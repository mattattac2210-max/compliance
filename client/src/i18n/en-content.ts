import type { ContentTranslations } from "./types";

export const enContent: ContentTranslations = {
  gates: [
    {
      layerLabel: "Prerequisite",
      title: "Legal Entity — PT PMA",
      subtitle: "Company formation must be complete before any licence application",
      rolePillText: "Document storage only",
      dscvrRole: "DSCVR Role — Document Storage",
      dscvrRoleDesc: "DSCVR stores the completed company deed, SK Kemenkumham approval, corporate NPWP, and bank confirmation. PT PMA formation requires a licensed Indonesian notary — DSCVR does not advise on structure or corporate law.",
      alerts: [
        {
          content: "<strong>Regulatory exposure risk.</strong> Using Indonesian nationals to hold shares on behalf of a foreign owner carries significant regulatory exposure for both parties and has faced increased scrutiny since 2024. PT PMA with 100% foreign ownership is the documented, low-risk structure for KBLI 55193.",
        },
      ],
      infoBlocks: [
        {
          title: "Steps Completed Externally",
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
          content: "Estimated 4\u20138 weeks from deed to NIB + bank account. Professional fees: estimated IDR 30\u201380M. Costs vary by provider. Minimum paid-up capital: IDR 2.5B (BKPM Reg 5/2025).",
        },
      ],
      portals: [
        { label: "AHU Online — Company Name & Deed" },
        { label: "OSS RBA — Business Registration" },
        { label: "DJP — Corporate NPWP" },
      ],
    },
    {
      layerLabel: "Layer One — Structural",
      title: "Zoning Documentation — KKPR",
      subtitle: "Missing or unverified zone documentation puts all downstream gates at risk",
      rolePillText: "Document + map upload",
      dscvrRole: "DSCVR Role — Document Upload & Status Tracking",
      dscvrRoleDesc: "DSCVR stores the KKPR certificate, records zone classification as operator-reported, and flags when a KBLI change may require a new KKPR. DSCVR does not determine legal zone status — that rests with a licensed consultant and the relevant DPMPTSP.",
      alerts: [
        {
          content: "Markets including Canggu and Pererenan contain both pink (pariwisata) and yellow (residential) zones in close proximity. Zone status must be verified at the individual land parcel level, not at suburb or street level.",
        },
      ],
      zones: [
        { name: "Pink", status: "\u2191 Pariwisata — proceed" },
        { name: "Orange", status: "\u2191 Mixed-use — conditional" },
        { name: "Red", status: "\u2191 Commercial — viable" },
        { name: "Yellow", status: "\u2193 Residential — high risk" },
        { name: "Green", status: "\u2193 Agricultural — high risk" },
        { name: "Konservasi", status: "\u2193 Conservation — high risk" },
      ],
      infoBlocks: [
        {
          title: "KKPR — What It Is",
          content: "Zoning conformity certificate via OSS \u2192 DPMPTSP. Confirms land use aligns with stated KBLI. Estimated timeline: 2\u20136 weeks. No government application fee. OSS cross-checks RDTR automatically on submission.",
        },
        {
          title: "Zone Conversion Risk Note",
          content: "Services promising to convert agricultural or residential zoning face significant regulatory hurdles and extended timelines with no guaranteed outcome. Independent legal advice recommended before proceeding on this basis.",
        },
      ],
      portals: [
        { label: "GISTARU Bali — Official Zone Map" },
        { label: "OSS RBA — KKPR Application" },
        { label: "RDTR ATR/BPN — National Spatial Reference" },
      ],
    },
    {
      layerLabel: "Layer Two — Structural",
      title: "Business Licensing — NIB + KBLI",
      subtitle: "NIB must reach Verified status — Issued alone does not pass OTA verification",
      rolePillText: "Licence expiry tracking",
      dscvrRole: "DSCVR Role — NIB Status Monitoring",
      dscvrRoleDesc: "DSCVR stores the NIB certificate, tracks displayed status (Issued / Verified / Suspended), and alerts when documents supporting verification approach expiry. DSCVR does not submit to OSS or advise on KBLI selection — consult a licensed business registration specialist.",
      alerts: [
        {
          content: "<strong>Identity consistency requirement.</strong> The legal entity name registered in OSS must match the account name on every OTA listing exactly. A mismatch — even minor formatting — triggers a verification failure regardless of underlying licence status.",
        },
      ],
      infoBlocks: [
        {
          title: "Relevant KBLI Codes",
          content: "",
          items: [
            "<strong>55193</strong> — Villa (commercial, staffed, 4+ beds)",
            "<strong>55194</strong> — Pondok Wisata (smaller homestay scale)",
            "<strong>55199</strong> — Catch-all: OSS increasingly flagging for large commercial villas. Review with registrar.",
          ],
        },
        {
          title: "KBLI 2025 — Transition Note",
          content: "BPS published KBLI 2025 in December 2025, replacing KBLI 2020. A transition window applies to existing registrations. Operators should confirm status with their OSS consultant. DSCVR will flag this as a tracking event.",
        },
      ],
      portals: [
        { label: "OSS RBA — NIB Application & Status" },
        { label: "BPS — KBLI 2025 Classification" },
        { label: "BKPM — Investment Coordinating Board" },
      ],
    },
    {
      layerLabel: "Layer Three — Structural",
      title: "Building Compliance — PBG + SLF",
      subtitle: "SLF expiry is the most common cause of sudden NIB status change — 5-year renewal cycle",
      rolePillText: "Inspection reminders",
      dscvrRole: "DSCVR Role — Expiry Tracking + Renewal Reminders",
      dscvrRoleDesc: "DSCVR stores the SLF certificate, tracks the expiry date, and issues alerts at 90 / 60 / 30 / 14 days before expiry. Renewal requires a licensed Pengkaji Teknis and DPMPTSP submission — DSCVR does not manage that process.",
      alerts: [
        {
          content: "A significant portion of pre-2021 Bali villa stock holds a PBG or IMB with <strong>Residential function</strong> — the most common structural licensing blocker. Amendment requires as-built drawings from a licensed engineer. Estimated cost: IDR 10\u201350M. Estimated timeline: 4\u201312 weeks.",
        },
      ],
      infoBlocks: [
        {
          title: "PBG Function Requirement",
          content: "Must read: <strong>Commercial / Pariwisata / Non-Residential</strong>. Residential function blocks TDUP and NIB Verified status. Applied or amended via SIMBG. IMBs issued before 2021 must be reviewed.",
        },
        {
          title: "SLF Renewal — Estimated Timeline",
          content: "Commercial SLF valid <strong>5 years</strong>. Allow 8\u201312 weeks for the full renewal cycle: Pengkaji Teknis, pre-inspection prep, formal inspection, any remediation, DPMPTSP processing (est. 14\u201345 days).",
        },
      ],
      portals: [
        { label: "SIMBG — PBG & SLF Submission" },
        { label: "OSS RBA — Building Compliance" },
        { label: "DPMPTSP Badung — Permit Office" },
      ],
    },
    {
      layerLabel: "Layer Four — Operational Stream",
      title: "Tax — PB1 / NPWPD / PPh",
      subtitle: "Begins concurrently with NIB issuance — not downstream of building compliance",
      rolePillText: "Filing calendar + storage",
      dscvrRole: "DSCVR Role — Filing Calendar + Document Storage",
      dscvrRoleDesc: "DSCVR maintains a tax obligation calendar, stores NPWPD registration and SPTPD filing confirmations. DSCVR does not prepare returns, advise on tax positions, or interpret tax law. Engage a licensed Indonesian tax consultant.",
      alerts: [
        {
          content: "<strong>Data matching risk (CoreTax, live from Jan 2025).</strong> Indonesia's CoreTax system is reported to cross-reference OTA booking revenue against PB1 filings. Significant discrepancies may generate audit attention. Confirm the extent of OTA data sharing with your tax consultant.",
        },
      ],
      infoBlocks: [
        {
          title: "Monthly PB1 — Badung",
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
        { label: "e-Palapa Badung — NPWPD & SPTPD" },
        { label: "DJP Online — PPh Filing" },
        { label: "CoreTax — Tax Administration" },
        { label: "Bapenda Badung — Regional Revenue" },
      ],
    },
    {
      layerLabel: "Layer Five — Operational Stream",
      title: "Staff & Employment Compliance",
      subtitle: "Runs concurrently — does not wait for building or tax gate completion",
      rolePillText: "Permit + contract tracking",
      dscvrRole: "DSCVR Role — Staff Profiles + Permit Expiry Tracking",
      dscvrRoleDesc: "DSCVR maintains a staff profile per employee, stores BPJS registration, employment contracts, and KITAS documents with expiry alerts. DSCVR does not advise on employment law, immigration applications, or contribution calculations.",
      alerts: [
        {
          content: "<strong>KITAS exposure risk.</strong> Foreign nationals managing villa operations without a valid Investor KITAS carry significant immigration exposure — increased enforcement attention in Bali since 2024. Estimated cost: IDR 3\u20138M per year via BKPM or licensed agent.",
        },
      ],
      infoBlocks: [
        {
          title: "BPJS Indicative Rates",
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
          content: "Mandatory one-month salary bonus for all employees. Indicative legal deadline: 7 days before Lebaran (estimated ~March 22, 2026). Applies to all staff regardless of role. Confirm exact date annually.",
        },
      ],
      portals: [
        { label: "eDabu — BPJS Kesehatan" },
        { label: "SIPP Online — BPJamsostek" },
        { label: "Ditjen Imigrasi — KITAS" },
        { label: "BKPM — Investor KITAS" },
      ],
    },
    {
      layerLabel: "Layer Six — Operational Stream",
      title: "Operational Safety — Ongoing Standards",
      subtitle: "Permenpar 6/2025 requires written SOPs — the task library with timestamps is the evidence",
      rolePillText: "Task execution + logs",
      dscvrRole: "DSCVR Role — Task Execution + Evidence Logs",
      dscvrRoleDesc: "This is where DSCVR is most operationally native. Recurring tasks, completed checklists, and PoP-timestamped photos generate the evidence trail that functions as the SOP record required under Permenpar 6/2025.",
      alerts: [
        {
          content: "Permenpar 6/2025 requires documented SOPs for check-in, check-out, housekeeping, maintenance, and emergency response. A task library with completion timestamps constitutes the documented SOP evidence during an inspection.",
        },
      ],
      infoBlocks: [
        {
          title: "Recurring Safety Tasks",
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
          content: "SLF renewal inspects structural, electrical, fire, plumbing, pool, and ventilation. Properties running active DSCVR safety task logs are better positioned for pre-inspection preparation, surfacing recurring issues before a formal inspection is triggered.",
        },
      ],
      portals: [
        { label: "JDIH Kemenparekraf — Permenpar 6/2025" },
        { label: "Dinas Damkar Badung — Fire Safety" },
      ],
    },
    {
      layerLabel: "Layer Seven — Verification Gate",
      title: "OTA Verification — Platform Compliance",
      subtitle: "Deadline 31 March 2026 — requires all upstream gates to be in order",
      rolePillText: "Compliance check",
      dscvrRole: "DSCVR Role — Readiness Assessment",
      dscvrRoleDesc: "DSCVR cross-references all uploaded documents against OTA verification requirements and generates a readiness report. DSCVR does not submit verification applications or guarantee OTA approval — the operator manages platform-side submissions directly.",
      alerts: [
        {
          content: "<strong>31 March 2026 deadline.</strong> OTA platforms (Airbnb, Booking.com, Agoda, Traveloka) are expected to begin enforcement of Permenparekraf verification requirements. Non-compliant listings risk suspension or delisting.",
        },
      ],
      infoBlocks: [
        {
          title: "OTA Verification Requirements",
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
          content: "Platform-side enforcement is expected to begin progressively after 31 March 2026. Initial actions may include warning notices, reduced visibility, booking restrictions, or full suspension. Timeline and severity vary by platform.",
        },
      ],
      portals: [
        { label: "Airbnb — Host Compliance" },
        { label: "Booking.com — Partner Hub" },
        { label: "Kemenparekraf — Tourism Registry" },
      ],
    },
  ],
  auditSections: [
    {
      title: "Entity & Licensing",
      items: [
        { title: "PT PMA deed registered and approved", desc: "SK Kemenkumham approval letter on file with matching company name" },
        { title: "NIB issued and in Verified status", desc: "Check OSS dashboard — 'Issued' alone does not satisfy OTA requirements" },
        { title: "KBLI code matches actual operations", desc: "55193 for commercial villas, 55194 for homestays — review with registrar" },
        { title: "KKPR zoning certificate uploaded", desc: "Confirms land parcel is in a permitted tourism zone (pink, orange, or red)" },
        { title: "Legal entity name matches OTA accounts", desc: "Exact character-for-character match required on all platform listings" },
      ],
    },
    {
      title: "Building & Safety",
      items: [
        { title: "PBG shows Commercial / Pariwisata function", desc: "Residential function blocks TDUP — amendment required via SIMBG" },
        { title: "SLF current and not within 90 days of expiry", desc: "5-year renewal cycle — allow 8-12 weeks for full renewal process" },
        { title: "Fire extinguishers serviced and sealed", desc: "Monthly visual check + annual full service with certificate" },
        { title: "Pool chemistry within safe range", desc: "Chlorine 1-3ppm, pH 7.2-7.8 — twice-weekly testing required" },
        { title: "Emergency exit signage (KELUAR) photographed", desc: "Quarterly photo evidence for SOP compliance record" },
      ],
    },
    {
      title: "Tax & Employment",
      items: [
        { title: "NPWPD registered with Bapenda", desc: "Required for PB1 (local tourism tax) collection and filing" },
        { title: "PB1 filed by 20th of each month", desc: "10% collected from guests — file SPTPD via e-Palapa Badung" },
        { title: "BPJS Kesehatan enrolled for all staff", desc: "4% employer + 1% employee — enrol within 30 days of hiring" },
        { title: "BPJS Ketenagakerjaan enrolled for all staff", desc: "Approx 6.24-7.74% employer — payment deadline 10th monthly" },
        { title: "Foreign owner KITAS current", desc: "Investor KITAS via BKPM — increased enforcement in Bali since 2024" },
        { title: "THR provisioned for Lebaran 2026", desc: "One month salary — estimated deadline ~March 22, 2026" },
      ],
    },
  ],
  guideCards: [
    {
      title: "Zoning Verification",
      role: "Licensed Consultant",
      desc: "Verify your land parcel's zone classification at the individual plot level using GISTARU Bali. Pink (pariwisata), orange (mixed-use), and red (commercial) zones are viable for tourism operations.",
      links: [{ label: "GISTARU Bali" }],
    },
    {
      title: "NIB Application",
      role: "Business Registrar",
      desc: "Apply for NIB through OSS RBA with the correct KBLI code. Ensure the NIB reaches 'Verified' status — 'Issued' alone is insufficient for OTA verification requirements.",
      links: [{ label: "OSS RBA" }],
    },
    {
      title: "Building Permit Review",
      role: "Licensed Engineer",
      desc: "Review PBG function classification. Pre-2021 buildings may hold IMB with Residential function — amendment to Commercial/Pariwisata function required via SIMBG before TDUP application.",
      links: [{ label: "SIMBG" }],
    },
    {
      title: "Tax Registration",
      role: "Tax Consultant",
      desc: "Register NPWPD with Bapenda for PB1 collection. Set up CoreTax access for national tax obligations. Monthly SPTPD filing and quarterly PPh instalments are ongoing requirements.",
      links: [{ label: "e-Palapa Badung" }, { label: "DJP Online" }],
    },
    {
      title: "Staff Compliance",
      role: "HR / Immigration",
      desc: "Enrol all staff in BPJS Kesehatan and Ketenagakerjaan within 30 days of hiring. Foreign operators require Investor KITAS via BKPM. THR bonus must be provisioned before Lebaran.",
      links: [{ label: "eDabu" }, { label: "SIPP Online" }],
    },
    {
      title: "OTA Readiness",
      role: "Operations",
      desc: "Cross-reference all compliance documents against OTA platform requirements. Ensure legal entity name matches across all listings. Target: all documents current and uploaded before 31 March 2026.",
      links: [{ label: "Kemenparekraf" }],
    },
  ],
  timelineItems: [
    { week: "Weeks 1\u20132", title: "Entity & Foundation", desc: "Complete PT PMA formation, secure corporate NPWP, open bank account with paid-up capital" },
    { week: "Weeks 2\u20134", title: "Zoning & Licensing", desc: "Verify zone status, apply for KKPR, begin NIB application through OSS RBA" },
    { week: "Weeks 3\u20136", title: "Building Compliance", desc: "Review PBG function, initiate amendment if needed, begin SLF process with Pengkaji Teknis" },
    { week: "Weeks 4\u20138", title: "Tax & Employment Setup", desc: "Register NPWPD, set up CoreTax, enrol staff in BPJS, secure KITAS if applicable" },
    { week: "Weeks 6\u201310", title: "Operational Standards", desc: "Establish recurring safety task library, begin SOP evidence collection via DSCVR" },
    { week: "Weeks 8\u201312", title: "OTA Verification", desc: "Cross-reference all documents, submit platform verification, resolve any discrepancies" },
    { week: "By 31 Mar 2026", title: "Full Compliance Target", desc: "All seven gates cleared, documents current, OTA listings verified and protected" },
  ],
};
