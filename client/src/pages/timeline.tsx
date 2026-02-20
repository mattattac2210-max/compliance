import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import type { Property, VaultDocumentTemplate, VaultDocument } from "@shared/schema";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

const GATE_COLORS = ["#94A3B8", "#14B8A6", "#60A5FA", "#A78BFA", "#F59E0B", "#22C55E", "#FCA5A5", "#14B8A6"];
const GATE_ABBRS = ["PT", "ZONE", "NIB", "SLF", "TAX", "STAFF", "SAFE", "OTA"];

type FilterType = "all" | "overdue" | "thisMonth" | "next90";

interface TimelineItem {
  id: string;
  label: string;
  date: Date;
  gateNumber: number;
  color: string;
  isOverdue: boolean;
  daysUntil: number;
  source: "vault" | "fixed";
  propertyName?: string;
}

const FIXED_DEADLINES = [
  { id: "tax-spt-tahunan", labelKey: "fixedSptTahunan" as const, month: 3, day: 30, recurring: "yearly" as const, gateNumber: 4 },
  { id: "tax-pph-monthly", labelKey: "fixedPphMonthly" as const, dayOfMonth: 20, recurring: "monthly" as const, gateNumber: 4 },
  { id: "tax-pb1-monthly", labelKey: "fixedPb1Monthly" as const, dayOfMonth: 20, recurring: "monthly" as const, gateNumber: 4 },
  { id: "bpjs-monthly", labelKey: "fixedBpjsMonthly" as const, dayOfMonth: 10, recurring: "monthly" as const, gateNumber: 5 },
  { id: "ota-deadline", labelKey: "fixedOtaDeadline" as const, fixedDate: "2026-03-31", gateNumber: 7 },
];

function getNextOccurrence(fd: typeof FIXED_DEADLINES[number], today: Date): Date[] {
  const results: Date[] = [];
  if ("fixedDate" in fd && fd.fixedDate) {
    results.push(new Date(fd.fixedDate));
    return results;
  }
  if (fd.recurring === "monthly" && "dayOfMonth" in fd) {
    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, fd.dayOfMonth!);
      results.push(d);
    }
    return results;
  }
  if (fd.recurring === "yearly" && "month" in fd) {
    const thisYear = new Date(today.getFullYear(), fd.month! - 1, fd.day!);
    const nextYear = new Date(today.getFullYear() + 1, fd.month! - 1, fd.day!);
    results.push(thisYear >= today ? thisYear : nextYear);
    return results;
  }
  return results;
}

function getTemplateName(tmpl: VaultDocumentTemplate, lang: string): string {
  const tr = tmpl.translations as Record<string, { name: string; description: string }>;
  return tr?.[lang]?.name || tr?.en?.name || "";
}

export default function TimelinePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const { data: templates = [] } = useQuery<VaultDocumentTemplate[]>({
    queryKey: ["/api/vault/templates"],
  });

  const allVaultDocs = useQuery<VaultDocument[]>({
    queryKey: ["/api/vault", properties[0]?.id],
    queryFn: () => properties.length > 0 ? fetch(`/api/vault?propertyId=${properties[0].id}`, { credentials: "include" }).then(r => r.json()) : Promise.resolve([]),
    enabled: properties.length > 0,
  });

  const items = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: TimelineItem[] = [];
    const tmplMap = new Map(templates.map(t => [t.id, t]));

    const docs = allVaultDocs.data || [];
    for (const doc of docs) {
      if (!doc.expiryDate) continue;
      if (doc.status !== "uploaded" && doc.status !== "expiring" && doc.status !== "expired") continue;
      const tmpl = tmplMap.get(doc.templateId);
      if (!tmpl) continue;
      const expDate = new Date(doc.expiryDate);
      const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      result.push({
        id: `vault-${doc.id}`,
        label: getTemplateName(tmpl, language),
        date: expDate,
        gateNumber: tmpl.gateNumber,
        color: GATE_COLORS[tmpl.gateNumber],
        isOverdue: diff < 0,
        daysUntil: diff,
        source: "vault",
        propertyName: properties[0]?.propertyName,
      });
    }

    for (const fd of FIXED_DEADLINES) {
      const dates = getNextOccurrence(fd, today);
      for (const d of dates) {
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        result.push({
          id: `fixed-${fd.id}-${d.toISOString()}`,
          label: t.timeline[fd.labelKey],
          date: d,
          gateNumber: fd.gateNumber,
          color: GATE_COLORS[fd.gateNumber],
          isOverdue: diff < 0,
          daysUntil: diff,
          source: "fixed",
        });
      }
    }

    result.sort((a, b) => a.date.getTime() - b.date.getTime());
    return result;
  }, [templates, allVaultDocs.data, properties, language, t]);

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const ninety = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    return items.filter(item => {
      if (filter === "overdue") return item.isOverdue;
      if (filter === "thisMonth") return item.date <= endOfMonth;
      if (filter === "next90") return item.date <= ninety;
      return true;
    });
  }, [items, filter]);

  const overdueItems = filtered.filter(i => i.isOverdue);
  const upcomingItems = filtered.filter(i => !i.isOverdue);

  const monthGroups = useMemo(() => {
    const groups = new Map<string, TimelineItem[]>();
    for (const item of upcomingItems) {
      const key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}`;
      const arr = groups.get(key) || [];
      arr.push(item);
      groups.set(key, arr);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [upcomingItems]);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t.timeline.filterAll },
    { key: "overdue", label: t.timeline.filterOverdue },
    { key: "thisMonth", label: t.timeline.filterThisMonth },
    { key: "next90", label: t.timeline.filterNext90 },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--app-bg)" }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-timeline-heading">{t.timeline.heading}</h1>
          <p className="text-slate-400 text-sm mt-1">{t.timeline.subheading}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-heading font-bold tracking-wider transition-colors ${filter === f.key ? "bg-[#14B8A6] text-white" : "bg-[#14B8A6]/10 text-[#14B8A6] hover:bg-[#14B8A6]/20"}`}
              data-testid={`button-filter-${f.key}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-heading" data-testid="text-timeline-empty">{t.timeline.noItems}</p>
            <p className="text-slate-500 text-sm mt-1">{t.timeline.noItemsDesc}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {overdueItems.length > 0 && (
              <div>
                <h2 className="text-sm font-heading font-bold text-[#EF4444] uppercase tracking-wider mb-3 flex items-center gap-2" data-testid="text-overdue-section">
                  <AlertTriangle className="h-4 w-4" /> {t.timeline.overdueLabel}
                </h2>
                <div className="space-y-2 border-l-2 border-[#EF4444]/30 pl-4 ml-2">
                  {overdueItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/15" data-testid={`item-timeline-${item.id}`}>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-sm text-slate-200 flex-1">{item.label}</span>
                      <span className="text-[9px] font-heading font-bold px-2 py-0.5 rounded-full" style={{ background: `${item.color}15`, color: item.color }}>{GATE_ABBRS[item.gateNumber]}</span>
                      <span className="text-xs text-slate-500">{item.date.toLocaleDateString()}</span>
                      <span className="text-[10px] font-heading font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">{Math.abs(item.daysUntil)} {t.timeline.daysOverdue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {monthGroups.map(([monthKey, groupItems]) => {
              const monthDate = new Date(monthKey + "-01");
              const monthLabel = monthDate.toLocaleDateString(language === "uk" ? "uk-UA" : language === "id" ? "id-ID" : "en-US", { month: "long", year: "numeric" });
              return (
                <div key={monthKey}>
                  <h2 className="text-sm font-heading font-bold text-[#14B8A6] uppercase tracking-wider mb-3 border-l-2 border-[#14B8A6]/50 pl-3" data-testid={`text-month-${monthKey}`}>
                    {monthLabel}
                  </h2>
                  <div className="space-y-2 border-l-2 border-[#14B8A6]/15 pl-4 ml-2">
                    {groupItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors" data-testid={`item-timeline-${item.id}`}>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                        <span className="text-sm text-slate-200 flex-1">{item.label}</span>
                        <span className="text-[9px] font-heading font-bold px-2 py-0.5 rounded-full" style={{ background: `${item.color}15`, color: item.color }}>{GATE_ABBRS[item.gateNumber]}</span>
                        <span className="text-xs text-slate-500">{item.date.toLocaleDateString()}</span>
                        {item.daysUntil >= 0 && (
                          <span className="text-[10px] font-heading text-slate-500">{item.daysUntil} {t.timeline.daysUntil}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
