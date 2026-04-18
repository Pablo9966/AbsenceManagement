export interface UvgAccidentReport {
  id: string;
  accidentType: 'BU' | 'NBU'; // Occupational (BU) or Non-Occupational (NBU)
  dateOfAccident: Date;
  employeeId: string;
  employerId: string;
  circumstances: string;
  injuredBodyParts: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
}

export interface UvgCoordination {
  id: string;
  uvgCaseId: string;
  ktgCaseId?: string;
  isComplementary: boolean;
  status: 'PENDING' | 'COORDINATED';
}

export class UvgCaseEngine {
  private reports: UvgAccidentReport[] = [];
  private coordinations: UvgCoordination[] = [];

  constructor() {}

  /**
   * Capture accident intake data
   */
  public reportAccident(data: Omit<UvgAccidentReport, 'id' | 'status'>): UvgAccidentReport {
    const report: UvgAccidentReport = {
      ...data,
      id: `UVG-${Date.now()}`,
      status: 'DRAFT',
    };
    this.reports.push(report);
    return report;
  }

  /**
   * Submit the accident report (generates PDF / external routing)
   */
  public submitReport(reportId: string): Buffer {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) throw new Error("Report not found");
    
    report.status = 'SUBMITTED';
    // Simulated PDF generation
    return Buffer.from(`%PDF-1.4 UVG Accident Report for ${reportId}\nType: ${report.accidentType}\nCircumstances: ${report.circumstances}`);
  }

  /**
   * Parallel KTG/UVG tracking & coordination
   */
  public coordinateWithKtg(uvgCaseId: string, ktgCaseId: string, isComplementary: boolean): UvgCoordination {
    const coordination: UvgCoordination = {
      id: `COORD-${Date.now()}`,
      uvgCaseId,
      ktgCaseId,
      isComplementary,
      status: 'COORDINATED',
    };
    this.coordinations.push(coordination);
    return coordination;
  }

  // Getters
  public getAllReports() { return this.reports; }
  public getReport(id: string) { return this.reports.find(r => r.id === id); }
}

export const uvgEngine = new UvgCaseEngine();
