import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import type { Property, VaultDocumentTemplate, VaultDocument, StaffMember } from "@shared/schema";
import { Calendar, AlertTriangle, RotateCw } from "lucide-react";
import {
  generateEvents, mapVaultDocs, mapStaffKitas, mapPropertyHgb,
  typeColor, GATE_NAMES, type CalendarEvent,
} from "@/lib/calendar-events";

const GATE_ABBRS = ["PT", "ZONE", "NIB", "SLF", "TAX", "STAFF", "SAFE", "OTA"];

type FilterType = "all" | "overdue" | "thisMonth" | "next90";

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

  const selectedPropertyId = properties[0]?.id;

  const { data: vaultDocs = [] } = useQuery<VaultDocument[]>({
    queryKey: ["/api/vault", selectedPropertyId],
    queryFn: () => fetch(`/api/vault?propertyId=${selectedPropertyId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPropertyId,
  });

  const { data: staffMembers = [] } = useQuery<StaffMember[]>({
    queryKey: ["/api/staff", selectedPropertyId],
    queryFn: () => fetch(`/api/staff?propertyId=${selectedPropertyId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedPropertyId,
  });

  const items = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yr = today.getFullYear();

    const thisYearEvents = generateEvents(yr, language);
    const nextYearEvents = generateEvents(yr + 1, language);
    const seen = new Set(thisYearEvents.map(e => e.id));
    const merged = [...thisYearEvents];
    for (const e of nextYearEvents) {
      if (!seen.has(e.id)) merged.push(e);
    }

    const vaultEvents = mapVaultDocs(vaultDocs, templates, language);
    const kitasEvents = mapStaffKitas(staffMembers, language);
    const hgbEvents = mapPropertyHgb(properties, language);

    const all = [...merged, ...vaultEvents, ...kitasEvents, ...hgbEvents];

    all.sort((a, b) => a.date.getTime() - b.date.getTime());
    return all;
  }, [vaultDocs, templates, properties, staffMembers, language]);

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const ninety = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    return items.filter(item => {
      if (filter === "overdue") return item.daysUntil < 0;
      if (filter === "thisMonth") return item.date <= endOfMonth;
      if (filter === "next90") return item.date <= ninety;
      return true;
    });
  }, [items, filter]);

  const overdueItems = filtered.filter(i => i.daysUntil < 0);
  const upcomingItems = filtered.filter(i => i.daysUntil >= 0);

  const monthGroups = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    for (const item of upcomingItems) {
      const key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}`;
      const arr = groups.get(key) || [];
      arr.push(item);
      groups.set(key, arr);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [upcomingItems]);

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: "all", label: t.timeline.filterAll },
    { key: "overdue", label: t.timeline.filterOverdue },
    { key: "thisMonth", label: t.timeline.filterThisMonth },
    { key: "next90", label: t.timeline.filterNext90 },
  ];

  if (!user) return null;

  const getColor = (ev: CalendarEvent) => typeColor(ev.type, ev.gate);
  const getGateLabel = (ev: CalendarEvent) => GATE_ABBRS[ev.gate] || "—";

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "var(--app-bg)" }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-timeline-heading">{t.timeline.heading}</h1>
          <p className="text-slate-400 text-sm mt-1">{t.timeline.subheading}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filterOptions.map(f => (
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
                  {overdueItems.map(item => {
                    const color = getColor(item);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#EF4444]/5 border border-[#EF4444]/15" data-testid={`item-timeline-${item.id}`}>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                        {item.recurring && <RotateCw className="h-3 w-3 text-slate-500 shrink-0" data-testid={`icon-recurring-${item.id}`} />}
                        <span className="text-sm text-slate-200 flex-1">{item.title}</span>
                        <span className="text-[9px] font-heading font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{getGateLabel(item)}</span>
                        <span className="text-xs text-slate-500">{item.date.toLocaleDateString()}</span>
                        <span className="text-[10px] font-heading font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">{Math.abs(item.daysUntil)} {t.timeline.daysOverdue}</span>
                      </div>
                    );
                  })}
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
                    {groupItems.map(item => {
                      const color = getColor(item);
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors" data-testid={`item-timeline-${item.id}`}>
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                          {item.recurring && <RotateCw className="h-3 w-3 text-slate-500 shrink-0" data-testid={`icon-recurring-${item.id}`} />}
                          <span className="text-sm text-slate-200 flex-1">{item.title}</span>
                          <span className="text-[9px] font-heading font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{getGateLabel(item)}</span>
                          <span className="text-xs text-slate-500">{item.date.toLocaleDateString()}</span>
                          {item.daysUntil >= 0 && (
                            <span className="text-[10px] font-heading text-slate-500">{item.daysUntil} {t.timeline.daysUntil}</span>
                          )}
                        </div>
                      );
                    })}
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
