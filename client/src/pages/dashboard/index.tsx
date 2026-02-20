import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import FreeDashboard from "./free";
import ProDashboard from "./pro";
import ComplianceFlow from "@/components/compliance-flow";
import SelfAudit from "@/components/self-audit";
import Guidebook from "@/components/guidebook";
import { useLanguage } from "@/i18n/context";

export type DashboardView = "dashboard" | "flow" | "audit" | "guide";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isPro = user?.isPro ?? false;
  const [view, setView] = useState<DashboardView>("dashboard");
  const [expandGate7, setExpandGate7] = useState(false);

  const handleOpenFlow = () => setView("flow");
  const handleOpenAudit = () => setView("audit");
  const handleOpenGuide = () => setView("guide");
  const handleOpenGate7 = () => {
    setExpandGate7(true);
    setView("flow");
  };
  const handleBack = () => {
    setView("dashboard");
    setExpandGate7(false);
  };

  if (view === "flow") {
    return (
      <div>
        <button
          onClick={handleBack}
          className="px-6 md:px-14 pt-4 text-sm font-heading font-bold tracking-wide hover:underline"
          style={{ color: "#14B8A6" }}
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
          style={{ color: "#14B8A6" }}
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
          style={{ color: "#14B8A6" }}
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
