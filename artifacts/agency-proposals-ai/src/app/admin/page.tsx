import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  ArrowLeft, Crown, Building2, FileText, Users, Settings2, Check, X,
  ShoppingBag, Plus, Edit2, Eye, EyeOff, ChevronDown, ChevronUp,
} from "lucide-react";
import { isLoggedIn, adminApi, catalogApi, type AdminOrg, type CatalogService } from "@/lib/api";

const PLANS = ["free", "starter", "pro", "agency"];
const PLAN_COLORS: Record<string, string> = {
  free:    "bg-white/10 text-white/60",
  starter: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pro:     "bg-violet-500/20 text-violet-300 border-violet-500/30",
  agency:  "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "ARS"];
const CATEGORIES = [
  { value: "project", label: "Proyecto" },
  { value: "recurring", label: "Recurrente" },
  { value: "consulting", label: "Consultoría" },
  { value: "seo", label: "SEO" },
  { value: "sem", label: "SEM" },
  { value: "social", label: "Social Media" },
  { value: "web", label: "Desarrollo Web" },
  { value: "design", label: "Diseño" },
  { value: "video", label: "Video" },
  { value: "email", label: "Email Marketing" },
];

const emptyCatalogForm = {
  name: "", description: "", category: "project",
  basePrice: "", suggestedPrice: "", currency: "USD", durationDays: "30", deliverables: "",
};

type Tab = "orgs" | "catalog";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("orgs");

  // Orgs state
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  // Catalog state
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingService, setEditingService] = useState<CatalogService | null>(null);
  const [catalogForm, setCatalogForm] = useState(emptyCatalogForm);
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const setCat = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setCatalogForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!isLoggedIn()) { setLocation("/auth/login"); return; }
    adminApi.listOrgs()
      .then((list) => { setOrgs(list); setOrgsLoading(false); })
      .catch((err) => { setError(err.message ?? "Access denied"); setOrgsLoading(false); });
  }, []);

  const loadCatalog = async () => {
    if (catalog.length > 0) return;
    setCatalogLoading(true);
    try {
      const list = await catalogApi.adminList();
      setCatalog(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar catálogo");
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === "catalog") loadCatalog();
  };

  // Orgs handlers
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

  // Catalog handlers
  const openCreateCatalog = () => {
    setEditingService(null);
    setCatalogForm(emptyCatalogForm);
    setShowCatalogModal(true);
  };

  const openEditCatalog = (s: CatalogService) => {
    setEditingService(s);
    setCatalogForm({
      name: s.name, description: s.description, category: s.category,
      basePrice: s.basePrice, suggestedPrice: s.suggestedPrice ?? "",
      currency: s.currency, durationDays: String(s.durationDays),
      deliverables: s.deliverables.join(", "),
    });
    setShowCatalogModal(true);
  };

  const handleCatalogSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogSaving(true);
    try {
      const payload = {
        name: catalogForm.name,
        description: catalogForm.description,
        category: catalogForm.category,
        basePrice: Number(catalogForm.basePrice),
        suggestedPrice: catalogForm.suggestedPrice ? Number(catalogForm.suggestedPrice) : null,
        currency: catalogForm.currency,
        durationDays: Number(catalogForm.durationDays) || 30,
        deliverables: catalogForm.deliverables.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editingService) {
        const updated = await catalogApi.adminUpdate(editingService.id, payload);
        setCatalog((prev) => prev.map((s) => s.id === editingService.id ? updated : s));
      } else {
        const created = await catalogApi.adminCreate(payload);
        setCatalog((prev) => [created, ...prev]);
      }
      setShowCatalogModal(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setCatalogSaving(false);
    }
  };

  const handleToggleActive = async (s: CatalogService) => {
    try {
      const updated = await catalogApi.adminToggle(s.id, !s.isActive);
      setCatalog((prev) => prev.map((x) => x.id === s.id ? updated : x));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  const totals = {
    orgs: orgs.length,
    proposals: orgs.reduce((s, o) => s + o.proposalCount, 0),
    gifted: orgs.filter((o) => o.giftedAccess).length,
  };

  if (orgsLoading) {
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
            <p className="text-white/40 text-xs">Panel de control</p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-white/5 bg-[hsl(240,12%,8%)] px-6">
        <div className="flex gap-1 max-w-6xl mx-auto">
          <button
            onClick={() => handleTabChange("orgs")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
              tab === "orgs" ? "border-amber-500 text-amber-300" : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Organizaciones
          </button>
          <button
            onClick={() => handleTabChange("catalog")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
              tab === "catalog" ? "border-amber-500 text-amber-300" : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Catálogo Publiexpert
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Tab: Organizaciones ── */}
        {tab === "orgs" && (
          <>
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

            <div className="rounded-2xl border border-white/5 overflow-hidden bg-[hsl(240,12%,8%)]">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-violet-400" />
                <h2 className="font-semibold text-sm">Organizaciones</h2>
              </div>
              <div className="divide-y divide-white/5">
                {orgs.map((org) => (
                  <div key={org.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4 flex-wrap">
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
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="font-semibold text-sm">{org.proposalCount}</p>
                        <p className="text-white/30 text-xs">de {org.proposalLimit} propuestas</p>
                      </div>
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
                      <div className="text-white/20 text-xs flex-shrink-0 hidden lg:block">
                        {new Date(org.createdAt!).toLocaleDateString("es-MX", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Tab: Catálogo Publiexpert ── */}
        {tab === "catalog" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold">Catálogo de servicios</h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {catalog.filter((s) => s.isActive).length} activos · {catalog.filter((s) => !s.isActive).length} inactivos
                </p>
              </div>
              <button onClick={openCreateCatalog}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-all">
                <Plus className="w-4 h-4" /> Nuevo servicio
              </button>
            </div>

            {catalogLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : catalog.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">Catálogo vacío</h3>
                <p className="text-white/40 text-sm mb-6">Crea el primer servicio para que las agencias puedan importarlo</p>
                <button onClick={openCreateCatalog}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-all">
                  <Plus className="w-4 h-4" /> Crear servicio
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 overflow-hidden bg-[hsl(240,12%,8%)]">
                <div className="divide-y divide-white/5">
                  {catalog.map((s) => (
                    <div key={s.id} className={`transition-colors ${s.isActive ? "hover:bg-white/[0.02]" : "opacity-50 hover:bg-white/[0.01]"}`}>
                      <div className="px-6 py-4 flex items-center gap-4">
                        {/* Name + category */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-sm truncate">{s.name}</p>
                            <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${s.isActive ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/5 text-white/30 border-white/10"}`}>
                              {s.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                          <p className="text-white/30 text-xs line-clamp-1">{s.description}</p>
                        </div>

                        {/* Prices */}
                        <div className="hidden sm:block text-right flex-shrink-0">
                          <p className="font-semibold text-sm text-amber-400">${Number(s.basePrice).toLocaleString()} {s.currency}</p>
                          {s.suggestedPrice && (
                            <p className="text-white/30 text-xs">Sugerido: ${Number(s.suggestedPrice).toLocaleString()}</p>
                          )}
                        </div>

                        {/* Duration */}
                        <div className="hidden lg:block text-center flex-shrink-0 w-16">
                          <p className="font-semibold text-sm">{s.durationDays}</p>
                          <p className="text-white/30 text-xs">días</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => setExpandedService(expandedService === s.id ? null : s.id)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all" title="Ver deliverables">
                            {expandedService === s.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => openEditCatalog(s)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(s)}
                            title={s.isActive ? "Desactivar" : "Activar"}
                            className={`p-1.5 rounded-lg transition-all ${s.isActive ? "text-emerald-400 hover:bg-emerald-400/10" : "text-white/30 hover:text-white hover:bg-white/5"}`}
                          >
                            {s.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded deliverables */}
                      {expandedService === s.id && s.deliverables.length > 0 && (
                        <div className="px-6 pb-4 flex flex-wrap gap-1.5">
                          {s.deliverables.map((d, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs">{d}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Catalog create/edit modal ── */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCatalogModal(false); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[hsl(240,12%,10%)] border border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <h2 className="font-bold">{editingService ? "Editar servicio" : "Nuevo servicio del catálogo"}</h2>
                </div>
                <button onClick={() => setShowCatalogModal(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCatalogSave} className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Nombre del servicio *</label>
                  <input type="text" value={catalogForm.name} onChange={setCat("name")} required
                    placeholder="Ej: Google Ads Management"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Descripción *</label>
                  <textarea value={catalogForm.description} onChange={setCat("description")} required rows={2}
                    placeholder="Descripción del servicio que ofrecerá Publiexpert..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Categoría</label>
                    <select value={catalogForm.category} onChange={setCat("category")}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500 transition-colors">
                      {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Moneda</label>
                    <select value={catalogForm.currency} onChange={setCat("currency")}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500 transition-colors">
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Precio base * <span className="text-amber-400/60">(costo Publiexpert)</span></label>
                    <input type="number" value={catalogForm.basePrice} onChange={setCat("basePrice")} required min="0" step="0.01"
                      placeholder="800"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Precio sugerido <span className="text-white/20">(opcional)</span></label>
                    <input type="number" value={catalogForm.suggestedPrice} onChange={setCat("suggestedPrice")} min="0" step="0.01"
                      placeholder="1200"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Duración (días)</label>
                    <input type="number" value={catalogForm.durationDays} onChange={setCat("durationDays")} min="1"
                      placeholder="30"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Deliverables (separados por coma)</label>
                  <textarea value={catalogForm.deliverables} onChange={setCat("deliverables")} rows={2}
                    placeholder="Configuración de campañas, Segmentación de audiencia, Reporte mensual..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCatalogModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm transition-all">
                    Cancelar
                  </button>
                  <button type="submit" disabled={catalogSaving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50 text-sm font-semibold transition-all">
                    {catalogSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : null}
                    {editingService ? "Guardar cambios" : "Publicar servicio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
