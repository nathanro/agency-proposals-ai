import { ArrowRight, FileText, CreditCard, CheckCircle, Zap, Users, BarChart3, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white overflow-x-hidden">

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="glass rounded-2xl px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">ProposalAI</span>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
                Características
              </a>
              <a href="#how" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
                Cómo funciona
              </a>
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-colors"
              >
                Empezar gratis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb absolute w-[600px] h-[600px] bg-violet-600/30 -top-40 -left-40" />
          <div className="orb absolute w-[500px] h-[500px] bg-indigo-600/25 top-1/3 -right-32" style={{ animationDelay: "2s" }} />
          <div className="orb absolute w-[400px] h-[400px] bg-fuchsia-600/20 bottom-0 left-1/3" style={{ animationDelay: "4s" }} />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(hsl(255,80%,70%) 1px, transparent 1px), linear-gradient(90deg, hsl(255,80%,70%) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-violet-300 mb-8 border border-violet-500/20">
            <Sparkles className="w-4 h-4" />
            Powered by IA generativa
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
            Propuestas que
            <br />
            <span className="text-gradient">cierran tratos</span>
            <br />
            en minutos
          </h1>

          <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Crea propuestas profesionales con IA, gestiona clientes y automatiza
            el inicio de proyectos. Tu agencia escala sin esfuerzo extra.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-base transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]"
            >
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 font-semibold text-base transition-all text-white/80"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex items-center justify-center gap-3 text-sm text-white/40">
            <div className="flex -space-x-2">
              {["A", "B", "C", "D"].map((l) => (
                <div key={l} className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 border-2 border-[hsl(240,15%,6%)] flex items-center justify-center text-xs font-bold">
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {[1,2,3,4,5].map((i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <span>Más de 200 agencias confían en ProposalAI</span>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Características</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Todo lo que necesitas</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Una plataforma completa para que tu agencia funcione como una máquina de ventas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText,    title: "Propuestas con IA",       desc: "Genera contenido persuasivo y personalizado en segundos. La IA adapta el tono a cada cliente." },
              { icon: Zap,         title: "Templates reutilizables", desc: "Define tus servicios una vez y reutilízalos en cada propuesta. Precios, deliverables y duración." },
              { icon: CheckCircle, title: "Tareas automáticas",      desc: "Al aceptar una propuesta, el sistema crea automáticamente la lista de tareas del proyecto." },
              { icon: CreditCard,  title: "Facturación sencilla",    desc: "Gestiona el estado de tus propuestas: borrador, enviada, aceptada o rechazada." },
              { icon: Users,       title: "Multi-cliente",           desc: "Centraliza todos tus clientes y propuestas en un solo panel limpio y organizado." },
              { icon: BarChart3,   title: "Métricas en tiempo real", desc: "Visualiza el pipeline de ventas y el valor total de propuestas activas de un vistazo." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-6 card-hover group">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:bg-violet-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Proceso</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">De cero a propuesta en 3 pasos</h2>
          </div>

          <div className="space-y-6">
            {[
              { n: "01", title: "Define tus servicios", desc: "Crea templates con nombre, descripción, precio, duración y deliverables. Una vez y listo para siempre." },
              { n: "02", title: "Genera la propuesta con IA", desc: "Selecciona el servicio, ingresa los datos del cliente y deja que la IA redacte una propuesta persuasiva y personalizada." },
              { n: "03", title: "Cierra el trato",           desc: "Envía la propuesta, actualiza su estado y el sistema organiza automáticamente las tareas del proyecto." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-6 glass rounded-2xl p-6 items-start card-hover">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-sm">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden p-12" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(67,56,202,0.3) 100%)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="orb absolute w-64 h-64 bg-violet-600/40 -top-20 -left-20" />
              <div className="orb absolute w-48 h-48 bg-indigo-600/40 -bottom-16 -right-16" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">¿Listo para escalar?</h2>
              <p className="text-white/60 text-lg mb-8">
                Empieza gratis. Sin tarjeta de crédito.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-violet-900 hover:bg-white/90 font-bold text-base transition-all hover:shadow-xl"
              >
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/30 text-sm">
        © 2025 ProposalAI · Todos los derechos reservados
      </footer>
    </div>
  );
}
