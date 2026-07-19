import { useState } from "react";
import {
  ArrowRight, FileText, Zap, CheckCircle2, Users, BarChart3, Sparkles, Star,
  Shield, ChevronDown, ChevronUp, Building2, Send, Eye, MessageCircle,
  Globe, Palette, Clock, TrendingUp, Lock, Check, X
} from "lucide-react";
import { Link } from "wouter";

/* ─── Data ─────────────────────────────────────────────── */

const PLANS = [
  {
    name: "Free",
    tag: "Por invitación",
    desc: "Para explorar sin compromisos",
    monthly: 0,
    color: "border-white/10 bg-white/[0.02]",
    btnClass: "bg-white/10 hover:bg-white/15 text-white",
    features: [
      { ok: true,  text: "10 propuestas / mes" },
      { ok: true,  text: "1 usuario" },
      { ok: true,  text: "Templates básicos" },
      { ok: true,  text: "Enlace público de propuesta" },
      { ok: false, text: "White-label" },
      { ok: false, text: "IA avanzada" },
    ],
    cta: "Solicitar acceso",
    href: "/auth/login",
    external: false,
    featured: false,
  },
  {
    name: "Starter",
    tag: null,
    desc: "Para agencias que empiezan a escalar",
    monthly: 29,
    color: "border-white/10 bg-white/[0.02]",
    btnClass: "bg-violet-600 hover:bg-violet-500 text-white",
    features: [
      { ok: true,  text: "50 propuestas / mes" },
      { ok: true,  text: "3 usuarios" },
      { ok: true,  text: "Templates ilimitados" },
      { ok: true,  text: "Propuestas con IA" },
      { ok: true,  text: "Estadísticas básicas" },
      { ok: false, text: "White-label" },
    ],
    cta: "Empezar 14 días gratis",
    href: "/auth/login",
    external: false,
    featured: false,
  },
  {
    name: "Pro",
    tag: "⭐ Más popular",
    desc: "Para equipos con alto volumen",
    monthly: 79,
    color: "border-violet-500/60 bg-violet-500/[0.06]",
    btnClass: "bg-violet-600 hover:bg-violet-500 text-white",
    features: [
      { ok: true, text: "200 propuestas / mes" },
      { ok: true, text: "10 usuarios" },
      { ok: true, text: "Templates ilimitados" },
      { ok: true, text: "IA avanzada (GPT-5)" },
      { ok: true, text: "White-label para tus clientes" },
      { ok: true, text: "Soporte prioritario" },
    ],
    cta: "Empezar 14 días gratis",
    href: "/auth/login",
    external: false,
    featured: true,
  },
  {
    name: "Agency",
    tag: "White-label completo",
    desc: "Para agencias que revenden la herramienta",
    monthly: 149,
    color: "border-white/10 bg-white/[0.02]",
    btnClass: "bg-white text-violet-900 hover:bg-white/90 font-bold",
    features: [
      { ok: true, text: "Propuestas ilimitadas" },
      { ok: true, text: "25 usuarios" },
      { ok: true, text: "White-label completo ✦" },
      { ok: true, text: "Revende a tus clientes" },
      { ok: true, text: "API access" },
      { ok: true, text: "Onboarding personal + soporte 24/7" },
    ],
    cta: "Hablar con ventas",
    href: "https://wa.me/message/PROPOSALAI?text=Hola%2C%20me%20interesa%20el%20plan%20Agency%20de%20ProposalAI",
    external: true,
    featured: false,
  },
];

const FEATURES = [
  { icon: Zap,        title: "Propuestas en 3 minutos",   desc: "La IA genera el contenido persuasivo. Tú solo confirmas y envías. Olvídate de escribir desde cero." },
  { icon: Palette,    title: "White-label total",          desc: "Tus clientes nunca ven ProposalAI. Solo ven tu marca, tu logo y tus colores." },
  { icon: Globe,      title: "Enlace público profesional", desc: "Cada propuesta tiene su propio enlace. El cliente acepta o rechaza directo desde el navegador." },
  { icon: FileText,   title: "Templates reutilizables",    desc: "Define tus servicios una vez. Precio, duración, deliverables. Reutilízalos en cada propuesta." },
  { icon: TrendingUp, title: "Pipeline de ventas",         desc: "Ve cuántas propuestas tienes activas, enviadas, aceptadas. Nunca pierdas el hilo." },
  { icon: Shield,     title: "Seguro y confiable",         desc: "Datos cifrados en reposo y en tránsito. Infraestructura en la nube con 99.9% de uptime." },
];

const TESTIMONIALS = [
  {
    name: "Daniela Ríos",
    role: "CEO · Ríos Digital",
    avatar: "DR",
    color: "from-violet-500 to-indigo-600",
    text: "Antes tardaba 2 horas por propuesta en Word. Ahora en 4 minutos tengo una propuesta profesional lista. Cerramos el doble de clientes este trimestre.",
  },
  {
    name: "Miguel Herrera",
    role: "Fundador · AgenciaHD",
    avatar: "MH",
    color: "from-emerald-500 to-teal-600",
    text: "El white-label es un juego de otro nivel. Mis clientes piensan que yo construí la herramienta. Les cobro $200/mes adicionales solo por el acceso.",
  },
  {
    name: "Sofía Valdés",
    role: "Directora Comercial · BrandMakers",
    avatar: "SV",
    color: "from-pink-500 to-rose-600",
    text: "Pasamos de propuestas en PDF a propuestas interactivas que el cliente acepta desde su celular. La tasa de cierre subió un 40%.",
  },
];

const FAQS = [
  {
    q: "¿Qué es el white-label y para quién es?",
    a: "Con el white-label, tus clientes ven la herramienta con tu marca: tu nombre de agencia, tu logo y tus colores. ProposalAI es invisible. Es ideal para agencias que quieren ofrecer una experiencia completamente de marca propia.",
  },
  {
    q: "¿Puedo revender el acceso a mis clientes?",
    a: "Sí. El plan Agency incluye white-label completo y te permite configurar sub-organizaciones para cada uno de tus clientes. Puedes cobrarles lo que quieras por el acceso.",
  },
  {
    q: "¿Los 14 días de prueba requieren tarjeta?",
    a: "No. El periodo de prueba es completamente gratis y sin tarjeta de crédito. Al terminar los 14 días puedes elegir tu plan o continuar con el Free.",
  },
  {
    q: "¿Mis propuestas están seguras?",
    a: "Tus datos se almacenan con cifrado AES-256 en bases de datos con acceso restringido. Nadie más puede acceder a tu información. Cumplimos con las mejores prácticas de seguridad de la industria.",
  },
  {
    q: "¿La IA reemplaza lo que yo escribo?",
    a: "La IA genera un borrador de calidad profesional basado en tu servicio y los datos del cliente. Tú puedes editarlo libremente antes de enviarlo. Es un punto de partida, no un reemplazo de tu criterio.",
  },
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Puedes hacer upgrade o downgrade en cualquier momento desde la configuración de tu cuenta. El cambio aplica inmediatamente y el cobro se proratea.",
  },
  {
    q: "¿Funciona en dispositivos móviles?",
    a: "Sí. La plataforma es completamente responsive. Tanto el dashboard para agencias como el enlace de propuesta para clientes funcionan perfectamente en móvil.",
  },
  {
    q: "¿Cuántos tipos de servicio puedo crear?",
    a: "Ilimitados. Puedes crear un template para cada servicio que ofreces: SEO, social media, diseño, desarrollo, consultoría, etc. Con sus propios precios y deliverables.",
  },
];

/* ─── App Mockup (SVG-free div-based) ──────────────────── */
function AppMockup() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: "hsl(240,12%,8%)" }}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5" style={{ background: "hsl(240,12%,6%)" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-400/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex-1 mx-3">
          <div className="w-48 h-5 rounded-md mx-auto text-xs text-white/20 flex items-center justify-center border border-white/5 px-3" style={{ background: "hsl(240,12%,10%)" }}>
            app.tuagencia.com/dashboard
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">Mi Agencia Digital</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 px-2.5 rounded-md text-xs text-white bg-violet-600 flex items-center gap-1">
            <span>+ Nueva propuesta</span>
          </div>
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {[
          { label: "Total", value: "12", color: "text-violet-400" },
          { label: "Enviadas", value: "5",  color: "text-blue-400" },
          { label: "Aceptadas", value: "7", color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg p-2 text-center" style={{ background: "hsl(240,12%,11%)" }}>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-white/30 text-[10px]">{label}</p>
          </div>
        ))}
      </div>
      {/* Proposal rows */}
      <div className="px-4 pb-3 space-y-2">
        {[
          { client: "Restaurante Don Jorge", service: "Social Media", price: "$800", status: "Aceptada", statusColor: "text-emerald-400", statusBg: "bg-emerald-400/10" },
          { client: "Clínica San Rafael",    service: "SEO Local",    price: "$1,200", status: "Enviada",  statusColor: "text-blue-400",    statusBg: "bg-blue-400/10" },
          { client: "Moda Valentina",        service: "Branding",     price: "$3,000", status: "Borrador", statusColor: "text-white/40",    statusBg: "bg-white/5" },
        ].map(({ client, service, price, status, statusColor, statusBg }) => (
          <div key={client} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "hsl(240,12%,11%)" }}>
            <div>
              <p className="text-white text-xs font-medium">{client}</p>
              <p className="text-white/30 text-[10px]">{service}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-semibold">{price}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor} ${statusBg}`}>{status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── White-label Mockup ─────────────────────────────── */
function WhitelabelMockup({ branded }: { branded: boolean }) {
  const name = branded ? "Tu Agencia Digital" : "ProposalAI";
  const color = branded ? "#10b981" : "#7c3aed";
  const rgb = branded ? "16, 185, 129" : "124, 58, 237";
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl text-xs" style={{ background: "hsl(240,15%,6%)" }}>
      {/* Agency header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5" style={{ background: "hsl(240,12%,8%)" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: color }}>
            {branded ? <Building2 className="w-3 h-3 text-white" /> : <Sparkles className="w-3 h-3 text-white" />}
          </div>
          <span className="text-white font-semibold">{name}</span>
        </div>
        <span className="text-white/30">Propuesta de servicios</span>
      </div>
      {/* Content */}
      <div className="px-4 py-3 space-y-2">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
          style={{ color, background: `rgba(${rgb},0.1)`, borderColor: `rgba(${rgb},0.3)` }}>
          <Sparkles className="w-2.5 h-2.5" /> Proyecto único
        </div>
        <p className="text-white font-semibold">Propuesta para <span style={{ color }}>Restaurante Don Jorge</span></p>
        <p className="text-white/50 text-[10px]">Preparada por {name}</p>
        <div className="rounded-lg p-2 border" style={{ background: `rgba(${rgb},0.06)`, borderColor: `rgba(${rgb},0.2)` }}>
          <div className="flex justify-between">
            <span className="text-white/60">Landing Page Premium</span>
            <span className="font-bold" style={{ color }}>$2,500</span>
          </div>
        </div>
        <button className="w-full py-1.5 rounded-lg text-white text-[10px] font-semibold" style={{ background: color }}>
          ✓ Aceptar propuesta
        </button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function HomePage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const price = (monthly: number) =>
    monthly === 0 ? "Gratis" : `$${annual ? Math.round(monthly * 0.8) : monthly}`;

  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="glass rounded-2xl px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">ProposalAI</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Características</a>
              <a href="#pricing"  className="text-sm text-white/60 hover:text-white transition-colors">Precios</a>
              <a href="#whitelabel" className="text-sm text-white/60 hover:text-white transition-colors">White-label</a>
              <a href="#faq"     className="text-sm text-white/60 hover:text-white transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
                Iniciar sesión
              </Link>
              <Link href="/auth/login" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                Empezar gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-16 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb absolute w-[700px] h-[700px] bg-violet-600/25 -top-40 -left-40" />
          <div className="orb absolute w-[500px] h-[500px] bg-indigo-600/20 top-1/3 -right-40" style={{ animationDelay: "2s" }} />
          <div className="orb absolute w-[400px] h-[400px] bg-fuchsia-600/15 bottom-0 left-1/3" style={{ animationDelay: "4s" }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(hsl(255,80%,70%) 1px,transparent 1px),linear-gradient(90deg,hsl(255,80%,70%) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div className="fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-violet-300 mb-8 border border-violet-500/20">
                <Sparkles className="w-4 h-4" />
                Impulsado por IA generativa · GPT-5
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight">
                Cierra propuestas<br />
                en <span className="text-gradient">3 minutos</span>,<br />
                no en 3 horas
              </h1>
              <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-lg">
                La plataforma de propuestas con IA para agencias digitales latinoamericanas.
                Con white-label incluido para que tus clientes vean solo tu marca.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-base transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]">
                  Crear cuenta gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="https://wa.me/message/PROPOSALAI?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20ProposalAI"
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 font-semibold text-base transition-all text-white/80">
                  <MessageCircle className="w-5 h-5 text-emerald-400" /> Hablar por WhatsApp
                </a>
              </div>
              {/* Social proof numbers */}
              <div className="mt-10 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["DR","MH","SV","LP"].map((l) => (
                      <div key={l} className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 border-2 border-[hsl(240,15%,6%)] flex items-center justify-center text-[10px] font-bold">{l}</div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map((i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}</div>
                    <p className="text-white/40 text-xs">+200 agencias</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-white font-bold">4,800+</p>
                  <p className="text-white/40 text-xs">Propuestas enviadas</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-white font-bold">68%</p>
                  <p className="text-white/40 text-xs">Tasa de cierre</p>
                </div>
              </div>
            </div>
            {/* Mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-10 bg-violet-600/10 rounded-full blur-3xl" />
              <div className="relative">
                <AppMockup />
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-8 glass rounded-2xl p-4 border border-white/10 shadow-2xl fade-in" style={{ animationDelay: "0.3s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">¡Propuesta aceptada!</p>
                      <p className="text-white/40 text-xs">Restaurante Don Jorge · $800</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-6 glass rounded-2xl p-3 border border-white/10 shadow-2xl fade-in" style={{ animationDelay: "0.5s" }}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-400" />
                    <div>
                      <p className="text-white text-xs font-semibold">IA generó propuesta</p>
                      <p className="text-white/40 text-[10px]">En 12 segundos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-white/5" style={{ background: "hsl(240,12%,7%)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "3 min",  label: "Propuesta generada" },
            { value: "+200",   label: "Agencias activas" },
            { value: "68%",    label: "Tasa de cierre promedio" },
            { value: "$0",     label: "Para empezar" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-gradient mb-1">{value}</p>
              <p className="text-white/40 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem / Solution ──────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">El problema</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              ¿Cuánto tiempo pierdes<br /> en cada propuesta?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              La mayoría de las agencias pasan 2-3 horas por propuesta en Word o Canva.
              Tiempo que podrías estar vendiendo o entregando resultados.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2 mb-4">
                <X className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-400">Sin ProposalAI</span>
              </div>
              <ul className="space-y-2 text-sm text-white/60">
                {["2-3 horas por propuesta en Word/Canva","Formato inconsistente entre propuestas","Clientes esperando días la propuesta","Sin seguimiento de qué clientes respondieron","Propuestas que se ven amateur"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><span className="text-red-400 mt-0.5">×</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Con ProposalAI</span>
              </div>
              <ul className="space-y-2 text-sm text-white/60">
                {["3 minutos de la idea a propuesta enviada","Formato profesional y consistente siempre","Cliente recibe enlace inmediato y acepta online","Dashboard completo con estado de cada propuesta","Tu marca, no la de nadie más"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Características</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Todo lo que tu agencia necesita</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Una plataforma completa para convertir más clientes con menos tiempo.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
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

      {/* ── How it works ─────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "hsl(240,12%,7%)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Proceso</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">De cero a propuesta en 3 pasos</h2>
          </div>
          <div className="space-y-5">
            {[
              { n: "01", icon: FileText,    title: "Define tus servicios una vez",      desc: "Crea templates con nombre, precio, duración y deliverables. Una plantilla por tipo de servicio." },
              { n: "02", icon: Sparkles,    title: "La IA escribe la propuesta",         desc: "Seleccionas el servicio y el cliente. La IA genera el contenido persuasivo en segundos. Edita lo que quieras." },
              { n: "03", icon: Send,        title: "Envía el enlace, cierra el trato",   desc: "El cliente recibe un enlace único y profesional donde puede aceptar o rechazar. Tú ves todo en tiempo real." },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="flex gap-5 glass rounded-2xl p-6 items-start card-hover">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-sm">{n}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-violet-400" />
                    <h3 className="font-semibold text-lg">{title}</h3>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Precios</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Planes para cada etapa</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">Sin contratos. Sin sorpresas. Cancela cuando quieras.</p>
            {/* Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-xl glass border border-white/10">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${!annual ? "bg-violet-600 text-white" : "text-white/50 hover:text-white"}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${annual ? "bg-violet-600 text-white" : "text-white/50 hover:text-white"}`}
              >
                Anual
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => (
              <div key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all flex flex-col ${plan.color} ${plan.featured ? "ring-2 ring-violet-500/50 scale-[1.02] shadow-[0_0_40px_rgba(124,58,237,0.2)]" : ""}`}>
                {plan.tag && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${plan.featured ? "bg-violet-600 text-white" : "bg-white/10 text-white/70 border border-white/20"}`}>
                    {plan.tag}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-xs">{plan.desc}</p>
                </div>
                <div className="mb-5">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold">{price(plan.monthly)}</span>
                    {plan.monthly > 0 && <span className="text-white/40 text-sm mb-1">/{annual ? "mes*" : "mes"}</span>}
                  </div>
                  {annual && plan.monthly > 0 && (
                    <p className="text-emerald-400 text-xs mt-1">*Facturado ${Math.round(plan.monthly * 0.8 * 12)}/año</p>
                  )}
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(({ ok, text }) => (
                    <li key={text} className={`flex items-start gap-2 text-sm ${ok ? "text-white/80" : "text-white/25 line-through"}`}>
                      {ok
                        ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                      }
                      {text}
                    </li>
                  ))}
                </ul>
                {plan.external
                  ? <a href={plan.href} target="_blank" rel="noreferrer" className={`w-full py-3 rounded-xl text-center text-sm font-semibold transition-all ${plan.btnClass}`}>
                      {plan.cta}
                    </a>
                  : <Link href={plan.href} className={`w-full py-3 rounded-xl text-center text-sm font-semibold transition-all ${plan.btnClass}`}>
                      {plan.cta}
                    </Link>
                }
              </div>
            ))}
          </div>

          <p className="text-center text-white/30 text-sm mt-8">
            ¿Necesitas más propuestas o usuarios? <a href="https://wa.me/message/PROPOSALAI" target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">Hablemos →</a>
          </p>
        </div>
      </section>

      {/* ── White-label spotlight ─────────────────────────── */}
      <section id="whitelabel" className="py-24 px-6" style={{ background: "hsl(240,12%,7%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">White-label</p>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                Tus clientes nunca<br />verán ProposalAI
              </h2>
              <p className="text-white/50 text-lg mb-6 leading-relaxed">
                Con el white-label, cada propuesta que envíes llevará tu logo, tus colores y tu nombre de agencia.
                ProposalAI es el motor. Tú eres la marca.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Palette,   text: "Logo, nombre y color primario personalizable" },
                  { icon: Globe,     text: "Dominio personalizado en planes Pro y Agency" },
                  { icon: Eye,       text: "Tus clientes nunca ven el nombre ProposalAI" },
                  { icon: Building2, text: "Revende el acceso a tus propios clientes (Agency)" },
                  { icon: Lock,      text: "Cada organización tiene sus datos aislados" },
                  { icon: Users,     text: "Gestiona múltiples agencias desde un panel" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-sm transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                Activar white-label <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Dual mockup */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">La misma propuesta — dos marcas</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/30 text-xs text-center mb-2">Sin white-label</p>
                  <WhitelabelMockup branded={false} />
                </div>
                <div>
                  <p className="text-emerald-400 text-xs text-center mb-2">Con white-label ✦</p>
                  <WhitelabelMockup branded={true} />
                </div>
              </div>
              <div className="rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 text-center">
                <p className="text-emerald-400 text-sm font-semibold">Tu cliente ve tu marca. Solo tu marca.</p>
                <p className="text-white/40 text-xs mt-1">Disponible en planes Pro y Agency</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Testimoniales</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Agencias que ya cerraron más</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 card-hover flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6" style={{ background: "hsl(240,12%,7%)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "hsl(240,12%,8%)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-violet-400 flex-shrink-0 ml-3" />
                    : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0 ml-3" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden p-12"
            style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.25) 0%,rgba(67,56,202,0.25) 100%)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="orb absolute w-64 h-64 bg-violet-600/35 -top-20 -left-20" />
              <div className="orb absolute w-48 h-48 bg-indigo-600/35 -bottom-16 -right-16" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-violet-300 text-sm mb-6">
                <Clock className="w-4 h-4" /> Primera propuesta lista en menos de 5 minutos
              </div>
              <h2 className="text-4xl font-extrabold mb-4">¿Listo para cerrar más?</h2>
              <p className="text-white/60 text-lg mb-8">
                Sin tarjeta de crédito. Sin contrato. Empieza gratis hoy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-violet-900 hover:bg-white/90 font-bold text-base transition-all hover:shadow-xl">
                  Crear cuenta gratis <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="https://wa.me/message/PROPOSALAI?text=Hola%2C%20quiero%20ver%20un%20demo%20de%20ProposalAI"
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 font-semibold text-base transition-all text-white/80">
                  <MessageCircle className="w-5 h-5 text-emerald-400" /> Ver un demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6" style={{ background: "hsl(240,12%,7%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold">ProposalAI</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                La plataforma de propuestas con IA para agencias digitales latinoamericanas.
              </p>
            </div>
            {/* Product */}
            <div>
              <p className="font-semibold text-sm mb-4">Producto</p>
              <ul className="space-y-2.5 text-sm text-white/40">
                {["#features", "#pricing", "#whitelabel", "#faq"].map((href, i) => (
                  <li key={href}><a href={href} className="hover:text-white transition-colors">{["Características","Precios","White-label","FAQ"][i]}</a></li>
                ))}
              </ul>
            </div>
            {/* Platform */}
            <div>
              <p className="font-semibold text-sm mb-4">Plataforma</p>
              <ul className="space-y-2.5 text-sm text-white/40">
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Crear cuenta</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <p className="font-semibold text-sm mb-4">Contacto</p>
              <ul className="space-y-2.5 text-sm text-white/40">
                <li>
                  <a href="https://wa.me/message/PROPOSALAI" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:hola@proposaiai.com" className="hover:text-white transition-colors">hola@proposaiai.com</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-white/20 text-xs">
            <span>© 2026 ProposalAI · Todos los derechos reservados</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white/60 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white/60 transition-colors">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
