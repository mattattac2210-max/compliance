import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlossarySection from "@/components/glossary";
import { ProcessNavigation } from "@/components/process-navigation";
import { ThemeToggle } from "@/components/theme-provider";

type TabId = "flow" | "audit" | "guide";

interface GateData {
  id: string;
  num: string;
  abbr: string;
  color: string;
  borderColor: string;
  glowColor: string;
  layerLabel: string;
  layerColor: string;
  title: string;
  subtitle: string;
  rolePillText: string;
  rolePillBg: string;
  rolePillBorder: string;
  rolePillColor: string;
  dscvrRole: string;
  dscvrRoleDesc: string;
  alerts: Array<{ type: "amber" | "red" | "teal"; icon: string; content: string }>;
  infoBlocks: Array<{ title: string; borderColor: string; content: string; items?: string[] }>;
  portals: Array<{ label: string; url: string }>;
  zones?: Array<{ color: string; name: string; status: string }>;
  isDashed?: boolean;
}

const gates: GateData[] = [
  {
    id: "g0",
    num: "PT",
    abbr: "PMA",
    color: "#94A3B8",
    borderColor: "rgba(148,163,184,0.3)",
    glowColor: "transparent",
    layerLabel: "Prerequisite",
    layerColor: "#94A3B8",
    title: "Legal Entity — PT PMA",
    subtitle: "Company formation must be complete before any licence application",
    rolePillText: "Document storage only",
    rolePillBg: "rgba(148,163,184,0.08)",
    rolePillBorder: "rgba(148,163,184,0.15)",
    rolePillColor: "#94A3B8",
    dscvrRole: "DSCVR Role — Document Storage",
    dscvrRoleDesc: "DSCVR stores the completed company deed, SK Kemenkumham approval, corporate NPWP, and bank confirmation. PT PMA formation requires a licensed Indonesian notary — DSCVR does not advise on structure or corporate law.",
    alerts: [
      {
        type: "amber",
        icon: "\u25B2",
        content: "<strong>Regulatory exposure risk.</strong> Using Indonesian nationals to hold shares on behalf of a foreign owner carries significant regulatory exposure for both parties and has faced increased scrutiny since 2024. PT PMA with 100% foreign ownership is the documented, low-risk structure for KBLI 55193.",
      },
    ],
    infoBlocks: [
      {
        title: "Steps Completed Externally",
        borderColor: "#0D9488",
        content: "",
        items: [
          "Company name reservation via AHU",
          "Notarised Deed (Akta Pendirian)",
          "Ministry approval — SK Kemenkumham",
          "Corporate NPWP (national tax ID)",
          "Bank account + IDR 2.5B paid-up capital",
        ],
      },
      {
        title: "Indicative Timeline & Costs",
        borderColor: "#64748B",
        content: "Estimated 4\u20138 weeks from deed to NIB + bank account. Professional fees: estimated IDR 30\u201380M. Costs vary by provider. Minimum paid-up capital: IDR 2.5B (BKPM Reg 5/2025).",
      },
    ],
    portals: [
      { label: "AHU Online — Company Name & Deed", url: "https://ahu.go.id" },
      { label: "OSS RBA — Business Registration", url: "https://oss.go.id" },
      { label: "DJP — Corporate NPWP", url: "https://pajak.go.id" },
    ],
    isDashed: true,
  },
  {
    id: "g1",
    num: "1",
    abbr: "ZONE",
    color: "#14B8A6",
    borderColor: "#14B8A6",
    glowColor: "rgba(20,184,166,0.14)",
    layerLabel: "Layer One — Structural",
    layerColor: "#14B8A6",
    title: "Zoning Documentation — KKPR",
    subtitle: "Missing or unverified zone documentation puts all downstream gates at risk",
    rolePillText: "Document + map upload",
    rolePillBg: "rgba(20,184,166,0.08)",
    rolePillBorder: "rgba(20,184,166,0.18)",
    rolePillColor: "#14B8A6",
    dscvrRole: "DSCVR Role — Document Upload & Status Tracking",
    dscvrRoleDesc: "DSCVR stores the KKPR certificate, records zone classification as operator-reported, and flags when a KBLI change may require a new KKPR. DSCVR does not determine legal zone status — that rests with a licensed consultant and the relevant DPMPTSP.",
    alerts: [
      {
        type: "amber",
        icon: "\u25B2",
        content: "Markets including Canggu and Pererenan contain both pink (pariwisata) and yellow (residential) zones in close proximity. Zone status must be verified at the individual land parcel level, not at suburb or street level.",
      },
    ],
    zones: [
      { color: "#FF85B3", name: "Pink", status: "\u2191 Pariwisata — proceed" },
      { color: "#FB923C", name: "Orange", status: "\u2191 Mixed-use — conditional" },
      { color: "#EF4444", name: "Red", status: "\u2191 Commercial — viable" },
      { color: "#EAB308", name: "Yellow", status: "\u2193 Residential — high risk" },
      { color: "#22C55E", name: "Green", status: "\u2193 Agricultural — high risk" },
      { color: "#166534", name: "Konservasi", status: "\u2193 Conservation — high risk" },
    ],
    infoBlocks: [
      {
        title: "KKPR — What It Is",
        borderColor: "#14B8A6",
        content: "Zoning conformity certificate via OSS \u2192 DPMPTSP. Confirms land use aligns with stated KBLI. Estimated timeline: 2\u20136 weeks. No government application fee. OSS cross-checks RDTR automatically on submission.",
      },
      {
        title: "Zone Conversion Risk Note",
        borderColor: "#F59E0B",
        content: "Services promising to convert agricultural or residential zoning face significant regulatory hurdles and extended timelines with no guaranteed outcome. Independent legal advice recommended before proceeding on this basis.",
      },
    ],
    portals: [
      { label: "GISTARU Bali — Official Zone Map", url: "https://gistarubali.id" },
      { label: "OSS RBA — KKPR Application", url: "https://oss.go.id" },
      { label: "RDTR ATR/BPN — National Spatial Reference", url: "https://rdtr.atrbpn.go.id" },
    ],
  },
  {
    id: "g2",
    num: "2",
    abbr: "NIB",
    color: "#60A5FA",
    borderColor: "#3B82F6",
    glowColor: "rgba(59,130,246,0.12)",
    layerLabel: "Layer Two — Structural",
    layerColor: "#60A5FA",
    title: "Business Licensing — NIB + KBLI",
    subtitle: "NIB must reach Verified status — Issued alone does not pass OTA verification",
    rolePillText: "Licence expiry tracking",
    rolePillBg: "rgba(59,130,246,0.08)",
    rolePillBorder: "rgba(59,130,246,0.18)",
    rolePillColor: "#60A5FA",
    dscvrRole: "DSCVR Role — NIB Status Monitoring",
    dscvrRoleDesc: "DSCVR stores the NIB certificate, tracks displayed status (Issued / Verified / Suspended), and alerts when documents supporting verification approach expiry. DSCVR does not submit to OSS or advise on KBLI selection — consult a licensed business registration specialist.",
    alerts: [
      {
        type: "amber",
        icon: "\u25B2",
        content: "<strong>Identity consistency requirement.</strong> The legal entity name registered in OSS must match the account name on every OTA listing exactly. A mismatch — even minor formatting — triggers a verification failure regardless of underlying licence status.",
      },
    ],
    infoBlocks: [
      {
        title: "Relevant KBLI Codes",
        borderColor: "#3B82F6",
        content: "",
        items: [
          "<strong>55193</strong> — Villa (commercial, staffed, 4+ beds)",
          "<strong>55194</strong> — Pondok Wisata (smaller homestay scale)",
          "<strong>55199</strong> — Catch-all: OSS increasingly flagging for large commercial villas. Review with registrar.",
        ],
      },
      {
        title: "KBLI 2025 — Transition Note",
        borderColor: "#F59E0B",
        content: "BPS published KBLI 2025 in December 2025, replacing KBLI 2020. A transition window applies to existing registrations. Operators should confirm status with their OSS consultant. DSCVR will flag this as a tracking event.",
      },
    ],
    portals: [
      { label: "OSS RBA — NIB Application & Status", url: "https://oss.go.id" },
      { label: "BPS — KBLI 2025 Classification", url: "https://www.bps.go.id/id/business-register" },
      { label: "BKPM — Investment Coordinating Board", url: "https://bkpm.go.id" },
    ],
  },
  {
    id: "g3",
    num: "3",
    abbr: "SLF",
    color: "#A78BFA",
    borderColor: "#8B5CF6",
    glowColor: "rgba(139,92,246,0.12)",
    layerLabel: "Layer Three — Structural",
    layerColor: "#A78BFA",
    title: "Building Compliance — PBG + SLF",
    subtitle: "SLF expiry is the most common cause of sudden NIB status change — 5-year renewal cycle",
    rolePillText: "Inspection reminders",
    rolePillBg: "rgba(139,92,246,0.08)",
    rolePillBorder: "rgba(139,92,246,0.18)",
    rolePillColor: "#A78BFA",
    dscvrRole: "DSCVR Role — Expiry Tracking + Renewal Reminders",
    dscvrRoleDesc: "DSCVR stores the SLF certificate, tracks the expiry date, and issues alerts at 90 / 60 / 30 / 14 days before expiry. Renewal requires a licensed Pengkaji Teknis and DPMPTSP submission — DSCVR does not manage that process.",
    alerts: [
      {
        type: "red",
        icon: "\u25B2",
        content: "A significant portion of pre-2021 Bali villa stock holds a PBG or IMB with <strong>Residential function</strong> — the most common structural licensing blocker. Amendment requires as-built drawings from a licensed engineer. Estimated cost: IDR 10\u201350M. Estimated timeline: 4\u201312 weeks.",
      },
    ],
    infoBlocks: [
      {
        title: "PBG Function Requirement",
        borderColor: "#8B5CF6",
        content: "Must read: <strong>Commercial / Pariwisata / Non-Residential</strong>. Residential function blocks TDUP and NIB Verified status. Applied or amended via SIMBG. IMBs issued before 2021 must be reviewed.",
      },
      {
        title: "SLF Renewal — Estimated Timeline",
        borderColor: "#14B8A6",
        content: "Commercial SLF valid <strong>5 years</strong>. Allow 8\u201312 weeks for the full renewal cycle: Pengkaji Teknis, pre-inspection prep, formal inspection, any remediation, DPMPTSP processing (est. 14\u201345 days).",
      },
    ],
    portals: [
      { label: "SIMBG — PBG & SLF Submission", url: "https://simbg.pu.go.id" },
      { label: "OSS RBA — Building Compliance", url: "https://oss.go.id" },
      { label: "DPMPTSP Badung — Permit Office", url: "https://dpmptsp.badungkab.go.id" },
    ],
  },
  {
    id: "g4",
    num: "4",
    abbr: "TAX",
    color: "#F59E0B",
    borderColor: "#F59E0B",
    glowColor: "rgba(245,158,11,0.12)",
    layerLabel: "Layer Four — Operational Stream",
    layerColor: "#F59E0B",
    title: "Tax — PB1 / NPWPD / PPh",
    subtitle: "Begins concurrently with NIB issuance — not downstream of building compliance",
    rolePillText: "Filing calendar + storage",
    rolePillBg: "rgba(245,158,11,0.08)",
    rolePillBorder: "rgba(245,158,11,0.18)",
    rolePillColor: "#F59E0B",
    dscvrRole: "DSCVR Role — Filing Calendar + Document Storage",
    dscvrRoleDesc: "DSCVR maintains a tax obligation calendar, stores NPWPD registration and SPTPD filing confirmations. DSCVR does not prepare returns, advise on tax positions, or interpret tax law. Engage a licensed Indonesian tax consultant.",
    alerts: [
      {
        type: "amber",
        icon: "\u25B2",
        content: "<strong>Data matching risk (CoreTax, live from Jan 2025).</strong> Indonesia's CoreTax system is reported to cross-reference OTA booking revenue against PB1 filings. Significant discrepancies may generate audit attention. Confirm the extent of OTA data sharing with your tax consultant.",
      },
    ],
    infoBlocks: [
      {
        title: "Monthly PB1 — Badung",
        borderColor: "#F59E0B",
        content: "",
        items: [
          "Register NPWPD via e-Palapa (Badung)",
          "Collect 10% PB1 from each guest — label as local government tax, not VAT",
          "File SPTPD by 20th of following month",
          "Remit via BPD Bali or Virtual Account",
        ],
      },
      {
        title: "Key Annual Deadlines",
        borderColor: "#64748B",
        content: "",
        items: [
          "<strong>April 30</strong> — SPT Tahunan (corporate)",
          "<strong>15th monthly</strong> — PPh 25 instalment",
          "<strong>20th monthly</strong> — PPh 21 / 23 / 26",
          "<strong>10th monthly</strong> — BPJS contributions",
        ],
      },
    ],
    portals: [
      { label: "e-Palapa Badung — NPWPD & SPTPD", url: "https://e-palapa.badungkab.go.id" },
      { label: "DJP Online — PPh Filing", url: "https://djponline.pajak.go.id" },
      { label: "CoreTax — Tax Administration", url: "https://pajak.go.id/reformasi-pajak/coretax" },
      { label: "Bapenda Badung — Regional Revenue", url: "https://bapenda.badungkab.go.id" },
    ],
  },
  {
    id: "g5",
    num: "5",
    abbr: "STAFF",
    color: "#22C55E",
    borderColor: "#22C55E",
    glowColor: "rgba(34,197,94,0.1)",
    layerLabel: "Layer Five — Operational Stream",
    layerColor: "#22C55E",
    title: "Staff & Employment Compliance",
    subtitle: "Runs concurrently — does not wait for building or tax gate completion",
    rolePillText: "Permit + contract tracking",
    rolePillBg: "rgba(34,197,94,0.08)",
    rolePillBorder: "rgba(34,197,94,0.18)",
    rolePillColor: "#22C55E",
    dscvrRole: "DSCVR Role — Staff Profiles + Permit Expiry Tracking",
    dscvrRoleDesc: "DSCVR maintains a staff profile per employee, stores BPJS registration, employment contracts, and KITAS documents with expiry alerts. DSCVR does not advise on employment law, immigration applications, or contribution calculations.",
    alerts: [
      {
        type: "red",
        icon: "\u25B2",
        content: "<strong>KITAS exposure risk.</strong> Foreign nationals managing villa operations without a valid Investor KITAS carry significant immigration exposure — increased enforcement attention in Bali since 2024. Estimated cost: IDR 3\u20138M per year via BKPM or licensed agent.",
      },
    ],
    infoBlocks: [
      {
        title: "BPJS Indicative Rates",
        borderColor: "#22C55E",
        content: "",
        items: [
          "Kesehatan: <strong>4%</strong> employer + 1% employee (cap applies)",
          "Ketenagakerjaan: approx <strong>6.24\u20137.74%</strong> employer total (varies by risk class)",
          "Payment deadline: 10th of each month",
          "Enrol within 30 days of hiring",
        ],
      },
      {
        title: "THR — 2026 Lebaran",
        borderColor: "#64748B",
        content: "Mandatory one-month salary bonus for all employees. Indicative legal deadline: 7 days before Lebaran (estimated ~March 22, 2026). Applies to all staff regardless of role. Confirm exact date annually.",
      },
    ],
    portals: [
      { label: "eDabu — BPJS Kesehatan", url: "https://edabu.bpjs-kesehatan.go.id" },
      { label: "SIPP Online — BPJamsostek", url: "https://sipp.bpjsketenagakerjaan.go.id" },
      { label: "Ditjen Imigrasi — KITAS", url: "https://imigrasi.go.id" },
      { label: "BKPM — Investor KITAS", url: "https://bkpm.go.id" },
    ],
  },
  {
    id: "g6",
    num: "6",
    abbr: "SAFE",
    color: "#FCA5A5",
    borderColor: "#EF4444",
    glowColor: "rgba(239,68,68,0.1)",
    layerLabel: "Layer Six — Operational Stream",
    layerColor: "#FCA5A5",
    title: "Operational Safety — Ongoing Standards",
    subtitle: "Permenpar 6/2025 requires written SOPs — the task library with timestamps is the evidence",
    rolePillText: "Task execution + logs",
    rolePillBg: "rgba(239,68,68,0.08)",
    rolePillBorder: "rgba(239,68,68,0.18)",
    rolePillColor: "#FCA5A5",
    dscvrRole: "DSCVR Role — Task Execution + Evidence Logs",
    dscvrRoleDesc: "This is where DSCVR is most operationally native. Recurring tasks, completed checklists, and PoP-timestamped photos generate the evidence trail that functions as the SOP record required under Permenpar 6/2025.",
    alerts: [
      {
        type: "teal",
        icon: "\u25C6",
        content: "Permenpar 6/2025 requires documented SOPs for check-in, check-out, housekeeping, maintenance, and emergency response. A task library with completion timestamps constitutes the documented SOP evidence during an inspection.",
      },
    ],
    infoBlocks: [
      {
        title: "Recurring Safety Tasks",
        borderColor: "#EF4444",
        content: "",
        items: [
          "<strong>Monthly:</strong> Fire extinguisher seal and gauge check",
          "<strong>Twice-weekly:</strong> Pool chemistry (Cl 1\u20133ppm, pH 7.2\u20137.8)",
          "<strong>Quarterly:</strong> Emergency exit KELUAR signage photo",
          "<strong>Annual:</strong> Fire extinguisher full service + certificate",
        ],
      },
      {
        title: "SLF Inspection Alignment",
        borderColor: "#64748B",
        content: "SLF renewal inspects structural, electrical, fire, plumbing, pool, and ventilation. Properties running active DSCVR safety task logs are better positioned for pre-inspection preparation, surfacing recurring issues before a formal inspection is triggered.",
      },
    ],
    portals: [
      { label: "JDIH Kemenparekraf — Permenpar 6/2025", url: "https://jdih.kemenparekraf.go.id" },
      { label: "Dinas Damkar Badung — Fire Safety", url: "https://damkar.badungkab.go.id" },
    ],
  },
  {
    id: "g7",
    num: "7",
    abbr: "OTA",
    color: "#14B8A6",
    borderColor: "#14B8A6",
    glowColor: "rgba(20,184,166,0.22)",
    layerLabel: "Layer Seven — Verification Gate",
    layerColor: "#14B8A6",
    title: "OTA Verification — Platform Compliance",
    subtitle: "Deadline 31 March 2026 — requires all upstream gates to be in order",
    rolePillText: "Compliance check",
    rolePillBg: "rgba(20,184,166,0.08)",
    rolePillBorder: "rgba(20,184,166,0.18)",
    rolePillColor: "#14B8A6",
    dscvrRole: "DSCVR Role — Readiness Assessment",
    dscvrRoleDesc: "DSCVR cross-references all uploaded documents against OTA verification requirements and generates a readiness report. DSCVR does not submit verification applications or guarantee OTA approval — the operator manages platform-side submissions directly.",
    alerts: [
      {
        type: "red",
        icon: "\u25B2",
        content: "<strong>31 March 2026 deadline.</strong> OTA platforms (Airbnb, Booking.com, Agoda, Traveloka) are expected to begin enforcement of Permenparekraf verification requirements. Non-compliant listings risk suspension or delisting.",
      },
    ],
    infoBlocks: [
      {
        title: "OTA Verification Requirements",
        borderColor: "#14B8A6",
        content: "",
        items: [
          "NIB in Verified status (not just Issued)",
          "TDUP or Sertifikat Standar Usaha active",
          "Legal entity name matches OTA account exactly",
          "All supporting documents current (not expired)",
          "Tax registrations active (NPWP, NPWPD)",
        ],
      },
      {
        title: "Enforcement Timeline",
        borderColor: "#EF4444",
        content: "Platform-side enforcement is expected to begin progressively after 31 March 2026. Initial actions may include warning notices, reduced visibility, booking restrictions, or full suspension. Timeline and severity vary by platform.",
      },
    ],
    portals: [
      { label: "Airbnb — Host Compliance", url: "https://airbnb.com" },
      { label: "Booking.com — Partner Hub", url: "https://partner.booking.com" },
      { label: "Kemenparekraf — Tourism Registry", url: "https://kemenparekraf.go.id" },
    ],
  },
];

interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  severity: "critical" | "high" | "medium" | "low";
  section: string;
}

const auditSections = [
  {
    num: "SEC-01",
    title: "Entity & Licensing",
    items: [
      { id: "a1", title: "PT PMA deed registered and approved", desc: "SK Kemenkumham approval letter on file with matching company name", severity: "critical" as const },
      { id: "a2", title: "NIB issued and in Verified status", desc: "Check OSS dashboard — 'Issued' alone does not satisfy OTA requirements", severity: "critical" as const },
      { id: "a3", title: "KBLI code matches actual operations", desc: "55193 for commercial villas, 55194 for homestays — review with registrar", severity: "high" as const },
      { id: "a4", title: "KKPR zoning certificate uploaded", desc: "Confirms land parcel is in a permitted tourism zone (pink, orange, or red)", severity: "critical" as const },
      { id: "a5", title: "Legal entity name matches OTA accounts", desc: "Exact character-for-character match required on all platform listings", severity: "high" as const },
    ],
  },
  {
    num: "SEC-02",
    title: "Building & Safety",
    items: [
      { id: "b1", title: "PBG shows Commercial / Pariwisata function", desc: "Residential function blocks TDUP — amendment required via SIMBG", severity: "critical" as const },
      { id: "b2", title: "SLF current and not within 90 days of expiry", desc: "5-year renewal cycle — allow 8-12 weeks for full renewal process", severity: "critical" as const },
      { id: "b3", title: "Fire extinguishers serviced and sealed", desc: "Monthly visual check + annual full service with certificate", severity: "high" as const },
      { id: "b4", title: "Pool chemistry within safe range", desc: "Chlorine 1-3ppm, pH 7.2-7.8 — twice-weekly testing required", severity: "medium" as const },
      { id: "b5", title: "Emergency exit signage (KELUAR) photographed", desc: "Quarterly photo evidence for SOP compliance record", severity: "medium" as const },
    ],
  },
  {
    num: "SEC-03",
    title: "Tax & Employment",
    items: [
      { id: "c1", title: "NPWPD registered with Bapenda", desc: "Required for PB1 (local tourism tax) collection and filing", severity: "critical" as const },
      { id: "c2", title: "PB1 filed by 20th of each month", desc: "10% collected from guests — file SPTPD via e-Palapa Badung", severity: "high" as const },
      { id: "c3", title: "BPJS Kesehatan enrolled for all staff", desc: "4% employer + 1% employee — enrol within 30 days of hiring", severity: "high" as const },
      { id: "c4", title: "BPJS Ketenagakerjaan enrolled for all staff", desc: "Approx 6.24-7.74% employer — payment deadline 10th monthly", severity: "high" as const },
      { id: "c5", title: "Foreign owner KITAS current", desc: "Investor KITAS via BKPM — increased enforcement in Bali since 2024", severity: "critical" as const },
      { id: "c6", title: "THR provisioned for Lebaran 2026", desc: "One month salary — estimated deadline ~March 22, 2026", severity: "medium" as const },
    ],
  },
];

const guideCards = [
  {
    num: "GUIDE-01",
    title: "Zoning Verification",
    role: "Licensed Consultant",
    roleColor: "#14B8A6",
    roleBg: "rgba(20,184,166,0.08)",
    roleBorder: "rgba(20,184,166,0.18)",
    desc: "Verify your land parcel's zone classification at the individual plot level using GISTARU Bali. Pink (pariwisata), orange (mixed-use), and red (commercial) zones are viable for tourism operations.",
    links: [{ label: "GISTARU Bali", url: "https://gistarubali.id" }],
  },
  {
    num: "GUIDE-02",
    title: "NIB Application",
    role: "Business Registrar",
    roleColor: "#60A5FA",
    roleBg: "rgba(59,130,246,0.08)",
    roleBorder: "rgba(59,130,246,0.18)",
    desc: "Apply for NIB through OSS RBA with the correct KBLI code. Ensure the NIB reaches 'Verified' status — 'Issued' alone is insufficient for OTA verification requirements.",
    links: [{ label: "OSS RBA", url: "https://oss.go.id" }],
  },
  {
    num: "GUIDE-03",
    title: "Building Permit Review",
    role: "Licensed Engineer",
    roleColor: "#A78BFA",
    roleBg: "rgba(139,92,246,0.08)",
    roleBorder: "rgba(139,92,246,0.18)",
    desc: "Review PBG function classification. Pre-2021 buildings may hold IMB with Residential function — amendment to Commercial/Pariwisata function required via SIMBG before TDUP application.",
    links: [{ label: "SIMBG", url: "https://simbg.pu.go.id" }],
  },
  {
    num: "GUIDE-04",
    title: "Tax Registration",
    role: "Tax Consultant",
    roleColor: "#F59E0B",
    roleBg: "rgba(245,158,11,0.08)",
    roleBorder: "rgba(245,158,11,0.18)",
    desc: "Register NPWPD with Bapenda for PB1 collection. Set up CoreTax access for national tax obligations. Monthly SPTPD filing and quarterly PPh instalments are ongoing requirements.",
    links: [
      { label: "e-Palapa Badung", url: "https://e-palapa.badungkab.go.id" },
      { label: "DJP Online", url: "https://djponline.pajak.go.id" },
    ],
  },
  {
    num: "GUIDE-05",
    title: "Staff Compliance",
    role: "HR / Immigration",
    roleColor: "#22C55E",
    roleBg: "rgba(34,197,94,0.08)",
    roleBorder: "rgba(34,197,94,0.18)",
    desc: "Enrol all staff in BPJS Kesehatan and Ketenagakerjaan within 30 days of hiring. Foreign operators require Investor KITAS via BKPM. THR bonus must be provisioned before Lebaran.",
    links: [
      { label: "eDabu", url: "https://edabu.bpjs-kesehatan.go.id" },
      { label: "SIPP Online", url: "https://sipp.bpjsketenagakerjaan.go.id" },
    ],
  },
  {
    num: "GUIDE-06",
    title: "OTA Readiness",
    role: "Operations",
    roleColor: "#14B8A6",
    roleBg: "rgba(20,184,166,0.08)",
    roleBorder: "rgba(20,184,166,0.18)",
    desc: "Cross-reference all compliance documents against OTA platform requirements. Ensure legal entity name matches across all listings. Target: all documents current and uploaded before 31 March 2026.",
    links: [{ label: "Kemenparekraf", url: "https://kemenparekraf.go.id" }],
  },
];

const timelineItems = [
  { week: "Weeks 1\u20132", title: "Entity & Foundation", desc: "Complete PT PMA formation, secure corporate NPWP, open bank account with paid-up capital" },
  { week: "Weeks 2\u20134", title: "Zoning & Licensing", desc: "Verify zone status, apply for KKPR, begin NIB application through OSS RBA" },
  { week: "Weeks 3\u20136", title: "Building Compliance", desc: "Review PBG function, initiate amendment if needed, begin SLF process with Pengkaji Teknis" },
  { week: "Weeks 4\u20138", title: "Tax & Employment Setup", desc: "Register NPWPD, set up CoreTax, enrol staff in BPJS, secure KITAS if applicable" },
  { week: "Weeks 6\u201310", title: "Operational Standards", desc: "Establish recurring safety task library, begin SOP evidence collection via DSCVR" },
  { week: "Weeks 8\u201312", title: "OTA Verification", desc: "Cross-reference all documents, submit platform verification, resolve any discrepancies" },
  { week: "By 31 Mar 2026", title: "Full Compliance Target", desc: "All seven gates cleared, documents current, OTA listings verified and protected" },
];

function GateCard({ gate, isOpen, onToggle }: { gate: GateData; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      data-testid={`gate-card-${gate.id}`}
      className={`rounded-[10px] border transition-all duration-200 cursor-pointer ${
        isOpen
          ? "bg-[rgba(13,148,136,0.04)]"
          : ""
      }`}
      style={{
        borderColor: isOpen ? "var(--app-border-teal)" : "var(--app-border)",
        ...(!isOpen ? { background: "var(--app-panel)" } : {}),
      }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between gap-4 p-[18px_22px]">
        <div>
          <div
            className="font-heading text-[9px] font-bold tracking-[2.5px] uppercase mb-[5px]"
            style={{ color: gate.layerColor }}
          >
            {gate.layerLabel}
          </div>
          <div className="font-heading font-extrabold text-[15px] mb-[3px] tracking-[-0.2px]" style={{ color: "var(--app-text)" }}>
            {gate.title}
          </div>
          <div className="text-[12px] font-light italic" style={{ color: "var(--app-text-muted)" }}>{gate.subtitle}</div>
        </div>
        <div className="flex items-center gap-[10px] shrink-0">
          <span
            className="font-heading text-[9px] font-bold tracking-[1px] uppercase py-[4px] px-[10px] rounded whitespace-nowrap"
            style={{
              background: gate.rolePillBg,
              border: `1px solid ${gate.rolePillBorder}`,
              color: gate.rolePillColor,
            }}
          >
            {gate.rolePillText}
          </span>
          <div
            className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[18px] font-light transition-all duration-200 ${
              isOpen ? "rotate-45 text-[#14B8A6]" : ""
            }`}
            style={{
              background: "var(--app-expand-bg)",
              ...(!isOpen ? { color: "var(--app-text-muted)" } : {}),
            }}
          >
            +
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-t px-[22px] pb-[22px]" style={{ borderColor: "var(--app-border)" }}>
              <div className="pt-[18px]">
                <div className="flex items-start gap-3 p-[12px_16px] rounded-[7px] mb-4 bg-[rgba(20,184,166,0.06)] border border-[rgba(20,184,166,0.15)]">
                  <span className="text-[13px] shrink-0 mt-[1px] text-[#14B8A6]">{"\u25C8"}</span>
                  <div className="text-[12px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
                    <strong className="font-heading font-bold text-[#14B8A6] text-[11px] tracking-[0.5px] block mb-[3px]">
                      {gate.dscvrRole}
                    </strong>
                    {gate.dscvrRoleDesc}
                  </div>
                </div>

                {gate.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`flex gap-[10px] items-start p-[11px_14px] rounded-[7px] mb-[14px] text-[13px] leading-[1.65] ${
                      alert.type === "amber"
                        ? "bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.18)]"
                        : alert.type === "red"
                          ? "bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.18)]"
                          : "bg-[rgba(13,148,136,0.06)] border border-[rgba(20,184,166,0.18)] text-[#14B8A6]"
                    }`}
                    style={{
                      color: alert.type === "amber"
                        ? "var(--app-amber-alert-text)"
                        : alert.type === "red"
                          ? "var(--app-red-alert-text)"
                          : undefined,
                    }}
                  >
                    <span className="text-[13px] shrink-0 mt-[2px]">{alert.icon}</span>
                    <span dangerouslySetInnerHTML={{ __html: alert.content }} />
                  </div>
                ))}

                {gate.zones && (
                  <div className="grid grid-cols-3 gap-[7px] mb-[14px] max-md:grid-cols-2">
                    {gate.zones.map((zone) => (
                      <div
                        key={zone.name}
                        className="flex items-center gap-2 p-[8px_10px] rounded-[6px] border"
                        style={{ background: "var(--app-zone-bg)", borderColor: "var(--app-border)" }}
                      >
                        <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: zone.color }} />
                        <div>
                          <span className="font-heading text-[11px] font-bold block" style={{ color: "var(--app-text-bright)" }}>{zone.name}</span>
                          <span className="text-[10px] block" style={{ color: "var(--app-text-muted)" }}>{zone.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-[10px] mb-[14px] max-md:grid-cols-1">
                  {gate.infoBlocks.map((block, i) => (
                    <div
                      key={i}
                      className="rounded-[7px] p-[14px_16px] border-l-2"
                      style={{ background: "var(--app-info-block-bg)", borderLeftColor: block.borderColor }}
                    >
                      <h4 className="font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[9px]" style={{ color: "var(--app-text-muted)" }}>
                        {block.title}
                      </h4>
                      {block.items ? (
                        <ul className="list-disc">
                          {block.items.map((item, j) => (
                            <li
                              key={j}
                              className="text-[13px] leading-[1.65] ml-[14px] mb-[3px] [&_strong]:font-bold"
                              style={{ color: "var(--app-text-secondary)" }}
                              dangerouslySetInnerHTML={{ __html: item }}
                            />
                          ))}
                        </ul>
                      ) : (
                        <p
                          className="text-[13px] leading-[1.65] [&_strong]:font-bold"
                          style={{ color: "var(--app-text-secondary)" }}
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase mb-[9px] mt-[16px]" style={{ color: "var(--app-text-muted)" }}>
                  Government Portals
                </div>
                <div className="flex flex-wrap gap-[7px]">
                  {gate.portals.map((portal) => (
                    <a
                      key={portal.url}
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`portal-link-${gate.id}`}
                      className="inline-flex items-center gap-[6px] text-[12px] font-bold py-[7px] px-[13px] rounded-[5px] no-underline border border-[rgba(20,184,166,0.18)] bg-[rgba(13,148,136,0.06)] text-[#14B8A6] hover-elevate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {"\u2197"} {portal.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Connector() {
  return (
    <div className="h-[28px] flex items-center pl-[36px] relative z-[1]">
      <div className="flex flex-col items-center gap-1">
        <div className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--app-border-teal)" }} />
        <div className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--app-border-teal)" }} />
        <div className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--app-border-teal)" }} />
      </div>
    </div>
  );
}

function NodeButton({ gate, onClick }: { gate: GateData; onClick: () => void }) {
  return (
    <button
      data-testid={`node-btn-${gate.id}`}
      className="w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center transition-transform duration-200 hover:scale-[1.08] shrink-0 cursor-pointer"
      style={{
        background: "var(--app-node-bg)",
        border: gate.isDashed ? `2px dashed ${gate.borderColor}` : `2px solid ${gate.borderColor}`,
        boxShadow: `0 0 18px ${gate.glowColor}`,
      }}
      onClick={onClick}
    >
      <span className="font-heading font-black text-[22px] leading-none tracking-[-0.5px]" style={{ color: gate.color }}>
        {gate.num}
      </span>
      <span className="text-[9px] font-bold tracking-[1.5px] uppercase mt-[3px] opacity-60" style={{ color: gate.borderColor }}>
        {gate.abbr}
      </span>
    </button>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("flow");
  const [openGates, setOpenGates] = useState<Set<string>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Map<string, "checked" | "flagged" | "warn">>(new Map());

  const toggleGate = (id: string) => {
    setOpenGates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cycleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (!current) next.set(id, "checked");
      else if (current === "checked") next.set(id, "flagged");
      else if (current === "flagged") next.set(id, "warn");
      else next.delete(id);
      return next;
    });
  };

  const structuralGates = gates.filter((g) => ["g0", "g1", "g2", "g3"].includes(g.id));
  const parallelGates = gates.filter((g) => ["g4", "g5"].includes(g.id));
  const lateGates = gates.filter((g) => ["g6", "g7"].includes(g.id));

  return (
    <div className="min-h-screen relative z-[1]">
      <header className="sticky top-0 z-[200] flex items-center justify-between px-14 py-4 backdrop-blur-[14px] border-b max-md:px-5" style={{ background: "var(--app-header-bg)", borderColor: "var(--app-border)" }} data-testid="header">
        <div className="font-heading font-black text-[20px] tracking-[2px] text-[#14B8A6]">
          DSCVR
          <span className="font-normal text-[10px] tracking-[3px] block mt-[2px] uppercase" style={{ color: "var(--app-text-muted)" }}>
            Compliance Navigator
          </span>
        </div>
        <div className="inline-flex items-center gap-[7px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.22)] rounded-full py-[6px] px-[14px] font-heading text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "var(--app-red-alert-text)" }} data-testid="deadline-pill">
          <span className="w-[7px] h-[7px] rounded-full bg-[#EF4444] animate-blink shrink-0" />
          OTA Deadline — 31 Mar 2026
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[11px] text-right leading-[1.8] max-md:hidden" style={{ color: "var(--app-text-muted)" }}>
            Bali Villa Operations<br />Seven-Gate Compliance Journey
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="sticky top-[57px] z-[150] backdrop-blur-[14px] border-b px-14 flex max-md:px-5" style={{ background: "var(--app-header-bg)", borderColor: "var(--app-border)" }} data-testid="tab-nav">
        {[
          { id: "flow" as const, label: "\u21B3 Compliance Flow" },
          { id: "audit" as const, label: "\u2299 Self-Audit Checklist" },
          { id: "guide" as const, label: "\u25FB Guidebook" },
        ].map((tab) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            className={`font-heading font-bold text-[11px] tracking-[1.5px] uppercase py-[14px] px-[22px] border-b-2 cursor-pointer transition-all duration-200 mb-[-1px] bg-transparent ${
              activeTab === tab.id
                ? "text-[#14B8A6] border-b-[#14B8A6]"
                : "border-b-transparent hover:text-[#14B8A6]"
            }`}
            style={activeTab !== tab.id ? { color: "var(--app-text-muted)" } : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "flow" && (
        <div>
          <div className="relative z-[5] max-w-[1000px] mx-auto pt-14 pb-11 px-14 max-md:px-5">
            <div className="font-heading text-[10px] font-bold tracking-[4px] uppercase text-[#0D9488] mb-[18px] flex items-center gap-3">
              <span className="block w-[28px] h-[1px] bg-[#0D9488] shrink-0" />
              Interactive compliance reference
            </div>
            <h1 className="font-heading font-black text-[50px] leading-[1.06] tracking-[-1.5px] mb-[18px] max-md:text-[34px]" style={{ color: "var(--app-text)" }}>
              Seven Gates.<br />
              <span className="text-[#14B8A6]">One Legal Path.</span>
            </h1>
            <p className="text-[16px] font-light leading-[1.8] max-w-[580px]" style={{ color: "var(--app-text-secondary)" }}>
              Structural gates are sequential — each blocks the next. Operational streams run concurrently once the entity exists. Click any gate to expand the procedure and open the government portal where it is done.
            </p>

            <div className="mt-9 grid grid-cols-2 border rounded-[10px] overflow-hidden max-md:grid-cols-1" style={{ borderColor: "var(--app-border)" }}>
              <div className="p-[22px_26px] border-r bg-[rgba(20,184,166,0.04)] max-md:border-r-0 max-md:border-b" style={{ borderColor: "var(--app-border)" }}>
                <div className="font-heading text-[9px] font-extrabold tracking-[3px] uppercase text-[#14B8A6] mb-[14px]">
                  DSCVR Tracks
                </div>
                {["Licence documents and expiry dates", "Permit inspection schedules", "Staff documentation and permit status", "Safety compliance task logs", "SOP execution evidence", "Filing calendar alerts"].map((item) => (
                  <div key={item} className="flex items-start gap-[10px] mb-2 text-[13px] leading-[1.5]" style={{ color: "var(--app-text-secondary)" }}>
                    <span className="w-[5px] h-[5px] rounded-full bg-[#14B8A6] shrink-0 mt-[6px]" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="p-[22px_26px] bg-[rgba(239,68,68,0.03)]">
                <div className="font-heading text-[9px] font-extrabold tracking-[3px] uppercase mb-[14px]" style={{ color: "var(--app-red-alert-text)" }}>
                  DSCVR Does Not
                </div>
                {["Interpret zoning or legal status", "Provide legal or tax advice", "Validate corporate structures", "File returns or submissions", "Certify compliance status", "Replace licensed professionals"].map((item) => (
                  <div key={item} className="flex items-start gap-[10px] mb-2 text-[13px] leading-[1.5]" style={{ color: "var(--app-text-secondary)" }}>
                    <span className="w-[5px] h-[5px] rounded-full shrink-0 mt-[6px]" style={{ background: "var(--app-red-alert-text)" }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex mt-6 border rounded-[10px] overflow-hidden max-md:flex-col" style={{ borderColor: "var(--app-border)" }} data-testid="stats-row">
              {[
                { n: "7", l: "Compliance layers" },
                { n: "8\u201314wk", l: "Estimated full timeline" },
                { n: "5yr", l: "SLF renewal cycle" },
                { n: "31 Mar", l: "OTA verification deadline" },
              ].map((stat, i) => (
                <div key={i} className={`flex-1 p-[18px_22px] ${i < 3 ? "border-r max-md:border-r-0 max-md:border-b" : ""}`} style={i < 3 ? { borderColor: "var(--app-border)" } : undefined}>
                  <div className="font-heading font-black text-[26px] text-[#14B8A6] leading-none mb-[5px] tracking-[-0.5px]">{stat.n}</div>
                  <div className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>{stat.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-[5] max-w-[1000px] mx-auto px-14 pb-20 max-md:px-5">
            <div className="absolute left-[calc(3.5rem+36px)] top-0 bottom-20 w-[1px] bg-gradient-to-b from-[rgba(20,184,166,0.5)] via-[rgba(20,184,166,0.2)] to-transparent z-0 max-md:left-[calc(1.25rem+36px)]" />

            <div className="grid grid-cols-[72px_1fr] gap-x-5 items-center mb-[10px] mt-2 relative z-[2]">
              <div />
              <div>
                <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--app-text-muted)" }}>
                  Foundation — required before all gates
                </div>
                <div className="h-[1px] bg-gradient-to-r from-[rgba(100,116,139,0.3)] to-transparent" />
              </div>
            </div>

            {structuralGates.map((gate, i) => (
              <div key={gate.id}>
                <div className="relative z-[2] mb-[6px]">
                  <div className="grid grid-cols-[72px_1fr] gap-x-5 items-start">
                    <NodeButton gate={gate} onClick={() => toggleGate(gate.id)} />
                    <GateCard gate={gate} isOpen={openGates.has(gate.id)} onToggle={() => toggleGate(gate.id)} />
                  </div>
                </div>
                {i < structuralGates.length - 1 && <Connector />}
                {i === 0 && (
                  <>
                    <Connector />
                    <div className="grid grid-cols-[72px_1fr] gap-x-5 items-center mb-[10px] relative z-[2]">
                      <div />
                      <div>
                        <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--app-text-muted)" }}>
                          Structural gates — sequential, each blocks the next
                        </div>
                        <div className="h-[1px] bg-gradient-to-r from-[rgba(100,116,139,0.3)] to-transparent" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            <Connector />

            <div className="grid grid-cols-[72px_1fr] gap-x-5 items-center mb-[10px] relative z-[2]">
              <div />
              <div>
                <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--app-text-muted)" }}>
                  Operational streams — run concurrently once entity is established
                </div>
                <div className="h-[1px] bg-gradient-to-r from-[rgba(100,116,139,0.3)] to-transparent" />
              </div>
            </div>

            <div className="grid grid-cols-[72px_1fr] gap-x-5 items-start mb-[6px] relative z-[2]">
              <div className="flex flex-col items-center gap-[10px] pt-2">
                {parallelGates.map((gate) => (
                  <NodeButton key={gate.id} gate={gate} onClick={() => toggleGate(gate.id)} />
                ))}
              </div>
              <div>
                {parallelGates.map((gate, i) => (
                  <div key={gate.id}>
                    <div className="font-heading text-[9px] font-bold tracking-[2.5px] uppercase text-[#F59E0B] py-[4px_0_8px] flex items-center gap-2 mb-1">
                      <span className="block w-[20px] h-[1px] bg-[rgba(245,158,11,0.4)]" />
                      {i === 0 ? "Tax compliance — concurrent stream" : "Staff compliance — concurrent stream"}
                    </div>
                    <div className={i === 0 ? "mb-[10px]" : ""}>
                      <GateCard gate={gate} isOpen={openGates.has(gate.id)} onToggle={() => toggleGate(gate.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Connector />

            {lateGates.map((gate, i) => (
              <div key={gate.id}>
                <div className="relative z-[2] mb-[6px]">
                  <div className="grid grid-cols-[72px_1fr] gap-x-5 items-start">
                    <NodeButton gate={gate} onClick={() => toggleGate(gate.id)} />
                    <GateCard gate={gate} isOpen={openGates.has(gate.id)} onToggle={() => toggleGate(gate.id)} />
                  </div>
                </div>
                {i < lateGates.length - 1 && <Connector />}
              </div>
            ))}

            <div className="mt-[10px] ml-[92px] max-md:ml-0">
              <div className="bg-gradient-to-br from-[rgba(13,148,136,0.09)] to-[rgba(34,197,94,0.05)] border rounded-[10px] p-[26px_30px] flex items-center gap-[22px]" style={{ borderColor: "var(--app-border-teal)" }}>
                <span className="text-[32px] shrink-0">{"\u2713"}</span>
                <div>
                  <div className="font-heading font-black text-[17px] text-[#14B8A6] tracking-[-0.2px] mb-[5px]">
                    Fully Compliant — OTA-Ready
                  </div>
                  <div className="text-[13px] font-light leading-[1.7] italic" style={{ color: "var(--app-text-muted)" }}>
                    When all seven gates are cleared and documents remain current, the property is positioned for OTA verification and ongoing operational compliance under Indonesian tourism regulations.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 ml-[92px] pl-5 border-l-2 border-l-[rgba(100,116,139,0.25)] text-[12px] font-light leading-[1.7] italic max-md:ml-0" style={{ color: "var(--app-text-muted)" }}>
              This compliance navigator is an operational reference tool. It does not constitute legal, tax, or regulatory advice. All regulatory interpretations, filings, and submissions should be managed by appropriately licensed Indonesian professionals. Timelines, costs, and requirements are indicative and subject to change.
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div>
          <div className="relative z-[5] max-w-[1000px] mx-auto pt-14 pb-11 px-14 max-md:px-5">
            <div className="font-heading text-[10px] font-bold tracking-[4px] uppercase text-[#0D9488] mb-[18px] flex items-center gap-3">
              <span className="block w-[28px] h-[1px] bg-[#0D9488] shrink-0" />
              Pre-verification audit
            </div>
            <h1 className="font-heading font-black text-[50px] leading-[1.06] tracking-[-1.5px] mb-[18px] max-md:text-[34px]" style={{ color: "var(--app-text)" }}>
              Self-Audit<br />
              <span className="text-[#14B8A6]">Checklist.</span>
            </h1>
            <p className="text-[16px] font-light leading-[1.8] max-w-[580px]" style={{ color: "var(--app-text-secondary)" }}>
              Click each item to cycle through status: unchecked {"\u2192"} compliant {"\u2192"} flagged {"\u2192"} needs attention {"\u2192"} unchecked. Use this to track your pre-verification readiness across all compliance layers.
            </p>
          </div>

          <div className="relative z-[5] max-w-[1000px] mx-auto px-14 pb-20 max-md:px-5">
            <div className="flex gap-[10px] items-start p-[20px_24px] rounded-[10px] mb-10 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)]" data-testid="audit-alert">
              <span className="text-[28px] shrink-0">{"\u26A0"}</span>
              <div>
                <h2 className="font-heading font-extrabold text-[18px] mb-[6px] tracking-[-0.2px]" style={{ color: "var(--app-text)" }}>
                  OTA Verification Deadline: 31 March 2026
                </h2>
                <p className="text-[13px] font-light leading-[1.7]" style={{ color: "var(--app-text-secondary)" }}>
                  All items marked as Critical must be resolved before platform verification submission. High-severity items should be addressed within the current compliance cycle. Non-compliance with critical items risks listing suspension.
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-7 p-[14px_18px] border rounded-[8px] flex-wrap" style={{ background: "var(--app-expand-bg)", borderColor: "var(--app-border)" }} data-testid="audit-legend">
              {[
                { color: "#22C55E", label: "Compliant" },
                { color: "#EF4444", label: "Flagged" },
                { color: "#F59E0B", label: "Needs attention" },
                { color: "#64748B", label: "Not checked" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-[7px] text-[12px]" style={{ color: "var(--app-text-secondary)" }}>
                  <div className="w-[10px] h-[10px] rounded-[3px] shrink-0" style={{ background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>

            {auditSections.map((section) => (
              <div key={section.num}>
                <div className="font-heading font-extrabold text-[13px] text-[#14B8A6] tracking-[0.3px] mb-[14px] pb-[10px] border-b flex items-center gap-[10px]" style={{ borderColor: "rgba(20,184,166,0.12)" }}>
                  <span className="font-heading text-[9px] font-bold tracking-[2px] bg-[rgba(13,148,136,0.12)] border border-[rgba(20,184,166,0.2)] text-[#0D9488] py-[3px] px-[9px] rounded uppercase">
                    {section.num}
                  </span>
                  {section.title}
                </div>
                <ul className="list-none mb-8">
                  {section.items.map((item) => {
                    const status = checkedItems.get(item.id);
                    return (
                      <li
                        key={item.id}
                        data-testid={`checklist-item-${item.id}`}
                        className={`grid grid-cols-[22px_1fr_auto] gap-3 items-start p-[13px_16px] rounded-[8px] mb-1 border cursor-pointer transition-colors duration-150 ${
                          status === "checked"
                            ? "bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.14)]"
                            : status === "flagged"
                              ? "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.14)]"
                              : status === "warn"
                                ? "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.14)]"
                                : "border-[rgba(226,232,240,0.06)] hover:bg-[rgba(255,255,255,0.035)]"
                        }`}
                        style={!status ? { background: "var(--app-expand-bg)" } : undefined}
                        onClick={() => cycleCheck(item.id)}
                      >
                        <div
                          className={`w-[20px] h-[20px] rounded flex items-center justify-center text-[11px] shrink-0 mt-[1px] transition-all duration-150 font-bold ${
                            status === "checked"
                              ? "bg-[#22C55E] border-[#22C55E] text-white"
                              : status === "flagged"
                                ? "bg-[#EF4444] border-[#EF4444] text-white"
                                : status === "warn"
                                  ? "bg-[#F59E0B] border-[#F59E0B] text-white"
                                  : "border-[1.5px] border-[#64748B]"
                          }`}
                        >
                          {status === "checked" ? "\u2713" : status === "flagged" ? "\u2717" : status === "warn" ? "!" : ""}
                        </div>
                        <div>
                          <div className="font-heading font-bold text-[13px] mb-[3px] tracking-[-0.1px]" style={{ color: "var(--app-text)" }}>
                            {item.title}
                          </div>
                          <div className="text-[12px] font-light leading-[1.55]" style={{ color: "var(--app-text-muted)" }}>{item.desc}</div>
                        </div>
                        <span
                          className={`font-heading text-[9px] font-bold tracking-[1px] py-[3px] px-[8px] rounded shrink-0 self-start mt-[2px] uppercase ${
                            item.severity === "critical"
                              ? "bg-[rgba(239,68,68,0.12)]"
                              : item.severity === "high"
                                ? "bg-[rgba(245,158,11,0.12)]"
                                : item.severity === "medium"
                                  ? "bg-[rgba(20,184,166,0.12)] text-[#14B8A6]"
                                  : "bg-[rgba(148,163,184,0.12)]"
                          }`}
                          style={{
                            color: item.severity === "critical"
                              ? "var(--app-red-alert-text)"
                              : item.severity === "high"
                                ? "var(--app-amber-alert-text)"
                                : item.severity === "low"
                                  ? "var(--app-text-secondary)"
                                  : undefined,
                          }}
                        >
                          {item.severity}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-8 pl-5 border-l-2 border-l-[rgba(100,116,139,0.25)] text-[12px] font-light leading-[1.7] italic" style={{ color: "var(--app-text-muted)" }}>
              This checklist is an operational self-assessment tool. Completion does not constitute legal certification of compliance. All regulatory assessments, submissions, and verifications should be conducted by appropriately licensed professionals.
            </div>
          </div>
        </div>
      )}

      {activeTab === "guide" && (
        <div>
          <div className="relative z-[5] max-w-[1000px] mx-auto pt-14 pb-11 px-14 max-md:px-5">
            <div className="font-heading text-[10px] font-bold tracking-[4px] uppercase text-[#0D9488] mb-[18px] flex items-center gap-3">
              <span className="block w-[28px] h-[1px] bg-[#0D9488] shrink-0" />
              Compliance reference library
            </div>
            <h1 className="font-heading font-black text-[50px] leading-[1.06] tracking-[-1.5px] mb-[18px] max-md:text-[34px]" style={{ color: "var(--app-text)" }}>
              Operator<br />
              <span className="text-[#14B8A6]">Guidebook.</span>
            </h1>
            <p className="text-[16px] font-light leading-[1.8] max-w-[580px]" style={{ color: "var(--app-text-secondary)" }}>
              Quick-reference cards covering each compliance area with direct links to the relevant government portals and indicative timelines for the full compliance journey.
            </p>
          </div>

          <div className="relative z-[5] max-w-[1000px] mx-auto px-14 pb-20 max-md:px-5">
            <div className="grid grid-cols-2 gap-[14px] mb-12 max-md:grid-cols-1">
              {guideCards.map((card) => (
                <div
                  key={card.num}
                  data-testid={`guide-card-${card.num}`}
                  className="border rounded-[10px] p-[22px_24px] transition-transform duration-200 block no-underline hover:-translate-y-[2px] hover-elevate"
                  style={{ background: "var(--app-panel)", borderColor: "var(--app-border)" }}
                >
                  <div className="font-heading text-[9px] font-bold tracking-[2.5px] uppercase text-[#0D9488] mb-[10px]">
                    {card.num}
                  </div>
                  <div className="font-heading font-extrabold text-[15px] mb-2 tracking-[-0.2px]" style={{ color: "var(--app-text)" }}>
                    {card.title}
                  </div>
                  <span
                    className="font-heading text-[9px] font-bold tracking-[1.5px] uppercase mb-[10px] py-[4px] px-[9px] rounded inline-block"
                    style={{
                      color: card.roleColor,
                      background: card.roleBg,
                      border: `1px solid ${card.roleBorder}`,
                    }}
                  >
                    {card.role}
                  </span>
                  <div className="text-[13px] font-light leading-[1.65] mb-4" style={{ color: "var(--app-text-secondary)" }}>{card.desc}</div>
                  <div className="flex flex-wrap gap-[6px]">
                    {card.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-[5px] text-[11px] font-bold py-[5px] px-[10px] rounded no-underline text-[#14B8A6] bg-[rgba(13,148,136,0.08)] border border-[rgba(20,184,166,0.15)] hover-elevate"
                      >
                        {"\u2197"} {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <GlossarySection />

            <div className="mb-12">
              <ProcessNavigation />
            </div>

            <div className="mb-12">
              <h3 className="font-heading font-extrabold text-[16px] text-[#14B8A6] mb-6 pb-[10px] border-b tracking-[-0.2px]" style={{ borderColor: "rgba(20,184,166,0.12)" }}>
                Indicative Compliance Timeline
              </h3>
              <div className="relative pl-8">
                <div className="absolute left-[8px] top-[8px] bottom-[8px] w-[1px] bg-gradient-to-b from-[#0D9488] to-[rgba(13,148,136,0.1)]" />
                {timelineItems.map((item, i) => (
                  <div key={i} className="relative mb-[26px]">
                    <div className="absolute left-[-28px] top-[5px] w-[11px] h-[11px] rounded-full border-[1.5px] border-[#0D9488]" style={{ background: "var(--app-node-bg)" }} />
                    <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#0D9488] mb-1">
                      {item.week}
                    </div>
                    <div className="font-heading font-bold text-[14px] mb-[5px] tracking-[-0.1px]" style={{ color: "var(--app-text)" }}>
                      {item.title}
                    </div>
                    <div className="text-[13px] font-light leading-[1.6]" style={{ color: "var(--app-text-muted)" }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pl-5 border-l-2 border-l-[rgba(100,116,139,0.25)] text-[12px] font-light leading-[1.7] italic" style={{ color: "var(--app-text-muted)" }}>
              This guidebook is an operational reference tool for villa operators in Bali. It does not constitute legal, tax, immigration, or regulatory advice. All timelines and cost estimates are indicative and subject to change. Engage appropriately licensed Indonesian professionals for all regulatory matters.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
