export interface PaymentInstruction {
  id: string;
  caseId: string;
  payee: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'IN_RUN' | 'SETTLED' | 'REJECTED';
}

export interface PaymentRun {
  id: string;
  createdAt: Date;
  status: 'DRAFT' | 'EXPORTED' | 'RECONCILED';
  instructions: PaymentInstruction[];
  totalAmount: number;
}

export class PaymentOperationsEngine {
  private instructions: PaymentInstruction[] = [];
  private runs: PaymentRun[] = [];

  constructor() {}

  /**
   * Receives payment instructions from the benefit-engine-service
   */
  public receiveInstruction(instruction: Omit<PaymentInstruction, 'status'>): PaymentInstruction {
    const newInstruction: PaymentInstruction = {
      ...instruction,
      status: 'PENDING'
    };
    this.instructions.push(newInstruction);
    return newInstruction;
  }

  /**
   * Groups pending PaymentInstructions into a new PaymentRun
   */
  public createPaymentRun(): PaymentRun {
    const pendingInstructions = this.instructions.filter(i => i.status === 'PENDING');
    
    if (pendingInstructions.length === 0) {
      throw new Error('No pending payment instructions to group.');
    }

    const runId = `PR-${Date.now()}`;
    const totalAmount = pendingInstructions.reduce((sum, inst) => sum + inst.amount, 0);
    
    pendingInstructions.forEach(i => i.status = 'IN_RUN');

    const newRun: PaymentRun = {
      id: runId,
      createdAt: new Date(),
      status: 'DRAFT',
      instructions: pendingInstructions,
      totalAmount
    };

    this.runs.push(newRun);
    return newRun;
  }

  /**
   * Simulates generating an export package (e.g. pain.001 XML)
   */
  public exportPaymentRun(runId: string): string {
    const run = this.runs.find(r => r.id === runId);
    if (!run) throw new Error('Payment run not found');
    
    run.status = 'EXPORTED';
    
    // Simulate export package generation
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <!-- Exported PR: ${run.id} Total: ${run.totalAmount} -->
</Document>`;
  }

  /**
   * Simulate Statement Rendering (Taggelddispositiv)
   */
  public generateStatementPdf(instructionId: string): Buffer {
    const instruction = this.instructions.find(i => i.id === instructionId);
    if (!instruction) throw new Error('Payment instruction not found');

    // Return mock PDF buffer
    return Buffer.from(`%PDF-1.4 Mock Statement for ${instruction.id}`);
  }

  /**
   * Updates reconciliation status when confirmation returns
   */
  public reconcileRun(runId: string, success: boolean): void {
    const run = this.runs.find(r => r.id === runId);
    if (!run) throw new Error('Payment run not found');

    run.status = success ? 'RECONCILED' : 'DRAFT';
    run.instructions.forEach(i => {
      i.status = success ? 'SETTLED' : 'REJECTED';
    });
  }

  // Getters for views
  public getAllRuns() { return this.runs; }
  public getPendingInstructions() { return this.instructions.filter(i => i.status === 'PENDING'); }
}

export const paymentEngine = new PaymentOperationsEngine();
