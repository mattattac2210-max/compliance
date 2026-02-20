import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useUpgradeModal } from "@/components/upgrade-modal";
import {
  Hexagon, CheckCircle, BookOpen, Archive, Clock, AlertTriangle, Lock, ArrowRight
} from "lucide-react";
import type { Property } from "@shared/schema";

interface FreeDashboardProps {
  onOpenFlow: () => void;
  onOpenAudit: () => void;
  onOpenGuide: () => void;
  onOpenGate7: () => void;
}

export default function FreeDashboard({ onOpenFlow, onOpenAudit, onOpenGuide, onOpenGate7 }: FreeDashboardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { openUpgradeModal } = useUpgradeModal();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const hasProperty = properties.length > 0;

  const otaDeadline = new Date("2026-03-31");
  const now = new Date();
  const daysRemaining = Math.ceil((otaDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const deadlinePassed = daysRemaining <= 0;

  const freeTiles = useMemo(() => [
    {
      key: "flow",
      icon: Hexagon,
      color: "#14B8A6",
      title: t.dashboard.tileFlowTitle,
      desc: t.dashboard.tileFlowDesc,
      cta: t.dashboard.tileFlowCta,
      onClick: onOpenFlow,
    },
    {
      key: "audit",
      icon: CheckCircle,
      color: "#60A5FA",
      title: t.dashboard.tileAuditTitle,
      desc: t.dashboard.tileAuditDesc,
      cta: t.dashboard.tileAuditCta,
      onClick: onOpenAudit,
    },
    {
      key: "guide",
      icon: BookOpen,
      color: "#A78BFA",
      title: t.dashboard.tileGuideTitle,
      desc: t.dashboard.tileGuideDesc,
      cta: t.dashboard.tileGuideCta,
      onClick: onOpenGuide,
    },
  ], [t, onOpenFlow, onOpenAudit, onOpenGuide]);

  const lockedTiles = useMemo(() => [
    {
      key: "vault",
      icon: Archive,
      color: "#14B8A6",
      title: t.dashboard.tileVaultTitle,
      desc: t.dashboard.tileVaultDesc,
      cta: t.dashboard.tileVaultCta,
    },
    {
      key: "timeline",
      icon: Clock,
      color: "#F59E0B",
      title: t.dashboard.tileTimelineTitle,
      desc: t.dashboard.tileTimelineDesc,
      cta: t.dashboard.tileTimelineCta,
    },
    {
      key: "alerts",
      icon: AlertTriangle,
      color: "#EF4444",
      title: t.dashboard.tileAlertsTitle,
      desc: t.dashboard.tileAlertsDesc,
      cta: t.dashboard.tileAlertsCta,
    },
  ], [t]);

  return (
    <div className="px-6 md:px-14 py-6 space-y-8" data-testid="free-dashboard">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading font-extrabold text-2xl tracking-tight" style={{ color: "var(--app-text)" }} data-testid="text-welcome">
            {t.dashboard.welcomeBack}, {user?.firstName || user?.email?.split("@")[0] || ""}
          </h1>
          <span
            className="text-[10px] font-heading font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ background: "rgba(100,116,139,0.12)", border: "1px solid rgba(100,116,139,0.2)", color: "#94A3B8" }}
            data-testid="badge-free-plan"
          >
            {t.dashboard.freePlan}
          </span>
        </div>
        {!hasProperty && (
          <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
            {t.dashboard.noPropertyNudge}{" "}
            <Link href="/profile" className="underline" style={{ color: "#14B8A6" }} data-testid="link-add-property">
              {t.dashboard.noPropertyCta}
            </Link>
          </p>
        )}
        <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }} data-testid="text-free-subheading">
          {t.dashboard.freeSubheading}
        </p>
      </div>

      <button
        onClick={openUpgradeModal}
        className="w-full text-left text-xs font-heading font-bold tracking-wide px-4 py-2 rounded-lg transition-colors hover:opacity-90"
        style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.18)", color: "#14B8A6" }}
        data-testid="button-upgrade-nudge"
      >
        {t.dashboard.upgradeNudge}
      </button>

      {!deadlinePassed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5 space-y-2"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
          data-testid="ota-deadline-banner"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="font-heading font-extrabold text-xs tracking-widest uppercase" style={{ color: "#EF4444" }}>
              {t.dashboard.otaDeadlineBanner}
            </span>
            <span
              className="ml-auto text-xs font-heading font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}
            >
              {daysRemaining} {t.dashboard.daysRemaining}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
            {t.dashboard.otaDeadlineBody}
          </p>
          <button
            onClick={onOpenGate7}
            className="text-xs font-heading font-bold tracking-wide hover:underline"
            style={{ color: "#EF4444" }}
            data-testid="button-ota-gate7"
          >
            {t.dashboard.otaDeadlineCta}
          </button>
        </motion.div>
      )}

      {deadlinePassed && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
          data-testid="ota-deadline-passed"
        >
          {t.dashboard.otaDeadlinePassed}
        </div>
      )}

      <div>
        <h2 className="font-heading font-bold text-sm tracking-widest uppercase mb-4" style={{ color: "var(--app-text-muted)" }} data-testid="heading-free-tools">
          {t.dashboard.freeToolsHeading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {freeTiles.map((tile) => (
            <button
              key={tile.key}
              onClick={tile.onClick}
              className="text-left rounded-xl p-5 transition-all hover:scale-[1.01] group"
              style={{
                background: `${tile.color}08`,
                border: `1px solid ${tile.color}22`,
              }}
              data-testid={`tile-${tile.key}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tile.color}18` }}>
                  <tile.icon className="w-4 h-4" style={{ color: tile.color }} />
                </div>
                <span className="font-heading font-extrabold text-sm" style={{ color: "var(--app-text)" }}>
                  {tile.title}
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--app-text-muted)" }}>
                {tile.desc}
              </p>
              <span
                className="text-xs font-heading font-bold tracking-wide group-hover:underline"
                style={{ color: tile.color }}
              >
                {tile.cta}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading font-bold text-sm tracking-widest uppercase mb-4" style={{ color: "var(--app-text-muted)" }} data-testid="heading-locked">
          {t.dashboard.lockedHeading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {lockedTiles.map((tile) => (
            <button
              key={tile.key}
              onClick={openUpgradeModal}
              className="text-left rounded-xl p-5 opacity-60 hover:opacity-80 transition-all relative group"
              style={{
                background: "var(--app-panel)",
                border: "1px solid var(--app-border)",
              }}
              data-testid={`tile-locked-${tile.key}`}
            >
              <Lock className="absolute top-3 right-3 w-3.5 h-3.5" style={{ color: "var(--app-text-muted)" }} />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tile.color}18` }}>
                  <tile.icon className="w-4 h-4" style={{ color: tile.color }} />
                </div>
                <span className="font-heading font-extrabold text-sm" style={{ color: "var(--app-text)" }}>
                  {tile.title}
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--app-text-muted)" }}>
                {tile.desc}
              </p>
              <span
                className="text-xs font-heading font-bold tracking-wide group-hover:underline"
                style={{ color: tile.color }}
              >
                {tile.cta}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 text-center">
          <p className="text-[10px]" style={{ color: "var(--app-text-muted)" }}>
            {t.dashboard.lockedMoreTools}
          </p>
          <button
            onClick={openUpgradeModal}
            className="text-xs font-heading font-bold tracking-wide mt-1 hover:underline"
            style={{ color: "#14B8A6" }}
            data-testid="button-see-pro"
          >
            {t.dashboard.lockedMoreCta}
          </button>
        </div>
      </div>
    </div>
  );
}
