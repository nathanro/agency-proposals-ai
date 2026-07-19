// API client — all requests go through Vite proxy → API server on port 8080.

const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  agencyName?: string | null;
}

export async function register(email: string, password: string, name: string, agencyName?: string) {
  const data = await request<{ token: string; user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, agencyName }),
  });
  localStorage.setItem("token", data.token);
  return data.user;
}

export async function login(email: string, password: string) {
  const data = await request<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.token);
  return data.user;
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    return await request<AuthUser>("/auth/me");
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

// ── Service Templates ─────────────────────────────────────────────────────────

export interface ServiceTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  durationDays: number;
  deliverables: string[];
  category?: string; // "recurring" | "project" | "consulting" — optional, server defaults to "project"
  isActive: boolean;
  createdAt: string;
}

export const templatesApi = {
  list: () => request<ServiceTemplate[]>("/templates"),
  create: (data: Omit<ServiceTemplate, "id" | "userId" | "createdAt">) =>
    request<ServiceTemplate>("/templates", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ServiceTemplate>) =>
    request<ServiceTemplate>(`/templates/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<{ ok: boolean }>(`/templates/${id}`, { method: "DELETE" }),
};

// ── Proposals ─────────────────────────────────────────────────────────────────

export interface AiContent {
  introduction: string;
  scope: string;
  timeline: string;
  investment: string;
}

export interface Proposal {
  id: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  status: "draft" | "sent" | "accepted" | "rejected";
  finalPrice: string;
  currency: string;
  discountPercentage: number;
  customMessage?: string | null;
  aiContent?: AiContent | null;
  proposalType: string;
  publicToken?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  serviceTemplateId: string;
  templateName?: string | null;
  // detail-only fields
  templateDescription?: string | null;
  templatePrice?: string | null;
  templateDurationDays?: number | null;
  templateDeliverables?: string[] | null;
  templateCurrency?: string | null;
  templateCategory?: string | null;
}

export interface PublicProposal extends Proposal {
  agencyName?: string | null;
  agentName?: string | null;
}

export const proposalsApi = {
  list: () => request<Proposal[]>("/proposals"),

  get: (id: string) => request<Proposal>(`/proposals/${id}`),

  create: (data: {
    serviceTemplateId: string;
    clientName: string;
    clientEmail: string;
    clientCompany?: string;
    customMessage?: string;
    discountPercentage?: number;
    aiContent?: AiContent;
    proposalType?: string;
  }) => request<Proposal>("/proposals", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: {
    clientName?: string;
    clientEmail?: string;
    clientCompany?: string;
    customMessage?: string;
    discountPercentage?: number;
    aiContent?: AiContent;
    proposalType?: string;
    serviceTemplateId?: string;
  }) => request<Proposal>(`/proposals/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  updateStatus: (id: string, status: string) =>
    request<Proposal>(`/proposals/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  send: (id: string) =>
    request<{ ok: boolean; publicToken: string; proposal: Proposal }>(`/proposals/${id}/send`, {
      method: "POST",
    }),

  delete: (id: string) => request<{ ok: boolean }>(`/proposals/${id}`, { method: "DELETE" }),

  getPublic: (token: string) =>
    fetch(`${BASE}/proposals/public/${token}`).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Not found");
      return d as PublicProposal;
    }),

  respond: (token: string, action: "accept" | "reject") =>
    fetch(`${BASE}/proposals/public/${token}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Error");
      return d as { ok: boolean; status: string };
    }),
};

// ── AI ────────────────────────────────────────────────────────────────────────

export interface ProposalContent {
  introduction: string;
  scope: string;
  timeline: string;
  investment: string;
}

export const aiApi = {
  generateProposal: (data: {
    serviceName: string;
    clientName: string;
    clientCompany?: string;
    serviceDescription?: string;
  }) => request<ProposalContent>("/ai/generate-proposal", { method: "POST", body: JSON.stringify(data) }),

  generateTasks: (data: {
    serviceName: string;
    serviceDescription?: string;
    deliverables?: string[];
  }) => request<Array<{ title: string; description: string; priority: string; estimatedHours: number }>>(
    "/ai/generate-tasks",
    { method: "POST", body: JSON.stringify(data) }
  ),
};
