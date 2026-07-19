import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  ArrowLeft, Edit2, Send, Copy, Check, Trash2, Sparkles, Wand2,
  User, Mail, Building2, Clock, CheckCircle2, XCircle, RefreshCw
} from "lucide-react";
import {
  isLoggedIn, proposalsApi, templatesApi, aiApi,
  type Proposal, type ServiceTemplate, type AiContent
} from "@/lib/api";

const STATUS_LABELS: Record<string, string> = { draft: "Borrador", sent: "Enviada", accepted: "Aceptada", rejected: "Rechazada" };
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-white/10 text-white/60",
  sent: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  accepted: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
};
const TYPE_LABELS: Record<string, string> = { recurring: "Recurrente", project: "Proyecto", consulting: "Consultoría" };
const AI_SECTION_LABELS: Record<string, string> = { introduction: "Introducción", scope: "Alcance", timeline: "Cronograma", investment: "Propuesta de Valor" };

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientCompany: "",
    customMessage: "", discountPercentage: 0,
    proposalType: "project", serviceTemplateId: "",
  });
  const [aiForm, setAiForm] = useState<AiContent>({ introduction: "", scope: "", timeline: "", investment: "" });

  useEffect(() => {
    if (!isLoggedIn()) { setLocation("/auth/login"); return; }
    (async () => {
      try {
        const [p, tpls] = await Promise.all([proposalsApi.get(id!), templatesApi.list()]);
        setProposal(p);
        setTemplates(tpls);
        setForm({
          clientName: p.clientName,
          clientEmail: p.clientEmail,
          clientCompany: p.clientCompany ?? "",
          customMessage: p.customMessage ?? "",
          discountPercentage: p.discountPercentage,
          proposalType: p.proposalType ?? "project",
          serviceTemplateId: p.serviceTemplateId,
        });
        setAiForm(p.aiContent ?? { introduction: "", scope: "", timeline: "", investment: "" });
      } catch (err: unknown) {
        console.error("Failed to load proposal:", err);
        // Show not-found state (proposal stays null, loading goes false)
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const selectedTemplate = templates.find((t) => t.id === form.serviceTemplateId) ?? null;
  const finalPrice = selectedTemplate
    ? Number(selectedTemplate.price) * (1 - form.discountPercentage / 100)
    : Number(proposal?.finalPrice ?? 0);

  const handleSave = async () => {
    if (!proposal) return;
    setSaving(true);
    try {
      const updated = await proposalsApi.update(proposal.id, {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientCompany: form.clientCompany || undefined,
        customMessage: form.customMessage || undefined,
        discountPercentage: form.discountPercentage,
        proposalType: form.proposalType,
        serviceTemplateId: form.serviceTemplateId !== proposal.serviceTemplateId ? form.serviceTemplateId : undefined,
        aiContent: aiForm,
      });
      setProposal({ ...updated, templateName: proposal.templateName, templateDeliverables: proposal.templateDeliverables });
      setEditing(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!proposal) return;
    setSending(true);
    try {
      const result = await proposalsApi.send(proposal.id);
      setProposal((prev) => prev ? { ...prev, status: "sent", publicToken: result.publicToken } : prev);
      const link = `${window.location.origin}/p/${result.publicToken}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    if (!proposal?.publicToken) return;
    const link = `${window.location.origin}/p/${proposal.publicToken}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDelete = async () => {
    if (!proposal || !confirm("¿Eliminar esta propuesta? Esta acción no se puede deshacer.")) return;
    await proposalsApi.delete(proposal.id);
    setLocation("/dashboard");
  };

  const handleGenerateAI = async () => {
    if (!proposal) return;
    setGenerating(true);
    try {
      const tpl = templates.find((t) => t.id === form.serviceTemplateId);
      const content = await aiApi.generateProposal({
        serviceName: tpl?.name ?? proposal.templateName ?? "Servicio",
        clientName: form.clientName,
        clientCompany: form.clientCompany || undefined,
        serviceDescription: tpl?.description,
      });
      setAiForm(content);
    } catch {
      alert("Error generando contenido con IA");
    } finally {
      setGenerating(false);
    }
  };

  const publicLink = proposal?.publicToken
    ? `${window.location.origin}/p/${proposal.publicToken}`
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-white/40 mb-4">Propuesta no encontrada</p>
          <Link href="/dashboard" className="text-violet-400 hover:underline">← Volver al dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[hsl(240,12%,8%)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold truncate">{proposal.clientName}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[proposal.status] ?? STATUS_COLORS.draft}`}>
                  {STATUS_LABELS[proposal.status] ?? proposal.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {TYPE_LABELS[proposal.proposalType] ?? proposal.proposalType}
                </span>
              </div>
              <p className="text-white/40 text-xs mt-0.5 truncate">{proposal.templateName} · {proposal.clientEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-medium transition-all">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  Guardar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
                {proposal.status === "draft" ? (
                  <button onClick={handleSend} disabled={sending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-medium transition-all">
                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    Enviar al cliente
                  </button>
                ) : publicLink ? (
                  <button onClick={handleCopyLink} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${copied ? "bg-emerald-600" : "bg-white/10 hover:bg-white/15"}`}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "¡Copiado!" : "Copiar enlace"}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left — main content */}
        <div className="space-y-5">
          {/* Client info */}
          <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" /> Datos del cliente
            </h2>
            {editing ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Nombre *</label>
                  <input value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Email *</label>
                  <input type="email" value={form.clientEmail} onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))} required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-white/40 mb-1.5 block">Empresa</label>
                  <input value={form.clientCompany} onChange={(e) => setForm((f) => ({ ...f, clientCompany: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-white/30 mb-1">Nombre</p>
                  <p className="font-medium text-sm flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-white/30" />{proposal.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">Email</p>
                  <p className="font-medium text-sm flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-white/30" />{proposal.clientEmail}</p>
                </div>
                {proposal.clientCompany && (
                  <div>
                    <p className="text-xs text-white/30 mb-1">Empresa</p>
                    <p className="font-medium text-sm flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-white/30" />{proposal.clientCompany}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* AI Content */}
          <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-violet-400" /> Contenido de la propuesta
              </h2>
              {editing && (
                <button onClick={handleGenerateAI} disabled={generating}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 disabled:opacity-50 text-xs transition-all">
                  {generating ? <div className="w-3 h-3 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Regenerar con IA
                </button>
              )}
            </div>

            {(["introduction", "scope", "timeline", "investment"] as const).map((key) => (
              <div key={key} className="mb-5 last:mb-0">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-2">{AI_SECTION_LABELS[key]}</p>
                {editing ? (
                  <textarea
                    value={aiForm[key]}
                    onChange={(e) => setAiForm((f) => ({ ...f, [key]: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-violet-500 transition-colors resize-none leading-relaxed"
                  />
                ) : aiForm[key] ? (
                  <p className="text-sm text-white/70 leading-relaxed bg-white/3 rounded-xl px-4 py-3">{aiForm[key]}</p>
                ) : (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-white/3 text-white/25 text-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sin contenido — edita para agregar o regenera con IA
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Deliverables */}
          {proposal.templateDeliverables && proposal.templateDeliverables.length > 0 && (
            <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400" /> Entregables
              </h2>
              <ul className="space-y-2">
                {proposal.templateDeliverables.map((d, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right — summary + actions */}
        <div className="space-y-4">
          {/* Pricing */}
          <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-5">
            <h2 className="font-semibold text-sm mb-4">Resumen económico</h2>
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-4">
              <p className="font-medium text-sm">{proposal.templateName}</p>
              <p className="text-white/40 text-xs mt-0.5">{proposal.templateDurationDays} días</p>
            </div>

            {editing ? (
              <div className="mb-4">
                <label className="text-xs text-white/40 mb-1.5 block">Tipo de servicio</label>
                <select value={form.proposalType} onChange={(e) => setForm((f) => ({ ...f, proposalType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors mb-3">
                  <option value="project">Proyecto único</option>
                  <option value="recurring">Servicio recurrente</option>
                  <option value="consulting">Consultoría</option>
                </select>
                <label className="text-xs text-white/40 mb-1.5 block">Descuento (%)</label>
                <input type="number" min={0} max={100} value={form.discountPercentage}
                  onChange={(e) => setForm((f) => ({ ...f, discountPercentage: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            ) : (
              <div className="space-y-2 mb-4 text-sm">
                {proposal.discountPercentage > 0 && (
                  <div className="flex justify-between text-white/50">
                    <span>Descuento</span>
                    <span className="text-emerald-400">-{proposal.discountPercentage}%</span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">Total</span>
                <span className="text-2xl font-bold text-violet-400">
                  ${finalPrice.toLocaleString()} <span className="text-sm font-normal text-white/30">{proposal.currency}</span>
                </span>
              </div>
            </div>
          </section>

          {/* Custom message */}
          <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-5">
            <h2 className="font-semibold text-sm mb-3">Mensaje adicional</h2>
            {editing ? (
              <textarea value={form.customMessage} onChange={(e) => setForm((f) => ({ ...f, customMessage: e.target.value }))} rows={3}
                placeholder="Notas adicionales para el cliente..."
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
            ) : (
              <p className="text-sm text-white/50 leading-relaxed">{proposal.customMessage || "Sin mensaje adicional"}</p>
            )}
          </section>

          {/* Public link */}
          {publicLink && (
            <section className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-5">
              <h2 className="font-semibold text-sm mb-2 text-emerald-400 flex items-center gap-2">
                <Send className="w-4 h-4" /> Enlace público
              </h2>
              <p className="text-xs text-white/40 mb-3">Comparte este enlace con tu cliente. No requiere login.</p>
              <div className="flex gap-2">
                <input readOnly value={publicLink}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 focus:outline-none" />
                <button onClick={handleCopyLink}
                  className={`flex-shrink-0 p-2 rounded-lg text-sm transition-all ${copied ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/15 text-white/70"}`}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </section>
          )}

          {/* Status */}
          {!editing && (
            <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-5">
              <h2 className="font-semibold text-sm mb-3">Estado</h2>
              <select value={proposal.status} onChange={(e) => proposalsApi.updateStatus(proposal.id, e.target.value).then((u) => setProposal((p) => p ? { ...p, status: u.status } : p))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer">
                <option value="draft">Borrador</option>
                <option value="sent">Enviada</option>
                <option value="accepted">Aceptada</option>
                <option value="rejected">Rechazada</option>
              </select>
            </section>
          )}

          {/* Danger zone */}
          {!editing && (
            <button onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-all">
              <Trash2 className="w-4 h-4" /> Eliminar propuesta
            </button>
          )}

          <div className="text-xs text-white/20 text-center">
            Creada {new Date(proposal.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </main>
    </div>
  );
}
