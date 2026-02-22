import { db } from "./db";
import { calendarEventTemplates } from "@shared/schema";
import { sql } from "drizzle-orm";

interface TemplateSeed {
  eventKey: string;
  frequency: string;
  dueDay: number;
  dueMonth?: number;
  quarterMonths?: number[];
  quarterLabels?: string[];
  type: string;
  gate: number;
  icon: string;
  titleEn: string;
  titleUk?: string;
  titleId?: string;
  shortEn: string;
  shortUk?: string;
  shortId?: string;
  descEn: string;
  descUk?: string;
  descId?: string;
  periodTemplate: string;
  isActive: boolean;
  yearSpecific?: number;
  isRecurring: boolean;
  sortOrder: number;
}

const MONTHLY_EVENTS: TemplateSeed[] = [
  {
    eventKey: "pb1", frequency: "monthly", dueDay: 20, type: "tax", gate: 4, icon: "cycle",
    titleEn: "PB1 Hotel Tax (SPTPD)", titleUk: "Готельний податок PB1 (SPTPD)", titleId: "Pajak Hotel PB1 (SPTPD)",
    shortEn: "PB1 Tax", shortUk: "Подат. PB1", shortId: "Pajak PB1",
    descEn: "File and pay 10% hotel tax on prior month room revenue via e-Palapa / local Bapenda portal. Late filing = penalties from day 1.",
    periodTemplate: "prev_month", isActive: true, isRecurring: true, sortOrder: 10,
  },
  {
    eventKey: "pph21", frequency: "monthly", dueDay: 20, type: "tax", gate: 4, icon: "cycle",
    titleEn: "PPh 21 Payroll Tax Filing", titleUk: "Подача PPh 21 податку на зарплату", titleId: "Pelaporan PPh 21 Pajak Gaji",
    shortEn: "PPh 21", shortUk: "PPh 21", shortId: "PPh 21",
    descEn: "File employee income tax withholding for prior month via CoreTax. Calculate per employee salary bracket.",
    periodTemplate: "prev_month", isActive: true, isRecurring: true, sortOrder: 11,
  },
  {
    eventKey: "pph25", frequency: "monthly", dueDay: 15, type: "tax", gate: 4, icon: "cycle",
    titleEn: "PPh 25 Corporate Tax Instalment", titleUk: "Авансовий внесок PPh 25", titleId: "Angsuran PPh 25 Pajak Badan",
    shortEn: "PPh 25", shortUk: "PPh 25", shortId: "PPh 25",
    descEn: "Monthly corporate income tax instalment. Amount = prior year SPT Tahunan ÷ 12. File and pay via CoreTax by 15th.",
    periodTemplate: "cur_month", isActive: true, isRecurring: true, sortOrder: 12,
  },
  {
    eventKey: "bpjsk", frequency: "monthly", dueDay: 10, type: "bpjs", gate: 5, icon: "dot",
    titleEn: "BPJS Kesehatan Contributions", titleUk: "Внески BPJS Kesehatan", titleId: "Kontribusi BPJS Kesehatan",
    shortEn: "BPJS-K", shortUk: "BPJS-K", shortId: "BPJS-K",
    descEn: "Pay health insurance contributions for all enrolled staff. Employer: 4%, Employee: 1% of capped salary. Via eDabu by the 10th.",
    periodTemplate: "cur_month", isActive: true, isRecurring: true, sortOrder: 13,
  },
  {
    eventKey: "bpjstk", frequency: "monthly", dueDay: 10, type: "bpjs", gate: 5, icon: "dot",
    titleEn: "BPJamsostek Contributions", titleUk: "Внески BPJamsostek", titleId: "Kontribusi BPJamsostek",
    shortEn: "BPJamsostek", shortUk: "BPJamsostek", shortId: "BPJamsostek",
    descEn: "Employment insurance (JHT, JKK, JKM, JP) for all staff. Employer: 6.24–7.74%. Via SIPP Online by the 10th.",
    periodTemplate: "cur_month", isActive: true, isRecurring: true, sortOrder: 14,
  },
  {
    eventKey: "banjar", frequency: "monthly", dueDay: 1, type: "banjar", gate: 5, icon: "banjar",
    titleEn: "Banjar Monthly Donation (Iuran)", titleUk: "Щомісячний внесок Banjar (Iuran)", titleId: "Iuran Bulanan Banjar",
    shortEn: "Iuran Banjar", shortUk: "Iuran Banjar", shortId: "Iuran Banjar",
    descEn: "Monthly iuran to local Banjar. Commercial villas: IDR 100,000–1,000,000 depending on location. Keep receipt.",
    periodTemplate: "cur_month", isActive: true, isRecurring: true, sortOrder: 15,
  },
  {
    eventKey: "apar", frequency: "monthly", dueDay: 1, type: "safety", gate: 6, icon: "fire-ext",
    titleEn: "APAR Fire Extinguisher Monthly Inspection", titleUk: "Щомісячна перевірка вогнегасників APAR", titleId: "Inspeksi Bulanan APAR",
    shortEn: "APAR Check", shortUk: "Перев. APAR", shortId: "Cek APAR",
    descEn: "Monthly physical check of all APAR units: pressure gauge in green, safety pin intact, nozzle clear.",
    periodTemplate: "cur_month", isActive: true, isRecurring: true, sortOrder: 16,
  },
];

const QUARTERLY_EVENTS: TemplateSeed[] = [
  {
    eventKey: "lkpm", frequency: "quarterly", dueDay: 10,
    quarterMonths: [3, 6, 9], quarterLabels: ["Q1", "Q2", "Q3"],
    type: "tax", gate: 0, icon: "cycle",
    titleEn: "LKPM {{q}} Investment Report", titleUk: "Звіт LKPM {{q}} про інвестиції", titleId: "Laporan Investasi LKPM {{q}}",
    shortEn: "LKPM {{q}}", shortUk: "LKPM {{q}}", shortId: "LKPM {{q}}",
    descEn: "LKPM Investment Activity Report via OSS. Missed filing triggers NIB suspension warnings.",
    periodTemplate: "quarter_range", isActive: true, isRecurring: true, sortOrder: 20,
  },
  {
    eventKey: "pool", frequency: "quarterly", dueDay: 15,
    quarterMonths: [1, 4, 7, 10], quarterLabels: ["Q1", "Q2", "Q3", "Q4"],
    type: "safety", gate: 6, icon: "pool",
    titleEn: "Pool Chemical & Safety — {{q}}", titleUk: "Хімічна та безпека басейну — {{q}}", titleId: "Kimia & Keselamatan Kolam — {{q}}",
    shortEn: "Pool Check", shortUk: "Перев. басейну", shortId: "Cek Kolam",
    descEn: "Quarterly pool maintenance: pH 7.2–7.8, free chlorine 1–3 ppm. Safety: pool fence/gate latch, depth markers, life ring.",
    periodTemplate: "quarter_label", isActive: true, isRecurring: true, sortOrder: 21,
  },
  {
    eventKey: "gr", frequency: "quarterly", dueDay: 8,
    quarterMonths: [1, 4, 7, 10], quarterLabels: ["Q1", "Q2", "Q3", "Q4"],
    type: "banjar", gate: 5, icon: "handshake",
    titleEn: "Gotong Royong Community Day — {{q}}", titleUk: "Gotong Royong день громади — {{q}}", titleId: "Gotong Royong Hari Komunitas — {{q}}",
    shortEn: "Gotong Royong", shortUk: "Gotong Royong", shortId: "Gotong Royong",
    descEn: "Quarterly Banjar community cleanup and village maintenance. Send a staff member or contribute IDR 200,000–500,000.",
    periodTemplate: "quarter_label", isActive: true, isRecurring: true, sortOrder: 22,
  },
];

const ANNUAL_EVENTS: TemplateSeed[] = [
  {
    eventKey: "spt", frequency: "annual", dueDay: 30, dueMonth: 3, type: "tax", gate: 4, icon: "hex",
    titleEn: "SPT Tahunan — Annual Corporate Tax", titleUk: "SPT Tahunan — річний корпоративний податок", titleId: "SPT Tahunan — Pajak Badan Tahunan",
    shortEn: "SPT Tahunan", shortUk: "SPT Tahunan", shortId: "SPT Tahunan",
    descEn: "Annual PPh Badan return via CoreTax by April 30. Penalty: 2% per month of underpaid tax.",
    periodTemplate: "fiscal", isActive: true, isRecurring: true, sortOrder: 30,
  },
  {
    eventKey: "pbb", frequency: "annual", dueDay: 30, dueMonth: 8, type: "tax", gate: 4, icon: "hex",
    titleEn: "PBB — Land & Building Tax", titleUk: "PBB — Податок на землю та будівлі", titleId: "PBB — Pajak Bumi dan Bangunan",
    shortEn: "PBB Tax", shortUk: "Подат. PBB", shortId: "Pajak PBB",
    descEn: "Annual PBB P2 due September 30. CRITICAL: must be assessed at COMMERCIAL rates, not residential.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 31,
  },
  {
    eventKey: "skd", frequency: "annual", dueDay: 15, dueMonth: 0, type: "docs", gate: 0, icon: "doc",
    titleEn: "Surat Keterangan Domisili (SKD) Renewal", titleUk: "Поновлення SKD", titleId: "Pembaruan SKD",
    shortEn: "SKD Renewal", shortUk: "Понов. SKD", shortId: "Perbarui SKD",
    descEn: "Annual renewal from Banjar Dinas/Kelurahan. Required for OSS, KITAS, NPWP address consistency.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 32,
  },
  {
    eventKey: "nib", frequency: "annual", dueDay: 5, dueMonth: 0, type: "docs", gate: 2, icon: "check",
    titleEn: "NIB Status Verification (OSS)", titleUk: "Верифікація статусу NIB (OSS)", titleId: "Verifikasi Status NIB (OSS)",
    shortEn: "NIB Status", shortUk: "Статус NIB", shortId: "Status NIB",
    descEn: "Annual check that NIB remains 'Verified/Effective' on oss.go.id. OTAs cross-reference NIB.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 33,
  },
  {
    eventKey: "damkar", frequency: "annual", dueDay: 15, dueMonth: 1, type: "safety", gate: 6, icon: "fire",
    titleEn: "Fire Safety Certificate Renewal (DAMKAR)", titleUk: "Поновлення пожежного сертифікату (DAMKAR)", titleId: "Pembaruan Sertifikat DAMKAR",
    shortEn: "DAMKAR Renewal", shortUk: "Понов. DAMKAR", shortId: "Perbarui DAMKAR",
    descEn: "Annual fire cert renewal. Schedule DAMKAR inspection 30+ days early. Expired cert = TDUP renewal blocked.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 34,
  },
  {
    eventKey: "apar-svc", frequency: "annual", dueDay: 1, dueMonth: 5, type: "safety", gate: 6, icon: "fire-ext",
    titleEn: "APAR Annual Professional Servicing", titleUk: "Щорічне обслуговування APAR", titleId: "Servis Tahunan APAR",
    shortEn: "APAR Annual Service", shortUk: "Серв. APAR", shortId: "Servis APAR",
    descEn: "Annual APAR service by certified provider: weigh + refill if <80%, internal inspection, new tamper seal.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 35,
  },
  {
    eventKey: "elec", frequency: "annual", dueDay: 1, dueMonth: 3, type: "safety", gate: 6, icon: "elec",
    titleEn: "Annual Electrical Safety Inspection", titleUk: "Щорічна електроперевірка", titleId: "Inspeksi Kelistrikan Tahunan",
    shortEn: "Electrical Inspection", shortUk: "Електроперев.", shortId: "Inspeksi Listrik",
    descEn: "PLN-certified electrician: earthing/grounding, RCD/ELCB trip function, switchboard condition.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 36,
  },
  {
    eventKey: "water", frequency: "annual", dueDay: 1, dueMonth: 1, type: "safety", gate: 6, icon: "water",
    titleEn: "Pool & Drinking Water Quality Test", titleUk: "Перевірка якості води", titleId: "Uji Kualitas Air",
    shortEn: "Water Quality Test", shortUk: "Якість води", shortId: "Kualitas Air",
    descEn: "Lab test: pool water (pH, chlorine, turbidity, coliforms) + drinking water supply. IDR 300,000–600,000.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 37,
  },
  {
    eventKey: "ipal", frequency: "annual", dueDay: 1, dueMonth: 7, type: "safety", gate: 6, icon: "recycle",
    titleEn: "Wastewater Treatment (IPAL) Annual Check", titleUk: "Щорічна перевірка IPAL", titleId: "Pemeriksaan Tahunan IPAL",
    shortEn: "IPAL Inspection", shortUk: "Перев. IPAL", shortId: "Cek IPAL",
    descEn: "Inspect IPAL: biodigester/septic tank function, soakpit condition, confirm zero discharge.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 38,
  },
  {
    eventKey: "waste", frequency: "annual", dueDay: 5, dueMonth: 0, type: "safety", gate: 6, icon: "waste",
    titleEn: "Commercial Waste Management Contract", titleUk: "Договір вивозу відходів", titleId: "Kontrak Pengelolaan Sampah",
    shortEn: "Waste Contract", shortUk: "Відходи", shortId: "Sampah",
    descEn: "Renew licensed waste collection contract. Commercial properties cannot use residential pickup.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 39,
  },
  {
    eventKey: "insure", frequency: "annual", dueDay: 30, dueMonth: 0, type: "docs", gate: 0, icon: "shield",
    titleEn: "Commercial Property Insurance Renewal", titleUk: "Поновлення страхування майна", titleId: "Pembaruan Asuransi Properti",
    shortEn: "Insurance Renewal", shortUk: "Страхування", shortId: "Asuransi",
    descEn: "Renew commercial property insurance. Residential policies void if used for commercial rental.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 40,
  },
  {
    eventKey: "passport", frequency: "annual", dueDay: 1, dueMonth: 2, type: "docs", gate: 0, icon: "passport",
    titleEn: "Director Passport Validity Review", titleUk: "Перевірка паспорту директора", titleId: "Pemeriksaan Paspor Direktur",
    shortEn: "Passport Check", shortUk: "Паспорт", shortId: "Paspor",
    descEn: "Ensure all director/shareholder passports valid 12+ months. Expired = OSS access issues.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 41,
  },
  {
    eventKey: "kitas", frequency: "annual", dueDay: 1, dueMonth: 2, type: "docs", gate: 5, icon: "id-card",
    titleEn: "KITAS Investor Renewal (if applicable)", titleUk: "Поновлення KITAS інвестора", titleId: "Pembaruan KITAS Investor",
    shortEn: "KITAS Renewal", shortUk: "Понов. KITAS", shortId: "Perbarui KITAS",
    descEn: "Begin 60 days before expiry. Fee approx IDR 1.25M. Working without valid KITAS = deportation risk.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 42,
  },
  {
    eventKey: "pbg", frequency: "annual", dueDay: 20, dueMonth: 0, type: "docs", gate: 3, icon: "hex",
    titleEn: "PBG Building Permit Annual Review", titleUk: "Щорічний перегляд PBG", titleId: "Tinjauan Tahunan PBG",
    shortEn: "PBG Review", shortUk: "Перегляд PBG", shortId: "Tinjauan PBG",
    descEn: "Any physical changes made without updating PBG? Unauthorised changes = SLF invalidity risk.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 43,
  },
  {
    eventKey: "slf", frequency: "annual", dueDay: 15, dueMonth: 5, type: "docs", gate: 3, icon: "doc",
    titleEn: "SLF Certificate — Begin Renewal (90-day lead)", titleUk: "Сертифікат SLF — початок поновлення", titleId: "Sertifikat SLF — Mulai Pembaruan",
    shortEn: "SLF Renewal", shortUk: "Понов. SLF", shortId: "Perbarui SLF",
    descEn: "Begin SLF renewal 90 days before expiry. Expired SLF = TDUP not renewable = OTA listing at risk.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 44,
  },
  {
    eventKey: "satpol", frequency: "annual", dueDay: 1, dueMonth: 5, type: "ops", gate: 7, icon: "officer",
    titleEn: "Satpol PP Inspection Season (June–Aug)", titleUk: "Сезон інспекцій Satpol PP (черв.–серп.)", titleId: "Musim Inspeksi Satpol PP (Jun–Agt)",
    shortEn: "Satpol PP Season", shortUk: "Satpol PP", shortId: "Satpol PP",
    descEn: "Peak enforcement season. Complete pre-inspection checklist by May.",
    periodTemplate: "year_only", isActive: true, isRecurring: true, sortOrder: 45,
  },
  {
    eventKey: "apoa", frequency: "annual", dueDay: 10, dueMonth: 0, type: "ops", gate: 7, icon: "clipboard",
    titleEn: "APOA Guest Registration System Review", titleUk: "Перегляд системи APOA", titleId: "Tinjauan Sistem APOA",
    shortEn: "APOA Review", shortUk: "Перегляд APOA", shortId: "Tinjauan APOA",
    descEn: "Annual review of APOA compliance. Foreign guests staying 24h+ must be registered.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 46,
  },
  {
    eventKey: "banjar-od", frequency: "annual", dueDay: 15, dueMonth: 3, type: "banjar", gate: 5, icon: "temple",
    titleEn: "Banjar Annual Ceremony Contribution", titleUk: "Щорічний внесок на церемонію Banjar", titleId: "Kontribusi Upacara Tahunan Banjar",
    shortEn: "Banjar Ceremony", shortUk: "Церемонія Banjar", shortId: "Upacara Banjar",
    descEn: "Annual contribution to major Banjar ceremony (Odalan/Melaspas). IDR 500,000–5,000,000+.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 47,
  },
  {
    eventKey: "event", frequency: "annual", dueDay: 20, dueMonth: 0, type: "banjar", gate: 5, icon: "event",
    titleEn: "Villa Events — Banjar Permit Process", titleUk: "Заходи на віллі — дозвіл Banjar", titleId: "Acara Villa — Proses Izin Banjar",
    shortEn: "Event Permits", shortUk: "Дозволи заходів", shortId: "Izin Acara",
    descEn: "For any villa events: prior Banjar + Kepala Desa approval required.",
    periodTemplate: "annual", isActive: true, isRecurring: true, sortOrder: 48,
  },
  {
    eventKey: "peak1", frequency: "annual", dueDay: 1, dueMonth: 0, type: "ops", gate: 7, icon: "chart",
    titleEn: "Peak Season Compliance Check (Jan–Feb)", titleUk: "Перевірка в пік сезону (січ.–лют.)", titleId: "Pemeriksaan Kepatuhan Musim Puncak (Jan–Feb)",
    shortEn: "Peak Jan–Feb", shortUk: "Пік січ.–лют.", shortId: "Puncak Jan–Feb",
    descEn: "Pre-peak checklist: all licences valid, APOA current, fire equipment checked, pool safety confirmed.",
    periodTemplate: "year_only", isActive: true, isRecurring: true, sortOrder: 49,
  },
  {
    eventKey: "peak2", frequency: "annual", dueDay: 1, dueMonth: 6, type: "ops", gate: 7, icon: "chart",
    titleEn: "Peak + Inspection Season (Jul–Aug)", titleUk: "Пік + сезон інспекцій (лип.–серп.)", titleId: "Puncak + Musim Inspeksi (Jul–Agt)",
    shortEn: "Peak Jul–Aug", shortUk: "Пік лип.–серп.", shortId: "Puncak Jul–Agt",
    descEn: "Second peak + Satpol PP primary enforcement. Complete self-audit by July 1.",
    periodTemplate: "year_only", isActive: true, isRecurring: true, sortOrder: 50,
  },
  {
    eventKey: "lkpm-ann", frequency: "annual", dueDay: 10, dueMonth: 0, type: "tax", gate: 0, icon: "cycle",
    titleEn: "LKPM Annual Investment Report", titleUk: "Щорічний інвестиційний звіт LKPM", titleId: "Laporan Investasi Tahunan LKPM",
    shortEn: "LKPM Annual", shortUk: "LKPM Щоріч.", shortId: "LKPM Tahunan",
    descEn: "Annual LKPM Investment Report — replaces Q4. File via OSS by January 10 of the following year.",
    periodTemplate: "full_year", isActive: true, isRecurring: true, sortOrder: 51,
  },
];

const ONE_TIME_EVENTS: TemplateSeed[] = [
  {
    eventKey: "ota-2026", frequency: "one-time", dueDay: 31, dueMonth: 2, type: "ota", gate: 7, icon: "hex",
    titleEn: "OTA Verification Deadline — Airbnb & Booking.com", titleUk: "Дедлайн верифікації OTA — Airbnb & Booking.com", titleId: "Tenggat Verifikasi OTA — Airbnb & Booking.com",
    shortEn: "OTA Deadline", shortUk: "Дедлайн OTA", shortId: "Tenggat OTA",
    descEn: "All Bali villa OTA listings must submit verified compliance docs by March 31, 2026. Required: NIB Verified, TDUP cert, KBLI 55193.",
    periodTemplate: "one_time", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 60,
  },
  {
    eventKey: "thr-nf", frequency: "one-time", dueDay: 21, dueMonth: 2, type: "bpjs", gate: 5, icon: "money",
    titleEn: "THR Due — Hindu Staff (Nyepi)", titleUk: "THR — індуїстський персонал (Nyepi)", titleId: "THR — Staf Hindu (Nyepi)",
    shortEn: "THR Nyepi", shortUk: "THR Nyepi", shortId: "THR Nyepi",
    descEn: "One full month gross salary. ≥ 7 days before Nyepi. Staff <12 months: pro-rated.",
    periodTemplate: "one_time", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 61,
  },
  {
    eventKey: "thr-eid", frequency: "one-time", dueDay: 23, dueMonth: 2, type: "bpjs", gate: 5, icon: "money",
    titleEn: "THR Due — Muslim Staff (Eid al-Fitr)", titleUk: "THR — мусульманський персонал (Eid al-Fitr)", titleId: "THR — Staf Muslim (Idul Fitri)",
    shortEn: "THR Eid", shortUk: "THR Eid", shortId: "THR Idul Fitri",
    descEn: "One full month gross salary. Eid 2026 est. March 30–31. Pay by March 23.",
    periodTemplate: "one_time", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 62,
  },
  {
    eventKey: "thr-xm", frequency: "one-time", dueDay: 18, dueMonth: 11, type: "bpjs", gate: 5, icon: "money",
    titleEn: "THR Due — Christian Staff (Christmas)", titleUk: "THR — християнський персонал (Різдво)", titleId: "THR — Staf Kristen (Natal)",
    shortEn: "THR Christmas", shortUk: "THR Різдво", shortId: "THR Natal",
    descEn: "One full month gross salary by December 18. Verify religion on employment contract.",
    periodTemplate: "one_time", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 63,
  },
];

const HOLIDAY_EVENTS: TemplateSeed[] = [
  { eventKey: "hol-new-year", frequency: "holiday", dueDay: 1, dueMonth: 0, type: "ops", gate: 5, icon: "flower",
    titleEn: "New Year's Day", titleUk: "Новий рік", titleId: "Tahun Baru",
    shortEn: "New Year's Day", shortUk: "Новий рік", shortId: "Tahun Baru",
    descEn: "National holiday. Peak season arrival day.",
    periodTemplate: "none", isActive: true, isRecurring: true, sortOrder: 100 },
  { eventKey: "hol-imlek", frequency: "holiday", dueDay: 29, dueMonth: 0, type: "ops", gate: 5, icon: "flower",
    titleEn: "Imlek — Chinese New Year", titleUk: "Імлек — Китайський Новий рік", titleId: "Imlek — Tahun Baru Cina",
    shortEn: "Imlek", shortUk: "Імлек", shortId: "Imlek",
    descEn: "National holiday.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 101 },
  { eventKey: "hol-galungan-1", frequency: "holiday", dueDay: 11, dueMonth: 1, type: "ops", gate: 5, icon: "flower",
    titleEn: "Galungan", titleUk: "Galungan", titleId: "Galungan",
    shortEn: "Galungan", shortUk: "Galungan", shortId: "Galungan",
    descEn: "Major Balinese Hindu ceremony. Most Balinese staff take 3–5 days.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 102 },
  { eventKey: "hol-kuningan-1", frequency: "holiday", dueDay: 21, dueMonth: 1, type: "ops", gate: 5, icon: "flower",
    titleEn: "Kuningan", titleUk: "Kuningan", titleId: "Kuningan",
    shortEn: "Kuningan", shortUk: "Kuningan", shortId: "Kuningan",
    descEn: "10 days after Galungan.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 103 },
  { eventKey: "hol-nyepi", frequency: "holiday", dueDay: 28, dueMonth: 2, type: "ops", gate: 5, icon: "flower",
    titleEn: "Nyepi — Day of Silence", titleUk: "Nyepi — День тиші", titleId: "Nyepi — Hari Raya Nyepi",
    shortEn: "Nyepi", shortUk: "Nyepi", shortId: "Nyepi",
    descEn: "TOTAL ISLAND SHUTDOWN. No movement, light, noise. Airport closes 6am–6am.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 104 },
  { eventKey: "hol-eid", frequency: "holiday", dueDay: 30, dueMonth: 2, type: "ops", gate: 5, icon: "flower",
    titleEn: "Eid al-Fitr", titleUk: "Eid al-Fitr", titleId: "Idul Fitri",
    shortEn: "Eid al-Fitr", shortUk: "Eid al-Fitr", shortId: "Idul Fitri",
    descEn: "Muslim staff holiday. Ensure THR paid by March 23.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 105 },
  { eventKey: "hol-good-friday", frequency: "holiday", dueDay: 3, dueMonth: 3, type: "ops", gate: 5, icon: "flower",
    titleEn: "Good Friday", titleUk: "Страсна п'ятниця", titleId: "Jumat Agung",
    shortEn: "Good Friday", shortUk: "Страсна п'ятниця", shortId: "Jumat Agung",
    descEn: "National holiday.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 106 },
  { eventKey: "hol-labour", frequency: "holiday", dueDay: 1, dueMonth: 4, type: "ops", gate: 5, icon: "flower",
    titleEn: "Labour Day", titleUk: "День праці", titleId: "Hari Buruh",
    shortEn: "Labour Day", shortUk: "День праці", shortId: "Hari Buruh",
    descEn: "National holiday. Staff entitled to day off or overtime pay.",
    periodTemplate: "none", isActive: true, isRecurring: true, sortOrder: 107 },
  { eventKey: "hol-ascension", frequency: "holiday", dueDay: 14, dueMonth: 4, type: "ops", gate: 5, icon: "flower",
    titleEn: "Ascension Day", titleUk: "Вознесіння", titleId: "Kenaikan Isa Almasih",
    shortEn: "Ascension", shortUk: "Вознесіння", shortId: "Kenaikan Isa",
    descEn: "National holiday.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 108 },
  { eventKey: "hol-waisak", frequency: "holiday", dueDay: 5, dueMonth: 5, type: "ops", gate: 5, icon: "flower",
    titleEn: "Waisak — Buddha Day", titleUk: "Waisak — День Будди", titleId: "Waisak — Hari Raya Waisak",
    shortEn: "Waisak", shortUk: "Waisak", shortId: "Waisak",
    descEn: "National holiday.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 109 },
  { eventKey: "hol-idul-adha", frequency: "holiday", dueDay: 6, dueMonth: 5, type: "ops", gate: 5, icon: "flower",
    titleEn: "Idul Adha", titleUk: "Idul Adha", titleId: "Idul Adha",
    shortEn: "Idul Adha", shortUk: "Idul Adha", shortId: "Idul Adha",
    descEn: "Muslim staff holiday.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 110 },
  { eventKey: "hol-independence", frequency: "holiday", dueDay: 17, dueMonth: 7, type: "ops", gate: 5, icon: "flower",
    titleEn: "Indonesian Independence Day", titleUk: "День незалежності Індонезії", titleId: "Hari Kemerdekaan Indonesia",
    shortEn: "Independence", shortUk: "Незалежність", shortId: "Kemerdekaan",
    descEn: "National holiday. Display Indonesian flag at gate.",
    periodTemplate: "none", isActive: true, isRecurring: true, sortOrder: 111 },
  { eventKey: "hol-galungan-2", frequency: "holiday", dueDay: 2, dueMonth: 8, type: "ops", gate: 5, icon: "flower",
    titleEn: "Galungan — Cycle 2", titleUk: "Galungan — Цикл 2", titleId: "Galungan — Siklus 2",
    shortEn: "Galungan (2)", shortUk: "Galungan 2", shortId: "Galungan 2",
    descEn: "Second Galungan of 2026.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 112 },
  { eventKey: "hol-kuningan-2", frequency: "holiday", dueDay: 12, dueMonth: 8, type: "ops", gate: 5, icon: "flower",
    titleEn: "Kuningan — Cycle 2", titleUk: "Kuningan — Цикл 2", titleId: "Kuningan — Siklus 2",
    shortEn: "Kuningan (2)", shortUk: "Kuningan 2", shortId: "Kuningan 2",
    descEn: "10 days after second Galungan.",
    periodTemplate: "none", isActive: true, yearSpecific: 2026, isRecurring: false, sortOrder: 113 },
  { eventKey: "hol-christmas", frequency: "holiday", dueDay: 25, dueMonth: 11, type: "ops", gate: 5, icon: "flower",
    titleEn: "Christmas Day", titleUk: "Різдво", titleId: "Hari Natal",
    shortEn: "Christmas Day", shortUk: "Різдво", shortId: "Natal",
    descEn: "National holiday. Peak season.",
    periodTemplate: "none", isActive: true, isRecurring: true, sortOrder: 114 },
];

const ALL_TEMPLATES: TemplateSeed[] = [
  ...MONTHLY_EVENTS,
  ...QUARTERLY_EVENTS,
  ...ANNUAL_EVENTS,
  ...ONE_TIME_EVENTS,
  ...HOLIDAY_EVENTS,
];

export async function seedCalendarEventTemplates() {
  const existing = await db.select({ id: calendarEventTemplates.id }).from(calendarEventTemplates).limit(1);
  if (existing.length > 0) {
    console.log("Calendar event templates already seeded, skipping...");
    return;
  }

  console.log(`Seeding ${ALL_TEMPLATES.length} calendar event templates...`);
  for (const t of ALL_TEMPLATES) {
    await db.insert(calendarEventTemplates).values({
      eventKey: t.eventKey,
      frequency: t.frequency,
      dueDay: t.dueDay,
      dueMonth: t.dueMonth ?? null,
      quarterMonths: t.quarterMonths ?? null,
      quarterLabels: t.quarterLabels ?? null,
      type: t.type,
      gate: t.gate,
      icon: t.icon,
      titleEn: t.titleEn,
      titleUk: t.titleUk ?? null,
      titleId: t.titleId ?? null,
      shortEn: t.shortEn,
      shortUk: t.shortUk ?? null,
      shortId: t.shortId ?? null,
      descEn: t.descEn,
      descUk: t.descUk ?? null,
      descId: t.descId ?? null,
      periodTemplate: t.periodTemplate,
      isActive: t.isActive,
      yearSpecific: t.yearSpecific ?? null,
      isRecurring: t.isRecurring,
      sortOrder: t.sortOrder,
    }).onConflictDoNothing();
  }
  console.log("Calendar event templates seeded successfully.");
}
