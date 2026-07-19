import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Plus, FileText, Clock, CheckCircle2, XCircle, Send, Trash2,
  Sparkles, LogOut, LayoutTemplate, TrendingUp, DollarSign, Eye, Edit2,
  Settings, Crown
} from "lucide-react";
import { getMe, logout, proposalsApi, isLoggedIn, type Proposal, type AuthUser } from "@/lib/api";
import { useOrg } from "@/contexts/OrgContext";

const STATUS_LABELS: Record<string, string> = { draft: "Borrador", sent: "Enviada", accepted: "Aceptada", rejected: "Rechazada" };
const STATUS_BADGE: Record<string, string> = { draft: "badge-draft", sent: "badge-sent", accepted: "badge-accepted", rejected: "badge-rejected" };
const STATUS_ICON: Record<string, React.ReactNode> = {
  draft: <Clock className="w-3 h-3" />,
  sent: <Send className="w-3 h-3" />,
  accepted: <CheckCircle2 className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};
const TYPE_BADGE: Record<string, string> = {
  recurring: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  project: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  consulting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};
const TYPE_LABELS: Record<string, string> = { recurring: "Recurrente", project: "Proyecto", consulting: "Consultoría" };

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { org } = useOrg();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { setLocation("/auth/login"); return; }
    (async () => {
      const [me, list] = await Promise.all([getMe(), proposalsApi.list()]);
      if (!me) { setLocation("/auth/login"); return; }
      setUser(me);
      setProposals(list);
      setLoading(false);
    })();
  }, []);

  const handleLogout = () => { logout(); setLocation("/"); };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await proposalsApi.updateStatus(id, status);
      setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status: updated.status } : p)));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta propuesta?")) return;
    await proposalsApi.delete(id);
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  const totals = {
    all: proposals.length,
    sent: proposals.filter((p) => p.status === "sent").length,
    accepted: proposals.filter((p) => p.status === "accepted").length,
    value: proposals.filter((p) => p.status === "accepted").reduce((sum, p) => sum + Number(p.finalPrice), 0),
  };

  const orgName = org?.name || user?.agencyName || "ProposalAI";
  const orgColor = org?.primaryColor || "#7c3aed";
  const orgLogo = org?.logoUrl;
  // Use server-derived isSuperAdmin flag from /auth/me — consistent with backend DB flag
  const isSuperAdmin = user?.isSuperAdmin === true;

  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[hsl(240,12%,8%)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {orgLogo ? (
              <img src={orgLogo} alt="logo" className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: orgColor }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <span className="font-bold text-sm">{orgName}</span>
              {org?.plan && (
                <span className="text-white/30 text-xs ml-2">· {org.plan}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Link href="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:block">Admin</span>
              </Link>
            )}
            <Link href="/templates" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
              <LayoutTemplate className="w-4 h-4" />
              <span className="hidden sm:block">Templates</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:block">Mi agencia</span>
            </Link>
            <Link
              href="/proposals/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: orgColor }}
            >
              <Plus className="w-4 h-4" />
              Nueva propuesta
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Hola, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-white/40 text-sm mt-1">Aquí está el resumen de tu pipeline</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: totals.all, icon: FileText, color: "from-violet-500/10 to-violet-600/5", border: "border-violet-500/20" },
            { label: "Enviadas", value: totals.sent, icon: Send, color: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20" },
            { label: "Aceptadas", value: totals.accepted, icon: CheckCircle2, color: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20" },
            { label: "Valor cerrado", value: `$${totals.value.toLocaleString()}`, icon: DollarSign, color: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20" },
          ].map(({ label, value, icon: Icon, color, border }) => (
            <div key={label} className={`rounded-2xl p-5 bg-gradient-to-br ${color} border ${border}`}>
              <Icon className="w-5 h-5 text-white/40 mb-3" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-white/40 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Proposals table */}
        <div className="rounded-2xl border border-white/5 overflow-hidden bg-[hsl(240,12%,8%)]">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h2 className="font-semibold text-sm">Propuestas</h2>
              {proposals.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">{proposals.length}</span>
              )}
            </div>
          </div>

          {proposals.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="font-semibold mb-2">Sin propuestas aún</h3>
              <p className="text-white/40 text-sm mb-6">Crea tu primera propuesta con IA</p>
              <Link href="/proposals/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all" style={{ background: orgColor }}>
                <Plus className="w-4 h-4" /> Nueva propuesta
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-sm truncate">{proposal.clientName}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[proposal.status] ?? "badge-draft"}`}>
                          {STATUS_ICON[proposal.status]}
                          {STATUS_LABELS[proposal.status] ?? proposal.status}
                        </span>
                        {proposal.proposalType && (
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${TYPE_BADGE[proposal.proposalType] ?? TYPE_BADGE.project}`}>
                            {TYPE_LABELS[proposal.proposalType] ?? proposal.proposalType}
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs truncate">{proposal.templateName} · {proposal.clientEmail}</p>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="font-semibold text-sm">${Number(proposal.finalPrice).toLocaleString()}</p>
                      <p className="text-white/30 text-xs">{proposal.currency}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link href={`/proposals/${proposal.id}`} className="p-1.5 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-400/10 transition-all" title="Ver">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/proposals/${proposal.id}`} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <select value={proposal.status} onChange={(e) => handleStatusChange(proposal.id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 focus:outline-none focus:border-violet-500 cursor-pointer">
                        <option value="draft">Borrador</option>
                        <option value="sent">Enviada</option>
                        <option value="accepted">Aceptada</option>
                        <option value="rejected">Rechazada</option>
                      </select>
                      <button onClick={() => handleDelete(proposal.id)} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
