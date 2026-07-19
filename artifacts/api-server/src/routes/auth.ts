import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, serviceTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const DEFAULT_TEMPLATES = [
  {
    name: "SEO Local Completo",
    description: "Optimización completa para búsquedas locales: Google My Business, citas, reseñas y posicionamiento en mapas.",
    price: "1200.00",
    currency: "USD",
    durationDays: 60,
    deliverables: ["Google My Business optimizado", "Citas en directorios locales", "Gestión de reseñas", "Reporte mensual"],
    category: "recurring",
    isActive: true,
  },
  {
    name: "Social Media Management",
    description: "Gestión mensual de redes sociales con contenido creativo, programación y análisis de métricas.",
    price: "800.00",
    currency: "USD",
    durationDays: 30,
    deliverables: ["12 posts mensuales", "Stories diarias", "Gestión de engagement", "Reporte mensual de analítica"],
    category: "recurring",
    isActive: true,
  },
  {
    name: "Landing Page Premium",
    description: "Diseño y desarrollo de landing page de alta conversión con copy persuasivo y optimización SEO on-page.",
    price: "2500.00",
    currency: "USD",
    durationDays: 14,
    deliverables: ["Diseño UI/UX personalizado", "Desarrollo responsive", "Copywriting persuasivo", "SEO on-page", "Formulario de leads"],
    category: "project",
    isActive: true,
  },
  {
    name: "Publicidad Digital (Google & Meta Ads)",
    description: "Gestión completa de campañas en Google Ads y Meta Ads con optimización continua para maximizar el ROI.",
    price: "1500.00",
    currency: "USD",
    durationDays: 30,
    deliverables: ["Configuración de campañas", "Segmentación de audiencia", "Creación de anuncios", "Optimización semanal", "Reporte mensual"],
    category: "recurring",
    isActive: true,
  },
  {
    name: "Branding e Identidad Visual",
    description: "Creación de identidad visual completa: logotipo, paleta de colores, tipografía y manual de marca.",
    price: "3000.00",
    currency: "USD",
    durationDays: 21,
    deliverables: ["Logotipo en múltiples formatos", "Paleta de colores", "Tipografía seleccionada", "Manual de marca", "Papelería básica"],
    category: "project",
    isActive: true,
  },
  {
    name: "Email Marketing",
    description: "Estrategia y ejecución de email marketing: secuencias automatizadas, newsletter mensual y análisis de resultados.",
    price: "600.00",
    currency: "USD",
    durationDays: 30,
    deliverables: ["Secuencia de bienvenida", "Newsletter mensual", "Automatización de seguimiento", "Reporte de aperturas y clics"],
    category: "recurring",
    isActive: true,
  },
  {
    name: "E-commerce Shopify",
    description: "Desarrollo de tienda online profesional en Shopify con productos, pasarela de pago y configuración completa.",
    price: "4000.00",
    currency: "USD",
    durationDays: 45,
    deliverables: ["Diseño personalizado", "Configuración de productos", "Pasarela de pago", "SEO básico", "Capacitación de uso"],
    category: "project",
    isActive: true,
  },
  {
    name: "Consultoría de Marketing Digital",
    description: "Sesiones de consultoría estratégica para definir el plan de marketing digital de tu negocio.",
    price: "500.00",
    currency: "USD",
    durationDays: 5,
    deliverables: ["Diagnóstico digital completo", "Plan de marketing personalizado", "Recomendaciones de herramientas", "Sesión de seguimiento"],
    category: "consulting",
    isActive: true,
  },
];

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const { email, password, name, agencyName } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: "email, password and name are required" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({ email, passwordHash, name, agencyName }).returning();

    // Seed 8 default service templates for new users
    await db.insert(serviceTemplatesTable).values(
      DEFAULT_TEMPLATES.map((t) => ({ ...t, userId: user.id }))
    );

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, agencyName: user.agencyName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, agencyName: user.agencyName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ id: user.id, email: user.email, name: user.name, agencyName: user.agencyName });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
