import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, Send, FileText, DollarSign, Mail } from 'lucide-react';
import { grokService } from '@/lib/grok';

interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  deliverables: string[];
}

export default function NewProposalPage() {
  const [, setLocation] = useLocation();
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_company: '',
    custom_message: '',
    discount_percentage: '0',
  });
  const [generatedContent, setGeneratedContent] = useState({
    introduction: '',
    scope: '',
    timeline: '',
    investment: '',
  });

  useEffect(() => {
    checkAuth();
    loadTemplates();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLocation('/auth/login');
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('service_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!selectedTemplate || !formData.client_name) return;

    setGeneratingContent(true);
    try {
      const content = await grokService.generateProposalContent(
        selectedTemplate.name,
        { company: formData.client_company, industry: '' }
      );
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generando contenido con IA');
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) {
      alert('Por favor selecciona un template de servicio');
      return;
    }

    try {
      const discount = parseFloat(formData.discount_percentage) || 0;
      const finalPrice = selectedTemplate.price * (1 - discount / 100);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('proposals')
        .insert({
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_company: formData.client_company,
          service_template_id: selectedTemplate.id,
          status: 'draft',
          custom_message: formData.custom_message,
          discount_percentage: discount,
          final_price: finalPrice,
          currency: selectedTemplate.currency,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      alert('✅ Propuesta creada exitosamente!');
      setLocation('/dashboard');
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Error creando propuesta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nueva Propuesta
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cliente Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Información del Cliente
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="juan@empresa.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  value={formData.client_company}
                  onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Empresa SA"
                />
              </div>
            </div>
          </div>

          {/* Seleccionar Template */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Seleccionar Servicio
            </h2>

            {templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No hay templates de servicios disponibles
                </p>
                <Link
                  href="/templates"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Crear Template
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        ${template.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {template.duration_days} días
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalles de la Propuesta */}
          {selectedTemplate && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Detalles de Propuesta
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio Final
                    </label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${(selectedTemplate.price * (1 - (parseFloat(formData.discount_percentage) || 0) / 100)).toLocaleString()} {selectedTemplate.currency}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mensaje Personalizado
                    </label>
                    <textarea
                      value={formData.custom_message}
                      onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Mensaje adicional para el cliente..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={generatingContent || !formData.client_name}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingContent ? 'Generando con IA...' : '✨ Generar Contenido con IA'}
                  </button>
                </div>
              </div>

              {/* AI Generated Content */}
              {generatedContent.introduction && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Contenido Generado por IA
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(generatedContent).map(([key, value]) => value && (
                      <div key={key}>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                          {key === 'introduction' ? 'Introducción' : key === 'scope' ? 'Alcance' : key === 'timeline' ? 'Timeline' : 'Inversión'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg"
            >
              <Send className="w-5 h-5" />
              Crear Propuesta
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
