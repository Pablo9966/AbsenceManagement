export interface SalaryMassReport {
  id: string;
  employerId: string;
  year: number;
  reportedMass: number;
  provisionalMass: number;
  status: 'SUBMITTED' | 'PROCESSED';
}

export interface PremiumAdjustment {
  id: string;
  employerId: string;
  year: number;
  adjustmentAmount: number;
  type: 'REFUND' | 'INVOICE';
  status: 'DRAFT' | 'ISSUED';
}

export class PremiumEngine {
  private reports: SalaryMassReport[] = [];
  private adjustments: PremiumAdjustment[] = [];

  constructor() {}

  /**
   * Employers submit their actual salary mass at the end of the year
   */
  public submitSalaryMass(employerId: string, year: number, reportedMass: number, provisionalMass: number): SalaryMassReport {
    const report: SalaryMassReport = {
      id: `SMR-${Date.now()}`,
      employerId,
      year,
      reportedMass,
      provisionalMass,
      status: 'SUBMITTED',
    };
    this.reports.push(report);
    return report;
  }

  /**
   * Calculate premium adjustment based on difference in salary mass
   */
  public calculateAdjustment(reportId: string, premiumRate: number): PremiumAdjustment {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) throw new Error("Report not found");

    const difference = report.reportedMass - report.provisionalMass;
    const adjustmentAmount = Math.abs(difference * premiumRate);
    const type = difference > 0 ? 'INVOICE' : 'REFUND';

    const adjustment: PremiumAdjustment = {
      id: `ADJ-${Date.now()}`,
      employerId: report.employerId,
      year: report.year,
      adjustmentAmount,
      type,
      status: 'DRAFT',
    };
    
    this.adjustments.push(adjustment);
    report.status = 'PROCESSED';
    return adjustment;
  }

  /**
   * Get claims ratio / premium exposure
   */
  public getPremiumExposure(employerId: string, totalClaims: number, totalPremiumsPaid: number): number {
    if (totalPremiumsPaid === 0) return 0;
    return totalClaims / totalPremiumsPaid;
  }

  // Getters
  public getAdjustments() { return this.adjustments; }
}

export const premiumEngine = new PremiumEngine();
