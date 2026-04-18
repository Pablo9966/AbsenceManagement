import type { LocaleCode, MessageCatalog } from "./types.js";

const deCommon: MessageCatalog = {
  "common.appName": "elipsLife Absence Management",
  "common.loading": "Wird geladen",
  "common.permissionDenied": "Zugriff verweigert",
  "common.empty": "Keine Daten verfuegbar",
  "common.placeholder": "Platzhalteransicht fuer die naechste Umsetzungsstufe",
  "shell.employerPortal": "Arbeitgeber-Portal",
  "shell.internalPortal": "Internes Portal",
  "shell.employeePortal": "Mitarbeiter-Portal",
  "shell.language": "Sprache",
  "shell.tenant": "Mandant",
  "shell.notifications": "Benachrichtigungen",
  "shell.profile": "Profil",
  "nav.dashboard": "Dashboard",
  "nav.absences": "Absenzen",
  "nav.cases": "KTG-Faelle",
  "nav.documents": "Dokumente",
  "nav.payments": "Zahlungen",
  "nav.premium": "Praemien",
  "nav.tasks": "Aufgaben",
  "nav.admin": "Administration",
  "nav.intake": "Intake",
  "nav.benefits": "Leistungen",
  "nav.compliance": "Compliance",
  "nav.adminUsers": "Benutzer",
  "nav.adminOnboarding": "Onboarding",
  "nav.reportAbsence": "Abwesenheit melden",
  "nav.uploadCertificate": "Arztzeugnis hochladen",
  "nav.returnToWork": "Rueckkehr bestaetigen",
  "page.dashboard.title": "Dashboard",
  "page.absences.title": "Absenzen",
  "page.absenceDetail.title": "Absenzdetail",
  "page.cases.title": "KTG-Faelle",
  "page.caseDetail.title": "Falldetail",
  "page.documents.title": "Dokumente",
  "page.payments.title": "Zahlungen",
  "page.premium.title": "Praemien",
  "page.tasks.title": "Aufgaben",
  "page.admin.title": "Administration",
  "page.adminUsers.title": "Benutzerverwaltung",
  "page.adminOnboarding.title": "Onboarding",
  "page.intake.title": "Intake",
  "page.intakeDetail.title": "Intake-Arbeitsbereich",
  "page.benefits.title": "Leistungsberechnungen",
  "page.benefitDetail.title": "Berechnungsdetail",
  "page.compliance.title": "Compliance"
};

const enCommon: MessageCatalog = {
  "common.appName": "elipsLife Absence Management",
  "common.loading": "Loading",
  "common.permissionDenied": "Access denied",
  "common.empty": "No data available",
  "common.placeholder": "Placeholder view for the next delivery stage",
  "shell.employerPortal": "Employer Portal",
  "shell.internalPortal": "Internal Portal",
  "shell.employeePortal": "Employee Portal",
  "shell.language": "Language",
  "shell.tenant": "Tenant",
  "shell.notifications": "Notifications",
  "shell.profile": "Profile",
  "nav.dashboard": "Dashboard",
  "nav.absences": "Absences",
  "nav.cases": "KTG Cases",
  "nav.documents": "Documents",
  "nav.payments": "Payments",
  "nav.premium": "Premium",
  "nav.tasks": "Tasks",
  "nav.admin": "Admin",
  "nav.intake": "Intake",
  "nav.benefits": "Benefits",
  "nav.compliance": "Compliance",
  "nav.adminUsers": "Users",
  "nav.adminOnboarding": "Onboarding",
  "nav.reportAbsence": "Report Absence",
  "nav.uploadCertificate": "Upload Certificate",
  "nav.returnToWork": "Return to Work",
  "page.dashboard.title": "Dashboard",
  "page.absences.title": "Absences",
  "page.absenceDetail.title": "Absence Detail",
  "page.cases.title": "KTG Cases",
  "page.caseDetail.title": "Case Detail",
  "page.documents.title": "Documents",
  "page.payments.title": "Payments",
  "page.premium.title": "Premium",
  "page.tasks.title": "Tasks",
  "page.admin.title": "Admin",
  "page.adminUsers.title": "User Administration",
  "page.adminOnboarding.title": "Onboarding",
  "page.intake.title": "Intake",
  "page.intakeDetail.title": "Intake Workspace",
  "page.benefits.title": "Benefit Calculations",
  "page.benefitDetail.title": "Calculation Detail",
  "page.compliance.title": "Compliance"
};

const frPlaceholder: MessageCatalog = {
  "common.appName": "elipsLife Absence Management",
  "common.loading": "Chargement",
  "common.permissionDenied": "Acces refuse",
  "common.empty": "Aucune donnee disponible",
  "common.placeholder": "Espace reserve pour une future traduction",
  "shell.employerPortal": "Portail employeur",
  "shell.internalPortal": "Portail interne",
  "nav.dashboard": "Dashboard"
};

const itPlaceholder: MessageCatalog = {
  "common.appName": "elipsLife Absence Management",
  "common.loading": "Caricamento",
  "common.permissionDenied": "Accesso negato",
  "common.empty": "Nessun dato disponibile",
  "common.placeholder": "Segnaposto per la prossima fase di traduzione",
  "shell.employerPortal": "Portale datore di lavoro",
  "shell.internalPortal": "Portale interno",
  "nav.dashboard": "Dashboard"
};

export const loadCatalog = (locale: LocaleCode): MessageCatalog => {
  switch (locale) {
    case "de-CH":
      return deCommon;
    case "en-CH":
      return enCommon;
    case "fr-CH":
      return frPlaceholder;
    case "it-CH":
      return itPlaceholder;
  }
};
