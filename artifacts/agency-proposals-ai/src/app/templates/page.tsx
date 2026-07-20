import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Plus, Edit2, Trash2, Zap, Sparkles, Check, X, ShoppingBag, Download, ExternalLink } from "lucide-react";
import { isLoggedIn, templatesApi, aiApi, catalogApi, type ServiceTemplate, type CatalogService } from "@/lib/api";

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "ARS"];

const CATEGORY_LABELS: Record<string, string> = {
  project: "Proyecto", recurring: "Recurrente", consulting: "Consultoría",
  seo: "SEO", sem: "SEM", social: "Social Media", web: "Desarrollo Web",
  design: "Diseño", video: "Video", email: "Email Marketing",
};
const CATEGORY_COLORS: Record<string, string> = {
  recurring: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  project: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  consulting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  seo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  sem: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  social: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  web: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  design: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  video: "bg-red-500/10 text-red-400 border-red-500/20",
  email: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

const emptyForm = { name: "", description: "", price: "", currency: "USD", durationDays: "30", deliverables: "", category: "project" };

type Tab = "mine" | "catalog";

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("mine");
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ServiceTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<{ title: string; priority: string; estimatedHours: number }[]>([]);

  // Import modal
  const [importService, setImportService] = useState<CatalogService | null>(null);
  const [importPrice, setImportPrice] = useState("");
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!isLoggedIn()) { setLocation("/auth/login"); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const list = await templatesApi.list();
      setTemplates(list);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    if (catalog.length > 0) return; // already loaded
    setCatalogLoading(true);
    try {
      const list = await catalogApi.list();
      setCatalog(list);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === "catalog") loadCatalog();
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setGeneratedTasks([]); setShowModal(true); };
  const openEdit = (t: ServiceTemplate) => {
    setEditing(t);
    setForm({
      name: t.name, description: t.description, price: t.price, currency: t.currency,
      durationDays: String(t.durationDays), deliverables: t.deliverables.join(", "),
      category: t.category ?? "project",
    });
    setGeneratedTasks([]);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description, price: form.price, currency: form.currency,
        durationDays: Number(form.durationDays),
        deliverables: form.deliverables.split(",").map((s) => s.trim()).filter(Boolean),
        category: form.category,
        isActive: true, userId: "",
      };
      if (editing) {
        const updated = await templatesApi.update(editing.id, payload);
        setTemplates((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
      } else {
        const created = await templatesApi.create(payload);
        setTemplates((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este template?")) return;
    await templatesApi.delete(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGenerateTasks = async () => {
    if (!form.name) return;
    setGeneratingTasks(true);
    try {
      const tasks = await aiApi.generateTasks({
        serviceName: form.name,
        serviceDescription: form.description,
        deliverables: form.deliverables.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setGeneratedTasks(tasks);
    } catch {
      alert("Error generando tareas");
    } finally {
      setGeneratingTasks(false);
    }
  };

  const toggleActive = async (t: ServiceTemplate) => {
    const updated = await templatesApi.update(t.id, { isActive: !t.isActive });
    setTemplates((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
  };

  const openImport = (service: CatalogService) => {
    setImportService(service);
    setImportPrice(service.suggestedPrice ?? service.basePrice);
    setImportSuccess(null);
  };

  const handleImport = async () => {
    if (!importService) return;
    const price = Number(importPrice);
    if (!price || price <= 0) { alert("Ingresa un precio de venta válido"); return; }
    setImporting(true);
    try {
      const tmpl = await catalogApi.import(importService.id, price);
      setTemplates((prev) => [tmpl, ...prev]);
      setImportSuccess(importService.name);
      setImportService(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setImporting(false);
    }
  };

  // Set of sourceServiceIds already imported by this org
  const importedIds = new Set(templates.map((t) => t.sourceServiceId).filter(Boolean));

  if (loading) return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(240,15%,6%)] text-white">
      <header className="border-b border-white/5 bg-[hsl(240,12%,8%)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold">Templates de servicio</h1>
            <p className="text-white/40 text-xs">{templates.length} servicios configurados</p>
          </div>
        </div>
        {tab === "mine" && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Nuevo template
          </button>
        )}
      </header>

      {/* Tab bar */}
      <div className="border-b border-white/5 bg-[hsl(240,12%,8%)] px-6">
        <div className="flex gap-1 max-w-5xl mx-auto">
          <button
            onClick={() => handleTabChange("mine")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
              tab === "mine"
                ? "border-violet-500 text-violet-300"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Mis Templates
          </button>
          <button
            onClick={() => handleTabChange("catalog")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
              tab === "catalog"
                ? "border-violet-500 text-violet-300"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Catálogo Publiexpert
          </button>
        </div>
      </div>

      {/* Import success toast */}
      {importSuccess && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium z-50 shadow-lg">
          <Check className="w-4 h-4" />
          "{importSuccess}" agregado a tus templates
          <button onClick={() => setImportSuccess(null)} className="ml-2 text-emerald-400/60 hover:text-emerald-300">×</button>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Tab: Mis Templates ── */}
        {tab === "mine" && (
          templates.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="font-semibold mb-2">Sin templates aún</h3>
              <p className="text-white/40 text-sm mb-6">Crea tu primer template o importa uno del catálogo</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Crear template
                </button>
                <button onClick={() => handleTabChange("catalog")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-all">
                  <ShoppingBag className="w-4 h-4" /> Ver catálogo
                </button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((t) => (
                <div key={t.id} className={`rounded-2xl border p-5 bg-[hsl(240,12%,8%)] transition-all ${t.isActive ? "border-white/10 hover:border-white/20" : "border-white/5 opacity-60"}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                        {t.sourceServiceId && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
                            vía Publiexpert
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs line-clamp-2">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-white/3 rounded-lg py-2">
                      <p className="font-bold text-violet-400 text-sm">${Number(t.price).toLocaleString()}</p>
                      <p className="text-white/30 text-xs">{t.currency}</p>
                    </div>
                    <div className="bg-white/3 rounded-lg py-2">
                      <p className="font-bold text-sm">{t.durationDays}</p>
                      <p className="text-white/30 text-xs">días</p>
                    </div>
                    <div className="bg-white/3 rounded-lg py-2">
                      <p className="font-bold text-sm">{t.deliverables.length}</p>
                      <p className="text-white/30 text-xs">items</p>
                    </div>
                  </div>

                  {t.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {t.deliverables.slice(0, 3).map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-xs">{d}</span>
                      ))}
                      {t.deliverables.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/30 text-xs">+{t.deliverables.length - 3}</span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => toggleActive(t)}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      t.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {t.isActive ? <><Check className="w-3 h-3" /> Activo</> : <><X className="w-3 h-3" /> Inactivo</>}
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Tab: Catálogo Publiexpert ── */}
        {tab === "catalog" && (
          catalogLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : catalog.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">El catálogo está vacío</h3>
              <p className="text-white/40 text-sm">Publiexpert aún no ha publicado servicios en el catálogo.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
                <ShoppingBag className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Catálogo Publiexpert</p>
                  <p className="text-xs text-amber-400/70 mt-0.5">
                    Importa servicios y define tu propio precio de venta. Tus clientes solo ven tu marca.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalog.map((s) => {
                  const alreadyImported = importedIds.has(s.id);
                  const catColor = CATEGORY_COLORS[s.category] ?? CATEGORY_COLORS.project;
                  return (
                    <div key={s.id} className="rounded-2xl border border-white/10 bg-[hsl(240,12%,8%)] hover:border-white/20 p-5 transition-all flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1">{s.name}</h3>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${catColor}`}>
                            {CATEGORY_LABELS[s.category] ?? s.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-white/50 text-xs leading-relaxed mb-4 flex-1">{s.description}</p>

                      <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                        <div className="bg-white/3 rounded-lg py-2">
                          <p className="font-bold text-amber-400 text-sm">${Number(s.basePrice).toLocaleString()}</p>
                          <p className="text-white/30 text-xs">{s.currency} base</p>
                        </div>
                        <div className="bg-white/3 rounded-lg py-2">
                          <p className="font-bold text-sm">{s.durationDays}</p>
                          <p className="text-white/30 text-xs">días</p>
                        </div>
                      </div>

                      {s.deliverables.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {s.deliverables.slice(0, 3).map((d, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">{d}</span>
                          ))}
                          {s.deliverables.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/30 text-xs">+{s.deliverables.length - 3}</span>
                          )}
                        </div>
                      )}

                      {alreadyImported ? (
                        <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check className="w-3 h-3" /> Ya importado
                        </div>
                      ) : (
                        <button
                          onClick={() => openImport(s)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Importar servicio
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}
      </main>

      {/* ── Template create/edit modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[hsl(240,12%,10%)] border border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold">{editing ? "Editar template" : "Nuevo template"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Nombre del servicio *</label>
                  <input type="text" value={form.name} onChange={set("name")} required placeholder="Ej: Local SEO Package"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Descripción *</label>
                  <textarea value={form.description} onChange={set("description")} required rows={2} placeholder="Qué incluye este servicio..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Categoría</label>
                    <select value={form.category} onChange={set("category")}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors">
                      {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Moneda</label>
                    <select value={form.currency} onChange={set("currency")}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-violet-500 transition-colors">
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Precio *</label>
                    <input type="number" value={form.price} onChange={set("price")} required min="0" placeholder="1000"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Duración (días)</label>
                    <input type="number" value={form.durationDays} onChange={set("durationDays")} min="1" placeholder="30"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Deliverables (separados por coma)</label>
                  <textarea value={form.deliverables} onChange={set("deliverables")} rows={2} placeholder="Google My Business, Citas locales, Reseñas..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                </div>

                {generatedTasks.length > 0 && (
                  <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-4">
                    <p className="text-xs text-violet-400 font-semibold mb-3 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Tareas generadas por IA</p>
                    <div className="space-y-2">
                      {generatedTasks.slice(0, 5).map((task, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 mt-0.5 ${task.priority === "high" ? "bg-red-500/20 text-red-400" : task.priority === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/40"}`}>
                            {task.priority}
                          </span>
                          <span className="text-white/70">{task.title}</span>
                          <span className="ml-auto text-white/30 flex-shrink-0">{task.estimatedHours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={handleGenerateTasks} disabled={generatingTasks || !form.name}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 disabled:opacity-40 text-sm transition-all">
                    {generatingTasks ? <div className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Generar tareas con IA
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-semibold transition-all">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {editing ? "Guardar cambios" : "Crear template"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Import modal ── */}
      {importService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) setImportService(null); }}>
          <div className="w-full max-w-md rounded-2xl bg-[hsl(240,12%,10%)] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <h2 className="font-bold text-sm">Importar servicio</h2>
                </div>
                <p className="text-white/40 text-xs">{importService.name}</p>
              </div>
              <button onClick={() => setImportService(null)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reference pricing */}
            <div className="rounded-xl bg-white/3 border border-white/8 p-4 mb-5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Precio base Publiexpert</span>
                <span className="font-semibold text-amber-400">${Number(importService.basePrice).toLocaleString()} {importService.currency}</span>
              </div>
              {importService.suggestedPrice && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Precio sugerido de venta</span>
                  <span className="font-semibold text-violet-400">${Number(importService.suggestedPrice).toLocaleString()} {importService.currency}</span>
                </div>
              )}
            </div>

            {/* Sale price input */}
            <div className="mb-5">
              <label className="text-xs text-white/40 mb-1.5 block">Tu precio de venta ({importService.currency}) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={importPrice}
                  onChange={(e) => setImportPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <p className="text-white/30 text-xs mt-1.5 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                El cliente solo verá el precio que definas — Publiexpert no aparece en la propuesta.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setImportService(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleImport} disabled={importing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-semibold transition-all">
                {importing
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Download className="w-4 h-4" /> Importar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
