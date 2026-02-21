import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalIcon, Check, AlertTriangle, RefreshCw, ArrowRight, Hexagon, FileText, Shield, Zap, Droplets, Recycle, Trash2, BookUser, UserCheck, ClipboardList, Landmark, CalendarDays, BarChart3, DollarSign, Flower2, Star, Waves, Handshake, Flame, FlameKindling, List, Grid3X3, LayoutList, Tag, Clock, Pencil, CalendarCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/context";
import {
  generateEvents, expandCustomEvent, typeColor, GATE_NAMES,
  FILTER_TYPES, getFilterLabels, getLegendItems,
  mapVaultDocs, mapStaffKitas, mapPropertyHgb,
  type CalendarEvent, type CustomEvent,
} from "@/lib/calendar-events";
import type { Property, VaultDocumentTemplate, VaultDocument, StaffMember } from "@shared/schema";

const COLOR_OPTIONS = ["#14B8A6", "#F59E0B", "#E879F9", "#FCA5A5", "#60A5FA", "#22C55E", "#A78BFA", "#94A3B8", "#FB923C", "#F472B6"];

function renderEventIcon(icon: string, size: number = 9) {
  const s = { width: size, height: size, display: "inline", verticalAlign: "middle" };
  const iconMap: Record<string, React.ReactNode> = {
    cycle: <RefreshCw style={s} />,
    dot: <span style={{ width: size, height: size, borderRadius: "50%", background: "currentColor", display: "inline-block", verticalAlign: "middle" }} />,
    banjar: <Landmark style={s} />,
    "fire-ext": <FlameKindling style={s} />,
    hex: <Hexagon style={s} />,
    doc: <FileText style={s} />,
    check: <Check style={s} />,
    fire: <Flame style={s} />,
    elec: <Zap style={s} />,
    water: <Droplets style={s} />,
    recycle: <Recycle style={s} />,
    waste: <Trash2 style={s} />,
    shield: <Shield style={s} />,
    passport: <BookUser style={s} />,
    "id-card": <UserCheck style={s} />,
    officer: <Shield style={s} />,
    clipboard: <ClipboardList style={s} />,
    temple: <Landmark style={s} />,
    event: <CalendarDays style={s} />,
    chart: <BarChart3 style={s} />,
    money: <DollarSign style={s} />,
    flower: <Flower2 style={s} />,
    star: <Star style={s} />,
    pool: <Waves style={s} />,
    handshake: <Handshake style={s} />,
  };
  return iconMap[icon] || <span style={{ fontSize: size }}>{icon}</span>;
}

type ViewMode = "month" | "week" | "list" | "category" | "timeline";

const VIEW_ICONS: Record<ViewMode, React.ReactNode> = {
  month: <Grid3X3 size={13} />,
  week: <CalendarDays size={13} />,
  list: <LayoutList size={13} />,
  category: <Tag size={13} />,
  timeline: <Clock size={13} />,
};

const LOCALE_MAP: Record<string, string> = { en: "en", uk: "uk", id: "id" };

function loadCustomEvents(): CustomEvent[] {
  try { return JSON.parse(localStorage.getItem("dscvr-cal-custom") || "[]"); } catch { return []; }
}
function saveCustomEvents(evs: CustomEvent[]) {
  localStorage.setItem("dscvr-cal-custom", JSON.stringify(evs));
}
function loadFiled(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem("dscvr-cal-filed") || "[]")); } catch { return new Set(); }
}
function saveFiled(s: Set<string>) {
  localStorage.setItem("dscvr-cal-filed", JSON.stringify([...s]));
}

export default function ComplianceCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { user } = useAuth();
  const { lang, t: uiT } = useLanguage();
  const t = uiT.calendarPage;
  const language = lang;
  const locale = LOCALE_MAP[lang] || "en";

  const filterLabels = useMemo(() => getFilterLabels(t), [t]);
  const legendItems = useMemo(() => getLegendItems(t), [t]);

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState<Set<string>>(new Set(["all"]));
  const [filed, setFiled] = useState<Set<string>>(loadFiled);
  const [customEvs, setCustomEvs] = useState<CustomEvent[]>(loadCustomEvents);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [tappedEvent, setTappedEvent] = useState<CalendarEvent | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<CustomEvent["type"]>("custom");
  const [formGate, setFormGate] = useState(-1);
  const [formRecurring, setFormRecurring] = useState<CustomEvent["recurring"]>("none");
  const [formDesc, setFormDesc] = useState("");
  const [formColor, setFormColor] = useState("#14B8A6");

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

  const baseEvents = useMemo(() => generateEvents(curYear, language), [curYear, language]);
  const allEvents = useMemo(() => {
    const expanded = customEvs.flatMap(ce => expandCustomEvent(ce, curYear));
    const vaultEvents = mapVaultDocs(vaultDocs, templates, language);
    const kitasEvents = mapStaffKitas(staffMembers, language);
    const hgbEvents = mapPropertyHgb(properties, language);
    return [...baseEvents, ...expanded, ...vaultEvents, ...kitasEvents, ...hgbEvents];
  }, [baseEvents, customEvs, curYear, vaultDocs, templates, staffMembers, properties, language]);

  const getEventsForDay = useCallback((y: number, m: number, d: number) => {
    let evts = allEvents.filter(ev => ev.date.getFullYear() === y && ev.date.getMonth() === m && ev.date.getDate() === d);
    if (!filters.has("all")) {
      evts = evts.filter(ev => filters.has(ev.type) || (filters.has("custom") && ev.isCustom));
    }
    return evts;
  }, [allEvents, filters]);

  const getEventsForMonth = useCallback((y: number, m: number) => {
    return allEvents.filter(ev => ev.date.getFullYear() === y && ev.date.getMonth() === m);
  }, [allEvents]);

  const filteredMonthEvents = useMemo(() => {
    let evts = allEvents.filter(ev => ev.date.getFullYear() === curYear && ev.date.getMonth() === curMonth);
    if (!filters.has("all")) {
      evts = evts.filter(ev => filters.has(ev.type) || (filters.has("custom") && ev.isCustom));
    }
    return evts.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [allEvents, curYear, curMonth, filters]);

  const weekDays = useMemo(() => {
    const d = selDate || new Date(curYear, curMonth, today.getMonth() === curMonth && today.getFullYear() === curYear ? today.getDate() : 1);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      days.push(dd);
    }
    return days;
  }, [selDate, curYear, curMonth, today]);

  const categoryGroups = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {};
    for (const ev of filteredMonthEvents) {
      const key = ev.isCustom ? "custom" : ev.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    }
    return groups;
  }, [filteredMonthEvents]);

  const viewLabels: Record<ViewMode, string> = {
    month: t.viewMonth,
    week: t.viewWeek,
    list: t.viewList,
    category: t.viewCategory,
    timeline: t.viewTimeline,
  };

  const toggleFilter = (f: string) => {
    setFilters(new Set([f]));
  };

  const changeMonth = (delta: number) => {
    let m = curMonth + delta;
    let y = curYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCurMonth(m);
    setCurYear(y);
    setSelDate(null);
  };

  const goToday = () => {
    setCurYear(today.getFullYear());
    setCurMonth(today.getMonth());
    setSelDate(new Date(today));
  };

  const goMonth = (m: number) => {
    setCurMonth(m);
    setSelDate(null);
  };

  const markFiled = (id: string) => {
    setFiled(prev => {
      const next = new Set(prev);
      next.add(id);
      saveFiled(next);
      return next;
    });
  };

  const openAddModal = () => {
    setEditId(null);
    setFormTitle("");
    setFormDate("");
    setFormType("custom");
    setFormGate(-1);
    setFormRecurring("none");
    setFormDesc("");
    setFormColor("#14B8A6");
    setShowModal(true);
  };

  const editCustom = (id: string) => {
    const baseId = id.includes("-") ? id.replace(/-\d{4}-\d{2}$/, "") : id;
    const ev = customEvs.find(c => c.id === baseId || c.id === id);
    if (!ev) return;
    setEditId(ev.id);
    setFormTitle(ev.title);
    setFormDate(ev.date);
    setFormType(ev.type);
    setFormGate(ev.gate);
    setFormRecurring(ev.recurring);
    setFormDesc(ev.desc);
    setFormColor(ev.customColor);
    setShowModal(true);
  };

  const deleteCustom = (id: string) => {
    const baseId = id.includes("-") ? id.replace(/-\d{4}-\d{2}$/, "") : id;
    const next = customEvs.filter(c => c.id !== baseId && c.id !== id);
    setCustomEvs(next);
    saveCustomEvents(next);
    setTappedEvent(null);
  };

  const handleEventTap = (ev: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setTappedEvent(ev);
  };

  const saveEvent = () => {
    if (!formTitle.trim() || !formDate) return;
    const ev: CustomEvent = {
      id: editId || `cust-${Math.random().toString(36).slice(2)}`,
      title: formTitle.trim(),
      date: formDate,
      type: formType,
      gate: formGate,
      desc: formDesc,
      recurring: formRecurring,
      customColor: formColor,
    };
    let next: CustomEvent[];
    if (editId) {
      next = customEvs.map(c => c.id === editId ? ev : c);
    } else {
      next = [...customEvs, ev];
    }
    setCustomEvs(next);
    saveCustomEvents(next);
    setShowModal(false);
  };

  const calCells = useMemo(() => {
    const firstDay = new Date(curYear, curMonth, 1).getDay();
    let startOffset = firstDay - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const daysInPrev = new Date(curYear, curMonth, 0).getDate();

    const cells: Array<{ d: number; m: number; y: number; outside: boolean }> = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ d: daysInPrev - i, m: curMonth - 1, y: curMonth === 0 ? curYear - 1 : curYear, outside: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ d, m: curMonth, y: curYear, outside: false });
    }
    const rem = 42 - cells.length;
    for (let d = 1; d <= rem; d++) {
      cells.push({ d, m: curMonth + 1, y: curMonth === 11 ? curYear + 1 : curYear, outside: true });
    }
    return cells;
  }, [curYear, curMonth]);

  const monthLabel = new Date(curYear, curMonth, 1).toLocaleString(locale, { month: "long", year: "numeric" });

  const detailEvents = useMemo(() => {
    if (!selDate) return [];
    return getEventsForDay(selDate.getFullYear(), selDate.getMonth(), selDate.getDate());
  }, [selDate, getEventsForDay]);

  useEffect(() => {
    if (selDate) {
      setTimeout(() => {
        document.getElementById("cal-detail-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [selDate]);

  return (
    <div className="p-4 md:px-[26px] md:py-[22px]" data-testid="calendar-page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "22px", color: "var(--txt)" }} data-testid="calendar-title">{t.title}</h1>
          <p style={{ fontSize: "12px", color: "var(--t2)", marginTop: "3px" }}>{t.subtitle}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
          <button
            onClick={() => changeMonth(-1)}
            data-testid="btn-prev-month"
            style={{ background: "var(--surface)", border: "1px solid var(--b)", color: "var(--t2)", padding: "7px 12px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b)"; e.currentTarget.style.color = "var(--t2)"; }}
          >
            <ChevronLeft size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {t.prev}
          </button>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", minWidth: "165px", textAlign: "center", color: "var(--txt)" }} data-testid="month-label">
            {monthLabel}
          </div>
          <button
            onClick={() => changeMonth(1)}
            data-testid="btn-next-month"
            style={{ background: "var(--surface)", border: "1px solid var(--b)", color: "var(--t2)", padding: "7px 12px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b)"; e.currentTarget.style.color = "var(--t2)"; }}
          >
            {t.next} <ChevronRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          </button>
          <button
            onClick={goToday}
            data-testid="btn-today"
            style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-tint2)", color: "var(--accent)", padding: "7px 14px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-tint2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--accent-tint)"; }}
          >
            {t.today}
          </button>
          <button
            onClick={openAddModal}
            data-testid="btn-add-event"
            style={{ background: "var(--accent)", border: "none", color: "var(--bg)", padding: "7px 16px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 800, transition: "all .15s", display: "flex", alignItems: "center", gap: "4px" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; }}
          >
            <Plus size={14} /> {t.addEvent}
          </button>
        </div>
      </div>
      {/* Year strip */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "14px", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }} data-testid="year-strip">
        {t.months.map((mn, mi) => {
          const mEvts = getEventsForMonth(curYear, mi);
          const types = [...new Set(mEvts.map(e => e.type))];
          return (
            <div
              key={mi}
              onClick={() => goMonth(mi)}
              data-testid={`month-${mi}`}
              style={{
                background: mi === curMonth ? "var(--accent-tint)" : "var(--surface)",
                border: `1px solid ${mi === curMonth ? "var(--accent)" : "var(--b)"}`,
                borderRadius: "6px", padding: "5px 6px", textAlign: "center", cursor: "pointer", transition: "all .15s",
                flex: "0 0 auto", minWidth: "52px",
              }}
              onMouseEnter={e => { if (mi !== curMonth) e.currentTarget.style.borderColor = "var(--accent-tint2)"; }}
              onMouseLeave={e => { if (mi !== curMonth) e.currentTarget.style.borderColor = "var(--b)"; }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700, letterSpacing: "1px", color: mi === curMonth ? "var(--accent)" : "var(--t2)", textTransform: "uppercase", marginBottom: "3px" }}>
                {mn}
              </div>
              <div style={{ display: "flex", gap: "2px", justifyContent: "center", flexWrap: "wrap", minHeight: "10px" }}>
                {types.slice(0, 6).map((tp, i) => {
                  const sample = mEvts.find(e => e.type === tp);
                  return <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: typeColor(tp, sample?.gate ?? 4) }} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* Filters */}
      <div
        style={{
          display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px", alignItems: "center",
          background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "10px",
          padding: "10px 14px",
        }}
        data-testid="calendar-filters"
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: "9px", letterSpacing: "1.5px", color: "var(--t3)", textTransform: "uppercase", marginRight: "4px", fontWeight: 700 }}>{t.filter}</span>
        {FILTER_TYPES.map(f => {
          const active = filters.has(f);
          return (
            <button
              key={f}
              data-testid={`filter-${f}`}
              onClick={() => toggleFilter(f)}
              style={{
                padding: "5px 14px", borderRadius: "20px",
                border: active ? "1px solid var(--accent)" : "1px solid var(--b)",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#ffffff" : "var(--t2)",
                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, letterSpacing: ".3px",
                cursor: "pointer", transition: "all .15s",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "var(--accent-tint2)"; e.currentTarget.style.color = "var(--txt)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "var(--b)"; e.currentTarget.style.color = "var(--t2)"; } }}
            >
              {filterLabels[f]}
            </button>
          );
        })}
      </div>
      {/* View mode switcher */}
      <div
        style={{
          display: "flex", marginBottom: "14px",
          background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "8px",
          overflowX: "auto", overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
        }}
        data-testid="view-switcher"
      >
        {(["month", "week", "list", "category", "timeline"] as ViewMode[]).map((vm, idx) => {
          const active = viewMode === vm;
          return (
            <button
              key={vm}
              data-testid={`view-${vm}`}
              onClick={() => setViewMode(vm)}
              style={{
                flex: "0 0 auto", minWidth: "80px", padding: "7px 12px",
                border: "none",
                borderRight: idx < 4 ? "1px solid var(--b)" : "none",
                background: active ? "var(--accent)" : "none",
                color: active ? "#fff" : "var(--t2)",
                fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700,
                letterSpacing: ".3px", textTransform: "uppercase",
                cursor: "pointer", transition: "all .15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--b)"; e.currentTarget.style.color = "var(--txt)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--t2)"; } }}
            >
              {VIEW_ICONS[vm]} {viewLabels[vm]}
            </button>
          );
        })}
      </div>
      {/* Calendar grid (Month view) */}
      {viewMode === "month" && <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }} data-testid="calendar-grid">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--b)" }}>
          {t.days.map(d => (
            <div
              key={d}
              style={{ padding: "9px 0", textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--t4)" }}
              className="text-[#404040] text-[10px] md:text-[13px]">
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {calCells.map((c, idx) => {
            const cellDate = new Date(c.y, c.m, c.d);
            const isToday = cellDate.getTime() === today.getTime();
            const isSel = selDate && selDate.getTime() === cellDate.getTime();
            const evts = c.outside ? [] : getEventsForDay(c.y, c.m, c.d);
            const hasOverdue = evts.some(e => e.daysUntil < 0 && e.type !== "ops");
            const visible = evts.slice(0, 3);
            const overflow = evts.length - 3;

            return (
              <div
                key={idx}
                onClick={() => !c.outside && setSelDate(cellDate)}
                data-testid={`cell-${c.y}-${c.m}-${c.d}`}
                className="min-h-[60px] md:min-h-[88px]"
                style={{
                  borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--b)" : undefined,
                  borderBottom: "1px solid var(--b)",
                  padding: "5px 4px", cursor: c.outside ? "default" : "pointer",
                  transition: "background .1s", overflow: "hidden",
                  opacity: c.outside ? 0.3 : 1,
                  background: isSel ? "var(--accent-tint)" : hasOverdue ? "rgba(239,68,68,0.04)" : "transparent",
                }}
                onMouseEnter={e => { if (!c.outside && !isSel) e.currentTarget.style.background = "var(--b)"; }}
                onMouseLeave={e => { if (!c.outside && !isSel) e.currentTarget.style.background = hasOverdue ? "rgba(239,68,68,0.04)" : "transparent"; }}
              >
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "12px", color: isToday ? "var(--bg)" : "var(--t2)",
                  marginBottom: "3px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%", background: isToday ? "var(--accent)" : "transparent",
                }}>
                  {c.d}
                </div>
                {visible.map(ev => {
                  const col = ev.isCustom ? (ev.customColor || "rgba(255,255,255,.35)") : typeColor(ev.type, ev.gate);
                  const isFiled = filed.has(ev.id);
                  return (
                    <div
                      key={ev.id}
                      onClick={e => handleEventTap(ev, e)}
                      style={{
                        display: "flex", alignItems: "center", gap: "2px", fontSize: "9px", fontFamily: "var(--font-display)", fontWeight: 600,
                        padding: "1px 4px", borderRadius: "3px", marginBottom: "2px", borderLeft: `2px solid ${col}`,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
                        cursor: "pointer", letterSpacing: ".2px", transition: "opacity .1s",
                        background: `${col}18`, color: col, opacity: isFiled ? 0.5 : 1,
                      }}
                    >
                      {isFiled ? <><Check style={{ width: 9, height: 9, display: "inline", verticalAlign: "middle" }} />{" "}</> : <>{renderEventIcon(ev.icon)}{" "}</>}{ev.short}
                    </div>
                  );
                })}
                {overflow > 0 && (
                  <div
                    onClick={e => { e.stopPropagation(); if (!c.outside) setSelDate(cellDate); }}
                    style={{ fontSize: "9px", color: "var(--t4)", fontFamily: "var(--font-display)", fontWeight: 600, padding: "1px 3px", cursor: "pointer" }}
                  >
                    +{overflow} {t.more}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>}
      {/* Detail panel (month view only) */}
      {viewMode === "month" && <div id="cal-detail-panel" style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }} data-testid="detail-panel">
        {!selDate ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--t4)" }}>
            <CalIcon size={26} style={{ marginBottom: "8px", opacity: 0.4 }} />
            <p>{t.clickDay}</p>
          </div>
        ) : detailEvents.length === 0 ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 17px", borderBottom: "1px solid var(--b)", background: "var(--surface2)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "14px", color: "var(--txt)" }}>
                  {selDate.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div style={{ fontSize: "11px", color: "var(--t2)", marginTop: "2px" }}>{t.noEvents}</div>
              </div>
              <button onClick={() => setSelDate(null)} data-testid="btn-close-detail" style={{ width: "26px", height: "26px", background: "var(--b)", border: "1px solid var(--b)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)", fontSize: "14px" }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: "20px", textAlign: "center", color: "var(--t4)" }}>
              <p>{t.noFilings}</p>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 17px", borderBottom: "1px solid var(--b)", background: "var(--surface2)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "14px", color: "var(--txt)" }}>
                  {selDate.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div style={{ fontSize: "11px", color: "var(--t2)", marginTop: "2px" }}>
                  {detailEvents.length} {detailEvents.length !== 1 ? t.events : t.event}
                </div>
              </div>
              <button onClick={() => setSelDate(null)} data-testid="btn-close-detail" style={{ width: "26px", height: "26px", background: "var(--b)", border: "1px solid var(--b)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)" }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "7px", maxHeight: "300px", overflowY: "auto" }}>
              {detailEvents.map(ev => {
                const col = ev.isCustom ? (ev.customColor || "rgba(255,255,255,.35)") : typeColor(ev.type, ev.gate);
                const gn = ev.gate >= 0 ? (GATE_NAMES[ev.gate] || t.custom) : t.custom;
                const isFiled = filed.has(ev.id);
                const isOverdue = ev.daysUntil < 0 && ev.type !== "ops" && ev.type !== "banjar";
                const isDueToday = ev.daysUntil === 0;

                return (
                  <div
                    key={ev.id}
                    style={{
                      background: ev.isCustom ? "var(--accent-tint)" : isOverdue ? "rgba(239,68,68,0.05)" : "var(--surface2)",
                      border: "1px solid var(--b)", borderRadius: "8px", padding: "10px 13px",
                      borderLeft: `3px solid ${col}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "12px", lineHeight: 1.4, color: "var(--txt)" }}>
                          {renderEventIcon(ev.icon, 12)} {ev.title}
                          {isOverdue && <span style={{ fontSize: "9px", color: "var(--danger)", fontFamily: "var(--font-display)", fontWeight: 700, marginLeft: "6px", display: "inline-flex", alignItems: "center", gap: "2px" }}><AlertTriangle style={{ width: 9, height: 9 }} /> {t.overdue}</span>}
                          {isDueToday && <span style={{ fontSize: "9px", color: "#FB923C", fontFamily: "var(--font-display)", fontWeight: 700, marginLeft: "6px" }}>{t.dueToday}</span>}
                        </div>
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "10px", whiteSpace: "nowrap", letterSpacing: ".4px", flexShrink: 0, background: `${col}22`, color: col, border: `1px solid ${col}44` }}>
                        {gn}
                      </div>
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--t4)", marginBottom: "4px" }}>
                      {ev.period}
                      {ev.recurring && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "9px", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--t4)", padding: "1px 5px", background: "var(--b)", borderRadius: "10px", marginLeft: "6px" }}><RefreshCw style={{ width: 9, height: 9 }} /> {t.recurring}</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--t2)", lineHeight: 1.5, marginBottom: "8px" }}>{ev.desc}</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                      {ev.recurring && (
                        isFiled ? (
                          <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "5px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "var(--grn)", cursor: "default", letterSpacing: ".3px" }}>
                            <Check style={{ width: 10, height: 10, display: "inline", verticalAlign: "middle" }} /> {t.filed}
                          </span>
                        ) : (
                          <button
                            onClick={() => markFiled(ev.id)}
                            data-testid={`btn-filed-${ev.id}`}
                            style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "5px", cursor: "pointer", letterSpacing: ".3px", transition: "all .15s", border: "1px solid var(--accent-tint2)", background: "var(--accent-tint)", color: "var(--accent)" }}
                          >
                            {t.markFiled}
                          </button>
                        )
                      )}
                      {!ev.isCustom && ev.type !== "ops" && (
                        <button style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "5px", cursor: "pointer", letterSpacing: ".3px", transition: "all .15s", border: "1px solid var(--b)", background: "transparent", color: "var(--t2)" }}>
                          {t.goToVault} <ArrowRight style={{ width: 10, height: 10, display: "inline", verticalAlign: "middle" }} />
                        </button>
                      )}
                      {ev.isCustom && (
                        <>
                          <button
                            onClick={() => editCustom(ev.id)}
                            style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "5px", cursor: "pointer", letterSpacing: ".3px", transition: "all .15s", border: "1px solid var(--b)", background: "transparent", color: "var(--t2)" }}
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => deleteCustom(ev.id)}
                            style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "5px", cursor: "pointer", letterSpacing: ".3px", transition: "all .15s", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}
                          >
                            {t.delete}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>}
      {/* Week view */}
      {viewMode === "week" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }} data-testid="week-view">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0 }}>
            {weekDays.map((wd, wi) => {
              const isToday = wd.getTime() === today.getTime();
              const dayEvts = getEventsForDay(wd.getFullYear(), wd.getMonth(), wd.getDate());
              return (
                <div
                  key={wi}
                  style={{
                    borderRight: wi < 6 ? "1px solid var(--b)" : undefined,
                    minHeight: "260px", display: "flex", flexDirection: "column",
                  }}
                >
                  <div style={{
                    padding: "10px 8px", borderBottom: "1px solid var(--b)",
                    background: isToday ? "var(--accent-tint)" : "var(--surface2)",
                    textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--t4)", marginBottom: "2px" }}>
                      {t.days[wi]}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "18px",
                      color: isToday ? "var(--accent)" : "var(--txt)",
                    }}>
                      {wd.getDate()}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "9px", color: "var(--t4)" }}>
                      {t.months[wd.getMonth()]}
                    </div>
                  </div>
                  <div style={{ padding: "6px 4px", flex: 1, display: "flex", flexDirection: "column", gap: "3px", overflowY: "auto" }}>
                    {dayEvts.length === 0 && (
                      <div style={{ fontSize: "9px", color: "var(--t4)", textAlign: "center", padding: "8px 0", fontFamily: "var(--font-display)" }}>—</div>
                    )}
                    {dayEvts.map(ev => {
                      const col = ev.isCustom ? (ev.customColor || "rgba(255,255,255,.35)") : typeColor(ev.type, ev.gate);
                      const isFiled = filed.has(ev.id);
                      return (
                        <div
                          key={ev.id}
                          onClick={e => handleEventTap(ev, e)}
                          style={{
                            fontSize: "9px", fontFamily: "var(--font-display)", fontWeight: 600,
                            padding: "4px 5px", borderRadius: "4px", borderLeft: `2px solid ${col}`,
                            background: `${col}18`, color: col,
                            cursor: "pointer", opacity: isFiled ? 0.5 : 1,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}
                        >
                          {renderEventIcon(ev.icon)} {ev.short}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* List view */}
      {viewMode === "list" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }} data-testid="list-view">
          {filteredMonthEvents.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--t4)", fontFamily: "var(--font-display)" }}>
              <LayoutList size={28} style={{ marginBottom: "8px", opacity: 0.4 }} />
              <p>{t.noEventsInPeriod}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredMonthEvents.map((ev, idx) => {
                const col = ev.isCustom ? (ev.customColor || "rgba(255,255,255,.35)") : typeColor(ev.type, ev.gate);
                const gn = ev.gate >= 0 ? (GATE_NAMES[ev.gate] || t.custom) : t.custom;
                const isFiled = filed.has(ev.id);
                const isOverdue = ev.daysUntil < 0 && ev.type !== "ops";
                const isDueToday = ev.daysUntil === 0;
                const dayLabel = ev.date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
                return (
                  <div
                    key={ev.id + "-" + idx}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 16px",
                      borderBottom: idx < filteredMonthEvents.length - 1 ? "1px solid var(--b)" : undefined,
                      borderLeft: `3px solid ${col}`,
                      background: isOverdue ? "rgba(239,68,68,0.04)" : "transparent",
                      opacity: isFiled ? 0.55 : 1,
                      transition: "background .1s", cursor: "pointer",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.08)" : "var(--b)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.04)" : "transparent"; }}
                    onClick={e => handleEventTap(ev, e)}
                  >
                    <div style={{ minWidth: "56px", textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", color: isDueToday ? "var(--accent)" : "var(--txt)" }}>
                        {ev.date.getDate()}
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600, color: "var(--t4)", textTransform: "uppercase", letterSpacing: ".5px" }}>
                        {dayLabel.split(",")[0]}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "12px", color: "var(--txt)", display: "flex", alignItems: "center", gap: "5px" }}>
                        {renderEventIcon(ev.icon, 11)} {ev.title}
                        {isOverdue && <span style={{ fontSize: "9px", color: "var(--danger)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}><AlertTriangle style={{ width: 9, height: 9 }} /> {t.overdue}</span>}
                        {isDueToday && <span style={{ fontSize: "9px", color: "#FB923C", fontWeight: 700 }}>{t.dueToday}</span>}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--t4)", fontFamily: "monospace", marginTop: "2px" }}>{ev.period}</div>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
                      padding: "2px 8px", borderRadius: "10px", whiteSpace: "nowrap",
                      background: `${col}22`, color: col, border: `1px solid ${col}44`,
                      flexShrink: 0,
                    }}>
                      {gn}
                    </div>
                    {ev.recurring && (
                      <div style={{ flexShrink: 0 }}>
                        <RefreshCw size={11} style={{ color: "var(--t4)" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* Category view */}
      {viewMode === "category" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "12px" }} data-testid="category-view">
          {Object.keys(categoryGroups).length === 0 ? (
            <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "12px", padding: "40px 20px", textAlign: "center", color: "var(--t4)", fontFamily: "var(--font-display)" }}>
              <Tag size={28} style={{ marginBottom: "8px", opacity: 0.4 }} />
              <p>{t.noEventsInPeriod}</p>
            </div>
          ) : (
            Object.entries(categoryGroups).map(([catKey, evts]) => {
              const sampleEv = evts[0];
              const catCol = sampleEv ? (sampleEv.isCustom ? (sampleEv.customColor || "#94A3B8") : typeColor(sampleEv.type, sampleEv.gate)) : "var(--t4)";
              const catLabel = filterLabels[catKey] || catKey;
              return (
                <div key={catKey} style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{
                    padding: "10px 16px", borderBottom: "1px solid var(--b)", background: "var(--surface2)",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: catCol, flexShrink: 0 }} />
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "13px", color: "var(--txt)", flex: 1 }}>
                      {catLabel}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, color: "var(--t4)", background: "var(--b)", padding: "2px 8px", borderRadius: "10px" }}>
                      {evts.length}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {evts.map((ev, idx) => {
                      const col = ev.isCustom ? (ev.customColor || "rgba(255,255,255,.35)") : typeColor(ev.type, ev.gate);
                      const isFiled = filed.has(ev.id);
                      const isOverdue = ev.daysUntil < 0 && ev.type !== "ops";
                      const dayLabel = ev.date.toLocaleDateString(locale, { day: "numeric", month: "short" });
                      return (
                        <div
                          key={ev.id + "-" + idx}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "9px 16px",
                            borderBottom: idx < evts.length - 1 ? "1px solid var(--b)" : undefined,
                            opacity: isFiled ? 0.55 : 1,
                            cursor: "pointer", transition: "background .1s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--b)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          onClick={e => handleEventTap(ev, e)}
                        >
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "11px", color: isOverdue ? "var(--danger)" : "var(--t2)", minWidth: "48px", flexShrink: 0 }}>
                            {dayLabel}
                          </div>
                          <div style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "11px", color: "var(--txt)", display: "flex", alignItems: "center", gap: "4px" }}>
                            {renderEventIcon(ev.icon, 10)} {ev.short}
                            {isOverdue && <AlertTriangle style={{ width: 9, height: 9, color: "var(--danger)" }} />}
                          </div>
                          {ev.recurring && <RefreshCw size={10} style={{ color: "var(--t4)", flexShrink: 0 }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {/* Timeline view */}
      {viewMode === "timeline" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "12px", overflow: "hidden", marginBottom: "12px", padding: "20px 16px" }} data-testid="timeline-view">
          {filteredMonthEvents.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--t4)", padding: "20px 0", fontFamily: "var(--font-display)" }}>
              <Clock size={28} style={{ marginBottom: "8px", opacity: 0.4 }} />
              <p>{t.noEventsInPeriod}</p>
            </div>
          ) : (
            <div style={{ position: "relative", paddingLeft: "28px" }}>
              <div style={{ position: "absolute", left: "10px", top: 0, bottom: 0, width: "2px", background: "var(--b)" }} />
              {(() => {
                let lastDateStr = "";
                return filteredMonthEvents.map((ev, idx) => {
                  const col = ev.isCustom ? (ev.customColor || "rgba(255,255,255,.35)") : typeColor(ev.type, ev.gate);
                  const dateStr = ev.date.toLocaleDateString(locale, { day: "numeric", month: "short", weekday: "short" });
                  const showDateHeader = dateStr !== lastDateStr;
                  lastDateStr = dateStr;
                  const isOverdue = ev.daysUntil < 0 && ev.type !== "ops";
                  const isDueToday = ev.daysUntil === 0;
                  const isFiled = filed.has(ev.id);
                  const gn = ev.gate >= 0 ? (GATE_NAMES[ev.gate] || t.custom) : t.custom;

                  return (
                    <div key={ev.id + "-" + idx} style={{ marginBottom: idx < filteredMonthEvents.length - 1 ? "4px" : 0 }}>
                      {showDateHeader && (
                        <div style={{ position: "relative", marginBottom: "8px", marginTop: idx > 0 ? "16px" : 0 }}>
                          <div style={{
                            position: "absolute", left: "-24px", top: "2px",
                            width: "10px", height: "10px", borderRadius: "50%",
                            background: isDueToday ? "var(--accent)" : isOverdue ? "var(--danger)" : "var(--t4)",
                            border: "2px solid var(--surface)",
                          }} />
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "12px", color: isDueToday ? "var(--accent)" : isOverdue ? "var(--danger)" : "var(--txt)", letterSpacing: ".3px" }}>
                            {dateStr}
                            {isDueToday && <span style={{ fontSize: "9px", color: "var(--accent)", marginLeft: "6px", fontWeight: 700 }}>{t.dueToday}</span>}
                          </div>
                        </div>
                      )}
                      <div
                        style={{
                          padding: "8px 12px", borderRadius: "8px",
                          borderLeft: `3px solid ${col}`,
                          background: isOverdue ? "rgba(239,68,68,0.05)" : "var(--surface2)",
                          opacity: isFiled ? 0.55 : 1,
                          cursor: "pointer", transition: "background .1s",
                          marginLeft: "4px",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--b)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isOverdue ? "rgba(239,68,68,0.05)" : "var(--surface2)"; }}
                        onClick={e => handleEventTap(ev, e)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "11px", color: "var(--txt)", flex: 1, display: "flex", alignItems: "center", gap: "4px" }}>
                            {renderEventIcon(ev.icon, 11)} {ev.title}
                            {isOverdue && <span style={{ fontSize: "9px", color: "var(--danger)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "2px" }}><AlertTriangle style={{ width: 9, height: 9 }} /> {t.overdue}</span>}
                          </div>
                          <div style={{
                            fontFamily: "var(--font-display)", fontSize: "8px", fontWeight: 700,
                            padding: "1px 6px", borderRadius: "8px",
                            background: `${col}22`, color: col, border: `1px solid ${col}44`,
                            whiteSpace: "nowrap", flexShrink: 0,
                          }}>
                            {gn}
                          </div>
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--t4)", fontFamily: "monospace" }}>{ev.period}</div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}
      {/* Legend */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--b)", borderRadius: "8px" }} data-testid="calendar-legend">
        {legendItems.map(li => (
          <div key={li.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--t2)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: li.color, flexShrink: 0 }} />
            {li.label}
          </div>
        ))}
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={() => setShowModal(false)}
          data-testid="event-modal-overlay"
        >
          <div
            style={{ background: "var(--surface)", border: "1px solid var(--accent-tint2)", borderRadius: "14px", width: "100%", maxWidth: "490px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
            onClick={e => e.stopPropagation()}
            data-testid="event-modal"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 22px", borderBottom: "1px solid var(--b)", background: "var(--surface2)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", color: "var(--txt)" }}>
                {editId ? t.editModal : t.addModal}
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: "28px", height: "28px", background: "var(--b)", border: "1px solid var(--b)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)" }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "13px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--t2)" }}>{t.labelTitle}</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder={t.placeholderTitle}
                  data-testid="input-title"
                  style={{ background: "var(--surface2)", border: "1px solid var(--b)", borderRadius: "7px", padding: "8px 12px", color: "var(--txt)", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", width: "100%" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--accent-tint2)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--b)"; }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--t2)" }}>{t.labelDate}</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    data-testid="input-date"
                    style={{ background: "var(--surface2)", border: "1px solid var(--b)", borderRadius: "7px", padding: "8px 12px", color: "var(--txt)", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", width: "100%", colorScheme: "dark" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--t2)" }}>{t.labelCategory}</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as CustomEvent["type"])}
                    data-testid="input-type"
                    style={{ background: "var(--surface2)", border: "1px solid var(--b)", borderRadius: "7px", padding: "8px 12px", color: "var(--txt)", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", width: "100%", cursor: "pointer", appearance: "none" }}
                  >
                    <option value="custom">{t.catCustom}</option>
                    <option value="banjar">{t.catBanjar}</option>
                    <option value="safety">{t.catSafety}</option>
                    <option value="tax">{t.catTax}</option>
                    <option value="bpjs">{t.catBpjs}</option>
                    <option value="docs">{t.catDocument}</option>
                    <option value="ops">{t.catOperational}</option>
                    <option value="ota">{t.catOta}</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--t2)" }}>{t.labelRepeats}</label>
                  <select
                    value={formRecurring}
                    onChange={e => setFormRecurring(e.target.value as CustomEvent["recurring"])}
                    data-testid="input-recurring"
                    style={{ background: "var(--surface2)", border: "1px solid var(--b)", borderRadius: "7px", padding: "8px 12px", color: "var(--txt)", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", width: "100%", cursor: "pointer", appearance: "none" }}
                  >
                    <option value="none">{t.noRepeat}</option>
                    <option value="monthly">{t.monthly}</option>
                    <option value="quarterly">{t.quarterly}</option>
                    <option value="annual">{t.annually}</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--t2)" }}>{t.labelGate}</label>
                  <select
                    value={formGate}
                    onChange={e => setFormGate(Number(e.target.value))}
                    data-testid="input-gate"
                    style={{ background: "var(--surface2)", border: "1px solid var(--b)", borderRadius: "7px", padding: "8px 12px", color: "var(--txt)", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", width: "100%", cursor: "pointer", appearance: "none" }}
                  >
                    <option value={-1}>{t.noGate}</option>
                    {Object.entries(GATE_NAMES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--t2)" }}>{t.labelNotes}</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder={t.placeholderNotes}
                  data-testid="input-desc"
                  style={{ background: "var(--surface2)", border: "1px solid var(--b)", borderRadius: "7px", padding: "8px 12px", color: "var(--txt)", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", width: "100%", resize: "vertical", minHeight: "65px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--t2)" }}>{t.labelColour}</label>
                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  {COLOR_OPTIONS.map(c => (
                    <div
                      key={c}
                      onClick={() => setFormColor(c)}
                      data-testid={`color-${c.replace("#", "")}`}
                      style={{
                        width: "22px", height: "22px", borderRadius: "50%", background: c, cursor: "pointer",
                        border: formColor === c ? "2px solid #fff" : "2px solid transparent",
                        transform: formColor === c ? "scale(1.2)" : "scale(1)", transition: "all .1s",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: "13px 22px 17px", display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid var(--b)" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "1px solid var(--b)", color: "var(--t2)", padding: "8px 18px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700 }}
              >
                {t.cancel}
              </button>
              <button
                onClick={saveEvent}
                data-testid="btn-save-event"
                style={{ background: "var(--accent)", border: "none", color: "var(--bg)", padding: "8px 22px", borderRadius: "7px", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 800 }}
              >
                {t.saveEvent}
              </button>
            </div>
          </div>
        </div>
      )}

      {tappedEvent && (
        <div
          data-testid="event-detail-overlay"
          onClick={() => setTappedEvent(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--surface)", borderRadius: "14px", width: "100%", maxWidth: "400px",
              border: "1px solid var(--b)", overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            }}
          >
            {(() => {
              const ev = tappedEvent;
              const col = ev.isCustom ? (ev.customColor || "rgba(255,255,255,.35)") : typeColor(ev.type, ev.gate);
              const isFiled = filed.has(ev.id);
              const isOverdue = ev.daysUntil < 0 && ev.type !== "ops";
              const isDueToday = ev.daysUntil === 0;
              const gn = ev.gate >= 1 && ev.gate <= 7 ? GATE_NAMES[ev.gate - 1] : "";
              const dateStr = ev.date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
              return (
                <>
                  <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "flex-start", gap: "12px", borderBottom: "1px solid var(--b)" }}>
                    <div style={{ width: "4px", borderRadius: "2px", background: col, alignSelf: "stretch", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "15px", color: "var(--txt)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                        {renderEventIcon(ev.icon, 15)} {ev.title}
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--t3)", marginBottom: "6px" }}>
                        <CalendarCheck size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                        {dateStr}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                        {gn && (
                          <span style={{
                            fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
                            padding: "2px 8px", borderRadius: "10px",
                            background: `${col}22`, color: col, border: `1px solid ${col}44`,
                          }}>
                            {gn}
                          </span>
                        )}
                        {ev.recurring && (
                          <span style={{
                            fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                            padding: "2px 8px", borderRadius: "10px", color: "var(--t3)",
                            background: "var(--b)", display: "inline-flex", alignItems: "center", gap: "3px",
                          }}>
                            <RefreshCw size={9} /> {t.recurring}
                          </span>
                        )}
                        {isFiled && (
                          <span style={{
                            fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 600,
                            padding: "2px 8px", borderRadius: "10px", color: "#22c55e",
                            background: "rgba(34,197,94,0.1)", display: "inline-flex", alignItems: "center", gap: "3px",
                          }}>
                            <Check size={9} /> {t.filed}
                          </span>
                        )}
                        {isOverdue && (
                          <span style={{
                            fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
                            padding: "2px 8px", borderRadius: "10px", color: "var(--danger)",
                            background: "rgba(239,68,68,0.1)", display: "inline-flex", alignItems: "center", gap: "3px",
                          }}>
                            <AlertTriangle size={9} /> {t.overdue}
                          </span>
                        )}
                        {isDueToday && (
                          <span style={{
                            fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
                            padding: "2px 8px", borderRadius: "10px", color: "#FB923C",
                            background: "rgba(251,146,60,0.1)",
                          }}>
                            {t.dueToday}
                          </span>
                        )}
                      </div>
                      {ev.period && (
                        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--t4)", marginTop: "6px" }}>
                          {ev.period}
                        </div>
                      )}
                    </div>
                    <button
                      data-testid="btn-close-detail"
                      onClick={() => setTappedEvent(null)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--t4)", padding: "2px", flexShrink: 0 }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div style={{ padding: "10px 16px 14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <button
                      data-testid="btn-toggle-filed"
                      onClick={() => {
                        const next = new Set(filed);
                        if (next.has(ev.id)) next.delete(ev.id);
                        else next.add(ev.id);
                        setFiled(next);
                        localStorage.setItem("dscvr_cal_filed", JSON.stringify([...next]));
                      }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700,
                        padding: "7px 14px", borderRadius: "7px", cursor: "pointer",
                        border: "1px solid var(--b)", color: isFiled ? "var(--t3)" : "#22c55e",
                        background: isFiled ? "transparent" : "rgba(34,197,94,0.08)",
                      }}
                    >
                      <Check size={12} /> {isFiled ? t.unmarkFiled : t.markFiled}
                    </button>
                    {ev.isCustom && (
                      <>
                        <button
                          data-testid="btn-edit-event"
                          onClick={() => { editCustom(ev.id); setTappedEvent(null); }}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700,
                            padding: "7px 14px", borderRadius: "7px", cursor: "pointer",
                            border: "1px solid var(--b)", color: "var(--accent)", background: "transparent",
                          }}
                        >
                          <Pencil size={12} /> {t.edit}
                        </button>
                        <button
                          data-testid="btn-delete-event"
                          onClick={() => { deleteCustom(ev.id); }}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700,
                            padding: "7px 14px", borderRadius: "7px", cursor: "pointer",
                            border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", background: "rgba(239,68,68,0.06)",
                          }}
                        >
                          <Trash2 size={12} /> {t.delete}
                        </button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
