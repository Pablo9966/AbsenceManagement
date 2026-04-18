import type {
  DeadlineCountingMethod,
  KtgCase,
  KtgCaseAbsenceLink,
  KtgCaseCoverageSnapshot,
  KtgCaseSuggestion,
  TransparentBoolean,
  TransparentDate,
} from "./types.js";

const formatDate = (value: Date): string => value.toISOString().slice(0, 10);

const addCalendarDays = (date: string, days: number): string => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return formatDate(next);
};

const addWorkingDays = (date: string, days: number): string => {
  let remaining = days;
  const next = new Date(`${date}T00:00:00Z`);

  while (remaining > 0) {
    next.setUTCDate(next.getUTCDate() + 1);
    const dayOfWeek = next.getUTCDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining -= 1;
    }
  }

  return formatDate(next);
};

export const calculateFirstPayableDay = (input: {
  firstDayOfIncapacity: string;
  wartezeitDays: number;
  lohnfortzahlungDays: number;
}): TransparentDate => {
  const controllingWaitDays = Math.max(input.wartezeitDays, input.lohnfortzahlungDays);
  const value = addCalendarDays(input.firstDayOfIncapacity, controllingWaitDays);

  return {
    value,
    formula: "first_day_of_incapacity + max(wartezeit_days, lohnfortzahlung_days)",
    inputs: {
      firstDayOfIncapacity: input.firstDayOfIncapacity,
      wartezeitDays: input.wartezeitDays,
      lohnfortzahlungDays: input.lohnfortzahlungDays,
      controllingWaitDays,
    },
    effectiveAt: input.firstDayOfIncapacity,
  };
};

export const calculateSubmissionReadiness = (input: {
  ktgCase: KtgCase;
  absenceLinks: ReadonlyArray<KtgCaseAbsenceLink>;
  coverageSnapshot?: KtgCaseCoverageSnapshot;
}): TransparentBoolean => {
  const linkedEpisodesCount = input.absenceLinks.length;
  const originatingEpisodesCount = input.absenceLinks.filter((link) => link.isOriginatingEpisode).length;
  const hasCoverageSnapshot = Boolean(input.coverageSnapshot);
  const hasFirstDayOfIncapacity = Boolean(input.coverageSnapshot?.firstDayOfIncapacity);

  const blockers = [
    linkedEpisodesCount > 0 ? null : "no_absence_link",
    originatingEpisodesCount === 1 ? null : "originating_episode_missing_or_ambiguous",
    hasCoverageSnapshot ? null : "coverage_snapshot_missing",
    hasFirstDayOfIncapacity ? null : "first_day_of_incapacity_missing",
    input.ktgCase.policyId ? null : "policy_missing",
  ].filter((item): item is string => item !== null);

  return {
    value: blockers.length === 0,
    formula: "all(required_blocks_present and no_blocking_validation_issue)",
    inputs: {
      linkedEpisodesCount,
      originatingEpisodesCount,
      hasCoverageSnapshot,
      hasFirstDayOfIncapacity,
      policyId: input.ktgCase.policyId,
      blockers,
    },
    effectiveAt: new Date().toISOString(),
  };
};

export const calculateDeadlineDueAt = (input: {
  anchorDate: string;
  daysToAdd: number;
  countingMethod: DeadlineCountingMethod;
}): TransparentDate => {
  const value =
    input.countingMethod === "working_days"
      ? addWorkingDays(input.anchorDate, input.daysToAdd)
      : addCalendarDays(input.anchorDate, input.daysToAdd);

  return {
    value,
    formula:
      input.countingMethod === "working_days"
        ? "anchor_date + working_days(days_to_add)"
        : "anchor_date + calendar_days(days_to_add)",
    inputs: {
      anchorDate: input.anchorDate,
      daysToAdd: input.daysToAdd,
      countingMethod: input.countingMethod,
    },
    effectiveAt: input.anchorDate,
  };
};

export const evaluateKtgCaseSuggestion = (input: {
  employeeId: string;
  absenceEpisodeId: string;
  policyId: string;
  firstDayOfIncapacity: string;
  latestAbsenceDate: string;
  recordedAbsenceDays: number;
  wartezeitDays: number;
  existingOpenCaseFlag: boolean;
  lohnfortzahlungDays: number;
}): KtgCaseSuggestion => {
  const shouldSuggestCase = !input.existingOpenCaseFlag && input.recordedAbsenceDays >= input.wartezeitDays;

  return {
    employeeId: input.employeeId,
    absenceEpisodeId: input.absenceEpisodeId,
    policyId: input.policyId,
    shouldSuggestCase: {
      value: shouldSuggestCase,
      formula: "recorded_absence_days >= wartezeit_days and existing_open_case_flag = false",
      inputs: {
        firstDayOfIncapacity: input.firstDayOfIncapacity,
        latestAbsenceDate: input.latestAbsenceDate,
        recordedAbsenceDays: input.recordedAbsenceDays,
        wartezeitDays: input.wartezeitDays,
        existingOpenCaseFlag: input.existingOpenCaseFlag,
      },
      effectiveAt: input.latestAbsenceDate,
    },
    firstPayableDay: calculateFirstPayableDay({
      firstDayOfIncapacity: input.firstDayOfIncapacity,
      wartezeitDays: input.wartezeitDays,
      lohnfortzahlungDays: input.lohnfortzahlungDays,
    }),
  };
};
