import { db } from "./db";
import { complianceTerms } from "@shared/schema";
import { sql } from "drizzle-orm";

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
    tags: ["Signatures", "Documents"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["Signatures", "Documents"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["Documents", "Legal"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["Documents", "Legal"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["Documents"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["OSS", "Permits"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["OSS", "Permits"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["OSS", "Permits"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["Permits", "Building"],
    lastUpdated: "2025-02-19",
    isActive: true,
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
    tags: ["Permits", "Building"],
    lastUpdated: "2025-02-19",
    isActive: true,
  },
];

export async function seedComplianceTerms() {
  const existing = await db.select({ id: complianceTerms.id }).from(complianceTerms).limit(1);
  if (existing.length > 0) {
    console.log("Compliance terms already seeded, skipping...");
    return;
  }

  console.log("Seeding compliance terms...");
  await db.insert(complianceTerms).values(seedTerms);
  console.log(`Seeded ${seedTerms.length} compliance terms.`);
}
