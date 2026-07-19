import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { CheckCircle2, XCircle, Sparkles, Clock, Check, ChevronRight, Building2 } from "lucide-react";
import { proposalsApi, type PublicProposal } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = { recurring: "Servicio mensual", project: "Proyecto único", consulting: "Consultoría" };

export default function PublicProposalPage() {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<PublicProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState<"accept" | "reject" | null>(null);

  useEffect(() => {
    if (!token) return;
    proposalsApi.getPublic(token)
      .then((p) => { setProposal(p); setLoading(false); })
      .catch(() => { setError("Esta propuesta no existe o el enlace no es válido."); setLoading(false); });
  }, [token]);

  const handleRespond = async (action: "accept" | "reject") => {
    if (!token) return;
    setResponding(true);
    try {
      await proposalsApi.respond(token, action);
      setResponded(action);
      setProposal((prev) => prev ? { ...prev, status: action === "accept" ? "accepted" : "rejected" } : prev);
    } catch {
      alert("Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setResponding(false);
    }
  };

  const alreadyDecided = proposal?.status === "accepted" || proposal?.status === "rejected";

  // Use org branding colors
  const primaryColor = proposal?.agencyColor || "#7c3aed";
  const primaryRgb = (() => {
    const c = primaryColor.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-white font-bold text-xl mb-2">Propuesta no encontrada</h1>
          <p className="text-white/40 text-sm">{error || "Este enlace no es válido o ha expirado."}</p>
        </div>
      </div>
    );
  }

  const agencyName = proposal.agencyName || proposal.agentName || "Agencia Digital";
  const agencyLogo = proposal.agencyLogo;
  const hasAiContent = proposal.aiContent &&
    (proposal.aiContent.introduction || proposal.aiContent.scope || proposal.aiContent.timeline || proposal.aiContent.investment);

  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white">
      {/* Dynamic background orbs using org color */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-40 -left-40 rounded-full blur-[100px]"
          style={{ background: `rgba(${primaryRgb}, 0.12)` }} />
        <div className="absolute w-[400px] h-[400px] bottom-0 right-0 rounded-full blur-[100px]"
          style={{ background: `rgba(${primaryRgb}, 0.07)` }} />
      </div>

      {/* Agency header */}
      <header className="relative border-b border-white/5 bg-[hsl(240,12%,8%)/80] backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {agencyLogo ? (
              <img src={agencyLogo} alt={agencyName} className="w-9 h-9 rounded-xl object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: primaryColor }}>
                <Building2 className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <p className="font-bold text-sm">{agencyName}</p>
              <p className="text-white/30 text-xs">Propuesta de servicios</p>
            </div>
          </div>
          {proposal.expiresAt && (
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Clock className="w-3.5 h-3.5" />
              Válida hasta {new Date(proposal.expiresAt).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}
            </div>
          )}
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-6 py-10">
        {/* Already responded banner */}
        {(responded || alreadyDecided) && (
          <div className={`mb-8 px-6 py-4 rounded-2xl border text-center ${
            (responded === "accept" || proposal.status === "accepted")
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}>
            {(responded === "accept" || proposal.status === "accepted") ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">¡Propuesta aceptada! Pronto nos pondremos en contacto contigo.</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Has declinado esta propuesta. Gracias por tu tiempo.</span>
              </div>
            )}
          </div>
        )}

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4 border"
            style={{ background: `rgba(${primaryRgb}, 0.1)`, borderColor: `rgba(${primaryRgb}, 0.3)`, color: primaryColor }}>
            <Sparkles className="w-3.5 h-3.5" />
            {TYPE_LABELS[proposal.proposalType] ?? "Propuesta de servicios"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            Propuesta para <span style={{ color: primaryColor }}>{proposal.clientName}</span>
          </h1>
          {proposal.clientCompany && <p className="text-white/50 text-lg">{proposal.clientCompany}</p>}
          <p className="text-white/40 text-sm mt-2">
            Preparada por <strong className="text-white/60">{agencyName}</strong> · {new Date(proposal.createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Service overview */}
        <section className="mb-6 rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-lg mb-1">{proposal.templateName}</h2>
              {proposal.templateDescription && (
                <p className="text-white/50 text-sm leading-relaxed max-w-lg">{proposal.templateDescription}</p>
              )}
            </div>
            {proposal.templateDurationDays && (
              <div className="rounded-xl px-4 py-3 text-center flex-shrink-0 border"
                style={{ background: `rgba(${primaryRgb}, 0.1)`, borderColor: `rgba(${primaryRgb}, 0.2)` }}>
                <p className="text-2xl font-bold" style={{ color: primaryColor }}>{proposal.templateDurationDays}</p>
                <p className="text-white/40 text-xs">días</p>
              </div>
            )}
          </div>
        </section>

        {/* AI Content sections */}
        {hasAiContent && (
          <section className="mb-6 space-y-4">
            {(["introduction", "scope", "timeline", "investment"] as const).map((key) => {
              const text = proposal.aiContent?.[key];
              if (!text) return null;
              const labels: Record<string, string> = {
                introduction: "Introducción",
                scope: "Alcance del trabajo",
                timeline: "Cronograma",
                investment: "Propuesta de valor",
              };
              return (
                <div key={key} className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
                  <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: primaryColor }}>{labels[key]}</p>
                  <p className="text-white/75 leading-relaxed">{text}</p>
                </div>
              );
            })}
          </section>
        )}

        {/* Deliverables */}
        {proposal.templateDeliverables && proposal.templateDeliverables.length > 0 && (
          <section className="mb-6 rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
            <h3 className="font-bold mb-4">¿Qué incluye?</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {proposal.templateDeliverables.map((d, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border"
                    style={{ background: `rgba(${primaryRgb}, 0.15)`, borderColor: `rgba(${primaryRgb}, 0.3)` }}>
                    <Check className="w-3 h-3" style={{ color: primaryColor }} />
                  </div>
                  {d}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Pricing */}
        <section className="mb-8 rounded-2xl border p-6"
          style={{ background: `rgba(${primaryRgb}, 0.06)`, borderColor: `rgba(${primaryRgb}, 0.2)` }}>
          <h3 className="font-bold mb-4">Inversión</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">{proposal.templateName}</span>
              <span className="text-white/80">${Number(proposal.finalPrice).toLocaleString()} {proposal.currency}</span>
            </div>
            {proposal.discountPercentage > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">Descuento especial</span>
                <span className="text-emerald-400">-{proposal.discountPercentage}%</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                ${Number(proposal.finalPrice).toLocaleString()} <span className="text-sm font-normal text-white/40">{proposal.currency}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Custom message */}
        {proposal.customMessage && (
          <section className="mb-8 rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
            <h3 className="font-bold mb-3">Mensaje personal</h3>
            <p className="text-white/60 leading-relaxed italic">"{proposal.customMessage}"</p>
          </section>
        )}

        {/* CTA */}
        {!responded && !alreadyDecided && proposal.status === "sent" && (
          <div className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6 text-center">
            <h3 className="font-bold text-lg mb-2">¿Qué decides?</h3>
            <p className="text-white/40 text-sm mb-6">Tu respuesta quedará registrada y nos notificaremos de inmediato.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleRespond("accept")}
                disabled={responding}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all text-white"
                style={{ background: primaryColor, boxShadow: responding ? "none" : `0 0 30px rgba(${primaryRgb}, 0.4)` }}
              >
                {responding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Aceptar propuesta
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRespond("reject")}
                disabled={responding}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 font-medium text-base transition-all text-white/50"
              >
                <XCircle className="w-5 h-5" />
                Declinar
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-white/20 text-xs">
          <p>Propuesta generada con ProposalAI · {agencyName}</p>
        </div>
      </main>
    </div>
  );
}
