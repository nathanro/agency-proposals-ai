import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Save, Building2, Palette, Image, Sparkles, Check, Crown } from "lucide-react";
import { isLoggedIn, orgApi, type OrgBranding } from "@/lib/api";
import { TrendingUp } from "lucide-react";
import { useOrg } from "@/contexts/OrgContext";

const PRESET_COLORS = [
  { label: "Violeta", value: "#7c3aed" },
  { label: "Azul", value: "#2563eb" },
  { label: "Índigo", value: "#4f46e5" },
  { label: "Esmeralda", value: "#059669" },
  { label: "Rojo", value: "#dc2626" },
  { label: "Naranja", value: "#ea580c" },
  { label: "Rosa", value: "#db2777" },
  { label: "Cian", value: "#0891b2" },
];

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free:    { label: "Free",    color: "bg-white/10 text-white/50" },
  starter: { label: "Starter", color: "bg-blue-500/20 text-blue-300" },
  pro:     { label: "Pro",     color: "bg-violet-500/20 text-violet-300" },
  agency:  { label: "Agency",  color: "bg-amber-500/20 text-amber-300" },
};

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { org, setOrg } = useOrg();
  const [form, setForm] = useState({ name: "", logoUrl: "", primaryColor: "#7c3aed" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { setLocation("/auth/login"); return; }
    orgApi.usage().then((u) => setUsageCount(u.proposals)).catch(() => {});
  }, []);

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name,
        logoUrl: org.logoUrl ?? "",
        primaryColor: org.primaryColor ?? "#7c3aed",
      });
    }
  }, [org]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await orgApi.update({
        name: form.name,
        logoUrl: form.logoUrl || undefined,
        primaryColor: form.primaryColor,
      });
      setOrg(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const plan = org?.plan ?? "free";
  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free;

  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white">
      <header className="border-b border-white/5 bg-[hsl(240,12%,8%)] px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold">Mi Agencia</h1>
          <p className="text-white/40 text-xs">Configura el branding de tu agencia</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Current plan */}
        <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-semibold text-sm">Plan actual</p>
                <p className="text-white/40 text-xs">Gestiona tu suscripción</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {org?.giftedAccess && (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gifted
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${planInfo.color}`}>
                {planInfo.label}
              </span>
            </div>
          </div>
          {org && (
            <div className="mt-4 space-y-3">
              {/* Proposal usage */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/40 text-xs">Propuestas usadas</p>
                  <p className="text-xs font-semibold">
                    {usageCount !== null ? usageCount : "—"} / {org.proposalLimit}
                  </p>
                </div>
                {usageCount !== null && (
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usageCount >= org.proposalLimit
                          ? "bg-red-500"
                          : usageCount / org.proposalLimit >= 0.8
                          ? "bg-amber-500"
                          : "bg-violet-500"
                      }`}
                      style={{ width: `${Math.min(100, (usageCount / org.proposalLimit) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-sm">
                <p className="text-white/40 text-xs mb-1">Miembros máx.</p>
                <p className="font-semibold">{org.memberLimit}</p>
              </div>
            </div>
          )}
          {/* Upgrade CTA — shown when at/near limit and not gifted or agency */}
          {org && !org.giftedAccess && org.plan !== "agency" && usageCount !== null && usageCount >= org.proposalLimit * 0.8 && (
            <div className={`mt-4 flex items-center gap-3 p-3 rounded-xl border ${
              usageCount >= org.proposalLimit
                ? "border-red-500/30 bg-red-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}>
              <TrendingUp className={`w-4 h-4 shrink-0 ${usageCount >= org.proposalLimit ? "text-red-400" : "text-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${usageCount >= org.proposalLimit ? "text-red-300" : "text-amber-300"}`}>
                  {usageCount >= org.proposalLimit
                    ? "Límite alcanzado — no puedes crear más propuestas"
                    : "Estás cerca de tu límite de propuestas"}
                </p>
                <p className="text-xs text-white/40 mt-0.5">Actualiza tu plan para seguir creciendo.</p>
              </div>
              <a
                href="mailto:hola@tuagencia.com?subject=Quiero%20actualizar%20mi%20plan"
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  usageCount >= org.proposalLimit
                    ? "bg-red-500 hover:bg-red-400 text-white"
                    : "bg-amber-500 hover:bg-amber-400 text-black"
                }`}
              >
                Actualizar
              </a>
            </div>
          )}
        </section>

        {/* Branding form */}
        <form onSubmit={handleSave} className="space-y-6">
          <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
            <h2 className="font-semibold text-sm mb-5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-400" /> Nombre de la agencia
            </h2>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="Mi Agencia Digital"
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </section>

          <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
            <h2 className="font-semibold text-sm mb-5 flex items-center gap-2">
              <Image className="w-4 h-4 text-violet-400" /> Logo (URL)
            </h2>
            <input
              type="url"
              value={form.logoUrl}
              onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://mi-agencia.com/logo.png"
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors mb-3"
            />
            {form.logoUrl && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                <img
                  src={form.logoUrl}
                  alt="Logo preview"
                  className="w-10 h-10 rounded-lg object-contain bg-white/10"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <p className="text-white/40 text-xs">Vista previa del logo</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-[hsl(240,12%,8%)] border border-white/5 p-6">
            <h2 className="font-semibold text-sm mb-5 flex items-center gap-2">
              <Palette className="w-4 h-4 text-violet-400" /> Color primario
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                placeholder="#7c3aed"
                className="w-32 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setForm((f) => ({ ...f, primaryColor: c.value }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.primaryColor === c.value ? "border-white scale-110" : "border-white/20 hover:border-white/50"}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </section>

          {/* Preview */}
          <section className="rounded-2xl border border-white/5 p-5" style={{ background: "hsl(240,12%,8%)" }}>
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" /> Vista previa
            </h2>
            <div className="rounded-xl border border-white/10 p-4 bg-[hsl(240,15%,6%)]">
              <div className="flex items-center gap-3 mb-3">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="logo" className="w-8 h-8 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: form.primaryColor }}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="font-bold text-sm">{form.name || "Mi Agencia"}</span>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: form.primaryColor }}
              >
                Nueva propuesta
              </button>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: saving || saved ? undefined : form.primaryColor, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <><Check className="w-4 h-4 text-emerald-400" /> <span className="text-emerald-400">¡Guardado!</span></>
            ) : (
              <><Save className="w-4 h-4" /> Guardar cambios</>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
