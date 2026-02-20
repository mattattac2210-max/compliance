export type Language = "en" | "uk" | "id";

export interface UITranslations {
  header: {
    brand: string;
    subtitle: string;
    deadlinePill: string;
    rightLabel1: string;
    rightLabel2: string;
  };
  tabs: {
    flow: string;
    audit: string;
    guide: string;
  };
  flow: {
    tagline: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    dscvrTracks: string;
    dscvrDoesNot: string;
    trackItems: string[];
    doesNotItems: string[];
    statsLabels: string[];
    sectionFoundation: string;
    sectionStructural: string;
    sectionOperational: string;
    taxConcurrent: string;
    staffConcurrent: string;
    fullyCompliantTitle: string;
    fullyCompliantDesc: string;
    governmentPortals: string;
    disclaimer: string;
  };
  audit: {
    tagline: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    deadlineTitle: string;
    deadlineDesc: string;
    legendCompliant: string;
    legendFlagged: string;
    legendNeedsAttention: string;
    legendNotChecked: string;
    disclaimer: string;
  };
  guide: {
    tagline: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    timelineTitle: string;
    disclaimer: string;
  };
  glossary: {
    heading: string;
    searchPlaceholder: string;
    allTags: string;
    whyItMatters: string;
    typicalProcessSteps: string;
    whatToStore: string;
    commonPitfalls: string;
    copyLabel: string;
    copySuccess: string;
    loadingText: string;
    noResults: string;
    disclaimer: string;
    lastUpdated: string;
    readMore: string;
    synonyms: string;
  };
  processNav: {
    heading: string;
    headingDesc: string;
    filterAll: string;
    stepPrefix: string;
    whereItGoes: string;
    handledBy: string;
    notesLabel: string;
    digitalLabel: string;
    physicalLabel: string;
    hybridLabel: string;
    expandDetails: string;
    whyThisMatters: string;
    commonIssues: string;
    preparationTips: string;
    storageReminders: string;
    infoTabExpect: string;
    infoTabDelays: string;
    infoTabRejections: string;
    infoTabStorage: string;
    authorityLabel: string;
    submissionLabel: string;
    lastUpdatedLabel: string;
    loadingText: string;
    noGuides: string;
    disclaimer: string;
  };
  admin: {
    title: string;
    backToApp: string;
    addTerm: string;
    editTerm: string;
    createTerm: string;
    termLabel: string;
    slugLabel: string;
    plainDefLabel: string;
    whyItMattersLabel: string;
    processStepsLabel: string;
    whatToStoreLabel: string;
    commonPitfallsLabel: string;
    synonymsLabel: string;
    tagsLabel: string;
    activeLabel: string;
    saveLabel: string;
    cancelLabel: string;
    activeStatus: string;
    inactiveStatus: string;
    commaHint: string;
  };
  common: {
    languageLabel: string;
    english: string;
    ukrainian: string;
    bahasa: string;
  };
}

export interface GateTranslation {
  layerLabel: string;
  title: string;
  subtitle: string;
  rolePillText: string;
  dscvrRole: string;
  dscvrRoleDesc: string;
  alerts: Array<{ content: string }>;
  zones?: Array<{ name: string; status: string }>;
  infoBlocks: Array<{ title: string; content: string; items?: string[] }>;
  portals: Array<{ label: string }>;
}

export interface AuditSectionTranslation {
  title: string;
  items: Array<{ title: string; desc: string }>;
}

export interface GuideCardTranslation {
  title: string;
  role: string;
  desc: string;
  links: Array<{ label: string }>;
}

export interface TimelineItemTranslation {
  week: string;
  title: string;
  desc: string;
}

export interface ContentTranslations {
  gates: GateTranslation[];
  auditSections: AuditSectionTranslation[];
  guideCards: GuideCardTranslation[];
  timelineItems: TimelineItemTranslation[];
}
