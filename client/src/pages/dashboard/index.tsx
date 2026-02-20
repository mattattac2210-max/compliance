import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import FreeDashboard from "./free";
import ProDashboard from "./pro";
import ComplianceFlow from "@/components/compliance-flow";
import SelfAudit from "@/components/self-audit";
import Guidebook from "@/components/guidebook";
import { useLanguage } from "@/i18n/context";
import { useLocation } from "wouter";

export type DashboardView = "dashboard" | "flow" | "audit" | "guide";

function getTabFromSearch(): DashboardView {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab === "audit" || tab === "guide" || tab === "flow") return tab;
  return "dashboard";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [location, navigate] = useLocation();
  const isPro = user?.isPro ?? false;
  const [view, setView] = useState<DashboardView>(getTabFromSearch);
  const [expandGate7, setExpandGate7] = useState(false);

  useEffect(() => {
    const newView = getTabFromSearch();
    setView(newView);
  }, [location]);

  useEffect(() => {
    const onPopState = () => setView(getTabFromSearch());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setViewAndUrl = useCallback((v: DashboardView) => {
    setView(v);
    if (v === "dashboard") {
      window.history.replaceState(null, "", "/app");
    } else {
      window.history.replaceState(null, "", `/app?tab=${v}`);
    }
  }, []);

  const handleOpenFlow = () => setViewAndUrl("flow");
  const handleOpenAudit = () => setViewAndUrl("audit");
  const handleOpenGuide = () => setViewAndUrl("guide");
  const handleOpenGate7 = () => {
    setExpandGate7(true);
    setViewAndUrl("flow");
  };
  const handleBack = () => {
    setViewAndUrl("dashboard");
    setExpandGate7(false);
  };

  if (view === "flow") {
    return (
      <div>
        <button
          onClick={handleBack}
          className="px-6 md:px-14 pt-4 text-sm font-heading font-bold tracking-wide hover:underline"
          style={{ color: "var(--accent)" }}
          data-testid="button-back-dashboard"
        >
          {t.dashboard.backToDashboard}
        </button>
        <ComplianceFlow expandGate7={expandGate7} />
      </div>
    );
  }

  if (view === "audit") {
    return (
      <div>
        <button
          onClick={handleBack}
          className="px-6 md:px-14 pt-4 text-sm font-heading font-bold tracking-wide hover:underline"
          style={{ color: "var(--accent)" }}
          data-testid="button-back-dashboard"
        >
          {t.dashboard.backToDashboard}
        </button>
        <SelfAudit />
      </div>
    );
  }

  if (view === "guide") {
    return (
      <div>
        <button
          onClick={handleBack}
          className="px-6 md:px-14 pt-4 text-sm font-heading font-bold tracking-wide hover:underline"
          style={{ color: "var(--accent)" }}
          data-testid="button-back-dashboard"
        >
          {t.dashboard.backToDashboard}
        </button>
        <Guidebook />
      </div>
    );
  }

  if (isPro) {
    return (
      <ProDashboard
        onOpenFlow={handleOpenFlow}
        onOpenAudit={handleOpenAudit}
        onOpenGuide={handleOpenGuide}
      />
    );
  }

  return (
    <FreeDashboard
      onOpenFlow={handleOpenFlow}
      onOpenAudit={handleOpenAudit}
      onOpenGuide={handleOpenGuide}
      onOpenGate7={handleOpenGate7}
    />
  );
}
