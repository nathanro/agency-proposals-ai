import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { orgApi, getStoredOrg, isLoggedIn, type OrgBranding } from "@/lib/api";

interface OrgContextValue {
  org: OrgBranding | null;
  setOrg: (org: OrgBranding) => void;
  loading: boolean;
}

const OrgContext = createContext<OrgContextValue>({
  org: null,
  setOrg: () => {},
  loading: false,
});

function injectOrgStyles(org: OrgBranding) {
  document.documentElement.style.setProperty("--org-primary", org.primaryColor || "#7c3aed");
  const r = parseInt(org.primaryColor?.slice(1, 3) ?? "7c", 16);
  const g = parseInt(org.primaryColor?.slice(3, 5) ?? "3a", 16);
  const b = parseInt(org.primaryColor?.slice(5, 7) ?? "ed", 16);
  document.documentElement.style.setProperty("--org-primary-rgb", `${r}, ${g}, ${b}`);
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const [org, setOrgState] = useState<OrgBranding | null>(null);
  const [loading, setLoading] = useState(isLoggedIn());

  useEffect(() => {
    // Fast initial load from localStorage
    const stored = getStoredOrg();
    if (stored) {
      setOrgState(stored);
      injectOrgStyles(stored);
    }

    // Fetch fresh data from API if logged in
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    orgApi.get()
      .then((freshOrg) => {
        setOrgState(freshOrg);
        injectOrgStyles(freshOrg);
        localStorage.setItem("org", JSON.stringify(freshOrg));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setOrg = (newOrg: OrgBranding) => {
    setOrgState(newOrg);
    injectOrgStyles(newOrg);
    localStorage.setItem("org", JSON.stringify(newOrg));
  };

  return (
    <OrgContext.Provider value={{ org, setOrg, loading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}
