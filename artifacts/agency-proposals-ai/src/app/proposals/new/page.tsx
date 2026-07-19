import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Send, Sparkles, User, Mail, Building2, ChevronRight, Wand2 } from "lucide-react";
import { isLoggedIn, templatesApi, proposalsApi, aiApi, type ServiceTemplate, type ProposalContent } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  recurring: "Recurrente",
  project: "Proyecto",
  consulting: "Consultoría",
};
const CATEGORY_COLORS: Record<string, string> = {
  recurring: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  project: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  consulting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function NewProposalPage() {
  const [, setLocation] = useLocation();
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [selected, setSelected] = useState<ServiceTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<ProposalContent | null>(null);

  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientCompany: "", customMessage: "", discountPercentage: 0,
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  useEffect(() => {
    if (!isLoggedIn()) { setLocation("/auth/login"); return; }
    templatesApi.list().then((t) => { setTemplates(t.filter((x) => x.isActive)); setLoading(false); });
  }, []);

  // Group templates by category
  const grouped = templates.reduce((acc, t) => {
    const cat = t.category ?? "project";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, ServiceTemplate[]>);
  const categoryOrder = ["project", "recurring", "consulting"];

  const finalPrice = selected ? Number(selected.price) * (1 - form.discountPercentage / 100) : 0;

  const handleGenerate = async () => {
    if (!selected || !form.clientName) return;
    setGenerating(true);
    try {
      const content = await aiApi.generateProposal({
        serviceName: selected.name,
        clientName: form.clientName,
        clientCompany: form.clientCompany || undefined,
        serviceDescription: selected.description,
      });
      setGenerated(content);
    } catch {
      alert("Error generando contenido con IA");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { alert("Selecciona un servicio"); return; }
    setSubmitting(true);
    try {
      const newProposal = await proposalsApi.create({
        serviceTemplateId: selected.id,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientCompany: form.clientCompany || undefined,
        customMessage: form.customMessage || undefined,
        discountPercentage: form.discountPercentage,
        aiContent: generated ?? undefined,
        proposalType: selected.category ?? "project",
      });
      // Go to detail page so user can send immediately
      setLocation(`/proposals/${newProposal.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al crear propuesta");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white">
      <header className="border-b border-white/5 bg-[hsl(240,12%,8%)] px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold">Nueva propuesta</h1>
          <p className="text-white/40 text-xs">Completa los datos y genera el contenido con IA</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Client info */}
            <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
              <h2 className="font-semibold mb-5 flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-violet-400" /> Datos del cliente
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Nombre *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="text" value={form.clientName} onChange={set("clientName")} required
                      placeholder="Juan Pérez"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="email" value={form.clientEmail} onChange={set("clientEmail")} required
                      placeholder="juan@empresa.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-white/40 mb-1.5 block">Empresa (opcional)</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="text" value={form.clientCompany} onChange={set("clientCompany")}
                      placeholder="Empresa SA"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                </div>
              </div>
            </section>

            {/* Template selection — grouped by category */}
            <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
              <h2 className="font-semibold mb-5 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-violet-400" /> Selecciona el servicio
              </h2>
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm mb-4">No tienes templates activos.</p>
                  <Link href="/templates" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-all">
                    Ir a templates
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {categoryOrder.filter((cat) => grouped[cat]?.length).map((cat) => (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[cat]}`}>
                          {CATEGORY_LABELS[cat]}
                        </span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {grouped[cat].map((t) => (
                          <button key={t.id} type="button" onClick={() => { setSelected(t); setGenerated(null); }}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              selected?.id === t.id
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-white/10 bg-white/3 hover:border-white/20"
                            }`}>
                            <p className="font-medium text-sm mb-1">{t.name}</p>
                            <p className="text-white/40 text-xs line-clamp-2 mb-2">{t.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-violet-400">${Number(t.price).toLocaleString()}</span>
                              <span className="text-white/30 text-xs">{t.durationDays}d</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* AI content */}
            {selected && (
              <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold flex items-center gap-2 text-sm">
                    <Wand2 className="w-4 h-4 text-violet-400" /> Contenido con IA
                  </h2>
                  <button type="button" onClick={handleGenerate} disabled={generating || !form.clientName}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-medium transition-all">
                    {generating
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Sparkles className="w-4 h-4" />}
                    {generating ? "Generando..." : generated ? "Regenerar" : "Generar"}
                  </button>
                </div>

                {generated ? (
                  <div className="space-y-4">
                    {(["introduction", "scope", "timeline", "investment"] as const).map((key) => (
                      <div key={key}>
                        <p className="text-xs text-white/30 uppercase tracking-widest mb-1.5">
                          {key === "introduction" ? "Introducción" : key === "scope" ? "Alcance" : key === "timeline" ? "Cronograma" : "Propuesta de Valor"}
                        </p>
                        <p className="text-sm text-white/70 bg-white/3 rounded-xl p-3 leading-relaxed">{generated[key]}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/30 text-sm">
                    {!form.clientName ? "Ingresa el nombre del cliente primero" : "Haz clic en Generar para crear el contenido con IA"}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6 sticky top-6">
              <h2 className="font-semibold mb-5 text-sm">Resumen</h2>

              {selected ? (
                <>
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4">
                    <p className="font-medium text-sm">{selected.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{selected.durationDays} días · {selected.currency}</p>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-white/40 mb-1.5 block">Descuento (%)</label>
                    <input type="number" min={0} max={100} value={form.discountPercentage} onChange={set("discountPercentage")}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-white/5 mb-4">
                    <span className="text-white/40 text-sm">Total</span>
                    <span className="text-xl font-bold text-violet-400">${finalPrice.toLocaleString()} {selected.currency}</span>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-white/40 mb-1.5 block">Mensaje adicional (opcional)</label>
                    <textarea value={form.customMessage} onChange={set("customMessage")} rows={3}
                      placeholder="Notas adicionales para el cliente..."
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-white/30 text-sm">
                  Selecciona un servicio para continuar
                </div>
              )}

              <button type="submit" disabled={!selected || submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-all">
                {submitting
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> Crear propuesta<ChevronRight className="w-4 h-4" /></>}
              </button>

              <Link href="/dashboard" className="w-full flex items-center justify-center mt-2 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 text-sm transition-all">
                Cancelar
              </Link>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}
