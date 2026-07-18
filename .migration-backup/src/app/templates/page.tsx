'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { grokService } from '@/lib/grok';

interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  deliverables: string[];
  is_active: boolean;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    duration_days: '30',
    deliverables: '',
  });
  const [generatingTasks, setGeneratingTasks] = useState(false);

  useEffect(() => {
    checkAuth();
    loadTemplates();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('service_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTasks = async () => {
    if (!formData.name || !formData.description) return;

    setGeneratingTasks(true);
    try {
      const deliverables = formData.deliverables.split(',').map(d => d.trim()).filter(d => d);
      
      const tasks = await grokService.generateDeliveryTasks(
        formData.name,
        formData.description,
        deliverables
      );

      alert(`✅ Se generaron ${tasks.length} tareas con IA!`);
      
      // Guardar las tareas generadas en el template
      if (editingTemplate) {
        await supabase
          .from('service_templates')
          .update({ ai_generated_tasks: tasks })
          .eq('id', editingTemplate.id);
      }

      return tasks;
    } catch (error) {
      console.error('Error generating tasks:', error);
      alert('Error generando tareas con IA');
      return [];
    } finally {
      setGeneratingTasks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const deliverables = formData.deliverables.split(',').map(d => d.trim()).filter(d => d);

      if (editingTemplate) {
        const { error } = await supabase
          .from('service_templates')
          .update({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            currency: formData.currency,
            duration_days: parseInt(formData.duration_days),
            deliverables,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('service_templates')
          .insert({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            currency: formData.currency,
            duration_days: parseInt(formData.duration_days),
            deliverables,
            is_active: true,
          });

        if (error) throw error;
      }

      setShowModal(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        duration_days: '30',
        deliverables: '',
      });
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error guardando template');
    }
  };

  const handleEdit = (template: ServiceTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      price: template.price.toString(),
      currency: template.currency,
      duration_days: template.duration_days.toString(),
      deliverables: template.deliverables.join(', '),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este template?')) return;

    try {
      const { error } = await supabase
        .from('service_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error eliminando template');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Service Templates
            </h1>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                currency: 'USD',
                duration_days: '30',
                deliverables: '',
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Nuevo Template
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No hay templates aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Crea tu primer template de servicio para comenzar
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Crear Primer Template
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Precio</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${template.price.toLocaleString()} {template.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duración</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {template.duration_days} días
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                    <p className={`text-lg font-semibold ${template.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                      {template.is_active ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Deliverables:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.deliverables.map((deliverable, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-sm"
                      >
                        {deliverable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingTemplate ? 'Editar Template' : 'Nuevo Template'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Servicio
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Local SEO Package"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe qué incluye este servicio..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Moneda
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="MXN">MXN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duración (días)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deliverables (separados por coma)
                  </label>
                  <textarea
                    value={formData.deliverables}
                    onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Google My Business, Citas locales, Reviews, etc."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleGenerateTasks}
                    disabled={generatingTasks || !formData.name || !formData.description}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4" />
                    {generatingTasks ? 'Generando...' : 'Generar Tareas con IA'}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingTemplate ? 'Actualizar' : 'Crear'} Template
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}