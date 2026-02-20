import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import {
  FileCheck, Clock, AlertTriangle, Calendar, Building2, ArrowRight, X,
  Hexagon, CheckCircle, BookOpen, List, ChevronRight
} from "lucide-react";
import { FILING_SCHEDULE, getNextFilingDates } from "@/lib/filing-schedule";
import type { Property, VaultDocument, VaultDocumentTemplate, StaffMember } from "@shared/schema";

interface ProDashboardProps {
  onOpenFlow: () => void;
  onOpenAudit: () => void;
  onOpenGuide: () => void;
}

const GATE_COLORS = ["#94A3B8", "#14B8A6", "#60A5FA", "#A78BFA", "#F59E0B", "#22C55E", "#FCA5A5", "#14B8A6"];
const GATE_ABBRS = ["PMA", "ZONE", "NIB", "SLF", "TAX", "STAFF", "SAFE", "OTA"];

function getGreeting(t: any): string {
  const h = new Date().getHours();
  if (h < 12) return t.dashboard.goodMorning;
  if (h < 18) return t.dashboard.goodAfternoon;
  return t.dashboard.goodEvening;
}

export default function ProDashboard({ onOpenFlow, onOpenAudit, onOpenGuide }: ProDashboardProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [setupDismissed, setSetupDismissed] = useState(() => {
    try { return localStorage.getItem("dscvr-setup-dismissed") === "true"; } catch { return false; }
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const selectedProperty = properties[0];
  const hasProperty = properties.length > 0;

  const { data: templates = [] } = useQuery<VaultDocumentTemplate[]>({
    queryKey: ["/api/vault/templates"],
  });

  const { data: documents = [] } = useQuery<VaultDocument[]>({
    queryKey: ["/api/vault", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];
      const res = await fetch(`/api/vault?propertyId=${selectedProperty.id}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedProperty?.id,
  });

  const { data: staffMembers = [] } = useQuery<StaffMember[]>({
    queryKey: ["/api/staff", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty?.id) return [];
      const res = await fetch(`/api/staff?propertyId=${selectedProperty.id}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedProperty?.id,
  });

  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const totalTemplates = templates.length;
  const uploadedCount = documents.filter(d => d.status === "uploaded" || d.status === "verified").length;
  const vaultPercent = totalTemplates > 0 ? Math.round((uploadedCount / totalTemplates) * 100) : 0;

  const expiringDocs = documents.filter(d => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate);
    return exp > now && exp <= in90;
  });

  const expiredDocs = documents.filter(d => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) <= now;
  });

  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const filingsDueThisMonth = FILING_SCHEDULE.filter(f => {
    const dates = getNextFilingDates(f, now, 1);
    return dates.some(d => d >= now && d <= monthEnd);
  });

  let complianceAlerts = 0;
  const attentionItems: Array<{ label: string; color: string; link: string; linkLabel: string }> = [];

  if (selectedProperty) {
    if (selectedProperty.otaEntityName && selectedProperty.entityName &&
        selectedProperty.otaEntityName.toLowerCase().trim() !== selectedProperty.entityName.toLowerCase().trim()) {
      complianceAlerts++;
      attentionItems.push({ label: t.dashboard.entityMismatch.replace("{{entity}}", selectedProperty.entityName).replace("{{ota}}", selectedProperty.otaEntityName), color: "#F59E0B", link: "/profile", linkLabel: t.dashboard.goToProfile });
    }
    if (selectedProperty.landTitleType === "hgb" && selectedProperty.landTitleExpiry) {
      const diff = Math.ceil((new Date(selectedProperty.landTitleExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 365 * 2) {
        complianceAlerts++;
        attentionItems.push({ label: t.dashboard.hgbExpiresInDays.replace("{{days}}", String(diff)), color: "#EF4444", link: "/profile", linkLabel: t.dashboard.goToProfile });
      }
    }
  }

  const activeStaff = staffMembers.filter(s => s.isActive);
  const bpjsGaps = activeStaff.filter(s =>
    s.bpjsKesehatanStatus === "not_registered" || s.bpjsKetenagakerjaanStatus === "not_registered"
  );
  if (bpjsGaps.length > 0) {
    complianceAlerts++;
    attentionItems.push({ label: t.dashboard.staffBpjsMissing.replace("{{count}}", String(bpjsGaps.length)), color: "#F59E0B", link: "/profile", linkLabel: t.dashboard.goToProfile });
  }

  const kitasExpiring = activeStaff.filter(s => {
    if (!s.kitasExpiry) return false;
    const diff = Math.ceil((new Date(s.kitasExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 90;
  });
  if (kitasExpiring.length > 0) {
    complianceAlerts += kitasExpiring.length;
    attentionItems.push({ label: t.dashboard.staffKitasExpiring.replace("{{count}}", String(kitasExpiring.length)), color: "#EF4444", link: "/profile", linkLabel: t.dashboard.goToProfile });
  }

  expiredDocs.forEach(d => {
    const tmpl = templates.find(tp => tp.id === d.templateId);
    const tmplName = tmpl?.translations?.[lang]?.name ?? tmpl?.translations?.en?.name ?? t.dashboard.document;
    attentionItems.push({ label: `${t.dashboard.expiredLabel}: ${tmplName}`, color: "#EF4444", link: "/vault", linkLabel: t.dashboard.goToVault });
  });

  expiringDocs.slice(0, 3).forEach(d => {
    const tmpl = templates.find(tp => tp.id === d.templateId);
    const tmplName = tmpl?.translations?.[lang]?.name ?? tmpl?.translations?.en?.name ?? t.dashboard.document;
    const daysLeft = Math.ceil((new Date(d.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    attentionItems.push({ label: `${tmplName} ${t.dashboard.expiresInDays.replace("{{days}}", String(daysLeft))}`, color: "#F59E0B", link: "/vault", linkLabel: t.dashboard.goToVault });
  });

  const alertCount = expiringDocs.length + expiredDocs.length + complianceAlerts;

  const upcomingDeadlines = useMemo(() => {
    const items: Array<{ label: string; date: Date; color: string }> = [];

    const otaDeadline = new Date("2026-03-31");
    if (otaDeadline > now && otaDeadline <= in90) {
      items.push({ label: "OTA Compliance Deadline", date: otaDeadline, color: "#EF4444" });
    }

    FILING_SCHEDULE.forEach(f => {
      const dates = getNextFilingDates(f, now, 2);
      dates.forEach(d => {
        if (d > now && d <= in90) {
          items.push({ label: f.description, date: d, color: "#F59E0B" });
        }
      });
    });

    expiringDocs.forEach(d => {
      const tmpl = templates.find(tp => tp.id === d.templateId);
      const tmplName = tmpl?.translations?.[lang]?.name ?? tmpl?.translations?.en?.name ?? t.dashboard.documentRenewal;
      items.push({ label: tmplName, date: new Date(d.expiryDate!), color: "#14B8A6" });
    });

    items.sort((a, b) => a.date.getTime() - b.date.getTime());
    return items.slice(0, 6);
  }, [expiringDocs, templates, now, in90, lang, t]);

  const gateDocCounts = useMemo(() => {
    return GATE_ABBRS.map((_, i) => {
      const gateTemplates = templates.filter(t => t.gateNumber === i);
      const total = gateTemplates.length;
      const uploaded = gateTemplates.filter(gt => {
        const doc = documents.find(d => d.templateId === gt.id);
        return doc && (doc.status === "uploaded" || doc.status === "verified");
      }).length;
      return { total, uploaded, pct: total > 0 ? Math.round((uploaded / total) * 100) : 0 };
    });
  }, [templates, documents]);

  const setupSteps = useMemo(() => {
    const profileComplete = hasProperty && !!selectedProperty?.entityName && !!selectedProperty?.nib;
    const hasVaultDoc = documents.length > 0;
    const entityConfirmed = !!selectedProperty?.entityStructure;
    const auditDone = false;
    return [
      { label: t.dashboard.setupStep1, done: profileComplete, link: "/profile" },
      { label: t.dashboard.setupStep2, done: hasVaultDoc, link: "/vault" },
      { label: t.dashboard.setupStep3, done: entityConfirmed, link: "/profile" },
      { label: t.dashboard.setupStep4, done: auditDone, link: "" },
    ];
  }, [t, hasProperty, selectedProperty, documents]);

  const setupScore = setupSteps.filter(s => s.done).length;
  const showSetup = setupScore < 4 && !setupDismissed;

  const dismissSetup = () => {
    setSetupDismissed(true);
    try { localStorage.setItem("dscvr-setup-dismissed", "true"); } catch {}
  };

  if (!hasProperty) {
    return (
      <div className="px-6 md:px-14 py-12 flex flex-col items-center justify-center text-center space-y-4" data-testid="pro-no-property">
        <Building2 className="w-12 h-12" style={{ color: "#14B8A6" }} />
        <h2 className="font-heading font-extrabold text-xl" style={{ color: "var(--app-text)" }}>
          {t.dashboard.noPropertyHeading}
        </h2>
        <p className="text-sm max-w-md" style={{ color: "var(--app-text-muted)" }}>
          {t.dashboard.noPropertyDesc}
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-heading font-bold text-sm text-white transition-colors hover:opacity-90"
          style={{ background: "#14B8A6" }}
          data-testid="button-add-property"
        >
          {t.dashboard.noPropertyCta}
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full max-w-3xl mt-8">
          {[
            { icon: FileCheck, color: "#14B8A6", title: t.dashboard.vaultProgress, sub: t.dashboard.vaultProgressSub, value: "\u2014" },
            { icon: Clock, color: "#F59E0B", title: t.dashboard.expiringDocs, sub: t.dashboard.expiringDocsSub, value: "\u2014" },
            { icon: Calendar, color: "#60A5FA", title: t.dashboard.filingsDue, sub: t.dashboard.filingsDueSub, value: "\u2014" },
            { icon: AlertTriangle, color: "#EF4444", title: t.dashboard.activeAlerts, sub: t.dashboard.activeAlertsSub, value: "\u2014" },
          ].map(card => (
            <div
              key={card.title}
              className="rounded-xl border p-4 flex items-center gap-3"
              style={{ borderColor: `${card.color}22`, background: `${card.color}06` }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${card.color}18` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <div>
                <div className="text-[10px] font-heading font-bold tracking-wider uppercase" style={{ color: "var(--app-text-muted)" }}>{card.title}</div>
                <div className="text-lg font-heading font-black" style={{ color: "var(--app-text)" }}>{card.value}</div>
                <div className="text-[9px]" style={{ color: "var(--app-text-muted)" }}>{card.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-14 py-6 space-y-6" data-testid="pro-dashboard">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading font-extrabold text-2xl tracking-tight" style={{ color: "var(--app-text)" }} data-testid="text-greeting">
            {getGreeting(t)}, {user?.firstName || user?.email?.split("@")[0] || ""}
          </h1>
          <span
            className="text-[10px] font-heading font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.2)", color: "#14B8A6" }}
            data-testid="badge-pro"
          >
            {t.dashboard.proMember}
          </span>
        </div>
        {selectedProperty && (
          <p className="text-sm mt-0.5" style={{ color: "var(--app-text-muted)" }} data-testid="text-property-subtitle">
            {selectedProperty.entityName ?? selectedProperty.propertyName}
            {selectedProperty.regency ? ` \u00b7 ${selectedProperty.regency}` : ""}
          </p>
        )}
      </div>

      {showSetup && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 relative"
          style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.15)" }}
          data-testid="setup-banner"
        >
          <button
            onClick={dismissSetup}
            className="absolute top-3 right-3 p-1 rounded hover:bg-white/5"
            data-testid="button-dismiss-setup"
          >
            <X className="w-3.5 h-3.5" style={{ color: "var(--app-text-muted)" }} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-heading font-bold text-xs tracking-wider uppercase" style={{ color: "#14B8A6" }}>
              {t.dashboard.setupHeading}
            </span>
            <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              {setupScore} {t.dashboard.stepOf}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "rgba(20,184,166,0.1)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(setupScore / 4) * 100}%`, background: "#14B8A6" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {setupSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                style={{
                  background: step.done ? "rgba(20,184,166,0.08)" : "transparent",
                  border: `1px solid ${step.done ? "rgba(20,184,166,0.15)" : "var(--app-border)"}`,
                }}
              >
                <span className="flex-1" style={{ color: step.done ? "#14B8A6" : "var(--app-text-muted)" }}>
                  {step.done ? t.dashboard.setupStepComplete : step.label}
                </span>
                {!step.done && step.link && (
                  <Link href={step.link} className="text-[10px] font-bold hover:underline" style={{ color: "#14B8A6" }}>
                    {t.dashboard.setupContinue}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="stat-cards">
        {[
          {
            icon: FileCheck, color: "#14B8A6",
            title: t.dashboard.vaultProgress, sub: `${uploadedCount} ${t.dashboard.ofTotal} ${totalTemplates}`,
            value: uploadedCount > 0 ? `${vaultPercent}%` : t.dashboard.vaultEmpty,
            ctaLabel: uploadedCount > 0 ? t.dashboard.vaultCtaContinue : t.dashboard.vaultCta,
            ctaLink: "/vault",
          },
          {
            icon: Clock, color: "#F59E0B",
            title: t.dashboard.expiringDocs, sub: `${t.dashboard.withinDays}`,
            value: expiringDocs.length > 0 ? String(expiringDocs.length) : t.dashboard.expiringEmpty,
            ctaLabel: expiringDocs.length > 0 ? t.dashboard.viewExpiring : undefined,
            ctaLink: "/vault",
          },
          {
            icon: Calendar, color: "#60A5FA",
            title: t.dashboard.filingsDue, sub: `${t.dashboard.beforeMonthEnd}`,
            value: filingsDueThisMonth.length > 0 ? String(filingsDueThisMonth.length) : t.dashboard.filingsDueEmpty,
            ctaLabel: filingsDueThisMonth.length > 0 ? t.dashboard.viewDeadlines : undefined,
            ctaLink: "/timeline",
          },
          {
            icon: AlertTriangle, color: "#EF4444",
            title: t.dashboard.activeAlerts, sub: `${t.dashboard.requireAttention}`,
            value: alertCount > 0 ? String(alertCount) : t.dashboard.alertsEmpty,
            ctaLabel: alertCount > 0 ? t.dashboard.viewAlerts : undefined,
            ctaLink: "/alerts",
          },
        ].map(card => (
          <div
            key={card.title}
            className="rounded-xl border p-4 space-y-1"
            style={{ borderColor: `${card.color}22`, background: `${card.color}06` }}
            data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${card.color}18` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <span className="text-[10px] font-heading font-bold tracking-wider uppercase" style={{ color: "var(--app-text-muted)" }}>
                {card.title}
              </span>
            </div>
            <div className="text-2xl font-heading font-black leading-tight" style={{ color: "var(--app-text)" }}>
              {card.value}
            </div>
            <div className="text-[10px]" style={{ color: "var(--app-text-muted)" }}>{card.sub}</div>
            {card.ctaLabel && (
              <Link href={card.ctaLink} className="text-[10px] font-heading font-bold tracking-wide hover:underline block pt-1" style={{ color: card.color }}>
                {card.ctaLabel}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-xl border p-5 space-y-3"
          style={{ background: "var(--app-panel)", borderColor: "var(--app-border)" }}
          data-testid="panel-attention"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm" style={{ color: "var(--app-text)" }}>
              {t.dashboard.needsAttentionHeading}
            </h3>
            {attentionItems.length > 0 && (
              <Link href="/alerts" className="text-[10px] font-heading font-bold tracking-wide hover:underline" style={{ color: "#14B8A6" }}>
                {t.dashboard.viewAllAlerts}
              </Link>
            )}
          </div>
          {attentionItems.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>{t.dashboard.needsAttentionEmpty}</p>
              <p className="text-[10px] mt-1" style={{ color: "var(--app-text-muted)" }}>{t.dashboard.needsAttentionEmptyDesc}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attentionItems.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs rounded-lg px-3 py-2" style={{ background: `${item.color}08`, border: `1px solid ${item.color}15` }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="flex-1 truncate" style={{ color: "var(--app-text)" }}>{item.label}</span>
                  <Link href={item.link} className="text-[10px] font-bold whitespace-nowrap hover:underline" style={{ color: item.color }}>
                    {item.linkLabel}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-xl border p-5 space-y-3"
          style={{ background: "var(--app-panel)", borderColor: "var(--app-border)" }}
          data-testid="panel-upcoming"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm" style={{ color: "var(--app-text)" }}>
              {t.dashboard.upcomingHeading}
            </h3>
            {upcomingDeadlines.length > 0 && (
              <Link href="/timeline" className="text-[10px] font-heading font-bold tracking-wide hover:underline" style={{ color: "#14B8A6" }}>
                {t.dashboard.viewFullTimeline}
              </Link>
            )}
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>{t.dashboard.upcomingEmpty}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((item, i) => {
                const daysLeft = Math.ceil((item.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={i} className="flex items-center gap-3 text-xs rounded-lg px-3 py-2" style={{ background: `${item.color}08`, border: `1px solid ${item.color}15` }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="flex-1 truncate" style={{ color: "var(--app-text)" }}>{item.label}</span>
                    <span className="text-[10px] font-heading font-bold whitespace-nowrap" style={{ color: item.color }}>
                      {daysLeft}d
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--app-text-muted)" }}>
                      {item.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div data-testid="gate-status-grid">
        <h3 className="font-heading font-bold text-sm mb-4" style={{ color: "var(--app-text)" }}>
          {t.dashboard.gateStatusHeading}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GATE_ABBRS.map((abbr, i) => (
            <Link
              key={i}
              href={`/vault?gate=${i}`}
              className="rounded-xl border p-3 transition-all hover:scale-[1.02] group"
              style={{ borderColor: `${GATE_COLORS[i]}22`, background: `${GATE_COLORS[i]}06` }}
              data-testid={`gate-status-${i}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-heading font-bold tracking-widest uppercase" style={{ color: GATE_COLORS[i] }}>
                  {i === 0 ? "PT" : `Gate ${i}`}
                </span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: GATE_COLORS[i] }} />
              </div>
              <div className="text-sm font-heading font-extrabold mb-1" style={{ color: "var(--app-text)" }}>
                {abbr}
              </div>
              <div className="w-full h-1 rounded-full mb-1" style={{ background: `${GATE_COLORS[i]}15` }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${gateDocCounts[i].pct}%`, background: GATE_COLORS[i] }} />
              </div>
              <div className="text-[10px]" style={{ color: "var(--app-text-muted)" }}>
                {gateDocCounts[i].uploaded}/{gateDocCounts[i].total} ({gateDocCounts[i].pct}%)
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pb-4" data-testid="reference-links">
        {[
          { icon: Hexagon, label: t.dashboard.openFlow, onClick: onOpenFlow, color: "#14B8A6" },
          { icon: CheckCircle, label: t.dashboard.openAudit, onClick: onOpenAudit, color: "#60A5FA" },
          { icon: BookOpen, label: t.dashboard.openGuide, onClick: onOpenGuide, color: "#A78BFA" },
          { icon: List, label: t.dashboard.openGlossary, onClick: onOpenGuide, color: "#F59E0B" },
        ].map((link) => (
          <button
            key={link.label}
            onClick={link.onClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-heading font-bold tracking-wide transition-colors hover:opacity-90"
            style={{ background: `${link.color}08`, border: `1px solid ${link.color}22`, color: link.color }}
            data-testid={`link-ref-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <link.icon className="w-3.5 h-3.5" />
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}
