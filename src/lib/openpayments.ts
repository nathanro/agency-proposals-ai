// Servicio para integración con OpenPayments (Web Monetization)

interface OpenPaymentsPayment {
  walletAddress: string;
  amount: string;
  assetCode: string;
  description?: string;
}

interface OpenPaymentsResponse {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class OpenPaymentsService {
  private walletAddress: string;
  private privateKey: string;
  private baseUrl: string = 'https://openpayments.guide';

  constructor() {
    this.walletAddress = process.env.NEXT_PUBLIC_OPENPAYMENTS_WALLET_ADDRESS || '';
    this.privateKey = process.env.OPENPAYMENTS_PRIVATE_KEY || '';
    
    if (!this.walletAddress || !this.privateKey) {
      console.warn('OpenPayments no configurado completamente');
    }
  }

  /**
   * Crea un link de pago para una propuesta
   */
  async createPaymentLink(proposalId: string, amount: number, currency: string = 'USD'): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('OpenPayments wallet address no configurada');
    }

    // En un sistema real, aquí se crearía un payment intent en OpenPayments
    // Por ahora, generamos un link simulado
    
    const paymentData = {
      walletAddress: this.walletAddress,
      amount: amount.toString(),
      assetCode: currency,
      description: `Payment for proposal ${proposalId}`,
    };

    try {
      // Simulación de creación de payment link
      // En producción: const response = await fetch(`${this.baseUrl}/payments`, { ... })
      
      const paymentLink = `${this.baseUrl}/pay/${this.walletAddress}?amount=${amount}&currency=${currency}&ref=${proposalId}`;
      
      return paymentLink;
    } catch (error) {
      console.error('Error creando payment link:', error);
      throw new Error('No se pudo crear el link de pago');
    }
  }

  /**
   * Verifica el estado de un pago
   */
  async verifyPayment(paymentId: string): Promise<boolean> {
    try {
      // En producción: verificar con OpenPayments API
      // Por ahora, simulamos verificación
      return false;
    } catch (error) {
      console.error('Error verificando pago:', error);
      return false;
    }
  }

  /**
   * Procesa webhook de OpenPayments
   */
  async processWebhook(webhookData: any): Promise<void> {
    try {
      // En producción: procesar webhook real de OpenPayments
      const { paymentId, status, proposalId } = webhookData;
      
      if (status === 'completed') {
        // Aquí se activaría la creación automática del proyecto
        await this.activateProjectAfterPayment(proposalId);
      }
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw error;
    }
  }

  /**
   * Activa el proyecto después del pago exitoso
   */
  private async activateProjectAfterPayment(proposalId: string): Promise<void> {
    // Importar dynamically para evitar circular dependency
    const { supabaseAdmin } = await import('./supabase');
    
    try {
      // 1. Obtener la propuesta
      const { data: proposal, error: proposalError } = await supabaseAdmin
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError || !proposal) {
        throw new Error('Propuesta no encontrada');
      }

      // 2. Obtener el template de servicio
      const { data: serviceTemplate, error: serviceError } = await supabaseAdmin
        .from('service_templates')
        .select('*')
        .eq('id', proposal.service_template_id)
        .single();

      if (serviceError || !serviceTemplate) {
        throw new Error('Template de servicio no encontrado');
      }

      // 3. Crear el proyecto
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .insert({
          agency_id: proposal.agency_id,
          proposal_id: proposal.id,
          client_name: proposal.client_name,
          client_email: proposal.client_email,
          service_name: serviceTemplate.name,
          status: 'pending',
          start_date: new Date().toISOString(),
          estimated_end_date: new Date(Date.now() + serviceTemplate.duration_days * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (projectError || !project) {
        throw new Error('Error creando proyecto');
      }

      // 4. Crear las tareas desde el template
      const tasks = serviceTemplate.ai_generated_tasks || [];
      
      for (const task of tasks) {
        await supabaseAdmin.from('tasks').insert({
          project_id: project.id,
          title: task.title,
          description: task.description,
          status: 'pending',
          priority: task.priority || 'medium',
          estimated_hours: task.estimated_hours,
          order_index: task.order || 0,
          dependencies: task.dependencies || [],
        });
      }

      // 5. Actualizar estado de la propuesta
      await supabaseAdmin
        .from('proposals')
        .update({ status: 'paid' })
        .eq('id', proposalId);

      // 6. Registrar el pago
      await supabaseAdmin.from('payments').insert({
        proposal_id: proposalId,
        project_id: project.id,
        amount: proposal.final_price,
        currency: proposal.currency,
        status: 'completed',
        payment_method: 'openpayments',
      });

    } catch (error) {
      console.error('Error activando proyecto:', error);
      throw error;
    }
  }

  /**
   * Genera QR code para pago
   */
  generatePaymentQR(paymentLink: string): string {
    // En producción, usar una librería de QR codes
    // Por ahora, retornamos el link
    return paymentLink;
  }
}

// Singleton instance
export const openPaymentsService = new OpenPaymentsService();