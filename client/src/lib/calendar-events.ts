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

const LOCALE_MAP: Record<string, string> = { en: "en-GB", uk: "uk", id: "id" };

function prevMonthLabel(y: number, m: number, lang: string = "en"): string {
  const locale = LOCALE_MAP[lang] || "en-GB";
  return new Date(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, 1).toLocaleString(locale, { month: "long", year: "numeric" });
}

function curMonthLabel(y: number, m: number, lang: string = "en"): string {
  const locale = LOCALE_MAP[lang] || "en-GB";
  return new Date(y, m, 1).toLocaleString(locale, { month: "long", year: "numeric" });
}

const EVENT_I18N: Record<string, Record<string, { title: string; short: string; desc?: string }>> = {
  pb1: {
    uk: { title: "Готельний податок PB1 (SPTPD)", short: "Подат. PB1" },
    id: { title: "Pajak Hotel PB1 (SPTPD)", short: "Pajak PB1" },
  },
  pph21: {
    uk: { title: "Подача PPh 21 податку на зарплату", short: "PPh 21" },
    id: { title: "Pelaporan PPh 21 Pajak Gaji", short: "PPh 21" },
  },
  pph25: {
    uk: { title: "Авансовий внесок PPh 25", short: "PPh 25" },
    id: { title: "Angsuran PPh 25 Pajak Badan", short: "PPh 25" },
  },
  bpjsk: {
    uk: { title: "Внески BPJS Kesehatan", short: "BPJS-K" },
    id: { title: "Kontribusi BPJS Kesehatan", short: "BPJS-K" },
  },
  bpjstk: {
    uk: { title: "Внески BPJamsostek", short: "BPJamsostek" },
    id: { title: "Kontribusi BPJamsostek", short: "BPJamsostek" },
  },
  banjar: {
    uk: { title: "Щомісячний внесок Banjar (Iuran)", short: "Iuran Banjar" },
    id: { title: "Iuran Bulanan Banjar", short: "Iuran Banjar" },
  },
  apar: {
    uk: { title: "Щомісячна перевірка вогнегасників APAR", short: "Перев. APAR" },
    id: { title: "Inspeksi Bulanan APAR", short: "Cek APAR" },
  },
  lkpm: {
    uk: { title: "Звіт LKPM {{q}} про інвестиції", short: "LKPM {{q}}" },
    id: { title: "Laporan Investasi LKPM {{q}}", short: "LKPM {{q}}" },
  },
  pool: {
    uk: { title: "Хімічна та безпека басейну — {{q}}", short: "Перев. басейну" },
    id: { title: "Kimia & Keselamatan Kolam — {{q}}", short: "Cek Kolam" },
  },
  gr: {
    uk: { title: "Gotong Royong день громади — {{q}}", short: "Gotong Royong" },
    id: { title: "Gotong Royong Hari Komunitas — {{q}}", short: "Gotong Royong" },
  },
  spt: {
    uk: { title: "SPT Tahunan — річний корпоративний податок", short: "SPT Tahunan" },
    id: { title: "SPT Tahunan — Pajak Badan Tahunan", short: "SPT Tahunan" },
  },
  pbb: {
    uk: { title: "PBB — Податок на землю та будівлі", short: "Подат. PBB" },
    id: { title: "PBB — Pajak Bumi dan Bangunan", short: "Pajak PBB" },
  },
  skd: {
    uk: { title: "Поновлення SKD", short: "Понов. SKD" },
    id: { title: "Pembaruan SKD", short: "Perbarui SKD" },
  },
  nib: {
    uk: { title: "Верифікація статусу NIB (OSS)", short: "Статус NIB" },
    id: { title: "Verifikasi Status NIB (OSS)", short: "Status NIB" },
  },
  damkar: {
    uk: { title: "Поновлення пожежного сертифікату (DAMKAR)", short: "Понов. DAMKAR" },
    id: { title: "Pembaruan Sertifikat DAMKAR", short: "Perbarui DAMKAR" },
  },
  "apar-svc": {
    uk: { title: "Щорічне обслуговування APAR", short: "Серв. APAR" },
    id: { title: "Servis Tahunan APAR", short: "Servis APAR" },
  },
  elec: {
    uk: { title: "Щорічна електроперевірка", short: "Електроперев." },
    id: { title: "Inspeksi Kelistrikan Tahunan", short: "Inspeksi Listrik" },
  },
  water: {
    uk: { title: "Перевірка якості води", short: "Якість води" },
    id: { title: "Uji Kualitas Air", short: "Kualitas Air" },
  },
  ipal: {
    uk: { title: "Щорічна перевірка IPAL", short: "Перев. IPAL" },
    id: { title: "Pemeriksaan Tahunan IPAL", short: "Cek IPAL" },
  },
  waste: {
    uk: { title: "Договір вивозу відходів", short: "Відходи" },
    id: { title: "Kontrak Pengelolaan Sampah", short: "Sampah" },
  },
  insure: {
    uk: { title: "Поновлення страхування майна", short: "Страхування" },
    id: { title: "Pembaruan Asuransi Properti", short: "Asuransi" },
  },
  passport: {
    uk: { title: "Перевірка паспорту директора", short: "Паспорт" },
    id: { title: "Pemeriksaan Paspor Direktur", short: "Paspor" },
  },
  kitas: {
    uk: { title: "Поновлення KITAS інвестора", short: "Понов. KITAS" },
    id: { title: "Pembaruan KITAS Investor", short: "Perbarui KITAS" },
  },
  pbg: {
    uk: { title: "Щорічний перегляд PBG", short: "Перегляд PBG" },
    id: { title: "Tinjauan Tahunan PBG", short: "Tinjauan PBG" },
  },
  slf: {
    uk: { title: "Сертифікат SLF — початок поновлення", short: "Понов. SLF" },
    id: { title: "Sertifikat SLF — Mulai Pembaruan", short: "Perbarui SLF" },
  },
  satpol: {
    uk: { title: "Сезон інспекцій Satpol PP (черв.–серп.)", short: "Satpol PP" },
    id: { title: "Musim Inspeksi Satpol PP (Jun–Agt)", short: "Satpol PP" },
  },
  apoa: {
    uk: { title: "Перегляд системи APOA", short: "Перегляд APOA" },
    id: { title: "Tinjauan Sistem APOA", short: "Tinjauan APOA" },
  },
  "banjar-od": {
    uk: { title: "Щорічний внесок на церемонію Banjar", short: "Церемонія Banjar" },
    id: { title: "Kontribusi Upacara Tahunan Banjar", short: "Upacara Banjar" },
  },
  event: {
    uk: { title: "Заходи на віллі — дозвіл Banjar", short: "Дозволи заходів" },
    id: { title: "Acara Villa — Proses Izin Banjar", short: "Izin Acara" },
  },
  peak1: {
    uk: { title: "Перевірка в пік сезону (січ.–лют.)", short: "Пік січ.–лют." },
    id: { title: "Pemeriksaan Kepatuhan Musim Puncak (Jan–Feb)", short: "Puncak Jan–Feb" },
  },
  peak2: {
    uk: { title: "Пік + сезон інспекцій (лип.–серп.)", short: "Пік лип.–серп." },
    id: { title: "Puncak + Musim Inspeksi (Jul–Agt)", short: "Puncak Jul–Agt" },
  },
  "lkpm-ann": {
    uk: { title: "Щорічний інвестиційний звіт LKPM", short: "LKPM Щоріч." },
    id: { title: "Laporan Investasi Tahunan LKPM", short: "LKPM Tahunan" },
  },
  ota: {
    uk: { title: "Дедлайн верифікації OTA — Airbnb & Booking.com", short: "Дедлайн OTA" },
    id: { title: "Tenggat Verifikasi OTA — Airbnb & Booking.com", short: "Tenggat OTA" },
  },
  "thr-nf": {
    uk: { title: "THR — індуїстський персонал (Nyepi)", short: "THR Nyepi" },
    id: { title: "THR — Staf Hindu (Nyepi)", short: "THR Nyepi" },
  },
  "thr-eid": {
    uk: { title: "THR — мусульманський персонал (Eid al-Fitr)", short: "THR Eid" },
    id: { title: "THR — Staf Muslim (Idul Fitri)", short: "THR Idul Fitri" },
  },
  "thr-xm": {
    uk: { title: "THR — християнський персонал (Різдво)", short: "THR Різдво" },
    id: { title: "THR — Staf Kristen (Natal)", short: "THR Natal" },
  },
};

const HOLIDAY_I18N: Record<string, Record<string, { title: string; short: string }>> = {
  "New Year's Day": {
    uk: { title: "Новий рік", short: "Новий рік" },
    id: { title: "Tahun Baru", short: "Tahun Baru" },
  },
  "Imlek — Chinese New Year": {
    uk: { title: "Імлек — Китайський Новий рік", short: "Імлек" },
    id: { title: "Imlek — Tahun Baru Cina", short: "Imlek" },
  },
  "Galungan": {
    uk: { title: "Galungan", short: "Galungan" },
    id: { title: "Galungan", short: "Galungan" },
  },
  "Kuningan": {
    uk: { title: "Kuningan", short: "Kuningan" },
    id: { title: "Kuningan", short: "Kuningan" },
  },
  "Nyepi — Day of Silence ⚠️": {
    uk: { title: "Nyepi — День тиші", short: "Nyepi" },
    id: { title: "Nyepi — Hari Raya Nyepi", short: "Nyepi" },
  },
  "Eid al-Fitr": {
    uk: { title: "Eid al-Fitr", short: "Eid al-Fitr" },
    id: { title: "Idul Fitri", short: "Idul Fitri" },
  },
  "Good Friday": {
    uk: { title: "Страсна п'ятниця", short: "Страсна п'ятниця" },
    id: { title: "Jumat Agung", short: "Jumat Agung" },
  },
  "Labour Day": {
    uk: { title: "День праці", short: "День праці" },
    id: { title: "Hari Buruh", short: "Hari Buruh" },
  },
  "Ascension Day": {
    uk: { title: "Вознесіння", short: "Вознесіння" },
    id: { title: "Kenaikan Isa Almasih", short: "Kenaikan Isa" },
  },
  "Waisak — Buddha Day": {
    uk: { title: "Waisak — День Будди", short: "Waisak" },
    id: { title: "Waisak — Hari Raya Waisak", short: "Waisak" },
  },
  "Idul Adha": {
    uk: { title: "Idul Adha", short: "Idul Adha" },
    id: { title: "Idul Adha", short: "Idul Adha" },
  },
  "Indonesian Independence Day": {
    uk: { title: "День незалежності Індонезії", short: "Незалежність" },
    id: { title: "Hari Kemerdekaan Indonesia", short: "Kemerdekaan" },
  },
  "Galungan — Cycle 2": {
    uk: { title: "Galungan — Цикл 2", short: "Galungan 2" },
    id: { title: "Galungan — Siklus 2", short: "Galungan 2" },
  },
  "Kuningan — Cycle 2": {
    uk: { title: "Kuningan — Цикл 2", short: "Kuningan 2" },
    id: { title: "Kuningan — Siklus 2", short: "Kuningan 2" },
  },
  "Christmas Day": {
    uk: { title: "Різдво", short: "Різдво" },
    id: { title: "Hari Natal", short: "Natal" },
  },
};

const PERIOD_I18N: Record<string, Record<string, string>> = {
  period: { uk: "період", id: "periode" },
  "Full year": { uk: "Повний рік", id: "Tahun penuh" },
  Annual: { uk: "Щорічний", id: "Tahunan" },
  Fiscal: { uk: "Фіскальний", id: "Fiskal" },
  "One-time 2026": { uk: "Одноразово 2026", id: "Satu kali 2026" },
  "7 days before Nyepi Mar 28": { uk: "7 днів до Nyepi 28 бер.", id: "7 hari sebelum Nyepi 28 Mar" },
  "7 days before Eid ~Mar 30–31": { uk: "7 днів до Eid ~30–31 бер.", id: "7 hari sebelum Idul Fitri ~30–31 Mar" },
  "7 days before Dec 25": { uk: "7 днів до 25 грудня", id: "7 hari sebelum 25 Des" },
  Expiry: { uk: "Закінчення", id: "Kedaluwarsa" },
};

const MISC_I18N: Record<string, Record<string, string>> = {
  Document: { uk: "Документ", id: "Dokumen" },
  "Document expires": { uk: "Документ закінчується", id: "Dokumen kedaluwarsa" },
  "HGB Expiry": { uk: "Закінч. HGB", id: "HGB Kedaluwarsa" },
};

function tr(key: string, lang: string, fallback: string, replacements?: Record<string, string>): string {
  if (lang === "en") return fallback;
  const entry = EVENT_I18N[key]?.[lang];
  if (!entry) return fallback;
  let val = entry.title || fallback;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      val = val.replace(`{{${k}}}`, v);
    }
  }
  return val;
}

function trTitle(key: string, lang: string, fallback: string, replacements?: Record<string, string>): string {
  if (lang === "en") return fallback;
  let val = EVENT_I18N[key]?.[lang]?.title;
  if (!val) return fallback;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      val = val.replace(`{{${k}}}`, v);
    }
  }
  return val;
}

function trShort(key: string, lang: string, fallback: string, replacements?: Record<string, string>): string {
  if (lang === "en") return fallback;
  let val = EVENT_I18N[key]?.[lang]?.short;
  if (!val) return fallback;
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      val = val.replace(`{{${k}}}`, v);
    }
  }
  return val;
}

function trPeriod(key: string, lang: string, fallback: string): string {
  if (lang === "en") return fallback;
  return PERIOD_I18N[key]?.[lang] || fallback;
}

function trMisc(key: string, lang: string): string {
  return MISC_I18N[key]?.[lang] || key;
}

function trHolidayTitle(enTitle: string, lang: string): string {
  if (lang === "en") return enTitle;
  return HOLIDAY_I18N[enTitle]?.[lang]?.title || enTitle;
}

function trHolidayShort(enTitle: string, enShort: string, lang: string): string {
  if (lang === "en") return enShort;
  return HOLIDAY_I18N[enTitle]?.[lang]?.short || enShort;
}

export function generateEvents(yr: number, lang: string = "en"): CalendarEvent[] {
  const E: CalendarEvent[] = [];
  const add = (o: Omit<CalendarEvent, "daysUntil">) =>
    E.push({ ...o, daysUntil: daysUntil(o.date) });

  for (let m = 0; m < 12; m++) {
    const p = prevMonthLabel(yr, m, lang);
    const c = curMonthLabel(yr, m, lang);
    const periodWord = trPeriod("period", lang, "period");

    add({ id: `pb1-${yr}-${m}`, date: new Date(yr, m, 20), type: "tax", gate: 4, icon: "↻",
      short: trShort("pb1", lang, "PB1 Tax"),
      title: trTitle("pb1", lang, "PB1 Hotel Tax (SPTPD)"),
      period: `${p} ${periodWord}`, recurring: true,
      desc: "File and pay 10% hotel tax on prior month room revenue via e-Palapa / local Bapenda portal. Late filing = penalties from day 1." });
    add({ id: `pph21-${yr}-${m}`, date: new Date(yr, m, 20), type: "tax", gate: 4, icon: "↻",
      short: trShort("pph21", lang, "PPh 21"),
      title: trTitle("pph21", lang, "PPh 21 Payroll Tax Filing"),
      period: `${p} ${periodWord}`, recurring: true,
      desc: "File employee income tax withholding for prior month via CoreTax. Calculate per employee salary bracket." });
    add({ id: `pph25-${yr}-${m}`, date: new Date(yr, m, 15), type: "tax", gate: 4, icon: "↻",
      short: trShort("pph25", lang, "PPh 25"),
      title: trTitle("pph25", lang, "PPh 25 Corporate Tax Instalment"),
      period: c, recurring: true,
      desc: "Monthly corporate income tax instalment. Amount = prior year SPT Tahunan ÷ 12. File and pay via CoreTax by 15th." });
    add({ id: `bpjsk-${yr}-${m}`, date: new Date(yr, m, 10), type: "bpjs", gate: 5, icon: "●",
      short: trShort("bpjsk", lang, "BPJS-K"),
      title: trTitle("bpjsk", lang, "BPJS Kesehatan Contributions"),
      period: c, recurring: true,
      desc: "Pay health insurance contributions for all enrolled staff. Employer: 4%, Employee: 1% of capped salary. Via eDabu by the 10th." });
    add({ id: `bpjstk-${yr}-${m}`, date: new Date(yr, m, 10), type: "bpjs", gate: 5, icon: "●",
      short: trShort("bpjstk", lang, "BPJamsostek"),
      title: trTitle("bpjstk", lang, "BPJamsostek Contributions"),
      period: c, recurring: true,
      desc: "Employment insurance (JHT, JKK, JKM, JP) for all staff. Employer: 6.24–7.74%. Via SIPP Online by the 10th." });
    add({ id: `banjar-${yr}-${m}`, date: new Date(yr, m, 1), type: "banjar", gate: 5, icon: "🏘",
      short: trShort("banjar", lang, "Iuran Banjar"),
      title: trTitle("banjar", lang, "Banjar Monthly Donation (Iuran)"),
      period: c, recurring: true,
      desc: "Monthly iuran to local Banjar. Commercial villas: IDR 100,000–1,000,000 depending on location. Keep receipt." });
    add({ id: `apar-${yr}-${m}`, date: new Date(yr, m, 1), type: "safety", gate: 6, icon: "🧯",
      short: trShort("apar", lang, "APAR Check"),
      title: trTitle("apar", lang, "APAR Fire Extinguisher Monthly Inspection"),
      period: c, recurring: true,
      desc: "Monthly physical check of all APAR units: pressure gauge in green, safety pin intact, nozzle clear." });
  }

  [[3, "Q1", `Q1 ${yr} (Jan–Mar)`], [6, "Q2", `Q2 ${yr} (Apr–Jun)`], [9, "Q3", `Q3 ${yr} (Jul–Sep)`]].forEach(([m, q, pr]) => {
    add({ id: `lkpm-${q}-${yr}`, date: new Date(yr, m as number, 10), type: "tax", gate: 0, icon: "↻",
      short: trShort("lkpm", lang, `LKPM ${q}`, { q: q as string }),
      title: trTitle("lkpm", lang, `LKPM ${q} Investment Report`, { q: q as string }),
      period: pr as string, recurring: true,
      desc: "LKPM Investment Activity Report via OSS. Missed filing triggers NIB suspension warnings." });
  });

  const fullYearLabel = `${trPeriod("Full year", lang, "Full year")} ${yr}`;
  add({ id: `lkpm-ann-${yr}`, date: new Date(yr + 1, 0, 10), type: "tax", gate: 0, icon: "↻",
    short: trShort("lkpm-ann", lang, "LKPM Annual"),
    title: trTitle("lkpm-ann", lang, "LKPM Annual Investment Report"),
    period: fullYearLabel, recurring: false,
    desc: `Annual LKPM Investment Report for ${yr} — replaces Q4. File via OSS by January 10 ${yr + 1}.` });

  [[1, 1], [4, 2], [7, 3], [10, 4]].forEach(([m, q]) => {
    const qLabel = `Q${q}`;
    add({ id: `pool-q${q}-${yr}`, date: new Date(yr, m, 15), type: "safety", gate: 6, icon: "🏊",
      short: trShort("pool", lang, "Pool Check"),
      title: trTitle("pool", lang, `Pool Chemical & Safety — Q${q}`, { q: qLabel }),
      period: `Q${q} ${yr}`, recurring: true,
      desc: "Quarterly pool maintenance: pH 7.2–7.8, free chlorine 1–3 ppm. Safety: pool fence/gate latch, depth markers, life ring." });
    add({ id: `gr-q${q}-${yr}`, date: new Date(yr, m, 8), type: "banjar", gate: 5, icon: "🤝",
      short: trShort("gr", lang, "Gotong Royong"),
      title: trTitle("gr", lang, `Gotong Royong Community Day — Q${q}`, { q: qLabel }),
      period: `Q${q} ${yr}`, recurring: true,
      desc: "Quarterly Banjar community cleanup and village maintenance. Send a staff member or contribute IDR 200,000–500,000." });
  });

  const annualLabel = trPeriod("Annual", lang, "Annual");
  const fiscalLabel = trPeriod("Fiscal", lang, "Fiscal");

  const annuals: Array<Omit<CalendarEvent, "daysUntil">> = [
    { id: `spt-${yr}`, date: new Date(yr, 3, 30), type: "tax", gate: 4, icon: "⬡",
      short: trShort("spt", lang, "SPT Tahunan"),
      title: trTitle("spt", lang, "SPT Tahunan — Annual Corporate Tax"),
      period: `${fiscalLabel} ${yr - 1}/${yr}`, recurring: false,
      desc: "Annual PPh Badan return via CoreTax by April 30. Penalty: 2% per month of underpaid tax." },
    { id: `pbb-${yr}`, date: new Date(yr, 8, 30), type: "tax", gate: 4, icon: "⬡",
      short: trShort("pbb", lang, "PBB Tax"),
      title: trTitle("pbb", lang, "PBB — Land & Building Tax"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Annual PBB P2 due September 30. CRITICAL: must be assessed at COMMERCIAL rates, not residential." },
    { id: `skd-${yr}`, date: new Date(yr, 0, 15), type: "docs", gate: 0, icon: "□",
      short: trShort("skd", lang, "SKD Renewal"),
      title: trTitle("skd", lang, "Surat Keterangan Domisili (SKD) Renewal"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Annual renewal from Banjar Dinas/Kelurahan. Required for OSS, KITAS, NPWP address consistency." },
    { id: `nib-${yr}`, date: new Date(yr, 0, 5), type: "docs", gate: 2, icon: "✓",
      short: trShort("nib", lang, "NIB Status"),
      title: trTitle("nib", lang, "NIB Status Verification (OSS)"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Annual check that NIB remains 'Verified/Effective' on oss.go.id. OTAs cross-reference NIB." },
    { id: `damkar-${yr}`, date: new Date(yr, 1, 15), type: "safety", gate: 6, icon: "🔥",
      short: trShort("damkar", lang, "DAMKAR Renewal"),
      title: trTitle("damkar", lang, "Fire Safety Certificate Renewal (DAMKAR)"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Annual fire cert renewal. Schedule DAMKAR inspection 30+ days early. Expired cert = TDUP renewal blocked." },
    { id: `apar-svc-${yr}`, date: new Date(yr, 5, 1), type: "safety", gate: 6, icon: "🧯",
      short: trShort("apar-svc", lang, "APAR Annual Service"),
      title: trTitle("apar-svc", lang, "APAR Annual Professional Servicing"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Annual APAR service by certified provider: weigh + refill if <80%, internal inspection, new tamper seal." },
    { id: `elec-${yr}`, date: new Date(yr, 3, 1), type: "safety", gate: 6, icon: "⚡",
      short: trShort("elec", lang, "Electrical Inspection"),
      title: trTitle("elec", lang, "Annual Electrical Safety Inspection"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "PLN-certified electrician: earthing/grounding, RCD/ELCB trip function, switchboard condition." },
    { id: `water-${yr}`, date: new Date(yr, 1, 1), type: "safety", gate: 6, icon: "💧",
      short: trShort("water", lang, "Water Quality Test"),
      title: trTitle("water", lang, "Pool & Drinking Water Quality Test"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Lab test: pool water (pH, chlorine, turbidity, coliforms) + drinking water supply. IDR 300,000–600,000." },
    { id: `ipal-${yr}`, date: new Date(yr, 7, 1), type: "safety", gate: 6, icon: "♻️",
      short: trShort("ipal", lang, "IPAL Inspection"),
      title: trTitle("ipal", lang, "Wastewater Treatment (IPAL) Annual Check"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Inspect IPAL: biodigester/septic tank function, soakpit condition, confirm zero discharge." },
    { id: `waste-${yr}`, date: new Date(yr, 0, 5), type: "safety", gate: 6, icon: "🗑️",
      short: trShort("waste", lang, "Waste Contract"),
      title: trTitle("waste", lang, "Commercial Waste Management Contract"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Renew licensed waste collection contract. Commercial properties cannot use residential pickup." },
    { id: `insure-${yr}`, date: new Date(yr, 0, 30), type: "docs", gate: 0, icon: "🛡️",
      short: trShort("insure", lang, "Insurance Renewal"),
      title: trTitle("insure", lang, "Commercial Property Insurance Renewal"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Renew commercial property insurance. Residential policies void if used for commercial rental." },
    { id: `passport-${yr}`, date: new Date(yr, 2, 1), type: "docs", gate: 0, icon: "🛂",
      short: trShort("passport", lang, "Passport Check"),
      title: trTitle("passport", lang, "Director Passport Validity Review"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Ensure all director/shareholder passports valid 12+ months. Expired = OSS access issues." },
    { id: `kitas-${yr}`, date: new Date(yr, 2, 1), type: "docs", gate: 5, icon: "🪪",
      short: trShort("kitas", lang, "KITAS Renewal"),
      title: trTitle("kitas", lang, "KITAS Investor Renewal (if applicable)"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Begin 60 days before expiry. Fee approx IDR 1.25M. Working without valid KITAS = deportation risk." },
    { id: `pbg-${yr}`, date: new Date(yr, 0, 20), type: "docs", gate: 3, icon: "⬡",
      short: trShort("pbg", lang, "PBG Review"),
      title: trTitle("pbg", lang, "PBG Building Permit Annual Review"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Any physical changes made without updating PBG? Unauthorised changes = SLF invalidity risk." },
    { id: `slf-${yr}`, date: new Date(yr, 5, 15), type: "docs", gate: 3, icon: "□",
      short: trShort("slf", lang, "SLF Renewal"),
      title: trTitle("slf", lang, "SLF Certificate — Begin Renewal (90-day lead)"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Begin SLF renewal 90 days before expiry. Expired SLF = TDUP not renewable = OTA listing at risk." },
    { id: `satpol-${yr}`, date: new Date(yr, 5, 1), type: "ops", gate: 7, icon: "👮",
      short: trShort("satpol", lang, "Satpol PP Season"),
      title: trTitle("satpol", lang, "Satpol PP Inspection Season (June–Aug)"),
      period: yr.toString(), recurring: false,
      desc: "Peak enforcement season. Complete pre-inspection checklist by May." },
    { id: `apoa-${yr}`, date: new Date(yr, 0, 10), type: "ops", gate: 7, icon: "📋",
      short: trShort("apoa", lang, "APOA Review"),
      title: trTitle("apoa", lang, "APOA Guest Registration System Review"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Annual review of APOA compliance. Foreign guests staying 24h+ must be registered." },
    { id: `banjar-od-${yr}`, date: new Date(yr, 3, 15), type: "banjar", gate: 5, icon: "🛕",
      short: trShort("banjar-od", lang, "Banjar Ceremony"),
      title: trTitle("banjar-od", lang, "Banjar Annual Ceremony Contribution"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "Annual contribution to major Banjar ceremony (Odalan/Melaspas). IDR 500,000–5,000,000+." },
    { id: `event-${yr}`, date: new Date(yr, 0, 20), type: "banjar", gate: 5, icon: "🎉",
      short: trShort("event", lang, "Event Permits"),
      title: trTitle("event", lang, "Villa Events — Banjar Permit Process"),
      period: `${annualLabel} ${yr}`, recurring: false,
      desc: "For any villa events: prior Banjar + Kepala Desa approval required." },
    { id: `peak1-${yr}`, date: new Date(yr, 0, 1), type: "ops", gate: 7, icon: "📈",
      short: trShort("peak1", lang, "Peak Jan–Feb"),
      title: trTitle("peak1", lang, "Peak Season Compliance Check (Jan–Feb)"),
      period: yr.toString(), recurring: false,
      desc: "Pre-peak checklist: all licences valid, APOA current, fire equipment checked, pool safety confirmed." },
    { id: `peak2-${yr}`, date: new Date(yr, 6, 1), type: "ops", gate: 7, icon: "📈",
      short: trShort("peak2", lang, "Peak Jul–Aug"),
      title: trTitle("peak2", lang, "Peak + Inspection Season (Jul–Aug)"),
      period: yr.toString(), recurring: false,
      desc: "Second peak + Satpol PP primary enforcement. Complete self-audit by July 1." },
  ];
  annuals.forEach(a => add(a));

  if (yr === 2026) {
    add({ id: "ota-2026", date: new Date(2026, 2, 31), type: "ota", gate: 7, icon: "⬡",
      short: trShort("ota", lang, "OTA Deadline"),
      title: trTitle("ota", lang, "OTA Verification Deadline — Airbnb & Booking.com"),
      period: trPeriod("One-time 2026", lang, "One-time 2026"), recurring: false,
      desc: "All Bali villa OTA listings must submit verified compliance docs by March 31, 2026. Required: NIB Verified, TDUP cert, KBLI 55193." });
    add({ id: "thr-nf", date: new Date(2026, 2, 21), type: "bpjs", gate: 5, icon: "💰",
      short: trShort("thr-nf", lang, "THR Nyepi"),
      title: trTitle("thr-nf", lang, "THR Due — Hindu Staff (Nyepi)"),
      period: trPeriod("7 days before Nyepi Mar 28", lang, "7 days before Nyepi Mar 28"), recurring: false,
      desc: "One full month gross salary. ≥ 7 days before Nyepi. Staff <12 months: pro-rated." });
    add({ id: "thr-eid", date: new Date(2026, 2, 23), type: "bpjs", gate: 5, icon: "💰",
      short: trShort("thr-eid", lang, "THR Eid"),
      title: trTitle("thr-eid", lang, "THR Due — Muslim Staff (Eid al-Fitr)"),
      period: trPeriod("7 days before Eid ~Mar 30–31", lang, "7 days before Eid ~Mar 30–31"), recurring: false,
      desc: "One full month gross salary. Eid 2026 est. March 30–31. Pay by March 23." });
    add({ id: "thr-xm", date: new Date(2026, 11, 18), type: "bpjs", gate: 5, icon: "💰",
      short: trShort("thr-xm", lang, "THR Christmas"),
      title: trTitle("thr-xm", lang, "THR Due — Christian Staff (Christmas)"),
      period: trPeriod("7 days before Dec 25", lang, "7 days before Dec 25"), recurring: false,
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
      add({
        id: `hol-${dt.toISOString().slice(0, 10)}`, date: dt, type: "ops", gate: 5, icon: "🌺",
        short: trHolidayShort(h.t, h.s, lang),
        title: trHolidayTitle(h.t, lang),
        desc: h.desc, period: "", recurring: false,
      });
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
  const expiryLabel = trPeriod("Expiry", lang, "Expiry");
  const docFallback = lang === "uk" ? "Документ" : lang === "id" ? "Dokumen" : "Document";
  const docExpiresPrefix = lang === "uk" ? "Документ закінчується" : lang === "id" ? "Dokumen kedaluwarsa" : "Document expires";
  for (const doc of docs) {
    if (!doc.expiryDate) continue;
    if (doc.status !== "uploaded" && doc.status !== "expiring" && doc.status !== "expired") continue;
    const tmpl = tmplMap.get(doc.templateId);
    if (!tmpl) continue;
    const tr = tmpl.translations as Record<string, { name: string; description: string }> | null;
    const name = tr?.[lang]?.name || tr?.en?.name || docFallback;
    const desc = tr?.[lang]?.description || tr?.en?.description || "";
    const d = new Date(doc.expiryDate);
    const du = daysUntil(d);
    results.push({
      id: `vault-${doc.id}`, date: d, type: "docs", gate: tmpl.gateNumber,
      icon: "□", short: name.slice(0, 16), title: name, period: expiryLabel,
      desc: desc || `${docExpiresPrefix} ${d.toLocaleDateString()}`,
      recurring: false, daysUntil: du,
    });
  }
  return results;
}

export function mapStaffKitas(staff: StaffInput[], lang: string = "en"): CalendarEvent[] {
  const results: CalendarEvent[] = [];
  const expiryLabel = trPeriod("Expiry", lang, "Expiry");
  for (const s of staff) {
    if (!s.kitasExpiry || !s.isActive) continue;
    const d = new Date(s.kitasExpiry);
    const titleStr = lang === "uk" ? `Закінчення KITAS: ${s.name}` : lang === "id" ? `KITAS Kedaluwarsa: ${s.name}` : `KITAS Expiry: ${s.name}`;
    const descStr = lang === "uk"
      ? `KITAS/дозвіл на роботу для ${s.name} закінчується ${d.toLocaleDateString()}. Почніть поновлення за 60 днів.`
      : lang === "id"
        ? `KITAS/izin kerja untuk ${s.name} kedaluwarsa ${d.toLocaleDateString()}. Mulai pembaruan 60 hari sebelumnya.`
        : `KITAS/work permit for ${s.name} expires ${d.toLocaleDateString()}. Begin renewal 60 days early.`;
    results.push({
      id: `kitas-${s.id}`, date: d, type: "docs", gate: 5,
      icon: "🪪", short: `KITAS ${s.name}`, title: titleStr,
      period: expiryLabel,
      desc: descStr,
      recurring: false, daysUntil: daysUntil(d),
    });
  }
  return results;
}

export function mapPropertyHgb(properties: PropertyInput[], lang: string = "en"): CalendarEvent[] {
  const results: CalendarEvent[] = [];
  const expiryLabel = trPeriod("Expiry", lang, "Expiry");
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
      icon: "⬡", short: shortLabel, title: titleStr,
      period: expiryLabel,
      desc: descStr,
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
