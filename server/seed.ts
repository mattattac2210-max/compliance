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
  const existing = await db.select({ id: complianceTerms.id }).from(complianceTerms).limit(1);
  if (existing.length > 0) {
    console.log("Compliance terms already seeded, skipping...");
  } else {
    console.log("Seeding compliance terms...");
    await db.insert(complianceTerms).values(seedTerms);
    console.log(`Seeded ${seedTerms.length} compliance terms.`);
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
  const termsWithoutTranslations = await db.select({ id: complianceTerms.id, slug: complianceTerms.slug, translations: complianceTerms.translations }).from(complianceTerms);
  let termCount = 0;
  for (const term of termsWithoutTranslations) {
    if (!term.translations && termTranslationsMap[term.slug]) {
      await db.update(complianceTerms).set({ translations: termTranslationsMap[term.slug] }).where(eq(complianceTerms.id, term.id));
      termCount++;
    }
  }
  if (termCount > 0) {
    console.log(`Backfilled translations for ${termCount} compliance terms.`);
  }

  const guidesWithoutTranslations = await db.select({ id: processNavigationGuides.id, title: processNavigationGuides.title, translations: processNavigationGuides.translations }).from(processNavigationGuides);
  let guideCount = 0;
  for (const guide of guidesWithoutTranslations) {
    if (!guide.translations && guide.title === "SLF Renewal Workflow" && guideTranslationsMap["slf-renewal-workflow"]) {
      await db.update(processNavigationGuides).set({ translations: guideTranslationsMap["slf-renewal-workflow"] }).where(eq(processNavigationGuides.id, guide.id));
      guideCount++;
    }
  }
  if (guideCount > 0) {
    console.log(`Backfilled translations for ${guideCount} process guides.`);
  }
}
