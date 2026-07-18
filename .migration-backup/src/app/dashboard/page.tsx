'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Plus, 
  LogOut,
  BarChart3,
  Users,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalProposals: number;
  activeProjects: number;
  pendingTasks: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProposals: 0,
    activeProjects: 0,
    pendingTasks: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
    } else {
      setUserName(session.user.email || '');
    }
  };

  const loadDashboardData = async () => {
    try {
      // Cargar estadísticas
      const { data: proposals } = await supabase
        .from('proposals')
        .select('final_price, status');

      const { data: projects } = await supabase
        .from('projects')
        .select('status');

      const { data: tasks } = await supabase
        .from('tasks')
        .select('status');

      if (proposals) {
        const totalRevenue = proposals
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + (p.final_price || 0), 0);

        setStats(prev => ({
          ...prev,
          totalProposals: proposals.length,
          totalRevenue,
        }));
      }

      if (projects) {
        const activeProjects = projects.filter(p => p.status === 'in_progress').length;
        setStats(prev => ({ ...prev, activeProjects }));
      }

      if (tasks) {
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        setStats(prev => ({ ...prev, pendingTasks }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Agency Proposals AI
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bienvenido, {userName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Propuestas"
            value={stats.totalProposals}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Proyectos Activos"
            value={stats.activeProjects}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Tareas Pendientes"
            value={stats.pendingTasks}
            color="yellow"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Ingresos Totales"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              icon={<Plus className="w-5 h-5" />}
              title="Nueva Propuesta"
              description="Crear propuesta para cliente"
              href="/proposals/new"
            />
            <QuickActionButton
              icon={<Users className="w-5 h-5" />}
              title="Service Templates"
              description="Gestionar templates de servicios"
              href="/templates"
            />
            <QuickActionButton
              icon={<BarChart3 className="w-5 h-5" />}
              title="Ver Proyectos"
              description="Gestionar proyectos activos"
              href="/projects"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            <ActivityItem
              icon={<TrendingUp className="w-5 h-5 text-green-500" />}
              title="Sistema inicializado"
              description="Comienza creando tu primer service template"
              time="Ahora"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string | number, color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className={`${colorClasses[color as keyof typeof colorClasses]} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function QuickActionButton({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
    >
      <div className="text-indigo-600 dark:text-indigo-400 mt-1">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

function ActivityItem({ icon, title, description, time }: { icon: React.ReactNode, title: string, description: string, time: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}