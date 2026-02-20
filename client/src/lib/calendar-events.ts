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
  4: "#F59E0B", 5: "#22C55E", 6: "#FCA5A5", 7: "#14B8A6",
};

export const GATE_NAMES: Record<number, string> = {
  0: "G0 Foundation", 1: "G1 Zoning", 2: "G2 NIB", 3: "G3 Building",
  4: "G4 Tax", 5: "G5 Staff", 6: "G6 Safety", 7: "G7 OTA",
};

export function typeColor(type: string, gate: number): string {
  if (type === "ops") return "rgba(255,220,80,.9)";
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

function prevMonthLabel(y: number, m: number): string {
  return new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
}

function curMonthLabel(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleString("en", { month: "long", year: "numeric" });
}

export function generateEvents(yr: number): CalendarEvent[] {
  const E: CalendarEvent[] = [];
  const add = (o: Omit<CalendarEvent, "daysUntil">) =>
    E.push({ ...o, daysUntil: daysUntil(o.date) });

  for (let m = 0; m < 12; m++) {
    const p = prevMonthLabel(yr, m);
    const c = curMonthLabel(yr, m);

    add({ id: `pb1-${yr}-${m}`, date: new Date(yr, m, 20), type: "tax", gate: 4, icon: "↻", short: "PB1 Tax", title: "PB1 Hotel Tax (SPTPD)", period: `${p} period`, recurring: true,
      desc: "File and pay 10% hotel tax on prior month room revenue via e-Palapa / local Bapenda portal. Late filing = penalties from day 1." });
    add({ id: `pph21-${yr}-${m}`, date: new Date(yr, m, 20), type: "tax", gate: 4, icon: "↻", short: "PPh 21", title: "PPh 21 Payroll Tax Filing", period: `${p} period`, recurring: true,
      desc: "File employee income tax withholding for prior month via CoreTax. Calculate per employee salary bracket." });
    add({ id: `pph25-${yr}-${m}`, date: new Date(yr, m, 15), type: "tax", gate: 4, icon: "↻", short: "PPh 25", title: "PPh 25 Corporate Tax Instalment", period: c, recurring: true,
      desc: "Monthly corporate income tax instalment. Amount = prior year SPT Tahunan ÷ 12. File and pay via CoreTax by 15th." });
    add({ id: `bpjsk-${yr}-${m}`, date: new Date(yr, m, 10), type: "bpjs", gate: 5, icon: "●", short: "BPJS-K", title: "BPJS Kesehatan Contributions", period: c, recurring: true,
      desc: "Pay health insurance contributions for all enrolled staff. Employer: 4%, Employee: 1% of capped salary. Via eDabu by the 10th." });
    add({ id: `bpjstk-${yr}-${m}`, date: new Date(yr, m, 10), type: "bpjs", gate: 5, icon: "●", short: "BPJamsostek", title: "BPJamsostek Contributions", period: c, recurring: true,
      desc: "Employment insurance (JHT, JKK, JKM, JP) for all staff. Employer: 6.24–7.74%. Via SIPP Online by the 10th." });
    add({ id: `banjar-${yr}-${m}`, date: new Date(yr, m, 1), type: "banjar", gate: 5, icon: "🏘", short: "Iuran Banjar", title: "Banjar Monthly Donation (Iuran)", period: c, recurring: true,
      desc: "Monthly iuran to local Banjar. Commercial villas: IDR 100,000–1,000,000 depending on location. Keep receipt." });
    add({ id: `apar-${yr}-${m}`, date: new Date(yr, m, 1), type: "safety", gate: 6, icon: "🧯", short: "APAR Check", title: "APAR Fire Extinguisher Monthly Inspection", period: c, recurring: true,
      desc: "Monthly physical check of all APAR units: pressure gauge in green, safety pin intact, nozzle clear." });
  }

  [[3, "Q1", `Q1 ${yr} (Jan–Mar)`], [6, "Q2", `Q2 ${yr} (Apr–Jun)`], [9, "Q3", `Q3 ${yr} (Jul–Sep)`]].forEach(([m, q, pr]) => {
    add({ id: `lkpm-${q}-${yr}`, date: new Date(yr, m as number, 10), type: "tax", gate: 0, icon: "↻", short: `LKPM ${q}`, title: `LKPM ${q} Investment Report`, period: pr as string, recurring: true,
      desc: "LKPM Investment Activity Report via OSS. Missed filing triggers NIB suspension warnings." });
  });

  add({ id: `lkpm-ann-${yr}`, date: new Date(yr + 1, 0, 10), type: "tax", gate: 0, icon: "↻", short: "LKPM Annual", title: "LKPM Annual Investment Report", period: `Full year ${yr}`, recurring: false,
    desc: `Annual LKPM Investment Report for ${yr} — replaces Q4. File via OSS by January 10 ${yr + 1}.` });

  [[1, 1], [4, 2], [7, 3], [10, 4]].forEach(([m, q]) => {
    add({ id: `pool-q${q}-${yr}`, date: new Date(yr, m, 15), type: "safety", gate: 6, icon: "🏊", short: "Pool Check", title: `Pool Chemical & Safety — Q${q}`, period: `Q${q} ${yr}`, recurring: true,
      desc: "Quarterly pool maintenance: pH 7.2–7.8, free chlorine 1–3 ppm. Safety: pool fence/gate latch, depth markers, life ring." });
    add({ id: `gr-q${q}-${yr}`, date: new Date(yr, m, 8), type: "banjar", gate: 5, icon: "🤝", short: "Gotong Royong", title: `Gotong Royong Community Day — Q${q}`, period: `Q${q} ${yr}`, recurring: true,
      desc: "Quarterly Banjar community cleanup and village maintenance. Send a staff member or contribute IDR 200,000–500,000." });
  });

  const annuals: Array<Omit<CalendarEvent, "daysUntil">> = [
    { id: `spt-${yr}`, date: new Date(yr, 3, 30), type: "tax", gate: 4, icon: "⬡", short: "SPT Tahunan", title: "SPT Tahunan — Annual Corporate Tax", period: `Fiscal ${yr - 1}/${yr}`, recurring: false,
      desc: "Annual PPh Badan return via CoreTax by April 30. Penalty: 2% per month of underpaid tax." },
    { id: `pbb-${yr}`, date: new Date(yr, 8, 30), type: "tax", gate: 4, icon: "⬡", short: "PBB Tax", title: "PBB — Land & Building Tax", period: `Annual ${yr}`, recurring: false,
      desc: "Annual PBB P2 due September 30. CRITICAL: must be assessed at COMMERCIAL rates, not residential." },
    { id: `skd-${yr}`, date: new Date(yr, 0, 15), type: "docs", gate: 0, icon: "□", short: "SKD Renewal", title: "Surat Keterangan Domisili (SKD) Renewal", period: `Annual ${yr}`, recurring: false,
      desc: "Annual renewal from Banjar Dinas/Kelurahan. Required for OSS, KITAS, NPWP address consistency." },
    { id: `nib-${yr}`, date: new Date(yr, 0, 5), type: "docs", gate: 2, icon: "✓", short: "NIB Status", title: "NIB Status Verification (OSS)", period: `Annual ${yr}`, recurring: false,
      desc: "Annual check that NIB remains 'Verified/Effective' on oss.go.id. OTAs cross-reference NIB." },
    { id: `damkar-${yr}`, date: new Date(yr, 1, 15), type: "safety", gate: 6, icon: "🔥", short: "DAMKAR Renewal", title: "Fire Safety Certificate Renewal (DAMKAR)", period: `Annual ${yr}`, recurring: false,
      desc: "Annual fire cert renewal. Schedule DAMKAR inspection 30+ days early. Expired cert = TDUP renewal blocked." },
    { id: `apar-svc-${yr}`, date: new Date(yr, 5, 1), type: "safety", gate: 6, icon: "🧯", short: "APAR Annual Service", title: "APAR Annual Professional Servicing", period: `Annual ${yr}`, recurring: false,
      desc: "Annual APAR service by certified provider: weigh + refill if <80%, internal inspection, new tamper seal." },
    { id: `elec-${yr}`, date: new Date(yr, 3, 1), type: "safety", gate: 6, icon: "⚡", short: "Electrical Inspection", title: "Annual Electrical Safety Inspection", period: `Annual ${yr}`, recurring: false,
      desc: "PLN-certified electrician: earthing/grounding, RCD/ELCB trip function, switchboard condition." },
    { id: `water-${yr}`, date: new Date(yr, 1, 1), type: "safety", gate: 6, icon: "💧", short: "Water Quality Test", title: "Pool & Drinking Water Quality Test", period: `Annual ${yr}`, recurring: false,
      desc: "Lab test: pool water (pH, chlorine, turbidity, coliforms) + drinking water supply. IDR 300,000–600,000." },
    { id: `ipal-${yr}`, date: new Date(yr, 7, 1), type: "safety", gate: 6, icon: "♻️", short: "IPAL Inspection", title: "Wastewater Treatment (IPAL) Annual Check", period: `Annual ${yr}`, recurring: false,
      desc: "Inspect IPAL: biodigester/septic tank function, soakpit condition, confirm zero discharge." },
    { id: `waste-${yr}`, date: new Date(yr, 0, 5), type: "safety", gate: 6, icon: "🗑️", short: "Waste Contract", title: "Commercial Waste Management Contract", period: `Annual ${yr}`, recurring: false,
      desc: "Renew licensed waste collection contract. Commercial properties cannot use residential pickup." },
    { id: `insure-${yr}`, date: new Date(yr, 0, 30), type: "docs", gate: 0, icon: "🛡️", short: "Insurance Renewal", title: "Commercial Property Insurance Renewal", period: `Annual ${yr}`, recurring: false,
      desc: "Renew commercial property insurance. Residential policies void if used for commercial rental." },
    { id: `passport-${yr}`, date: new Date(yr, 2, 1), type: "docs", gate: 0, icon: "🛂", short: "Passport Check", title: "Director Passport Validity Review", period: `Annual ${yr}`, recurring: false,
      desc: "Ensure all director/shareholder passports valid 12+ months. Expired = OSS access issues." },
    { id: `kitas-${yr}`, date: new Date(yr, 2, 1), type: "docs", gate: 5, icon: "🪪", short: "KITAS Renewal", title: "KITAS Investor Renewal (if applicable)", period: `Annual ${yr}`, recurring: false,
      desc: "Begin 60 days before expiry. Fee approx IDR 1.25M. Working without valid KITAS = deportation risk." },
    { id: `pbg-${yr}`, date: new Date(yr, 0, 20), type: "docs", gate: 3, icon: "⬡", short: "PBG Review", title: "PBG Building Permit Annual Review", period: `Annual ${yr}`, recurring: false,
      desc: "Any physical changes made without updating PBG? Unauthorised changes = SLF invalidity risk." },
    { id: `slf-${yr}`, date: new Date(yr, 5, 15), type: "docs", gate: 3, icon: "□", short: "SLF Renewal", title: "SLF Certificate — Begin Renewal (90-day lead)", period: `Annual ${yr}`, recurring: false,
      desc: "Begin SLF renewal 90 days before expiry. Expired SLF = TDUP not renewable = OTA listing at risk." },
    { id: `satpol-${yr}`, date: new Date(yr, 5, 1), type: "ops", gate: 7, icon: "👮", short: "Satpol PP Season", title: "Satpol PP Inspection Season (June–Aug)", period: yr.toString(), recurring: false,
      desc: "Peak enforcement season. Complete pre-inspection checklist by May." },
    { id: `apoa-${yr}`, date: new Date(yr, 0, 10), type: "ops", gate: 7, icon: "📋", short: "APOA Review", title: "APOA Guest Registration System Review", period: `Annual ${yr}`, recurring: false,
      desc: "Annual review of APOA compliance. Foreign guests staying 24h+ must be registered." },
    { id: `banjar-od-${yr}`, date: new Date(yr, 3, 15), type: "banjar", gate: 5, icon: "🛕", short: "Banjar Ceremony", title: "Banjar Annual Ceremony Contribution", period: `Annual ${yr}`, recurring: false,
      desc: "Annual contribution to major Banjar ceremony (Odalan/Melaspas). IDR 500,000–5,000,000+." },
    { id: `event-${yr}`, date: new Date(yr, 0, 20), type: "banjar", gate: 5, icon: "🎉", short: "Event Permits", title: "Villa Events — Banjar Permit Process", period: `Annual ${yr}`, recurring: false,
      desc: "For any villa events: prior Banjar + Kepala Desa approval required." },
    { id: `peak1-${yr}`, date: new Date(yr, 0, 1), type: "ops", gate: 7, icon: "📈", short: "Peak Jan–Feb", title: "Peak Season Compliance Check (Jan–Feb)", period: yr.toString(), recurring: false,
      desc: "Pre-peak checklist: all licences valid, APOA current, fire equipment checked, pool safety confirmed." },
    { id: `peak2-${yr}`, date: new Date(yr, 6, 1), type: "ops", gate: 7, icon: "📈", short: "Peak Jul–Aug", title: "Peak + Inspection Season (Jul–Aug)", period: yr.toString(), recurring: false,
      desc: "Second peak + Satpol PP primary enforcement. Complete self-audit by July 1." },
  ];
  annuals.forEach(a => add(a));

  if (yr === 2026) {
    add({ id: "ota-2026", date: new Date(2026, 2, 31), type: "ota", gate: 7, icon: "⬡", short: "OTA Deadline", title: "OTA Verification Deadline — Airbnb & Booking.com", period: "One-time 2026", recurring: false,
      desc: "All Bali villa OTA listings must submit verified compliance docs by March 31, 2026. Required: NIB Verified, TDUP cert, KBLI 55193." });
    add({ id: "thr-nf", date: new Date(2026, 2, 21), type: "bpjs", gate: 5, icon: "💰", short: "THR Nyepi", title: "THR Due — Hindu Staff (Nyepi)", period: "7 days before Nyepi Mar 28", recurring: false,
      desc: "One full month gross salary. ≥ 7 days before Nyepi. Staff <12 months: pro-rated." });
    add({ id: "thr-eid", date: new Date(2026, 2, 23), type: "bpjs", gate: 5, icon: "💰", short: "THR Eid", title: "THR Due — Muslim Staff (Eid al-Fitr)", period: "7 days before Eid ~Mar 30–31", recurring: false,
      desc: "One full month gross salary. Eid 2026 est. March 30–31. Pay by March 23." });
    add({ id: "thr-xm", date: new Date(2026, 11, 18), type: "bpjs", gate: 5, icon: "💰", short: "THR Christmas", title: "THR Due — Christian Staff (Christmas)", period: "7 days before Dec 25", recurring: false,
      desc: "One full month gross salary by December 18. Verify religion on employment contract." });
  }

  const holidays2026 = [
    { d: [2026, 0, 1], s: "New Year's Day", t: "New Year's Day", desc: "National holiday. Peak season arrival day." },
    { d: [2026, 0, 29], s: "Imlek", t: "Imlek — Chinese New Year", desc: "National holiday." },
    { d: [2026, 1, 11], s: "Galungan 🎋", t: "Galungan", desc: "Major Balinese Hindu ceremony. Most Balinese staff take 3–5 days." },
    { d: [2026, 1, 21], s: "Kuningan", t: "Kuningan", desc: "10 days after Galungan." },
    { d: [2026, 2, 28], s: "Nyepi 🔇", t: "Nyepi — Day of Silence ⚠️", desc: "⚠️ TOTAL ISLAND SHUTDOWN. No movement, light, noise. Airport closes 6am–6am." },
    { d: [2026, 2, 30], s: "Eid al-Fitr", t: "Eid al-Fitr", desc: "Muslim staff holiday. Ensure THR paid by March 23." },
    { d: [2026, 3, 3], s: "Good Friday", t: "Good Friday", desc: "National holiday." },
    { d: [2026, 4, 1], s: "Labour Day 🔧", t: "Labour Day", desc: "National holiday. Staff entitled to day off or overtime pay." },
    { d: [2026, 4, 14], s: "Ascension", t: "Ascension Day", desc: "National holiday." },
    { d: [2026, 5, 5], s: "Waisak", t: "Waisak — Buddha Day", desc: "National holiday." },
    { d: [2026, 5, 6], s: "Idul Adha", t: "Idul Adha", desc: "Muslim staff holiday." },
    { d: [2026, 7, 17], s: "Independence 🇮🇩", t: "Indonesian Independence Day", desc: "National holiday. Display Indonesian flag at gate." },
    { d: [2026, 8, 2], s: "Galungan ② 🎋", t: "Galungan — Cycle 2", desc: "Second Galungan of 2026." },
    { d: [2026, 8, 12], s: "Kuningan ②", t: "Kuningan — Cycle 2", desc: "10 days after second Galungan." },
    { d: [2026, 11, 25], s: "Christmas 🎄", t: "Christmas Day", desc: "National holiday. Peak season." },
  ];

  holidays2026
    .filter(h => h.d[0] === yr)
    .forEach(h => {
      const dt = new Date(h.d[0], h.d[1], h.d[2]);
      add({ id: `hol-${dt.toISOString().slice(0, 10)}`, date: dt, type: "ops", gate: 5, icon: "🌺", short: h.s, title: h.t, desc: h.desc, period: "", recurring: false });
    });

  return E;
}

export function expandCustomEvent(ce: CustomEvent, maxYear: number): CalendarEvent[] {
  if (ce.recurring === "none") {
    const d = new Date(ce.date);
    return [{
      id: ce.id, date: d, type: ce.type, gate: ce.gate, icon: "★",
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
      icon: "★", short: ce.title.slice(0, 16), title: ce.title, period: "",
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
  translations: Record<string, { name: string; description: string }> | null;
}

export interface StaffInput {
  id: string;
  name: string;
  kitasExpiry: string | null;
  isActive: boolean;
}

export interface PropertyInput {
  id: string;
  propertyName: string;
  landTitleType: string | null;
  landTitleExpiry: string | null;
}

export function mapVaultDocs(docs: VaultDocInput[], templates: VaultTemplateInput[], lang: string): CalendarEvent[] {
  const tmplMap = new Map(templates.map(t => [t.id, t]));
  const results: CalendarEvent[] = [];
  for (const doc of docs) {
    if (!doc.expiryDate) continue;
    if (doc.status !== "uploaded" && doc.status !== "expiring" && doc.status !== "expired") continue;
    const tmpl = tmplMap.get(doc.templateId);
    if (!tmpl) continue;
    const tr = tmpl.translations as Record<string, { name: string; description: string }> | null;
    const name = tr?.[lang]?.name || tr?.en?.name || "Document";
    const desc = tr?.[lang]?.description || tr?.en?.description || "";
    const d = new Date(doc.expiryDate);
    const du = daysUntil(d);
    results.push({
      id: `vault-${doc.id}`, date: d, type: "docs", gate: tmpl.gateNumber,
      icon: "□", short: name.slice(0, 16), title: name, period: "Expiry",
      desc: desc || `Document expires ${d.toLocaleDateString()}`,
      recurring: false, daysUntil: du,
    });
  }
  return results;
}

export function mapStaffKitas(staff: StaffInput[]): CalendarEvent[] {
  const results: CalendarEvent[] = [];
  for (const s of staff) {
    if (!s.kitasExpiry || !s.isActive) continue;
    const d = new Date(s.kitasExpiry);
    results.push({
      id: `kitas-${s.id}`, date: d, type: "docs", gate: 5,
      icon: "🪪", short: `KITAS ${s.name}`, title: `KITAS Expiry: ${s.name}`,
      period: "Expiry",
      desc: `KITAS/work permit for ${s.name} expires ${d.toLocaleDateString()}. Begin renewal 60 days early.`,
      recurring: false, daysUntil: daysUntil(d),
    });
  }
  return results;
}

export function mapPropertyHgb(properties: PropertyInput[]): CalendarEvent[] {
  const results: CalendarEvent[] = [];
  for (const p of properties) {
    if (p.landTitleType !== "hgb" || !p.landTitleExpiry) continue;
    const d = new Date(p.landTitleExpiry);
    results.push({
      id: `hgb-${p.id}`, date: d, type: "docs", gate: 0,
      icon: "⬡", short: "HGB Expiry", title: `HGB Land Title Expiry: ${p.propertyName}`,
      period: "Expiry",
      desc: `HGB land title for ${p.propertyName} expires ${d.toLocaleDateString()}. Begin renewal 2 years early.`,
      recurring: false, daysUntil: daysUntil(d),
    });
  }
  return results;
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
