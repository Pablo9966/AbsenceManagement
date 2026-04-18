import type {
  AbsenceDailyRecord,
  AbsenceDayEquivalent,
  AbsenceEpisode,
  AbsenceTimelineItem,
  AbsenceType,
  BradfordFactor,
} from "./types.js";

const roundMetric = (value: number): number => Math.round((value + Number.EPSILON) * 10000) / 10000;

const dateInClosedRange = (date: string, from: string, to: string): boolean => date >= from && date <= to;

export const calculateAbsenceDayEquivalent = (
  record: Pick<
    AbsenceDailyRecord,
    | "absenceDate"
    | "incapacityPercentage"
    | "partialDayPercentage"
    | "scheduledWorkMinutes"
    | "lostWorkMinutes"
  >,
): AbsenceDayEquivalent => {
  if (record.scheduledWorkMinutes !== undefined && record.lostWorkMinutes !== undefined) {
    const rawValue = record.scheduledWorkMinutes === 0
      ? 0
      : Math.min(1, record.lostWorkMinutes / record.scheduledWorkMinutes);

    return {
      value: roundMetric(rawValue),
      formula: "min(1, lost_work_minutes / scheduled_work_minutes)",
      inputs: {
        scheduledWorkMinutes: record.scheduledWorkMinutes,
        lostWorkMinutes: record.lostWorkMinutes,
        incapacityPercentage: record.incapacityPercentage,
        partialDayPercentage: record.partialDayPercentage,
      },
      effectiveAt: record.absenceDate,
      method: "minutes",
    };
  }

  const rawValue = (record.incapacityPercentage / 100) * (record.partialDayPercentage / 100);

  return {
    value: roundMetric(rawValue),
    formula: "(incapacity_percentage / 100) * (partial_day_percentage / 100)",
    inputs: {
      incapacityPercentage: record.incapacityPercentage,
      partialDayPercentage: record.partialDayPercentage,
      scheduledWorkMinutes: record.scheduledWorkMinutes ?? null,
      lostWorkMinutes: record.lostWorkMinutes ?? null,
    },
    effectiveAt: record.absenceDate,
    method: "percentages",
  };
};

export const calculateBradfordFactor = (params: {
  episodes: ReadonlyArray<AbsenceEpisode>;
  dailyRecords: ReadonlyArray<AbsenceDailyRecord>;
  windowStart: string;
  windowEnd: string;
  includedAbsenceTypes?: ReadonlyArray<AbsenceType>;
}): BradfordFactor => {
  const includedAbsenceTypes = params.includedAbsenceTypes ?? ["ktg_sickness", "uvg_bu", "uvg_nbu"];
  const qualifyingEpisodes = params.episodes.filter((episode) => includedAbsenceTypes.includes(episode.primaryAbsenceType));
  const qualifyingEpisodeIds = new Set(qualifyingEpisodes.map((episode) => episode.id));

  const qualifyingRecords = params.dailyRecords.filter(
    (record) =>
      qualifyingEpisodeIds.has(record.episodeId) &&
      dateInClosedRange(record.absenceDate, params.windowStart, params.windowEnd),
  );
  const deduplicatedByEpisodeDate = deduplicateEpisodeDayEquivalents(qualifyingRecords);
  const spellsCount = new Set(deduplicatedByEpisodeDate.map((item) => item.episodeId)).size;
  const totalLostDaysEquivalent = roundMetric(
    deduplicatedByEpisodeDate.reduce((sum, item) => sum + item.dayEquivalent, 0),
  );
  const value = roundMetric(spellsCount * spellsCount * totalLostDaysEquivalent);

  return {
    value,
    formula: "S * S * D",
    inputs: {
      spellsCount,
      totalLostDaysEquivalent,
      includedAbsenceTypes,
      includedEpisodeIds: Array.from(qualifyingEpisodeIds),
      recordCount: qualifyingRecords.length,
      uniqueEpisodeDayCount: deduplicatedByEpisodeDate.length,
    },
    windowStart: params.windowStart,
    windowEnd: params.windowEnd,
  };
};

export const buildAbsenceTimeline = (params: {
  episodes: ReadonlyArray<AbsenceEpisode>;
  dailyRecords: ReadonlyArray<AbsenceDailyRecord>;
  from: string;
  to: string;
}): AbsenceTimelineItem[] => {
  const deduplicatedByEpisodeDate = new Map<string, number>();

  for (const item of deduplicateEpisodeDayEquivalents(params.dailyRecords)) {
    if (!dateInClosedRange(item.absenceDate, params.from, params.to)) {
      continue;
    }

    const current = deduplicatedByEpisodeDate.get(item.episodeId) ?? 0;
    deduplicatedByEpisodeDate.set(item.episodeId, roundMetric(current + item.dayEquivalent));
  }

  return params.episodes
    .filter((episode) => {
      const effectiveEndDate = episode.actualEndDate ?? episode.expectedEndDate ?? episode.startDate;
      return !(effectiveEndDate < params.from || episode.startDate > params.to);
    })
    .map((episode) => {
      const dayEquivalents = deduplicatedByEpisodeDate.get(episode.id) ?? 0;

      return {
        episodeId: episode.id,
        employeeId: episode.employeeId,
        primaryAbsenceType: episode.primaryAbsenceType,
        status: episode.status,
        startDate: episode.startDate,
        endDate: episode.actualEndDate ?? episode.expectedEndDate,
        dayEquivalents,
        recurrenceGroupId: episode.recurrenceGroupId,
      };
    })
    .sort((left, right) => left.startDate.localeCompare(right.startDate));
};

interface EpisodeDayEquivalent {
  episodeId: string;
  absenceDate: string;
  dayEquivalent: number;
}

const deduplicateEpisodeDayEquivalents = (
  records: ReadonlyArray<AbsenceDailyRecord>,
): EpisodeDayEquivalent[] => {
  const byEpisodeDate = new Map<string, EpisodeDayEquivalent>();

  for (const record of records) {
    const key = `${record.episodeId}:${record.absenceDate}`;
    const dayEquivalent = calculateAbsenceDayEquivalent(record).value;
    const current = byEpisodeDate.get(key);

    if (!current || dayEquivalent > current.dayEquivalent) {
      byEpisodeDate.set(key, {
        episodeId: record.episodeId,
        absenceDate: record.absenceDate,
        dayEquivalent,
      });
    }
  }

  return Array.from(byEpisodeDate.values());
};
