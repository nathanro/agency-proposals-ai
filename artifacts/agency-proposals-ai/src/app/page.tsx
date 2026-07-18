import { Plus, FileText, CreditCard, CheckCircle, Zap, Users, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Agency Proposals AI
          </h1>
          <nav className="flex gap-4">
            <a href="#features" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Características
            </a>
            <Link href="/auth/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Iniciar Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Automatiza tus Propuestas con IA
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Crea propuestas, procesa pagos y genera automáticamente los proyectos con tareas de entrega predefinidas por IA. 
          Escala tu agencia sin complicaciones.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/login" className="px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Comenzar Gratis
          </Link>
          <Link href="/auth/login" className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg text-lg font-semibold hover:bg-indigo-50 dark:hover:bg-gray-800">
            Ver Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Características Principales
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="Propuestas Inteligentes"
            description="Crea propuestas basadas en tus templates de servicios. Personaliza y envía en minutos."
          />
          <FeatureCard
            icon={<CreditCard className="w-8 h-8" />}
            title="Pagos Automatizados"
            description="Integración con OpenPayments para procesar pagos sin complicaciones técnicas."
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="Tareas Generadas por IA"
            description="El sistema crea automáticamente la lista de tareas de entrega para cada servicio vendido."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Super Rápido"
            description="De propuesta a proyecto en minutos. Sin configuración manual de tareas."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Multi-Cliente"
            description="Gestiona múltiples clientes y propuestas desde un panel centralizado."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Analytics"
            description="Visualiza el progreso de tus proyectos y el rendimiento de tu agencia."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            ¿Cómo Funciona?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Crea un Template"
              description="Define tus servicios con precios, deliverables y duración estimada."
            />
            <StepCard
              step="2"
              title="Genera una Propuesta"
              description="Selecciona el servicio y personaliza la propuesta para tu cliente con ayuda de IA."
            />
            <StepCard
              step="3"
              title="Pago y Proyecto Automático"
              description="Al recibir el pago, el sistema crea automáticamente el proyecto con todas las tareas."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          ¿Listo para escalar tu agencia?
        </h3>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Únete y comienza a automatizar tus propuestas hoy.
        </p>
        <Link href="/auth/login" className="px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Comenzar Gratis Ahora
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p>© 2024 Agency Proposals AI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-indigo-600 dark:text-indigo-400 mb-4">{icon}</div>
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
