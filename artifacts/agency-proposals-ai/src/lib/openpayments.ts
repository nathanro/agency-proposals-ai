// Servicio para integración con OpenPayments (Web Monetization)

export class OpenPaymentsService {
  private walletAddress: string;
  private baseUrl: string = 'https://openpayments.guide';

  constructor() {
    this.walletAddress = import.meta.env.VITE_OPENPAYMENTS_WALLET_ADDRESS || '';
    if (!this.walletAddress) {
      console.warn('OpenPayments wallet address no configurada');
    }
  }

  async createPaymentLink(proposalId: string, amount: number, currency: string = 'USD'): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('OpenPayments wallet address no configurada');
    }
    const paymentLink = `${this.baseUrl}/pay/${this.walletAddress}?amount=${amount}&currency=${currency}&ref=${proposalId}`;
    return paymentLink;
  }

  async verifyPayment(_paymentId: string): Promise<boolean> {
    return false;
  }

  generatePaymentQR(paymentLink: string): string {
    return paymentLink;
  }
}

export const openPaymentsService = new OpenPaymentsService();
