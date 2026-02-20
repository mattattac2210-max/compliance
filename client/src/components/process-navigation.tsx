import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, MapPin, Clock, AlertTriangle, FolderOpen, FileText, Monitor, Building, Zap } from "lucide-react";
import type { ProcessGuide, SequenceStep, ExpandDetails, GuideTranslation } from "@shared/schema";
import { GlossaryAwareText, useGlossaryTerms } from "./glossary-link";
import { useLanguage } from "@/i18n/context";
import type { Language, UITranslations } from "@/i18n/types";

function SubmissionBadge({ type, t }: { type: string; t: UITranslations }) {
  const config: Record<string, { icon: typeof Monitor; labelKey: "digitalLabel" | "physicalLabel" | "hybridLabel"; color: string }> = {
    digital: { icon: Monitor, labelKey: "digitalLabel", color: "#14B8A6" },
    physical: { icon: FileText, labelKey: "physicalLabel", color: "#F59E0B" },
    hybrid: { icon: Zap, labelKey: "hybridLabel", color: "#A78BFA" },
  };
  const c = config[type] || config.hybrid;
  const Icon = c.icon;
  return (
    <span
      className="inline-flex items-center gap-[5px] text-[9px] font-heading font-bold tracking-[1.2px] uppercase py-[3px] px-[8px] rounded-full border"
      style={{ color: c.color, borderColor: `${c.color}33`, background: `${c.color}11` }}
      data-testid={`badge-${type}`}
    >
      <Icon size={10} />
      {t.processNav[c.labelKey]}
    </span>
  );
}

function StepTimeline({ steps, terms, t }: { steps: SequenceStep[]; terms: ReturnType<typeof useGlossaryTerms>; t: UITranslations }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="relative" data-testid="step-timeline">
      <div className="absolute left-[15px] top-[24px] bottom-[24px] w-[2px] bg-gradient-to-b from-[var(--accent)] via-[var(--accent-tint2)] to-[var(--accent-tint)]" />

      {steps.map((step, i) => {
        const isExpanded = expandedStep === step.stepNumber;
        const details = step.expandDetails as ExpandDetails | undefined;
        const hasDetails = !!details;

        return (
          <div key={step.stepNumber} className="relative pl-[44px] mb-[4px]" data-testid={`step-${step.stepNumber}`}>
            <div
              className="absolute left-[8px] top-[14px] w-[16px] h-[16px] rounded-full border-[2px] border-[var(--accent)] flex items-center justify-center z-10"
              style={{ background: "var(--app-circle-bg)" }}
            >
              <span className="text-[8px] font-heading font-bold text-[var(--accent)]">{step.stepNumber}</span>
            </div>

            <div
              className={`rounded-[8px] p-[14px_16px] transition-all border ${hasDetails ? "cursor-pointer hover-elevate" : ""}`}
              style={{
                background: "var(--app-card-translucent)",
                borderColor: isExpanded ? "var(--app-border-teal)" : "var(--app-border-teal-subtle)",
              }}
              onClick={() => hasDetails && setExpandedStep(isExpanded ? null : step.stepNumber)}
              data-testid={`step-toggle-${step.stepNumber}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold leading-[1.5] mb-[6px]" style={{ color: "var(--txt)" }}>
                    <GlossaryAwareText text={step.actionDescription} terms={terms} />
                  </div>

                  <div className="flex flex-wrap items-center gap-[10px] text-[10px]" style={{ color: "var(--app-text-muted)" }}>
                    <span className="flex items-center gap-[4px]">
                      <MapPin size={9} style={{ color: "var(--app-text-dim)" }} />
                      {step.whereItGoes}
                    </span>
                    <span className="flex items-center gap-[4px]">
                      <Building size={9} style={{ color: "var(--app-text-dim)" }} />
                      {step.whoHandlesIt}
                    </span>
                    <SubmissionBadge type={step.digitalOrPhysical} t={t} />
                  </div>

                  {step.notes && (
                    <div className="mt-[8px] text-[10px] italic leading-[1.5]" style={{ color: "var(--app-text-secondary)" }}>
                      <GlossaryAwareText text={step.notes} terms={terms} />
                    </div>
                  )}
                </div>

                {hasDetails && (
                  <div className="shrink-0 mt-[2px]">
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-[var(--accent)]" />
                    ) : (
                      <ChevronRight size={14} style={{ color: "var(--app-text-dim)" }} />
                    )}
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-[14px] pt-[14px] space-y-[12px]" style={{ borderTop: "1px solid var(--app-border-teal-subtle)" }}>
                      {details.whyThisMatters && (
                        <div>
                          <div className="font-heading text-[8px] font-bold tracking-[2px] uppercase text-[var(--gold)] mb-[5px]">
                            {t.processNav.whyThisMatters}
                          </div>
                          <div className="text-[11px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
                            <GlossaryAwareText text={details.whyThisMatters} terms={terms} />
                          </div>
                        </div>
                      )}

                      {details.commonIssues && details.commonIssues.length > 0 && (
                        <div>
                          <div className="font-heading text-[8px] font-bold tracking-[2px] uppercase text-[var(--danger)] mb-[5px]">
                            {t.processNav.commonIssues}
                          </div>
                          <ul className="space-y-[3px]">
                            {details.commonIssues.map((item, j) => (
                              <li key={j} className="flex items-start gap-[6px] text-[11px] text-[#FCA5A5] leading-[1.5]">
                                <span className="w-[3px] h-[3px] rounded-full bg-[var(--danger)] shrink-0 mt-[6px]" />
                                <GlossaryAwareText text={item} terms={terms} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {details.preparationTips && details.preparationTips.length > 0 && (
                        <div>
                          <div className="font-heading text-[8px] font-bold tracking-[2px] uppercase text-[var(--accent)] mb-[5px]">
                            {t.processNav.preparationTips}
                          </div>
                          <ul className="space-y-[3px]">
                            {details.preparationTips.map((item, j) => (
                              <li key={j} className="flex items-start gap-[6px] text-[11px] leading-[1.5]" style={{ color: "var(--app-text-secondary)" }}>
                                <span className="w-[3px] h-[3px] rounded-full bg-[var(--accent)] shrink-0 mt-[6px]" />
                                <GlossaryAwareText text={item} terms={terms} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {details.storageReminders && details.storageReminders.length > 0 && (
                        <div>
                          <div className="font-heading text-[8px] font-bold tracking-[2px] uppercase text-[#A78BFA] mb-[5px]">
                            {t.processNav.storageReminders}
                          </div>
                          <ul className="space-y-[3px]">
                            {details.storageReminders.map((item, j) => (
                              <li key={j} className="flex items-start gap-[6px] text-[11px] leading-[1.5]" style={{ color: "var(--app-text-bright)" }}>
                                <span className="w-[3px] h-[3px] rounded-full bg-[#A78BFA] shrink-0 mt-[6px]" />
                                <GlossaryAwareText text={item} terms={terms} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getTranslatedGuide(guide: ProcessGuide, lang: Language) {
  if (lang === "en" || !guide.translations) {
    return {
      title: guide.title,
      summary: guide.summary,
      authorityHandledBy: guide.authorityHandledBy,
      sequenceSteps: guide.sequenceSteps as SequenceStep[],
      whatToExpect: guide.whatToExpect as string[],
      typicalDelays: guide.typicalDelays as string[],
      commonRejectionReasons: guide.commonRejectionReasons as string[],
      dscvrRecommendedStorage: guide.dscvrRecommendedStorage as string[],
    };
  }
  const tr = (guide.translations as Record<string, GuideTranslation>)[lang];
  if (!tr) {
    return {
      title: guide.title,
      summary: guide.summary,
      authorityHandledBy: guide.authorityHandledBy,
      sequenceSteps: guide.sequenceSteps as SequenceStep[],
      whatToExpect: guide.whatToExpect as string[],
      typicalDelays: guide.typicalDelays as string[],
      commonRejectionReasons: guide.commonRejectionReasons as string[],
      dscvrRecommendedStorage: guide.dscvrRecommendedStorage as string[],
    };
  }
  return {
    title: tr.title || guide.title,
    summary: tr.summary || guide.summary,
    authorityHandledBy: tr.authorityHandledBy || guide.authorityHandledBy,
    sequenceSteps: tr.sequenceSteps?.length ? tr.sequenceSteps : (guide.sequenceSteps as SequenceStep[]),
    whatToExpect: tr.whatToExpect?.length ? tr.whatToExpect : (guide.whatToExpect as string[]),
    typicalDelays: tr.typicalDelays?.length ? tr.typicalDelays : (guide.typicalDelays as string[]),
    commonRejectionReasons: tr.commonRejectionReasons?.length ? tr.commonRejectionReasons : (guide.commonRejectionReasons as string[]),
    dscvrRecommendedStorage: tr.dscvrRecommendedStorage?.length ? tr.dscvrRecommendedStorage : (guide.dscvrRecommendedStorage as string[]),
  };
}

function WorkflowCard({ guide, terms, lang, t }: { guide: ProcessGuide; terms: ReturnType<typeof useGlossaryTerms>; lang: Language; t: UITranslations }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<"expect" | "delays" | "rejections" | "storage">("expect");

  const translated = getTranslatedGuide(guide, lang);
  const steps = translated.sequenceSteps;
  const whatToExpect = translated.whatToExpect;
  const typicalDelays = translated.typicalDelays;
  const commonRejections = translated.commonRejectionReasons;
  const storage = translated.dscvrRecommendedStorage;

  const infoTabs = [
    { key: "expect" as const, label: t.processNav.infoTabExpect, icon: Clock, items: whatToExpect, color: "var(--accent)" },
    { key: "delays" as const, label: t.processNav.infoTabDelays, icon: Clock, items: typicalDelays, color: "var(--gold)" },
    { key: "rejections" as const, label: t.processNav.infoTabRejections, icon: AlertTriangle, items: commonRejections, color: "var(--danger)" },
    { key: "storage" as const, label: t.processNav.infoTabStorage, icon: FolderOpen, items: storage, color: "#A78BFA" },
  ];

  const activeTabData = infoTabs.find(tab => tab.key === activeInfoTab)!;

  return (
    <div
      className="rounded-[12px] overflow-hidden hover-elevate border"
      style={{
        background: "var(--app-card-translucent)",
        borderColor: "var(--app-border-teal-subtle)",
      }}
      data-testid={`workflow-card-${guide.id}`}
    >
      <div
        className="p-[20px_24px] cursor-pointer flex items-start justify-between gap-4"
        onClick={() => setIsOpen(!isOpen)}
        data-testid={`workflow-toggle-${guide.id}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[10px] mb-[8px]">
            <span className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[var(--accent)] bg-[var(--accent-tint)] px-[8px] py-[2px] rounded">
              Gate {guide.gateNumber}
            </span>
            <SubmissionBadge type={guide.submissionType} t={t} />
          </div>
          <h3 className="font-heading font-black text-[18px] tracking-[-0.3px] mb-[6px]" style={{ color: "var(--txt)" }}>
            {translated.title}
          </h3>
          <p className="text-[12px] font-light leading-[1.7]" style={{ color: "var(--app-text-secondary)" }}>
            <GlossaryAwareText text={translated.summary} terms={terms} />
          </p>
          <div className="flex items-center gap-[8px] mt-[8px] text-[10px]" style={{ color: "var(--app-text-muted)" }}>
            <Building size={10} style={{ color: "var(--app-text-dim)" }} />
            <GlossaryAwareText text={translated.authorityHandledBy} terms={terms} />
          </div>
        </div>
        <div className="shrink-0 mt-[4px]">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={20} style={{ color: "var(--app-text-dim)" }} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-[24px] pb-[24px]">
              <div className="pt-[20px]" style={{ borderTop: "1px solid var(--app-border-teal-subtle)" }}>
                <div className="font-heading text-[10px] font-bold tracking-[2px] uppercase mb-[16px]" style={{ color: "var(--app-text-muted)" }}>
                  {t.processNav.stepPrefix} ({steps.length})
                </div>
                <StepTimeline steps={steps} terms={terms} t={t} />
              </div>

              <div className="mt-[20px] pt-[20px]" style={{ borderTop: "1px solid var(--app-border-teal-subtle)" }}>
                <div className="flex flex-wrap gap-[6px] mb-[14px]">
                  {infoTabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveInfoTab(tab.key)}
                      className="font-heading text-[9px] font-bold tracking-[1.2px] uppercase py-[5px] px-[10px] rounded-[4px] border cursor-pointer hover-elevate"
                      style={
                        activeInfoTab === tab.key
                          ? {
                              color: "var(--txt)",
                              borderColor: "var(--app-border-teal)",
                              background: "var(--accent-tint)",
                            }
                          : {
                              color: "var(--app-text-muted)",
                              borderColor: "rgba(100,116,139,0.15)",
                              background: "transparent",
                            }
                      }
                      data-testid={`info-tab-${tab.key}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInfoTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ul className="space-y-[6px]">
                      {activeTabData.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-[8px] text-[11px] leading-[1.6]" style={{ color: activeTabData.color === "var(--danger)" ? "#FCA5A5" : "var(--app-text-secondary)" }}>
                          <span className="w-[4px] h-[4px] rounded-full shrink-0 mt-[6px]" style={{ background: activeTabData.color }} />
                          <GlossaryAwareText text={item} terms={terms} />
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-[14px] text-[9px]" style={{ color: "var(--app-text-dim)" }}>
                {t.processNav.lastUpdatedLabel}: {guide.lastUpdated}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProcessNavigation() {
  const terms = useGlossaryTerms();
  const { lang, t } = useLanguage();

  const { data: guides = [], isLoading } = useQuery<ProcessGuide[]>({
    queryKey: ["/api/guides"],
  });

  const [gateFilter, setGateFilter] = useState<number | null>(null);

  const filteredGuides = useMemo(() => {
    if (gateFilter === null) return guides;
    return guides.filter(g => g.gateNumber === gateFilter);
  }, [guides, gateFilter]);

  const gateNumbers = useMemo(() => {
    const nums = [...new Set(guides.map(g => g.gateNumber))];
    return nums.sort((a, b) => a - b);
  }, [guides]);

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="workflow-loading">
        {[1, 2].map(i => (
          <div
            key={i}
            className="rounded-[12px] p-[24px] animate-pulse border"
            style={{
              background: "var(--app-card-translucent)",
              borderColor: "var(--app-border-teal-subtle)",
            }}
          >
            <div className="h-3 bg-[var(--accent-tint)] rounded w-[60px] mb-3" />
            <div className="h-5 bg-[var(--accent-tint)] rounded w-[200px] mb-3" />
            <div className="h-3 bg-[var(--accent-tint)] rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (guides.length === 0) {
    return (
      <div className="text-center py-[40px]" data-testid="no-workflows">
        <div className="font-heading text-[14px] font-bold" style={{ color: "var(--app-text-secondary)" }}>{t.processNav.noGuides}</div>
      </div>
    );
  }

  return (
    <div data-testid="process-navigation">
      <div className="mb-[20px]">
        <div className="flex items-center justify-between mb-[10px]">
          <div>
            <h2 className="font-heading font-black text-[22px] tracking-[-0.5px]" style={{ color: "var(--txt)" }}>
              {t.processNav.heading}
            </h2>
          </div>
          <div className="text-[10px]" style={{ color: "var(--app-text-muted)" }}>
            {guides.length} workflow{guides.length !== 1 ? "s" : ""}
          </div>
        </div>

        <p className="text-[12px] font-light leading-[1.7] mb-[14px]" style={{ color: "var(--app-text-secondary)" }}>
          {t.processNav.headingDesc}
        </p>

        {gateNumbers.length > 1 && (
          <div className="flex flex-wrap gap-[6px]">
            <button
              onClick={() => setGateFilter(null)}
              className="font-heading text-[9px] font-bold tracking-[1.2px] uppercase py-[5px] px-[10px] rounded-[4px] border cursor-pointer hover-elevate"
              style={
                gateFilter === null
                  ? {
                      color: "var(--txt)",
                      borderColor: "var(--app-border-teal)",
                      background: "var(--accent-tint)",
                    }
                  : {
                      color: "var(--app-text-muted)",
                      borderColor: "rgba(100,116,139,0.15)",
                      background: "transparent",
                    }
              }
              data-testid="filter-all-gates"
            >
              {t.processNav.filterAll}
            </button>
            {gateNumbers.map(num => (
              <button
                key={num}
                onClick={() => setGateFilter(num)}
                className="font-heading text-[9px] font-bold tracking-[1.2px] uppercase py-[5px] px-[10px] rounded-[4px] border cursor-pointer hover-elevate"
                style={
                  gateFilter === num
                    ? {
                        color: "var(--txt)",
                        borderColor: "var(--app-border-teal)",
                        background: "var(--accent-tint)",
                      }
                    : {
                        color: "var(--app-text-muted)",
                        borderColor: "rgba(100,116,139,0.15)",
                        background: "transparent",
                      }
                }
                data-testid={`filter-gate-${num}`}
              >
                Gate {num}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-[16px]">
        {filteredGuides.map(guide => (
          <WorkflowCard key={guide.id} guide={guide} terms={terms} lang={lang} t={t} />
        ))}
      </div>

      <div className="mt-[20px] bg-[rgba(249,115,22,0.06)] border border-[rgba(249,115,22,0.15)] rounded-[8px] p-[12px_16px]">
        <div className="flex items-start gap-[8px]">
          <AlertTriangle size={12} className="text-[#F97316] shrink-0 mt-[2px]" />
          <div className="text-[10px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
            <strong className="text-[#F97316]">Disclaimer:</strong> {t.processNav.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
