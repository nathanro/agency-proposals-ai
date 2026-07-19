import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Crown, Building2, FileText, Users, Settings2, Check, X } from "lucide-react";
import { isLoggedIn, adminApi, type AdminOrg } from "@/lib/api";

const PLANS = ["free", "starter", "pro", "agency"];
const PLAN_COLORS: Record<string, string> = {
  free:    "bg-white/10 text-white/60",
  starter: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pro:     "bg-violet-500/20 text-violet-300 border-violet-500/30",
  agency:  "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { setLocation("/auth/login"); return; }
    adminApi.listOrgs()
      .then((list) => { setOrgs(list); setLoading(false); })
      .catch((err) => { setError(err.message ?? "Access denied"); setLoading(false); });
  }, []);

  const handlePlanChange = async (orgId: string, plan: string) => {
    setSaving(orgId);
    try {
      const updated = await adminApi.updateOrg(orgId, { plan });
      setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, ...updated, proposalCount: o.proposalCount } : o));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  };

  const handleGiftedToggle = async (orgId: string, current: boolean) => {
    setSaving(orgId);
    try {
      const updated = await adminApi.updateOrg(orgId, { giftedAccess: !current });
      setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, ...updated, proposalCount: o.proposalCount } : o));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  };

  const totals = {
    orgs: orgs.length,
    proposals: orgs.reduce((s, o) => s + o.proposalCount, 0),
    gifted: orgs.filter((o) => o.giftedAccess).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-white font-bold text-xl mb-2">Acceso denegado</h1>
          <p className="text-white/40 text-sm mb-4">{error}</p>
          <Link href="/dashboard" className="text-violet-400 hover:underline text-sm">← Volver al dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white">
      <header className="border-b border-white/5 bg-[hsl(240,12%,8%)] px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <div>
            <h1 className="font-bold">Superadmin</h1>
            <p className="text-white/40 text-xs">Panel de control de organizaciones</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl p-5 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
            <Building2 className="w-5 h-5 text-white/40 mb-3" />
            <p className="text-2xl font-bold">{totals.orgs}</p>
            <p className="text-white/40 text-xs mt-1">Agencias</p>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
            <FileText className="w-5 h-5 text-white/40 mb-3" />
            <p className="text-2xl font-bold">{totals.proposals}</p>
            <p className="text-white/40 text-xs mt-1">Propuestas totales</p>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
            <Users className="w-5 h-5 text-white/40 mb-3" />
            <p className="text-2xl font-bold">{totals.gifted}</p>
            <p className="text-white/40 text-xs mt-1">Acceso gifted</p>
          </div>
        </div>

        {/* Orgs table */}
        <div className="rounded-2xl border border-white/5 overflow-hidden bg-[hsl(240,12%,8%)]">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-sm">Organizaciones</h2>
          </div>

          <div className="divide-y divide-white/5">
            {orgs.map((org) => (
              <div key={org.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Org info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt="logo" className="w-9 h-9 rounded-lg object-contain bg-white/10 flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: org.primaryColor }}>
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{org.name}</p>
                      <p className="text-white/30 text-xs truncate">{org.ownerEmail}</p>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="font-semibold text-sm">{org.proposalCount}</p>
                    <p className="text-white/30 text-xs">de {org.proposalLimit} propuestas</p>
                  </div>

                  {/* Plan selector */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={org.plan}
                      onChange={(e) => handlePlanChange(org.id, e.target.value)}
                      disabled={saving === org.id}
                      className={`px-2 py-1 rounded-lg border text-xs focus:outline-none focus:border-violet-500 cursor-pointer transition-colors ${PLAN_COLORS[org.plan] ?? PLAN_COLORS.free}`}
                      style={{ background: "hsl(240,12%,12%)" }}
                    >
                      {PLANS.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>

                    {/* Gifted toggle */}
                    <button
                      onClick={() => handleGiftedToggle(org.id, org.giftedAccess ?? false)}
                      disabled={saving === org.id}
                      title={org.giftedAccess ? "Quitar acceso gifted" : "Dar acceso gifted"}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                        org.giftedAccess
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {saving === org.id ? (
                        <div className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                      ) : org.giftedAccess ? (
                        <Check className="w-3 h-3" />
                      ) : null}
                      Gifted
                    </button>
                  </div>

                  {/* Created at */}
                  <div className="text-white/20 text-xs flex-shrink-0 hidden lg:block">
                    {new Date(org.createdAt!).toLocaleDateString("es-MX", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
