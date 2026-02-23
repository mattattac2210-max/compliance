import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { Property, VaultDocumentTemplate, VaultDocument, StaffMember } from "@shared/schema";
import { CheckCircle2, AlertTriangle, Clock, X, FileText, Calendar, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const GATE_COLORS = ["#94A3B8", "#14B8A6", "#60A5FA", "#A78BFA", "#F59E0B", "#22C55E", "#FCA5A5", "#14B8A6"];
const GATE_ABBRS = ["PT", "ZONE", "NIB", "SLF", "TAX", "STAFF", "SAFE", "OTA"];

interface AlertItem {
  id: string;
  label: string;
  gateNumber: number;
  color: string;
  date: Date;
  daysUntil: number;
  type: "overdue" | "upcoming";
  source: "vault" | "fixed" | "compliance";
  propertyName?: string;
  description?: string;
}

const FIXED_DEADLINES = [
  { id: "tax-spt-tahunan", labelKey: "fixedSptTahunan" as const, month: 3, day: 30, gateNumber: 4 },
  { id: "tax-pph-monthly", labelKey: "fixedPphMonthly" as const, dayOfMonth: 20, recurring: "monthly" as const, gateNumber: 4 },
  { id: "tax-pb1-monthly", labelKey: "fixedPb1Monthly" as const, dayOfMonth: 20, recurring: "monthly" as const, gateNumber: 4 },
  { id: "bpjs-monthly", labelKey: "fixedBpjsMonthly" as const, dayOfMonth: 10, recurring: "monthly" as const, gateNumber: 5 },
  { id: "ota-deadline", labelKey: "fixedOtaDeadline" as const, fixedDate: "2026-03-31", gateNumber: 7 },
];

function getTemplateName(tmpl: VaultDocumentTemplate, lang: string): string {
  const tr = tmpl.translations as Record<string, { name: string; description: string }>;
  return tr?.[lang]?.name || tr?.en?.name || "";
}

function getDismissedKey(userId: string) {
  return `dscvr-dismissed-alerts-${userId}`;
}

export default function AlertsPage() {
  const { t, lang: language } = useLanguage();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (!user) return new Set();
    try {
      const stored = localStorage.getItem(getDismissedKey(user.id));
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const { data: templates = [] } = useQuery<VaultDocumentTemplate[]>({
    queryKey: ["/api/vault/templates"],
  });

  const { data: vaultDocs = [] } = useQuery<VaultDocument[]>({
    queryKey: ["/api/vault", properties[0]?.id],
    queryFn: () => properties.length > 0 ? fetch(`/api/vault?propertyId=${properties[0].id}`, { credentials: "include" }).then(r => r.json()) : Promise.resolve([]),
    enabled: properties.length > 0,
  });

  const { data: staffMembers = [] } = useQuery<StaffMember[]>({
    queryKey: ["/api/staff", properties[0]?.id],
    queryFn: () => properties.length > 0 ? fetch(`/api/staff?propertyId=${properties[0].id}`, { credentials: "include" }).then(r => r.json()) : Promise.resolve([]),
    enabled: properties.length > 0,
  });

  const dismiss = useCallback((alertId: string) => {
    if (!user) return;
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(alertId);
      localStorage.setItem(getDismissedKey(user.id), JSON.stringify(Array.from(next)));
      return next;
    });
  }, [user]);

  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const result: AlertItem[] = [];
    const tmplMap = new Map(templates.map(t => [t.id, t]));

    for (const doc of vaultDocs) {
      if (!doc.expiryDate) continue;
      const expDate = new Date(doc.expiryDate);
      const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const tmpl = tmplMap.get(doc.templateId);
      if (!tmpl) continue;

      if (diff < 0) {
        result.push({
          id: `vault-expired-${doc.id}`,
          label: getTemplateName(tmpl, language),
          gateNumber: tmpl.gateNumber,
          color: GATE_COLORS[tmpl.gateNumber],
          date: expDate,
          daysUntil: diff,
          type: "overdue",
          source: "vault",
          propertyName: properties[0]?.propertyName,
        });
      } else if (expDate <= ninetyDays) {
        result.push({
          id: `vault-expiring-${doc.id}`,
          label: getTemplateName(tmpl, language),
          gateNumber: tmpl.gateNumber,
          color: GATE_COLORS[tmpl.gateNumber],
          date: expDate,
          daysUntil: diff,
          type: "upcoming",
          source: "vault",
          propertyName: properties[0]?.propertyName,
        });
      }
    }

    for (const fd of FIXED_DEADLINES) {
      let d: Date;
      if ("fixedDate" in fd && fd.fixedDate) {
        d = new Date(fd.fixedDate);
      } else if (fd.recurring === "monthly" && "dayOfMonth" in fd) {
        d = new Date(today.getFullYear(), today.getMonth(), fd.dayOfMonth!);
        if (d < today) d = new Date(today.getFullYear(), today.getMonth() + 1, fd.dayOfMonth!);
      } else if ("month" in fd) {
        d = new Date(today.getFullYear(), fd.month! - 1, fd.day!);
        if (d < today) d = new Date(today.getFullYear() + 1, fd.month! - 1, fd.day!);
      } else continue;

      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 0) {
        result.push({
          id: `fixed-overdue-${fd.id}`,
          label: t.timeline[fd.labelKey],
          gateNumber: fd.gateNumber,
          color: GATE_COLORS[fd.gateNumber],
          date: d,
          daysUntil: diff,
          type: "overdue",
          source: "fixed",
        });
      } else if (d <= thirtyDays) {
        result.push({
          id: `fixed-upcoming-${fd.id}`,
          label: t.timeline[fd.labelKey],
          gateNumber: fd.gateNumber,
          color: GATE_COLORS[fd.gateNumber],
          date: d,
          daysUntil: diff,
          type: "upcoming",
          source: "fixed",
        });
      }
    }

    for (const prop of properties) {
      if (prop.otaEntityName && prop.entityName &&
        prop.otaEntityName.toLowerCase().trim() !== prop.entityName.toLowerCase().trim()) {
        result.push({
          id: `entity-mismatch-${prop.id}`,
          label: t.alerts.entityMismatch,
          gateNumber: 7,
          color: "#EF4444",
          date: today,
          daysUntil: 0,
          type: "overdue",
          source: "compliance",
          propertyName: prop.propertyName,
          description: t.alerts.entityMismatchDesc,
        });
      }
    }

    const activeStaff = staffMembers.filter(s => s.isActive);
    const bpjsGaps = activeStaff.filter(s =>
      s.bpjsKesehatanStatus === "not_registered" ||
      s.bpjsKetenagakerjaanStatus === "not_registered"
    );
    if (bpjsGaps.length > 0) {
      result.push({
        id: "bpjs-gap",
        label: `${t.alerts.bpjsGap} (${bpjsGaps.length})`,
        gateNumber: 5,
        color: "#F59E0B",
        date: today,
        daysUntil: 0,
        type: "overdue",
        source: "compliance",
        description: t.alerts.bpjsGapDesc,
      });
    }

    for (const prop of properties) {
      if (prop.landTitleType === "hgb" && prop.landTitleExpiry) {
        const expDate = new Date(prop.landTitleExpiry);
        const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 365 * 2) {
          result.push({
            id: `hgb-expiry-${prop.id}`,
            label: t.alerts.hgbExpiryAlert,
            gateNumber: 0,
            color: diff < 0 ? "#EF4444" : "#F59E0B",
            date: expDate,
            daysUntil: diff,
            type: diff < 0 ? "overdue" : "upcoming",
            source: "compliance",
            propertyName: prop.propertyName,
            description: t.alerts.hgbExpiryAlertDesc,
          });
        }
      }
    }

    for (const staff of activeStaff) {
      if (staff.kitasExpiry) {
        const expDate = new Date(staff.kitasExpiry);
        const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 90) {
          result.push({
            id: `kitas-expiry-${staff.id}`,
            label: `${t.alerts.kitasExpiryAlert}: ${staff.name}`,
            gateNumber: 5,
            color: diff < 0 ? "#EF4444" : "#F59E0B",
            date: expDate,
            daysUntil: diff,
            type: diff < 0 ? "overdue" : "upcoming",
            source: "compliance",
            description: t.alerts.kitasExpiryAlertDesc,
          });
        }
      }
    }

    return result.filter(a => !dismissed.has(a.id));
  }, [vaultDocs, templates, properties, language, dismissed, t, staffMembers]);

  const overdueAlerts = alerts.filter(a => a.type === "overdue");
  const upcomingAlerts = alerts.filter(a => a.type === "upcoming");

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-alerts-heading">{t.alerts.heading}</h1>
          <p className="text-slate-400 text-sm mt-1">{t.alerts.subheading}</p>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-16 rounded-lg border border-[var(--accent-tint)] bg-[var(--accent-tint)]">
            <CheckCircle2 className="h-12 w-12 text-[var(--accent)] mx-auto mb-3" />
            <p className="text-white font-heading text-lg" data-testid="text-all-clear">{t.alerts.allClear}</p>
            <p className="text-slate-400 text-sm mt-1">{t.alerts.allClearDesc}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {overdueAlerts.length > 0 && (
              <div>
                <h2 className="text-sm font-heading font-bold text-[var(--danger)] uppercase tracking-wider mb-3 flex items-center gap-2" data-testid="text-overdue-section">
                  <AlertTriangle className="h-4 w-4" /> {t.alerts.overdueSection}
                </h2>
                <div className="space-y-2">
                  {overdueAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center gap-3 p-4 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/15" data-testid={`alert-card-${alert.id}`}>
                      <AlertTriangle className="h-5 w-5 text-[var(--danger)] shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-200">{alert.label}</p>
                        {alert.description && <p className="text-xs text-slate-500 mt-0.5" data-testid={`text-desc-${alert.id}`}>{alert.description}</p>}
                        {alert.propertyName && <p className="text-xs text-slate-500 mt-0.5">{alert.propertyName}</p>}
                      </div>
                      <span className="text-[9px] font-heading font-bold px-2 py-0.5 rounded-full" style={{ background: `${alert.color}15`, color: alert.color }}>{GATE_ABBRS[alert.gateNumber]}</span>
                      <span className="text-[10px] font-heading font-bold text-[var(--danger)]">{Math.abs(alert.daysUntil)} {t.timeline.daysOverdue}</span>
                      <div className="flex items-center gap-1">
                        {alert.source === "compliance" ? (
                          <Link to="/profile" className="text-[10px] text-[var(--accent)] hover:text-[#5EEAD4]" data-testid={`link-profile-${alert.id}`}>Profile</Link>
                        ) : alert.source === "vault" ? (
                          <Link to="/vault" className="text-[10px] text-[var(--accent)] hover:text-[#5EEAD4]" data-testid={`link-vault-${alert.id}`}>{t.alerts.viewVault}</Link>
                        ) : (
                          <Link to="/timeline" className="text-[10px] text-[var(--accent)] hover:text-[#5EEAD4]" data-testid={`link-timeline-${alert.id}`}>{t.alerts.viewTimeline}</Link>
                        )}
                        <button onClick={() => dismiss(alert.id)} className="text-slate-600 hover:text-slate-400 ml-2" data-testid={`button-dismiss-${alert.id}`}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingAlerts.length > 0 && (
              <div>
                <h2 className="text-sm font-heading font-bold text-[var(--gold)] uppercase tracking-wider mb-3 flex items-center gap-2" data-testid="text-upcoming-section">
                  <Clock className="h-4 w-4" /> {t.alerts.upcomingSection}
                </h2>
                <div className="space-y-2">
                  {upcomingAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center gap-3 p-4 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/15" data-testid={`alert-card-${alert.id}`}>
                      <Clock className="h-5 w-5 text-[var(--gold)] shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-200">{alert.label}</p>
                        {alert.description && <p className="text-xs text-slate-500 mt-0.5" data-testid={`text-desc-${alert.id}`}>{alert.description}</p>}
                        {alert.propertyName && <p className="text-xs text-slate-500 mt-0.5">{alert.propertyName}</p>}
                      </div>
                      <span className="text-[9px] font-heading font-bold px-2 py-0.5 rounded-full" style={{ background: `${alert.color}15`, color: alert.color }}>{GATE_ABBRS[alert.gateNumber]}</span>
                      <span className="text-xs text-slate-500">{alert.date.toLocaleDateString()}</span>
                      <span className="text-[10px] font-heading text-slate-500">{alert.daysUntil} {t.alerts.daysLabel}</span>
                      <div className="flex items-center gap-1">
                        {alert.source === "compliance" ? (
                          <Link to="/profile" className="text-[10px] text-[var(--accent)] hover:text-[#5EEAD4]" data-testid={`link-profile-${alert.id}`}>Profile</Link>
                        ) : alert.source === "vault" ? (
                          <Link to="/vault" className="text-[10px] text-[var(--accent)] hover:text-[#5EEAD4]">{t.alerts.viewVault}</Link>
                        ) : (
                          <Link to="/timeline" className="text-[10px] text-[var(--accent)] hover:text-[#5EEAD4]">{t.alerts.viewTimeline}</Link>
                        )}
                        <button onClick={() => dismiss(alert.id)} className="text-slate-600 hover:text-slate-400 ml-2" data-testid={`button-dismiss-${alert.id}`}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
