import { db } from "./db";
import { eq } from "drizzle-orm";
import { complianceTerms, processNavigationGuides } from "@shared/schema";
import { termTranslationsMap, guideTranslationsMap } from "./seed-translations";

const seedTerms = [
  {
    term: "Wet Signature",
    slug: "wet-signature",
    plainDefinition: "A physical signature made with pen on a printed document (not a digital signature).",
    whyItMatters: [
      "Many Indonesian government offices require paper signatures for verification",
      "Digital signatures may be rejected for certain official filings"
    ],
    typicalProcessSteps: [
      "Download/export the form or document (PDF)",
      "Print it",
      "Sign with pen (director/authorized signatory)",
      "Apply company stamp if required",
      "Scan or photograph clearly",
      "Upload to DSCVR and attach to the relevant compliance item"
    ],
    whatToStore: [
      "Signed PDF scan",
      "Photo of signature page if needed"
    ],
    commonPitfalls: [
      "Low-quality scans that are hard to read",
      "Missing signature page",
      "Wrong signatory (must be authorised director)"
    ],
    synonyms: ["physical signature", "ink signature", "manual signature"],
    tags: ["Signatures", "Documents"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["wet-signature"],
  },
  {
    term: "Company Stamp / Chop",
    slug: "company-stamp-chop",
    plainDefinition: "A company seal or stamp used to authenticate official documents issued by the business.",
    whyItMatters: [
      "Often requested by government agencies to confirm documents are officially issued by the business",
      "May be required alongside signatures on contracts and filings"
    ],
    typicalProcessSteps: [
      "Print document",
      "Apply stamp where indicated (often near signature)",
      "Scan and upload"
    ],
    whatToStore: [
      "Scanned stamped document",
      "Photo evidence if required"
    ],
    commonPitfalls: [
      "Using the wrong stamp (e.g. old company name)",
      "Stamping over key text making it unreadable"
    ],
    synonyms: ["company seal", "chop", "corporate stamp"],
    tags: ["Signatures", "Documents"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["company-stamp-chop"],
  },
  {
    term: "Notarised Document",
    slug: "notarised-document",
    plainDefinition: "A document that has been verified and authenticated by a licensed notary public.",
    whyItMatters: [
      "Used to confirm identities, signatures, and document authenticity",
      "Required for many official filings including company formation and property transactions"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "Notary-certified copy (PDF)",
      "Receipt or reference number if issued"
    ],
    commonPitfalls: [
      "Confusing notarised vs certified copy — they are different",
      "Using expired or incorrect document versions"
    ],
    synonyms: ["notarized document", "notary-certified"],
    tags: ["Documents", "Legal"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["notarised-document"],
  },
  {
    term: "Legalised Copy",
    slug: "legalised-copy",
    plainDefinition: "A copy that has been formally verified by an authority or notary as a true and accurate copy of the original.",
    whyItMatters: [
      "Some government applications require legalised copies instead of originals",
      "Provides official assurance that the copy matches the original document"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "Legalised PDF scan",
      "Supporting receipt from the legalising authority"
    ],
    commonPitfalls: [
      "Uploading a normal photocopy instead of a properly legalised copy"
    ],
    synonyms: ["legalized copy"],
    tags: ["Documents", "Legal"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["legalised-copy"],
  },
  {
    term: "Certified Copy",
    slug: "certified-copy",
    plainDefinition: "A copy signed and/or stamped by an authorised person confirming it matches the original document.",
    whyItMatters: [
      "Often accepted in place of originals where originals aren't required",
      "Cheaper and faster than notarisation for many routine filings"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "Certified scan (PDF)",
      "Certifier details (name, position, date)"
    ],
    commonPitfalls: [
      "Missing certifier details or date on the copy"
    ],
    synonyms: ["true copy"],
    tags: ["Documents"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["certified-copy"],
  },
  {
    term: "OSS (Online Single Submission)",
    slug: "oss-online-single-submission",
    plainDefinition: "Indonesia's online portal used to register businesses and manage certain permits and licences.",
    whyItMatters: [
      "Many registrations and licences start here — it is the central government record",
      "Required for NIB, KBLI selection, and various permit applications"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "Screenshots of submission confirmation",
      "PDF outputs from OSS portal",
      "Registration numbers"
    ],
    commonPitfalls: [
      "Losing login credentials to the OSS portal",
      "Incomplete fields leading to rejections or delays"
    ],
    synonyms: ["OSS portal", "OSS RBA"],
    tags: ["OSS", "Permits"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["oss-online-single-submission"],
  },
  {
    term: "NIB (Business Identification Number)",
    slug: "nib-business-identification-number",
    plainDefinition: "A core business identification number issued through the OSS portal upon successful registration.",
    whyItMatters: [
      "Often required before other permits, tax registrations, and operational steps",
      "Acts as the primary business identification for government interactions"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "NIB certificate (PDF)",
      "OSS confirmation page"
    ],
    commonPitfalls: [
      "Wrong business category data entered during registration",
      "Mismatched company details between NIB and other documents"
    ],
    synonyms: ["NIB", "business ID number"],
    tags: ["OSS", "Permits"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["nib-business-identification-number"],
  },
  {
    term: "KBLI",
    slug: "kbli",
    plainDefinition: "Indonesia's standard business activity classification codes that categorise what a business does.",
    whyItMatters: [
      "The selected KBLI code affects what licences and permits apply to your business",
      "Wrong KBLI selection can mean missing required permits or needing to re-register"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "KBLI selection record from OSS",
      "Consultant recommendation file (if any)"
    ],
    commonPitfalls: [
      "Selecting the wrong KBLI and needing to redo the registration process"
    ],
    synonyms: ["KBLI code", "business classification"],
    tags: ["OSS", "Permits"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["kbli"],
  },
  {
    term: "PBG (Building Approval)",
    slug: "pbg-building-approval",
    plainDefinition: "A building approval or permit required for construction, renovation, or changes to building function/status.",
    whyItMatters: [
      "Needed for legal building approval and downstream certificates like SLF",
      "Operating without PBG can result in fines or forced closure"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "PBG approval documents",
      "Technical drawings submitted",
      "Inspection notes"
    ],
    commonPitfalls: [
      "Missing technical drawings in the application",
      "Assuming old building permits (IMB) are still valid — PBG has replaced IMB"
    ],
    synonyms: ["PBG", "building permit", "building approval"],
    tags: ["Permits", "Building"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["pbg-building-approval"],
  },
  {
    term: "SLF (Building Function Certificate)",
    slug: "slf-building-function-certificate",
    plainDefinition: "A certificate confirming that a building is fit for its intended function and safe for occupancy.",
    whyItMatters: [
      "Often required for commercial operation, insurance, and compliance audits",
      "May require periodic renewal (typically every 5 years)"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "SLF certificate (PDF)",
      "Inspection reports",
      "Renewal reminders and dates"
    ],
    commonPitfalls: [
      "Letting the SLF expire without renewal",
      "Missing inspection evidence needed for renewal"
    ],
    synonyms: ["SLF", "building function certificate", "occupancy certificate"],
    tags: ["Permits", "Building"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["slf-building-function-certificate"],
  },
  {
    term: "Zoning Certificate",
    slug: "zoning-certificate",
    plainDefinition: "An official document confirming the permitted land use classification for a specific property or plot.",
    whyItMatters: [
      "Determines what activities are legally permitted on the land",
      "Required before applying for building or operational permits"
    ],
    typicalProcessSteps: null,
    whatToStore: [
      "Zoning certificate PDF",
      "KKPR documentation",
      "Map or plot reference"
    ],
    commonPitfalls: [
      "Assuming verbal confirmation is sufficient — always obtain written documentation",
      "Not checking if zoning has been reclassified recently"
    ],
    synonyms: ["KKPR", "zoning document", "land use certificate"],
    tags: ["Permits", "Zoning"],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: termTranslationsMap["zoning-certificate"],
  },
  {
    term: "Banjar",
    slug: "banjar",
    plainDefinition: "A traditional Balinese community organisation that governs local affairs, ceremonies, and mutual obligations within a neighbourhood.",
    whyItMatters: [
      "Villa operators in Bali are expected to maintain good relationships with their local banjar",
      "Banjar contributions and participation are socially mandatory — failure to engage can lead to operational difficulties"
    ],
    typicalProcessSteps: null,
    whatToStore: ["Banjar introduction records", "Contribution receipts", "Meeting notes"],
    commonPitfalls: ["Ignoring banjar obligations", "Not attending required ceremonies or meetings"],
    synonyms: ["banjar adat", "community council"],
    tags: ["Community", "Bali"],
    lastUpdated: "2026-02-20",
    isActive: true,
    translations: termTranslationsMap["banjar"],
  },
  {
    term: "BPJS (Social Security)",
    slug: "bpjs",
    plainDefinition: "Indonesia's mandatory social security programme covering health insurance (BPJS Kesehatan) and employment benefits (BPJS Ketenagakerjaan) for all workers.",
    whyItMatters: [
      "All employers must register staff in both BPJS Kesehatan and Ketenagakerjaan",
      "Non-compliance can result in fines, sanctions, and inability to access government services"
    ],
    typicalProcessSteps: [
      "Register as an employer with BPJS",
      "Register each employee in both BPJS Kesehatan and Ketenagakerjaan",
      "Pay monthly contributions by the 10th (Kesehatan) and 15th (Ketenagakerjaan)",
      "Report any staff changes within 7 days"
    ],
    whatToStore: ["BPJS registration certificates", "Monthly payment receipts", "Employee membership cards"],
    commonPitfalls: ["Late monthly payments resulting in service suspension", "Not registering new employees within the required timeframe"],
    synonyms: ["social security", "BPJS Kesehatan", "BPJS Ketenagakerjaan", "jaminan sosial"],
    tags: ["Staff", "Compliance"],
    lastUpdated: "2026-02-20",
    isActive: true,
    translations: termTranslationsMap["bpjs"],
  },
  {
    term: "CoreTax",
    slug: "coretax",
    plainDefinition: "Indonesia's new integrated tax administration system that replaces older DJP Online portals for tax filing and management.",
    whyItMatters: [
      "All tax filings are transitioning to CoreTax — businesses must adapt their processes",
      "CoreTax changes how tax IDs (NPWP) and filings are managed digitally"
    ],
    typicalProcessSteps: null,
    whatToStore: ["CoreTax login credentials (secure)", "Filing confirmations", "Tax ID registration documents"],
    commonPitfalls: ["Using outdated DJP Online when CoreTax is now required", "Not updating company details in the new system"],
    synonyms: ["core tax system", "DJP CoreTax"],
    tags: ["Tax", "Digital"],
    lastUpdated: "2026-02-20",
    isActive: true,
    translations: termTranslationsMap["coretax"],
  },
  {
    term: "HGB (Hak Guna Bangunan)",
    slug: "hgb",
    plainDefinition: "A time-limited right to build on and use land in Indonesia, typically granted for 20–30 years and renewable.",
    whyItMatters: [
      "Most foreign-owned villa operations hold land under HGB — it expires and must be renewed",
      "Expired HGB can jeopardise the entire operation and property rights"
    ],
    typicalProcessSteps: [
      "Check HGB certificate for expiry date",
      "Begin renewal process 1–2 years before expiry",
      "Submit renewal application to BPN (Land Office)",
      "Pay renewal fees and taxes",
      "Receive updated HGB certificate"
    ],
    whatToStore: ["HGB certificate (original and scan)", "Renewal application receipts", "BPN correspondence"],
    commonPitfalls: ["Waiting too long to start renewal — processing can take 6–12 months", "Not tracking the expiry date"],
    synonyms: ["building rights", "hak guna bangunan", "land lease"],
    tags: ["Property", "Legal"],
    lastUpdated: "2026-02-20",
    isActive: true,
    translations: termTranslationsMap["hgb"],
  },
  {
    term: "KITAS (Limited Stay Permit)",
    slug: "kitas",
    plainDefinition: "A temporary residence permit for foreigners working or staying in Indonesia, typically valid for 1–2 years.",
    whyItMatters: [
      "Foreign staff must hold a valid KITAS to work legally in Indonesia",
      "Expired KITAS means the employee is working illegally, risking deportation and fines"
    ],
    typicalProcessSteps: [
      "Obtain IMTA (work permit) through employer sponsorship",
      "Apply for KITAS through immigration",
      "Complete biometrics and interview",
      "Receive KITAS card",
      "Renew before expiry"
    ],
    whatToStore: ["KITAS card scan", "IMTA approval letter", "Passport pages with KITAS stamp", "Renewal reminders"],
    commonPitfalls: ["Missing renewal deadlines", "Not starting the renewal process early enough (allow 2–3 months)"],
    synonyms: ["stay permit", "work visa", "izin tinggal terbatas"],
    tags: ["Staff", "Immigration"],
    lastUpdated: "2026-02-20",
    isActive: true,
    translations: termTranslationsMap["kitas"],
  },
  {
    term: "PB1 (Hotel/Accommodation Tax)",
    slug: "pb1",
    plainDefinition: "A local tax on accommodation services (including villas) charged to guests and remitted monthly to the local government.",
    whyItMatters: [
      "Villa operators must collect PB1 from guests and file/pay monthly",
      "Non-compliance can result in fines, back-taxes, and operational restrictions"
    ],
    typicalProcessSteps: [
      "Register with local tax office (BPPD/Bapenda)",
      "Collect tax from guests (typically 10%)",
      "File SPTPD monthly by the 20th",
      "Pay collected tax to local government"
    ],
    whatToStore: ["SPTPD filing receipts", "Monthly payment proofs", "Tax registration certificate"],
    commonPitfalls: ["Not collecting from guests and paying out of pocket", "Filing late and incurring penalties"],
    synonyms: ["pajak hotel", "SPTPD", "accommodation tax", "hotel tax"],
    tags: ["Tax", "Operations"],
    lastUpdated: "2026-02-20",
    isActive: true,
    translations: termTranslationsMap["pb1"],
  },
  {
    term: "PKWT (Fixed-Term Employment Contract)",
    slug: "pkwt",
    plainDefinition: "A fixed-term employment contract in Indonesia, used for temporary or project-based work with defined start and end dates.",
    whyItMatters: [
      "Most villa staff are hired under PKWT contracts",
      "PKWT contracts have legal limits on duration and renewal — exceeding them converts the contract to permanent employment"
    ],
    typicalProcessSteps: [
      "Draft PKWT in Bahasa Indonesia (required by law)",
      "Include mandatory terms: duration, role, compensation, termination",
      "Register with local manpower office within 7 days",
      "Track renewal dates"
    ],
    whatToStore: ["Signed PKWT contracts", "Registration receipts", "Renewal/extension records"],
    commonPitfalls: ["Not writing contracts in Bahasa Indonesia (makes them legally void)", "Exceeding the maximum contract duration without conversion"],
    synonyms: ["kontrak kerja", "fixed-term contract", "employment agreement"],
    tags: ["Staff", "Legal"],
    lastUpdated: "2026-02-20",
    isActive: true,
    translations: termTranslationsMap["pkwt"],
  },
  {
    term: "THR (Holiday Allowance)",
    slug: "thr",
    plainDefinition: "A mandatory annual bonus (Tunjangan Hari Raya) that employers must pay to employees before major religious holidays.",
    whyItMatters: [
      "THR is legally required — failure to pay can result in fines and penalties",
      "Must be paid at least 7 days before the employee's religious holiday"
    ],
    typicalProcessSteps: [
      "Calculate THR (one month's salary for employees with 12+ months of service)",
      "Pro-rate for employees with less than 12 months",
      "Pay at least 7 days before the holiday",
      "Include in payroll records"
    ],
    whatToStore: ["THR calculation records", "Payment receipts", "Employee acknowledgement"],
    commonPitfalls: ["Paying late (must be 7 days before the holiday)", "Not pro-rating for new employees"],
    synonyms: ["tunjangan hari raya", "holiday bonus", "religious holiday allowance"],
    tags: ["Staff", "Compensation"],
    lastUpdated: "2026-02-20",
    isActive: true,
    translations: termTranslationsMap["thr"],
  },
];

const seedWorkflows = [
  {
    gateNumber: 6,
    title: "SLF Renewal Workflow",
    summary: "Step-by-step process for renewing your SLF (Building Function Certificate) before it expires. This hybrid workflow involves both digital submissions and physical inspections.",
    authorityHandledBy: "Local DPMPTSP / Public Works Office",
    submissionType: "hybrid",
    sequenceSteps: [
      {
        stepNumber: 1,
        actionDescription: "Check SLF expiry date and schedule inspection at least 3 months before expiry",
        whereItGoes: "Internal / DPMPTSP",
        digitalOrPhysical: "digital" as const,
        whoHandlesIt: "Villa operator or compliance consultant",
        notes: "Start early — inspections can take weeks to schedule.",
        expandDetails: {
          whyThisMatters: "If the SLF expires before renewal is complete, the property technically operates without a valid certificate. Starting early avoids gaps.",
          commonIssues: [
            "Forgetting the expiry date until it's too late",
            "DPMPTSP backlog during busy periods"
          ],
          preparationTips: [
            "Set calendar reminders 6 months and 3 months before expiry",
            "Confirm which DPMPTSP office handles your regency"
          ],
          storageReminders: [
            "Save a copy of current SLF with expiry date highlighted",
            "Upload inspection appointment confirmation to DSCVR"
          ]
        }
      },
      {
        stepNumber: 2,
        actionDescription: "Prepare building documentation package including original PBG, previous SLF, and as-built drawings",
        whereItGoes: "Internal preparation",
        digitalOrPhysical: "physical" as const,
        whoHandlesIt: "Villa operator",
        notes: "Ensure all documents are current and match the actual building state.",
        expandDetails: {
          whyThisMatters: "Incomplete documentation is the most common reason for inspection delays. Having everything ready speeds up the process significantly.",
          commonIssues: [
            "Cannot find original PBG documents",
            "As-built drawings don't match current building layout"
          ],
          preparationTips: [
            "Gather PBG, previous SLF, structural drawings, and MEP diagrams",
            "Verify drawings match any renovations made since last SLF"
          ],
          storageReminders: [
            "Upload complete document package to DSCVR before inspection",
            "Create a checklist of all required documents"
          ]
        }
      },
      {
        stepNumber: 3,
        actionDescription: "Host building inspector onsite for physical inspection",
        whereItGoes: "Onsite at property",
        digitalOrPhysical: "physical" as const,
        whoHandlesIt: "Inspector (DPMPTSP) + villa operator",
        notes: "Inspector will check structural integrity, fire safety, and MEP systems.",
        expandDetails: {
          whyThisMatters: "The physical inspection is the core requirement. Inspectors verify that the building matches documentation and meets current safety standards.",
          commonIssues: [
            "Inspector finds undocumented modifications",
            "Fire safety equipment not serviced or expired",
            "Access issues preventing full inspection"
          ],
          preparationTips: [
            "Service all fire extinguishers and safety equipment beforehand",
            "Ensure all areas are accessible for inspection",
            "Have a staff member available to assist the inspector"
          ],
          storageReminders: [
            "Photograph the inspection process",
            "Get a copy of the inspector's preliminary notes if possible"
          ]
        }
      },
      {
        stepNumber: 4,
        actionDescription: "Receive inspection report and address any findings or remediation requirements",
        whereItGoes: "DPMPTSP issues report",
        digitalOrPhysical: "hybrid" as const,
        whoHandlesIt: "Villa operator + consultant",
        notes: "Some findings may require corrections before the SLF can be issued.",
        expandDetails: {
          whyThisMatters: "The inspection report determines whether the SLF can be renewed directly or if corrections are needed first. Quick response to findings avoids extended delays.",
          commonIssues: [
            "Delayed report delivery from DPMPTSP",
            "Unclear remediation requirements"
          ],
          preparationTips: [
            "Follow up with DPMPTSP if report is not received within 2 weeks",
            "Engage your consultant to interpret technical findings"
          ],
          storageReminders: [
            "Upload full inspection report to DSCVR",
            "Document any remediation work completed with photos"
          ]
        }
      },
      {
        stepNumber: 5,
        actionDescription: "Apply wet signature and company stamp to the SLF application form",
        whereItGoes: "Internal — signed by director",
        digitalOrPhysical: "physical" as const,
        whoHandlesIt: "Company director / authorised signatory",
        notes: "Must be signed by the person registered as director in the company deed.",
        expandDetails: {
          whyThisMatters: "Government offices require original wet signatures. Digital or photocopied signatures will be rejected.",
          commonIssues: [
            "Director not available to sign in person",
            "Using wrong signatory"
          ],
          preparationTips: [
            "Confirm who is the registered director before signing",
            "Have the company stamp ready"
          ],
          storageReminders: [
            "Scan the signed application clearly",
            "Upload both the signed form and stamped version to DSCVR"
          ]
        }
      },
      {
        stepNumber: 6,
        actionDescription: "Submit renewal application with all supporting documents to DPMPTSP",
        whereItGoes: "DPMPTSP office",
        digitalOrPhysical: "hybrid" as const,
        whoHandlesIt: "Consultant or villa operator",
        notes: "Some regencies accept digital submission via OSS; others require physical delivery.",
        expandDetails: {
          whyThisMatters: "This is the formal submission. Missing documents will delay processing and may require resubmission.",
          commonIssues: [
            "Incomplete document package",
            "Wrong office or submission channel"
          ],
          preparationTips: [
            "Double-check the document checklist before submission",
            "Confirm whether your regency uses OSS or physical submission"
          ],
          storageReminders: [
            "Upload submission receipt or confirmation to DSCVR",
            "Note the submission date and expected processing time"
          ]
        }
      },
      {
        stepNumber: 7,
        actionDescription: "Receive renewed SLF certificate and store originals securely",
        whereItGoes: "DPMPTSP issues certificate",
        digitalOrPhysical: "digital" as const,
        whoHandlesIt: "Villa operator",
        notes: "Set reminder for next renewal cycle (typically 5 years).",
        expandDetails: {
          whyThisMatters: "The renewed SLF is your proof of building compliance. Store it carefully and set reminders for the next renewal.",
          commonIssues: [
            "Not following up on delayed issuance",
            "Forgetting to update DSCVR with the new certificate"
          ],
          preparationTips: [
            "Follow up if certificate is not issued within the stated timeframe",
            "Verify all details on the new SLF are correct"
          ],
          storageReminders: [
            "Upload the new SLF certificate PDF to DSCVR",
            "Update the renewal date tracker",
            "Store physical original in a secure location"
          ]
        }
      }
    ],
    whatToExpect: [
      "Process typically takes 4-8 weeks from inspection to certificate issuance",
      "Inspection scheduling may take 2-4 weeks depending on DPMPTSP availability",
      "Minor remediation items are common and usually resolved quickly",
      "Some regencies process renewals faster than initial applications"
    ],
    typicalDelays: [
      "Inspector availability — can be 2-4 weeks wait",
      "Incomplete documentation requiring resubmission",
      "Remediation work needed after inspection findings",
      "DPMPTSP administrative processing backlog"
    ],
    commonRejectionReasons: [
      "Building modifications not reflected in submitted drawings",
      "Fire safety equipment expired or missing",
      "Structural concerns identified during inspection",
      "Incomplete or incorrectly signed application forms"
    ],
    dscvrRecommendedStorage: [
      "Current and renewed SLF certificates (PDF)",
      "Inspection reports and findings",
      "Remediation evidence (photos and documents)",
      "Submission receipts and correspondence",
      "Renewal date reminders"
    ],
    lastUpdated: "2025-02-19",
    isActive: true,
    translations: guideTranslationsMap["slf-renewal-workflow"],
  }
];

export async function seedComplianceTerms() {
  const existing = await db.select({ slug: complianceTerms.slug }).from(complianceTerms);
  const existingSlugs = new Set(existing.map(e => e.slug));

  if (existing.length === 0) {
    console.log("Seeding compliance terms...");
    await db.insert(complianceTerms).values(seedTerms);
    console.log(`Seeded ${seedTerms.length} compliance terms.`);
  } else {
    const newTerms = seedTerms.filter(t => !existingSlugs.has(t.slug));
    if (newTerms.length > 0) {
      await db.insert(complianceTerms).values(newTerms);
      console.log(`Seeded ${newTerms.length} new compliance terms.`);
    } else {
      console.log("Compliance terms already seeded, skipping...");
    }
  }

  const existingGuides = await db.select({ id: processNavigationGuides.id }).from(processNavigationGuides).limit(1);
  if (existingGuides.length > 0) {
    console.log("Process navigation guides already seeded, skipping...");
  } else {
    console.log("Seeding process navigation guides...");
    await db.insert(processNavigationGuides).values(seedWorkflows);
    console.log(`Seeded ${seedWorkflows.length} process navigation guides.`);
  }

  await backfillTranslations();
}

async function backfillTranslations() {
  const allTerms = await db.select({ id: complianceTerms.id, slug: complianceTerms.slug, translations: complianceTerms.translations }).from(complianceTerms);
  let termCount = 0;
  for (const term of allTerms) {
    const latest = termTranslationsMap[term.slug];
    if (latest) {
      const needsUpdate = !term.translations ||
        JSON.stringify(term.translations) !== JSON.stringify(latest);
      if (needsUpdate) {
        await db.update(complianceTerms).set({ translations: latest }).where(eq(complianceTerms.id, term.id));
        termCount++;
      }
    }
  }
  if (termCount > 0) {
    console.log(`Updated translations for ${termCount} compliance terms.`);
  }

  const allGuides = await db.select({ id: processNavigationGuides.id, title: processNavigationGuides.title, translations: processNavigationGuides.translations }).from(processNavigationGuides);
  let guideCount = 0;
  for (const guide of allGuides) {
    if (guide.title === "SLF Renewal Workflow" && guideTranslationsMap["slf-renewal-workflow"]) {
      const latest = guideTranslationsMap["slf-renewal-workflow"];
      const needsUpdate = !guide.translations ||
        JSON.stringify(guide.translations) !== JSON.stringify(latest);
      if (needsUpdate) {
        await db.update(processNavigationGuides).set({ translations: latest }).where(eq(processNavigationGuides.id, guide.id));
        guideCount++;
      }
    }
  }
  if (guideCount > 0) {
    console.log(`Updated translations for ${guideCount} process guides.`);
  }
}
