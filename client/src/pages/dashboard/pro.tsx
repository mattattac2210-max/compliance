import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import {
  FileCheck, Clock, AlertTriangle, Calendar, Building2, ArrowRight,
  CheckCircle, Upload, ClipboardCheck, Landmark, Zap, X, AlertCircle,
  ShieldCheck
} from "lucide-react";
import { FILING_SCHEDULE, getNextFilingDates } from "@/lib/filing-schedule";
import {
  generateEvents, mapVaultDocs, mapStaffKitas, mapPropertyHgb,
  typeColor,
} from "@/lib/calendar-events";
import type { Property, VaultDocument, VaultDocumentTemplate, StaffMember } from "@shared/schema";

interface ProDashboardProps {
  onOpenFlow: () => void;
  onOpenAudit: () => void;
  onOpenGuide: () => void;
}

const GATE_NAMES = [
  "Foundation", "Zoning & Land", "NIB & Licensing", "Building & SLF",
  "Tax", "Staff & BPJS", "Safety", "OTA Ready"
];
const GATE_SUBS = [
  "Entity, NPWP, OSS structure",
  "KKPR, RTRW, spatial",
  "NIB, KBLI 55193, OSS RBA",
  "PBG, SLF, as-built plans",
  "PB1, PPh 25, PPh 21, SPT",
  "BPJS K, Jamsostek, THR",
  "DAMKAR, APAR, pool, electrical",
  "TDUP, proof pack, platforms",
];
const GATE_ABBRS = ["PMA", "ZONE", "NIB", "SLF", "TAX", "STAFF", "SAFE", "OTA"];

const SCORE_LABELS = [
  "Foundation & Licensing",
  "Tax & Reporting",
  "Staff & BPJS",
  "Safety & Building",
  "OTA Readiness",
];

function getGreeting(t: any): string {
  const h = new Date().getHours();
  if (h < 12) return t.dashboard.goodMorning;
  if (h < 18) return t.dashboard.goodAfternoon;
  return t.dashboard.goodEvening;
}

function gateStatus(pct: number): "done" | "warn" | "crit" {
  if (pct >= 90) return "done";
  if (pct >= 50) return "warn";
  return "crit";
}

const STATUS_COLORS = { done: "#16A34A", warn: "#D97706", crit: "#EF4444" };
const STATUS_BG_ALPHA = { done: "rgba(22,163,74,0.06)", warn: "rgba(217,119,6,0.06)", crit: "rgba(239,68,68,0.06)" };

export default function ProDashboard({ onOpenFlow, onOpenAudit, onOpenGuide }: ProDashboardProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

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

  const missingByGate = new Map<number, number>();
  if (selectedProperty) {
    for (const tmpl of templates) {
      const doc = documents.find(d => d.templateId === tmpl.id);
      if (!doc || doc.status === "not_started") {
        missingByGate.set(tmpl.gateNumber, (missingByGate.get(tmpl.gateNumber) || 0) + 1);
      }
    }
  }
  const totalMissing = Array.from(missingByGate.values()).reduce((a, b) => a + b, 0);
  const vaultComplete = totalMissing === 0 && totalTemplates > 0;

  let complianceAlerts = 0;
  const attentionItems: Array<{ label: string; desc?: string; color: string; link: string; linkLabel: string; due?: string }> = [];

  if (!vaultComplete) {
    attentionItems.push({
      label: t.dashboard.missingDocsAlert.replace("{{count}}", String(totalMissing || totalTemplates)),
      desc: t.dashboard.vaultIncompleteNotice,
      color: "#F59E0B",
      link: "/vault",
      linkLabel: t.dashboard.goToVault,
    });
    for (const [gate, count] of Array.from(missingByGate.entries()).sort((a, b) => a[0] - b[0])) {
      attentionItems.push({
        label: t.dashboard.missingDocsGate.replace("{{gate}}", String(gate)).replace("{{count}}", String(count)),
        color: "#D97706",
        link: `/vault?gate=${gate}`,
        linkLabel: t.dashboard.goToVault,
      });
    }
    complianceAlerts = totalMissing || totalTemplates;
  } else {
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
  }

  const alertCount = expiringDocs.length + expiredDocs.length + complianceAlerts;

  const upcomingDeadlines = useMemo(() => {
    const yr = now.getFullYear();
    const staticEvents = generateEvents(yr, lang);
    const nextYearEvents = generateEvents(yr + 1, lang);
    const seen = new Set(staticEvents.map(e => e.id));
    for (const e of nextYearEvents) {
      if (!seen.has(e.id)) staticEvents.push(e);
    }

    const vaultEvents = mapVaultDocs(documents, templates, lang);
    const kitasEvents = mapStaffKitas(staffMembers, lang);
    const hgbEvents = mapPropertyHgb(properties, lang);

    const all = [...staticEvents, ...vaultEvents, ...kitasEvents, ...hgbEvents]
      .filter(e => e.date > now && e.date <= in90)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6);

    return all.map(e => ({
      label: e.title,
      date: e.date,
      type: e.type,
      color: typeColor(e.type, e.gate),
    }));
  }, [documents, templates, staffMembers, properties, now, in90, lang]);

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

  const gatesComplete = gateDocCounts.filter(g => g.pct >= 100).length;
  const overallPct = totalTemplates > 0 ? Math.round((uploadedCount / totalTemplates) * 100) : 0;

  const otaDeadline = new Date("2026-03-31");
  const otaDaysLeft = Math.max(0, Math.ceil((otaDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const showOtaBanner = otaDeadline > now;

  const todayStr = now.toLocaleDateString(lang === "uk" ? "uk" : lang === "id" ? "id-ID" : "en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const scoreBuckets = useMemo(() => {
    const g = gateDocCounts;
    const avg = (indices: number[]) => {
      const vals = indices.map(i => g[i]?.pct ?? 0);
      return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };
    return [
      avg([0, 2]),
      avg([4]),
      avg([5]),
      avg([3, 6]),
      avg([7]),
    ];
  }, [gateDocCounts]);

  const scoreColors = ["#2563EB", "#D97706", "#16A34A", "#7C3AED", "#EF4444"];

  if (!hasProperty) {
    return (
      <div className="px-6 md:px-14 py-12 flex flex-col items-center justify-center text-center space-y-4" data-testid="pro-no-property">
        <Building2 className="w-12 h-12" style={{ color: "var(--accent)" }} />
        <h2 className="font-heading font-extrabold text-xl" style={{ color: "var(--txt)" }}>
          {t.dashboard.noPropertyHeading}
        </h2>
        <p className="text-sm max-w-md" style={{ color: "var(--t3)" }}>
          {t.dashboard.noPropertyDesc}
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-heading font-bold text-sm text-white transition-colors hover:opacity-90"
          style={{ background: "var(--accent)" }}
          data-testid="button-add-property"
        >
          {t.dashboard.noPropertyCta}
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full max-w-3xl mt-8">
          {[
            { icon: AlertTriangle, color: "#EF4444", title: t.dashboard.activeAlerts, value: "\u2014" },
            { icon: FileCheck, color: "#D97706", title: t.dashboard.vaultProgress, value: "\u2014" },
            { icon: CheckCircle, color: "#16A34A", title: "Gates Complete", value: "\u2014" },
            { icon: Calendar, color: "#2563EB", title: t.dashboard.filingsDue, value: "\u2014" },
          ].map(card => (
            <div
              key={card.title}
              className="rounded-xl border p-4 flex items-center gap-3"
              style={{ borderColor: "var(--b)", background: "var(--surface)" }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${card.color}18` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <div>
                <div className="text-[10px] font-heading font-bold tracking-wider uppercase" style={{ color: "var(--t3)" }}>{card.title}</div>
                <div className="text-lg font-heading font-black" style={{ color: "var(--txt)" }}>{card.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const connectorGradient = gateDocCounts.map((g, i) => {
    const s = gateStatus(g.pct);
    return STATUS_COLORS[s];
  });

  const gradientStops = connectorGradient.map((c, i) => {
    const pctStart = (i / 8) * 100;
    const pctEnd = ((i + 1) / 8) * 100;
    return `${c} ${pctStart}%, ${c} ${pctEnd}%`;
  }).join(", ");

  return (
    <div className="px-6 md:px-14 py-6" style={{ fontFamily: "var(--font-body)" }} data-testid="pro-dashboard">

      {/* ── 1. OTA DEADLINE BANNER ── */}
      {showOtaBanner && (
        <div
          data-testid="ota-banner"
          onClick={onOpenFlow}
          style={{
            background: "var(--accent)",
            borderRadius: 8,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            cursor: "pointer",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.9)" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "#fff", whiteSpace: "nowrap" }}>
              OTA Deadline
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
              — Mar 31, 2026
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span data-testid="text-ota-days" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "#fff" }}>
              {otaDaysLeft}d
            </span>
            <ArrowRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.7)" }} />
          </div>
        </div>
      )}

      {/* ── 2. PAGE HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1
            data-testid="text-greeting"
            style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, color: "var(--txt)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}
          >
            {getGreeting(t)}, {user?.firstName || user?.email?.split("@")[0] || ""}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M3 10C3 6 5 3 10 3C15 3 17 6 17 10" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M6 10V15" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 10V17" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 10V15" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </h1>
          <p data-testid="text-property-subtitle" style={{ fontSize: 13, color: "var(--t2)" }}>
            {selectedProperty?.entityName ?? selectedProperty?.propertyName ?? ""}
            {selectedProperty?.regency ? ` \u00b7 ${selectedProperty.regency}` : ""}
            {" \u00b7 Here's your compliance overview for today"}
          </p>
        </div>
        <div
          data-testid="text-today-date"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--t3)",
            background: "var(--surface)",
            border: "1px solid var(--b)",
            padding: "6px 12px",
            borderRadius: 6,
          }}
        >
          {todayStr}
        </div>
      </div>

      {/* ── 3. STATS GRID ── */}
      <div
        data-testid="stat-cards"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}
      >
        {[
          {
            icon: <AlertTriangle className="w-5 h-5" style={{ color: "#EF4444" }} />,
            num: alertCount, numColor: "#EF4444",
            label: "Active Alerts",
            sub: `${expiringDocs.length + expiredDocs.length} expiring + ${complianceAlerts} compliance`,
            barColor: "#EF4444", barPct: Math.min(alertCount * 10, 100),
          },
          {
            icon: <FileCheck className="w-5 h-5" style={{ color: "#D97706" }} />,
            num: `${vaultPercent}%`, numColor: "#D97706",
            label: "Vault Complete",
            sub: `${uploadedCount} of ${totalTemplates} documents`,
            barColor: "#D97706", barPct: vaultPercent,
          },
          {
            icon: <CheckCircle className="w-5 h-5" style={{ color: "#16A34A" }} />,
            num: gatesComplete, numColor: "#16A34A",
            label: "Gates Complete",
            sub: `${gatesComplete} of 8 at 100%`,
            barColor: "#16A34A", barPct: (gatesComplete / 8) * 100,
          },
          {
            icon: <Calendar className="w-5 h-5" style={{ color: "#2563EB" }} />,
            num: filingsDueThisMonth.length, numColor: "#D97706",
            label: "Events This Month",
            sub: `${filingsDueThisMonth.length} filings due before month end`,
            barColor: "#2563EB", barPct: Math.min(filingsDueThisMonth.length * 15, 100),
          },
        ].map((card, idx) => (
          <div
            key={idx}
            data-testid={`stat-card-${idx}`}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--b)",
              borderRadius: 12,
              padding: "18px 20px",
              boxShadow: "var(--shadow)",
              position: "relative",
              overflow: "hidden",
              cursor: "default",
              transition: "box-shadow .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "var(--shadow)")}
          >
            <div style={{ marginBottom: 10 }}>{card.icon}</div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28,
              color: card.numColor, lineHeight: 1, marginBottom: 4,
            }}>{card.num}</div>
            <div style={{ fontSize: 11, color: "var(--t2)", fontWeight: 700, fontFamily: "var(--font-body)", letterSpacing: 0.2 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 3 }}>{card.sub}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--bg)" }}>
              <div style={{ height: "100%", width: `${card.barPct}%`, background: card.barColor, borderRadius: "0 2px 2px 0", transition: "width .8s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. QUICK ACTIONS ── */}
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 13, color: "var(--txt)", letterSpacing: 0.3, marginBottom: 12 }}>
        Quick Actions
      </div>
      <div
        data-testid="quick-actions"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}
      >
        {[
          { icon: <Upload className="w-4 h-4" />, sub: "Document Vault", label: "Upload Document", href: "/vault" },
          { icon: <Calendar className="w-4 h-4" />, sub: "Compliance Dates", label: "View Calendar", href: "/calendar" },
          { icon: <ClipboardCheck className="w-4 h-4" />, sub: "Compliance Check", label: "Run Self-Audit", action: onOpenAudit },
          { icon: <Landmark className="w-4 h-4" />, sub: "Legal Database", label: "Check Regulations", href: "/disclaimers" },
        ].map((qa, idx) => {
          const cardStyle: React.CSSProperties = {
            background: "var(--qa-bg)",
            border: "1px solid var(--b)",
            borderRadius: 10,
            padding: "18px 16px",
            cursor: "pointer",
            transition: "all .18s",
            boxShadow: "var(--shadow-sm)",
            position: "relative",
            overflow: "hidden",
            textDecoration: "none",
            display: "block",
          };
          const inner = (
            <>
              <div style={{
                width: 36, height: 36, background: "var(--accent-tint)",
                border: "1px solid var(--b)", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 28, color: "var(--t2)",
              }}>
                {qa.icon}
              </div>
              <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 3 }}>{qa.sub}</div>
              <div style={{
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
                color: "var(--txt)", display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                {qa.label}
                <ArrowRight className="w-3 h-3" style={{ color: "var(--accent)", opacity: 0.7, transition: "transform .18s" }} />
              </div>
            </>
          );
          const hoverHandlers = {
            onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
              const el = e.currentTarget;
              el.style.background = "var(--qa-hover)";
              el.style.borderColor = "var(--accent)";
              el.style.boxShadow = "var(--shadow-md)";
              el.style.transform = "translateY(-2px)";
            },
            onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
              const el = e.currentTarget;
              el.style.background = "var(--qa-bg)";
              el.style.borderColor = "var(--b)";
              el.style.boxShadow = "var(--shadow-sm)";
              el.style.transform = "translateY(0)";
            },
          };
          if (qa.href) {
            return (
              <Link key={idx} href={qa.href} data-testid={`qa-card-${idx}`} style={cardStyle} {...hoverHandlers}>
                {inner}
              </Link>
            );
          }
          return (
            <div key={idx} onClick={qa.action} data-testid={`qa-card-${idx}`} style={cardStyle} {...hoverHandlers}>
              {inner}
            </div>
          );
        })}
      </div>

      {/* ── 5. GATE PIPELINE ── */}
      <div style={{
        fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 13,
        color: "var(--txt)", letterSpacing: 0.3, marginBottom: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        Compliance Gates
        <span
          onClick={onOpenFlow}
          data-testid="link-view-all-gates"
          style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer", fontWeight: 700 }}
        >
          View all <ArrowRight className="w-3 h-3 inline-block" style={{ verticalAlign: "middle" }} />
        </span>
      </div>
      <div
        data-testid="gate-pipeline"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--b)",
          borderRadius: 14,
          boxShadow: "var(--shadow)",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px 12px", borderBottom: "1px solid var(--b)", flexWrap: "wrap", gap: 8,
        }}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "var(--txt)" }}>
            Gate Progress Pipeline
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {[
              { label: "Complete", color: "#16A34A" },
              { label: "In Progress", color: "#D97706" },
              { label: "Critical", color: "#EF4444" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--t3)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "20px 20px 16px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", gap: 0, minWidth: "max-content", position: "relative", alignItems: "flex-start" }}>
            {gateDocCounts.map((g, i) => {
              const s = gateStatus(g.pct);
              const col = STATUS_COLORS[s];
              const bg = STATUS_BG_ALPHA[s];
              const nextCol = i < 7 ? STATUS_COLORS[gateStatus(gateDocCounts[i + 1].pct)] : col;
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}>
                <div
                  data-testid={`gate-node-${i}`}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1, cursor: "pointer", width: 80, flexShrink: 0 }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: `3px solid ${col}`,
                    background: bg,
                    marginBottom: 10,
                    position: "relative",
                    transition: "all .18s",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 11, lineHeight: 1, color: col,
                    }}>
                      {g.pct}%
                    </span>
                    <div style={{
                      position: "absolute", bottom: -3, right: -3,
                      width: 18, height: 18, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid var(--surface)",
                      background: col,
                    }}>
                      {s === "done" && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                      {s === "warn" && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 2V5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><circle cx="4" cy="6.5" r="0.5" fill="#fff"/></svg>
                      )}
                      {s === "crit" && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 2L6 6M6 2L2 6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/></svg>
                      )}
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--t3)", marginBottom: 3, textAlign: "center" }}>
                    G{i}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
                    color: "var(--txt)", textAlign: "center", lineHeight: 1.3,
                  }}>
                    {GATE_NAMES[i]}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--t3)", textAlign: "center", lineHeight: 1.4, marginTop: 2 }}>
                    {GATE_SUBS[i]}
                  </div>
                  <div style={{ width: "100%", marginTop: 8 }}>
                    <div style={{ height: 4, background: "var(--b)", borderRadius: 2, margin: "0 4px 3px" }}>
                      <div style={{ height: "100%", width: `${g.pct}%`, background: col, borderRadius: 2, transition: "width .8s ease" }} />
                    </div>
                  </div>
                </div>
                {i < 7 && (
                  <div style={{ display: "flex", alignItems: "center", height: 56, flexShrink: 0, width: 32 }}>
                    <svg width="32" height="16" viewBox="0 0 32 16" fill="none" style={{ display: "block" }}>
                      <line x1="0" y1="8" x2="24" y2="8" stroke={nextCol} strokeWidth="2" strokeLinecap="round" />
                      <path d="M20 3L27 8L20 13" stroke={nextCol} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 6. TWO-COLUMN: ALERTS + DEADLINES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>

        {/* Active Alerts */}
        <div
          data-testid="panel-alerts"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--b)",
            borderRadius: 12,
            boxShadow: "var(--shadow)",
            overflow: "hidden",
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", borderBottom: "1px solid var(--b)", flexWrap: "wrap", gap: 8,
          }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 13, color: "var(--txt)" }}>
              Active Alerts
            </div>
            {alertCount > 0 && (
              <span
                data-testid="badge-alert-count"
                style={{
                  background: "var(--accent-tint)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-body)",
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 10,
                  border: "1px solid var(--accent-tint2)",
                }}
              >
                {alertCount}
              </span>
            )}
          </div>
          {attentionItems.length === 0 ? (
            <div style={{ padding: "24px 18px", textAlign: "center" }}>
              <ShieldCheck className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--t3)" }} />
              <p style={{ fontSize: 12, color: "var(--t3)" }}>{t.dashboard.needsAttentionEmpty}</p>
            </div>
          ) : (
            <div>
              {attentionItems.slice(0, 6).map((item, i) => (
                <Link
                  key={i}
                  href={item.link}
                  data-testid={`alert-item-${i}`}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 18px",
                    borderBottom: i < attentionItems.length - 1 ? "1px solid var(--b2)" : "none",
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: "var(--txt)", marginBottom: 2 }}>
                      {item.label}
                    </div>
                    {item.desc && (
                      <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.45 }}>{item.desc}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div
          data-testid="panel-upcoming"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--b)",
            borderRadius: 12,
            boxShadow: "var(--shadow)",
            overflow: "hidden",
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", borderBottom: "1px solid var(--b)", flexWrap: "wrap", gap: 8,
          }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 13, color: "var(--txt)" }}>
              Upcoming Deadlines
            </div>
            <Link
              href="/calendar"
              data-testid="link-open-calendar"
              style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}
            >
              Open calendar <ArrowRight className="w-3 h-3 inline-block" style={{ verticalAlign: "middle" }} />
            </Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div style={{ padding: "24px 18px", textAlign: "center" }}>
              <Calendar className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--t3)" }} />
              <p style={{ fontSize: 12, color: "var(--t3)" }}>{t.dashboard.upcomingEmpty}</p>
            </div>
          ) : (
            <div>
              {upcomingDeadlines.map((item, i) => {
                const daysLeft = Math.ceil((item.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isHot = daysLeft <= 7;
                const chipColor = daysLeft <= 0 ? "#EF4444" : daysLeft <= 3 ? "#EF4444" : daysLeft <= 7 ? "#D97706" : "#16A34A";
                const chipLabel = daysLeft <= 0 ? "Urgent" : daysLeft === 0 ? "Due today" : `${daysLeft}d`;
                return (
                  <div
                    key={i}
                    data-testid={`deadline-item-${i}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 18px",
                      borderBottom: i < upcomingDeadlines.length - 1 ? "1px solid var(--b2)" : "none",
                      cursor: "pointer",
                      transition: "background .1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{
                      background: isHot ? "var(--accent-tint)" : "var(--bg)",
                      border: `1px solid ${isHot ? "var(--accent-tint2)" : "var(--b)"}`,
                      borderRadius: 7,
                      padding: "6px 9px",
                      textAlign: "center",
                      flexShrink: 0,
                      minWidth: 42,
                    }}>
                      <div style={{
                        fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 15,
                        color: isHot ? "var(--accent)" : "var(--txt)", lineHeight: 1,
                      }}>
                        {item.date.getDate()}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-body)", fontSize: 8, fontWeight: 700,
                        color: isHot ? "var(--accent)" : "var(--t3)",
                        textTransform: "uppercase", letterSpacing: 1,
                      }}>
                        {item.date.toLocaleDateString(lang === "uk" ? "uk" : lang === "id" ? "id-ID" : "en-GB", { month: "short" })}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12, color: "var(--txt)", marginBottom: 2 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t3)" }}>{item.type}</div>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700,
                      padding: "3px 8px", borderRadius: 8, whiteSpace: "nowrap",
                      background: `${chipColor}18`, color: chipColor, border: `1px solid ${chipColor}30`,
                    }}>
                      {chipLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 7. COMPLIANCE SCORE ── */}
      <div style={{
        fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 13,
        color: "var(--txt)", letterSpacing: 0.3, marginBottom: 12,
      }}>
        Overall Compliance Score
      </div>
      <div
        data-testid="compliance-score"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--b)",
          borderRadius: 12,
          boxShadow: "var(--shadow)",
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="var(--accent)"
              strokeWidth="10"
              strokeDasharray={`${(overallPct / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <div data-testid="text-overall-score" style={{
              fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, color: "var(--txt)", lineHeight: 1,
            }}>
              {overallPct}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--t3)", letterSpacing: 1 }}>PERCENT</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 14, color: "var(--txt)", marginBottom: 4 }}>
            Compliance Health
          </div>
          <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 12, lineHeight: 1.5 }}>
            Your property's overall regulatory readiness across all 8 compliance gates.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SCORE_LABELS.map((label, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--t2)", flex: 1 }}>{label}</span>
                <div style={{ flex: 2, height: 5, background: "var(--bg)", borderRadius: 3 }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${scoreBuckets[idx]}%`,
                    background: scoreColors[idx],
                    transition: "width .8s ease",
                  }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--t3)", width: 28, textAlign: "right" }}>
                  {scoreBuckets[idx]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}