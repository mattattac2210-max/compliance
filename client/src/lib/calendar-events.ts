import type { CalendarEventTemplate } from "@shared/schema";

export interface CalendarEvent {
  id: string;
  date: Date;
  type: "tax" | "bpjs" | "banjar" | "safety" | "docs" | "ops" | "ota" | "custom";
  gate: number;
  icon: string;
  short: string;
  title: string;
  period: string;
  desc: string;
  recurring: boolean;
  isCustom?: boolean;
  customColor?: string;
  daysUntil: number;
}

export interface CustomEvent {
  id: string;
  title: string;
  date: string;
  type: CalendarEvent["type"];
  gate: number;
  desc: string;
  recurring: "none" | "monthly" | "quarterly" | "annual";
  customColor: string;
}

export const GATE_COLORS: Record<number, string> = {
  0: "#94A3B8", 1: "#14B8A6", 2: "#60A5FA", 3: "#A78BFA",
  4: "#F97316", 5: "#22C55E", 6: "#FCA5A5", 7: "#14B8A6",
};

export const GATE_NAMES: Record<number, string> = {
  0: "G0 Foundation", 1: "G1 Zoning", 2: "G2 NIB", 3: "G3 Building",
  4: "G4 Tax", 5: "G5 Staff", 6: "G6 Safety", 7: "G7 OTA",
};

export function typeColor(type: string, gate: number): string {
  if (type === "ops") return "#FB923C";
  if (type === "ota") return "#14B8A6";
  if (type === "banjar") return "#E879F9";
  if (type === "safety") return "#FCA5A5";
  if (type === "custom") return "rgba(255,255,255,.35)";
  return GATE_COLORS[gate] || "#94A3B8";
}

function daysUntil(d: Date): number {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - t.getTime()) / 86400000);
}

const LOCALE_MAP: Record<string, string> = { en: "en-GB", uk: "uk", id: "id" };

function prevMonthLabel(y: number, m: number, lang: string = "en"): string {
  const locale = LOCALE_MAP[lang] || "en-GB";
  return new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, 1).toLocaleString(locale, { month: "long", year: "numeric" });
}

function curMonthLabel(y: number, m: number, lang: string = "en"): string {
  const locale = LOCALE_MAP[lang] || "en-GB";
  return new Date(y, m, 1).toLocaleString(locale, { month: "long", year: "numeric" });
}

function getTitle(tmpl: CalendarEventTemplate, lang: string, replacements?: Record<string, string>): string {
  let val = lang === "uk" && tmpl.titleUk ? tmpl.titleUk
    : lang === "id" && tmpl.titleId ? tmpl.titleId
    : tmpl.titleEn;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      val = val.replace(`{{${k}}}`, v);
    }
  }
  return val;
}

function getShort(tmpl: CalendarEventTemplate, lang: string, replacements?: Record<string, string>): string {
  let val = lang === "uk" && tmpl.shortUk ? tmpl.shortUk
    : lang === "id" && tmpl.shortId ? tmpl.shortId
    : tmpl.shortEn;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      val = val.replace(`{{${k}}}`, v);
    }
  }
  return val;
}

function getDesc(tmpl: CalendarEventTemplate, lang: string): string {
  return lang === "uk" && tmpl.descUk ? tmpl.descUk
    : lang === "id" && tmpl.descId ? tmpl.descId
    : tmpl.descEn;
}

const PERIOD_I18N: Record<string, Record<string, string>> = {
  period: { uk: "період", id: "periode" },
  "Full year": { uk: "Повний рік", id: "Tahun penuh" },
  Annual: { uk: "Щорічний", id: "Tahunan" },
  Fiscal: { uk: "Фіскальний", id: "Fiskal" },
};

function trPeriod(key: string, lang: string, fallback: string): string {
  if (lang === "en") return fallback;
  return PERIOD_I18N[key]?.[lang] || fallback;
}

function buildPeriodLabel(tmpl: CalendarEventTemplate, yr: number, m: number, lang: string, qLabel?: string): string {
  const periodWord = trPeriod("period", lang, "period");
  const annualLabel = trPeriod("Annual", lang, "Annual");
  const fiscalLabel = trPeriod("Fiscal", lang, "Fiscal");
  const fullYearLabel = trPeriod("Full year", lang, "Full year");

  switch (tmpl.periodTemplate) {
    case "prev_month":
      return `${prevMonthLabel(yr, m, lang)} ${periodWord}`;
    case "cur_month":
      return curMonthLabel(yr, m, lang);
    case "annual":
      return `${annualLabel} ${yr}`;
    case "fiscal":
      return `${fiscalLabel} ${yr - 1}/${yr}`;
    case "full_year":
      return `${fullYearLabel} ${yr}`;
    case "year_only":
      return yr.toString();
    case "quarter_range": {
      const qRanges: Record<string, string> = {
        Q1: `Q1 ${yr} (Jan–Mar)`, Q2: `Q2 ${yr} (Apr–Jun)`,
        Q3: `Q3 ${yr} (Jul–Sep)`, Q4: `Q4 ${yr} (Oct–Dec)`,
      };
      return qRanges[qLabel || "Q1"] || `${qLabel} ${yr}`;
    }
    case "quarter_label":
      return `${qLabel} ${yr}`;
    case "one_time":
      return lang === "uk" ? `Одноразово ${yr}` : lang === "id" ? `Satu kali ${yr}` : `One-time ${yr}`;
    case "none":
      return "";
    default:
      return tmpl.periodTemplate;
  }
}

export function generateEventsFromTemplates(templates: CalendarEventTemplate[], yr: number, lang: string = "en"): CalendarEvent[] {
  const E: CalendarEvent[] = [];
  const add = (o: Omit<CalendarEvent, "daysUntil">) =>
    E.push({ ...o, daysUntil: daysUntil(o.date) });

  for (const tmpl of templates) {
    if (!tmpl.isActive) continue;

    const eventType = tmpl.type as CalendarEvent["type"];

    if (tmpl.frequency === "monthly") {
      for (let m = 0; m < 12; m++) {
        add({
          id: `${tmpl.eventKey}-${yr}-${m}`,
          date: new Date(yr, m, tmpl.dueDay),
          type: eventType, gate: tmpl.gate, icon: tmpl.icon,
          short: getShort(tmpl, lang),
          title: getTitle(tmpl, lang),
          period: buildPeriodLabel(tmpl, yr, m, lang),
          recurring: true,
          desc: getDesc(tmpl, lang),
        });
      }
    } else if (tmpl.frequency === "quarterly") {
      const months = tmpl.quarterMonths || [3, 6, 9];
      const labels = tmpl.quarterLabels || months.map((_, i) => `Q${i + 1}`);
      months.forEach((m, i) => {
        const qLabel = labels[i] || `Q${i + 1}`;
        add({
          id: `${tmpl.eventKey}-${qLabel}-${yr}`,
          date: new Date(yr, m, tmpl.dueDay),
          type: eventType, gate: tmpl.gate, icon: tmpl.icon,
          short: getShort(tmpl, lang, { q: qLabel }),
          title: getTitle(tmpl, lang, { q: qLabel }),
          period: buildPeriodLabel(tmpl, yr, m, lang, qLabel),
          recurring: true,
          desc: getDesc(tmpl, lang),
        });
      });
    } else if (tmpl.frequency === "annual") {
      const m = tmpl.dueMonth ?? 0;
      let targetYr = yr;
      if (tmpl.eventKey === "lkpm-ann") {
        targetYr = yr + 1;
      }
      add({
        id: `${tmpl.eventKey}-${yr}`,
        date: new Date(targetYr, m, tmpl.dueDay),
        type: eventType, gate: tmpl.gate, icon: tmpl.icon,
        short: getShort(tmpl, lang),
        title: getTitle(tmpl, lang),
        period: buildPeriodLabel(tmpl, yr, m, lang),
        recurring: tmpl.isRecurring,
        desc: getDesc(tmpl, lang),
      });
    } else if (tmpl.frequency === "one-time") {
      if (tmpl.yearSpecific && tmpl.yearSpecific !== yr) continue;
      const m = tmpl.dueMonth ?? 0;
      add({
        id: tmpl.eventKey,
        date: new Date(yr, m, tmpl.dueDay),
        type: eventType, gate: tmpl.gate, icon: tmpl.icon,
        short: getShort(tmpl, lang),
        title: getTitle(tmpl, lang),
        period: buildPeriodLabel(tmpl, yr, m, lang),
        recurring: false,
        desc: getDesc(tmpl, lang),
      });
    } else if (tmpl.frequency === "holiday") {
      if (tmpl.yearSpecific && tmpl.yearSpecific !== yr) continue;
      const m = tmpl.dueMonth ?? 0;
      const dt = new Date(yr, m, tmpl.dueDay);
      add({
        id: `hol-${dt.toISOString().slice(0, 10)}`,
        date: dt,
        type: eventType, gate: tmpl.gate, icon: tmpl.icon,
        short: getShort(tmpl, lang),
        title: getTitle(tmpl, lang),
        period: "",
        recurring: false,
        desc: getDesc(tmpl, lang),
      });
    }
  }

  return E;
}

export function expandCustomEvent(ce: CustomEvent, maxYear: number): CalendarEvent[] {
  if (ce.recurring === "none") {
    const d = new Date(ce.date);
    return [{
      id: ce.id, date: d, type: ce.type, gate: ce.gate, icon: "star",
      short: ce.title.slice(0, 16), title: ce.title, period: "",
      desc: ce.desc, recurring: false, isCustom: true,
      customColor: ce.customColor, daysUntil: 0,
    }].map(e => ({ ...e, daysUntil: Math.floor((e.date.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000) }));
  }

  const out: CalendarEvent[] = [];
  const end = new Date(maxYear + 2, 11, 31);
  const cur = new Date(ce.date);
  while (cur <= end) {
    const d = new Date(cur);
    out.push({
      id: `${ce.id}-${d.toISOString().slice(0, 7)}`, date: d, type: ce.type, gate: ce.gate,
      icon: "star", short: ce.title.slice(0, 16), title: ce.title, period: "",
      desc: ce.desc, recurring: true, isCustom: true, customColor: ce.customColor,
      daysUntil: Math.floor((d.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000),
    });
    if (ce.recurring === "monthly") cur.setMonth(cur.getMonth() + 1);
    else if (ce.recurring === "quarterly") cur.setMonth(cur.getMonth() + 3);
    else if (ce.recurring === "annual") cur.setFullYear(cur.getFullYear() + 1);
    else break;
  }
  return out;
}

export interface VaultDocInput {
  id: string;
  templateId: string;
  status: string;
  expiryDate: string | null;
}

export interface VaultTemplateInput {
  id: string;
  gateNumber: number;
  documentName: string;
}

export function mapVaultDocs(docs: VaultDocInput[], templates: VaultTemplateInput[], lang: string = "en"): CalendarEvent[] {
  const tMap = new Map(templates.map(t => [t.id, t]));
  const results: CalendarEvent[] = [];
  const docLabel = lang === "uk" ? "Документ" : lang === "id" ? "Dokumen" : "Document";
  const expiresLabel = lang === "uk" ? "Документ закінчується" : lang === "id" ? "Dokumen kedaluwarsa" : "Document expires";
  const expiryLabel = lang === "uk" ? "Закінчення" : lang === "id" ? "Kedaluwarsa" : "Expiry";
  for (const doc of docs) {
    if (!doc.expiryDate) continue;
    const tmpl = tMap.get(doc.templateId);
    if (!tmpl) continue;
    const d = new Date(doc.expiryDate);
    results.push({
      id: `vault-${doc.id}`, date: d, type: "docs", gate: tmpl.gateNumber,
      icon: "doc", short: `${docLabel} Exp`, title: `${expiresLabel}: ${tmpl.documentName}`,
      period: expiryLabel,
      desc: `${tmpl.documentName} expires ${d.toLocaleDateString()}.`,
      recurring: false, daysUntil: daysUntil(d),
    });
  }
  return results;
}

export interface StaffInput {
  id: string;
  name: string;
  kitasExpiryDate?: string | null;
}

export function mapStaffKitas(staff: StaffInput[], lang: string = "en"): CalendarEvent[] {
  const results: CalendarEvent[] = [];
  const shortLabel = lang === "uk" ? "Понов. KITAS" : lang === "id" ? "Perbarui KITAS" : "KITAS Renewal";
  const expiryLabel = lang === "uk" ? "Закінчення" : lang === "id" ? "Kedaluwarsa" : "Expiry";
  for (const s of staff) {
    if (!s.kitasExpiryDate) continue;
    const d = new Date(s.kitasExpiryDate);
    const titleStr = lang === "uk" ? `KITAS Закінч.: ${s.name}` : lang === "id" ? `KITAS Kedaluwarsa: ${s.name}` : `KITAS Expiry: ${s.name}`;
    const descStr = lang === "uk"
      ? `KITAS для ${s.name} закінчується ${d.toLocaleDateString()}. Починайте поновлення за 60 днів.`
      : lang === "id"
        ? `KITAS untuk ${s.name} kedaluwarsa ${d.toLocaleDateString()}. Mulai perpanjangan 60 hari sebelumnya.`
        : `KITAS for ${s.name} expires ${d.toLocaleDateString()}. Begin renewal 60 days prior.`;
    results.push({
      id: `kitas-staff-${s.id}`, date: d, type: "docs", gate: 5,
      icon: "id-card", short: shortLabel, title: titleStr,
      period: expiryLabel,
      desc: descStr,
      recurring: false, daysUntil: daysUntil(d),
    });
  }
  return results;
}

export interface PropertyInput {
  id: string;
  propertyName: string;
  landTitleType?: string | null;
  landTitleExpiry?: string | null;
}

export function mapPropertyHgb(properties: PropertyInput[], lang: string = "en"): CalendarEvent[] {
  const results: CalendarEvent[] = [];
  const expiryLabel = lang === "uk" ? "Закінчення" : lang === "id" ? "Kedaluwarsa" : "Expiry";
  const shortLabel = lang === "uk" ? "Закінч. HGB" : lang === "id" ? "HGB Kedaluwarsa" : "HGB Expiry";
  for (const p of properties) {
    if (p.landTitleType !== "hgb" || !p.landTitleExpiry) continue;
    const d = new Date(p.landTitleExpiry);
    const titleStr = lang === "uk" ? `Закінчення HGB: ${p.propertyName}` : lang === "id" ? `HGB Kedaluwarsa: ${p.propertyName}` : `HGB Land Title Expiry: ${p.propertyName}`;
    const descStr = lang === "uk"
      ? `HGB для ${p.propertyName} закінчується ${d.toLocaleDateString()}. Почніть поновлення за 2 роки.`
      : lang === "id"
        ? `HGB untuk ${p.propertyName} kedaluwarsa ${d.toLocaleDateString()}. Mulai pembaruan 2 tahun sebelumnya.`
        : `HGB land title for ${p.propertyName} expires ${d.toLocaleDateString()}. Begin renewal 2 years early.`;
    results.push({
      id: `hgb-${p.id}`, date: d, type: "docs", gate: 0,
      icon: "hex", short: shortLabel, title: titleStr,
      period: expiryLabel,
      desc: descStr,
      recurring: false, daysUntil: daysUntil(d),
    });
  }
  return results;
}

export interface RecurringFilingInput {
  id: string;
  propertyId: string;
  filingType: string;
  periodLabel: string;
  dueDate: string;
  filedDate: string | null;
  status: string;
  notes: string | null;
}

const FILING_TYPE_MAP: Record<string, { eventPrefix: string; type: CalendarEvent["type"]; gate: number; icon: string }> = {
  "pb1": { eventPrefix: "pb1", type: "tax", gate: 4, icon: "cycle" },
  "pph 21": { eventPrefix: "pph21", type: "tax", gate: 4, icon: "cycle" },
  "pph21": { eventPrefix: "pph21", type: "tax", gate: 4, icon: "cycle" },
  "pph 25": { eventPrefix: "pph25", type: "tax", gate: 4, icon: "cycle" },
  "pph25": { eventPrefix: "pph25", type: "tax", gate: 4, icon: "cycle" },
  "ppn": { eventPrefix: "ppn", type: "tax", gate: 4, icon: "cycle" },
  "bpjs kesehatan": { eventPrefix: "bpjsk", type: "bpjs", gate: 5, icon: "dot" },
  "bpjs-k": { eventPrefix: "bpjsk", type: "bpjs", gate: 5, icon: "dot" },
  "bpjamsostek": { eventPrefix: "bpjstk", type: "bpjs", gate: 5, icon: "dot" },
  "bpjs ketenagakerjaan": { eventPrefix: "bpjstk", type: "bpjs", gate: 5, icon: "dot" },
  "bpjs": { eventPrefix: "bpjsk", type: "bpjs", gate: 5, icon: "dot" },
  "spt tahunan": { eventPrefix: "spt", type: "tax", gate: 4, icon: "hex" },
  "pbb": { eventPrefix: "pbb", type: "tax", gate: 4, icon: "hex" },
  "lkpm": { eventPrefix: "lkpm", type: "tax", gate: 0, icon: "cycle" },
};

function matchFilingType(filingType: string): { eventPrefix: string; type: CalendarEvent["type"]; gate: number; icon: string } | null {
  const lower = filingType.toLowerCase().trim();
  if (FILING_TYPE_MAP[lower]) return FILING_TYPE_MAP[lower];
  for (const [key, val] of Object.entries(FILING_TYPE_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

const MONTH_NAMES = ["january","february","march","april","may","june","july","august","september","october","november","december"];

function deriveOverrideIds(prefix: string, periodLabel: string, dueDate: string): string[] {
  const ids: string[] = [];
  const pl = periodLabel.toLowerCase();

  const qMatch = pl.match(/q([1-4])/i);
  if (qMatch) {
    const yr = pl.match(/(\d{4})/)?.[1];
    if (yr) {
      ids.push(`${prefix}-Q${qMatch[1]}-${yr}`);
    }
  }

  const yrMatch = pl.match(/(\d{4})/);
  if (yrMatch) {
    const yr = yrMatch[1];
    if (pl.includes("annual") || pl.includes("tahunan") || pl.includes("full year") || pl.includes("fiscal")) {
      ids.push(`${prefix}-${yr}`);
    }
    for (let mi = 0; mi < 12; mi++) {
      if (pl.includes(MONTH_NAMES[mi])) {
        ids.push(`${prefix}-${yr}-${mi}`);
      }
    }
  }

  if (ids.length === 0) {
    const d = new Date(dueDate + "T00:00:00");
    if (!isNaN(d.getTime())) {
      const yr = d.getFullYear();
      const m = d.getMonth();
      ids.push(`${prefix}-${yr}-${m}`);
    }
  }

  return ids;
}

export function mapRecurringFilings(filings: RecurringFilingInput[], lang: string = "en"): { events: CalendarEvent[]; overrideIds: Set<string> } {
  const events: CalendarEvent[] = [];
  const overrideIds = new Set<string>();

  for (const filing of filings) {
    if (!filing.dueDate) continue;
    const d = new Date(filing.dueDate + "T00:00:00");
    if (isNaN(d.getTime())) continue;

    const matched = matchFilingType(filing.filingType);

    if (matched) {
      const idsToOverride = deriveOverrideIds(matched.eventPrefix, filing.periodLabel, filing.dueDate);
      for (const oid of idsToOverride) {
        overrideIds.add(oid);
      }

      events.push({
        id: `filing-${filing.id}`,
        date: d,
        type: matched.type,
        gate: matched.gate,
        icon: matched.icon,
        short: filing.filingType,
        title: `${filing.filingType}${filing.notes ? ` — ${filing.notes}` : ""}`,
        period: filing.periodLabel,
        desc: filing.notes || `Filing: ${filing.filingType}. Status: ${filing.status}.`,
        recurring: true,
        daysUntil: daysUntil(d),
      });
    } else {
      events.push({
        id: `filing-${filing.id}`,
        date: d,
        type: "tax",
        gate: 4,
        icon: "cycle",
        short: filing.filingType.slice(0, 16),
        title: `${filing.filingType}${filing.notes ? ` — ${filing.notes}` : ""}`,
        period: filing.periodLabel,
        desc: filing.notes || `Filing: ${filing.filingType}. Status: ${filing.status}.`,
        recurring: true,
        daysUntil: daysUntil(d),
      });
    }
  }

  return { events, overrideIds };
}

export const FILTER_TYPES = ["all", "tax", "bpjs", "banjar", "safety", "docs", "ops", "ota", "custom"] as const;

export const FILTER_LABELS: Record<string, string> = {
  all: "All", tax: "Tax", bpjs: "BPJS/Staff", banjar: "Banjar",
  safety: "Safety", docs: "Documents", ops: "Operational", ota: "OTA", custom: "Custom",
};

export function getFilterLabels(t: { filterAll: string; filterTax: string; filterBpjs: string; filterBanjar: string; filterSafety: string; filterDocs: string; filterOps: string; filterOta: string; filterCustom: string }): Record<string, string> {
  return {
    all: t.filterAll, tax: t.filterTax, bpjs: t.filterBpjs, banjar: t.filterBanjar,
    safety: t.filterSafety, docs: t.filterDocs, ops: t.filterOps, ota: t.filterOta, custom: t.filterCustom,
  };
}

export const LEGEND_ITEMS = [
  { label: "Tax", color: "#F59E0B" },
  { label: "BPJS/Staff", color: "#22C55E" },
  { label: "Banjar", color: "#E879F9" },
  { label: "Safety", color: "#FCA5A5" },
  { label: "Corp/LKPM", color: "#94A3B8" },
  { label: "Doc expiry", color: "#A78BFA" },
  { label: "Holidays", color: "rgba(255,220,80,.9)" },
  { label: "OTA", color: "#14B8A6" },
  { label: "Overdue", color: "rgba(239,68,68,.8)" },
  { label: "Custom", color: "rgba(255,255,255,.3)" },
];

export function getLegendItems(t: { legendTax: string; legendBpjs: string; legendBanjar: string; legendSafety: string; legendCorp: string; legendDocExpiry: string; legendHolidays: string; legendOta: string; legendOverdue: string; legendCustom: string }) {
  return [
    { label: t.legendTax, color: "#F59E0B" },
    { label: t.legendBpjs, color: "#22C55E" },
    { label: t.legendBanjar, color: "#E879F9" },
    { label: t.legendSafety, color: "#FCA5A5" },
    { label: t.legendCorp, color: "#94A3B8" },
    { label: t.legendDocExpiry, color: "#A78BFA" },
    { label: t.legendHolidays, color: "rgba(255,220,80,.9)" },
    { label: t.legendOta, color: "#14B8A6" },
    { label: t.legendOverdue, color: "rgba(239,68,68,.8)" },
    { label: t.legendCustom, color: "rgba(255,255,255,.3)" },
  ];
}
