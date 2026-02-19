import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, MapPin, Clock, AlertTriangle, FolderOpen, FileText, Monitor, Building, Zap } from "lucide-react";
import type { ProcessGuide, SequenceStep, ExpandDetails } from "@shared/schema";
import { GlossaryAwareText, useGlossaryTerms } from "./glossary-link";

function SubmissionBadge({ type }: { type: string }) {
  const config: Record<string, { icon: typeof Monitor; label: string; color: string }> = {
    digital: { icon: Monitor, label: "Digital", color: "#14B8A6" },
    physical: { icon: FileText, label: "Physical", color: "#F59E0B" },
    hybrid: { icon: Zap, label: "Hybrid", color: "#A78BFA" },
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
      {c.label}
    </span>
  );
}

function StepTimeline({ steps, terms }: { steps: SequenceStep[]; terms: ReturnType<typeof useGlossaryTerms> }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="relative" data-testid="step-timeline">
      <div className="absolute left-[15px] top-[24px] bottom-[24px] w-[2px] bg-gradient-to-b from-[#14B8A6] via-[rgba(20,184,166,0.3)] to-[rgba(20,184,166,0.08)]" />

      {steps.map((step, i) => {
        const isExpanded = expandedStep === step.stepNumber;
        const details = step.expandDetails as ExpandDetails | undefined;
        const hasDetails = !!details;

        return (
          <div key={step.stepNumber} className="relative pl-[44px] mb-[4px]" data-testid={`step-${step.stepNumber}`}>
            <div
              className="absolute left-[8px] top-[14px] w-[16px] h-[16px] rounded-full border-[2px] border-[#14B8A6] flex items-center justify-center z-10"
              style={{ background: "var(--app-circle-bg)" }}
            >
              <span className="text-[8px] font-heading font-bold text-[#14B8A6]">{step.stepNumber}</span>
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
                  <div className="text-[12px] font-semibold leading-[1.5] mb-[6px]" style={{ color: "var(--app-text)" }}>
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
                    <SubmissionBadge type={step.digitalOrPhysical} />
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
                      <ChevronDown size={14} className="text-[#14B8A6]" />
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
                          <div className="font-heading text-[8px] font-bold tracking-[2px] uppercase text-[#F59E0B] mb-[5px]">
                            Why this matters
                          </div>
                          <div className="text-[11px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
                            <GlossaryAwareText text={details.whyThisMatters} terms={terms} />
                          </div>
                        </div>
                      )}

                      {details.commonIssues && details.commonIssues.length > 0 && (
                        <div>
                          <div className="font-heading text-[8px] font-bold tracking-[2px] uppercase text-[#EF4444] mb-[5px]">
                            Common issues
                          </div>
                          <ul className="space-y-[3px]">
                            {details.commonIssues.map((item, j) => (
                              <li key={j} className="flex items-start gap-[6px] text-[11px] text-[#FCA5A5] leading-[1.5]">
                                <span className="w-[3px] h-[3px] rounded-full bg-[#EF4444] shrink-0 mt-[6px]" />
                                <GlossaryAwareText text={item} terms={terms} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {details.preparationTips && details.preparationTips.length > 0 && (
                        <div>
                          <div className="font-heading text-[8px] font-bold tracking-[2px] uppercase text-[#14B8A6] mb-[5px]">
                            Preparation tips
                          </div>
                          <ul className="space-y-[3px]">
                            {details.preparationTips.map((item, j) => (
                              <li key={j} className="flex items-start gap-[6px] text-[11px] leading-[1.5]" style={{ color: "var(--app-text-secondary)" }}>
                                <span className="w-[3px] h-[3px] rounded-full bg-[#14B8A6] shrink-0 mt-[6px]" />
                                <GlossaryAwareText text={item} terms={terms} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {details.storageReminders && details.storageReminders.length > 0 && (
                        <div>
                          <div className="font-heading text-[8px] font-bold tracking-[2px] uppercase text-[#A78BFA] mb-[5px]">
                            Storage reminders
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

function WorkflowCard({ guide, terms }: { guide: ProcessGuide; terms: ReturnType<typeof useGlossaryTerms> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<"expect" | "delays" | "rejections" | "storage">("expect");

  const steps = guide.sequenceSteps as SequenceStep[];
  const whatToExpect = guide.whatToExpect as string[];
  const typicalDelays = guide.typicalDelays as string[];
  const commonRejections = guide.commonRejectionReasons as string[];
  const storage = guide.dscvrRecommendedStorage as string[];

  const infoTabs = [
    { key: "expect" as const, label: "What to Expect", icon: Clock, items: whatToExpect, color: "#14B8A6" },
    { key: "delays" as const, label: "Typical Delays", icon: Clock, items: typicalDelays, color: "#F59E0B" },
    { key: "rejections" as const, label: "Rejection Reasons", icon: AlertTriangle, items: commonRejections, color: "#EF4444" },
    { key: "storage" as const, label: "Recommended Storage", icon: FolderOpen, items: storage, color: "#A78BFA" },
  ];

  const activeTabData = infoTabs.find(t => t.key === activeInfoTab)!;

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
            <span className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#14B8A6] bg-[rgba(20,184,166,0.08)] px-[8px] py-[2px] rounded">
              Gate {guide.gateNumber}
            </span>
            <SubmissionBadge type={guide.submissionType} />
          </div>
          <h3 className="font-heading font-black text-[18px] tracking-[-0.3px] mb-[6px]" style={{ color: "var(--app-text)" }}>
            {guide.title}
          </h3>
          <p className="text-[12px] font-light leading-[1.7]" style={{ color: "var(--app-text-secondary)" }}>
            <GlossaryAwareText text={guide.summary} terms={terms} />
          </p>
          <div className="flex items-center gap-[8px] mt-[8px] text-[10px]" style={{ color: "var(--app-text-muted)" }}>
            <Building size={10} style={{ color: "var(--app-text-dim)" }} />
            <GlossaryAwareText text={guide.authorityHandledBy} terms={terms} />
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
                  Process Steps ({steps.length} steps)
                </div>
                <StepTimeline steps={steps} terms={terms} />
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
                              color: "var(--app-text)",
                              borderColor: "var(--app-border-teal)",
                              background: "rgba(20,184,166,0.1)",
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
                        <li key={i} className="flex items-start gap-[8px] text-[11px] leading-[1.6]" style={{ color: activeTabData.color === "#EF4444" ? "#FCA5A5" : "var(--app-text-secondary)" }}>
                          <span className="w-[4px] h-[4px] rounded-full shrink-0 mt-[6px]" style={{ background: activeTabData.color }} />
                          <GlossaryAwareText text={item} terms={terms} />
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-[14px] text-[9px]" style={{ color: "var(--app-text-dim)" }}>
                Last updated: {guide.lastUpdated}
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
            <div className="h-3 bg-[rgba(20,184,166,0.08)] rounded w-[60px] mb-3" />
            <div className="h-5 bg-[rgba(20,184,166,0.08)] rounded w-[200px] mb-3" />
            <div className="h-3 bg-[rgba(20,184,166,0.08)] rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (guides.length === 0) {
    return (
      <div className="text-center py-[40px]" data-testid="no-workflows">
        <div className="text-[32px] mb-3">🗺️</div>
        <div className="font-heading text-[14px] font-bold" style={{ color: "var(--app-text-secondary)" }}>No workflows available yet</div>
        <div className="text-[12px] mt-1" style={{ color: "var(--app-text-muted)" }}>Process navigation guides will appear here</div>
      </div>
    );
  }

  return (
    <div data-testid="process-navigation">
      <div className="mb-[20px]">
        <div className="flex items-center justify-between mb-[10px]">
          <div>
            <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase text-[#14B8A6] mb-[4px]">
              Process Navigation
            </div>
            <h2 className="font-heading font-black text-[22px] tracking-[-0.5px]" style={{ color: "var(--app-text)" }}>
              Step-by-Step Workflows
            </h2>
          </div>
          <div className="text-[10px]" style={{ color: "var(--app-text-muted)" }}>
            {guides.length} workflow{guides.length !== 1 ? "s" : ""}
          </div>
        </div>

        <p className="text-[12px] font-light leading-[1.7] mb-[14px]" style={{ color: "var(--app-text-secondary)" }}>
          Detailed process walkthroughs showing exactly what happens at each step. Hover over
          <span className="text-[#14B8A6] border-b border-dotted border-[rgba(20,184,166,0.4)] mx-[3px]">highlighted terms</span>
          for instant definitions.
        </p>

        {gateNumbers.length > 1 && (
          <div className="flex flex-wrap gap-[6px]">
            <button
              onClick={() => setGateFilter(null)}
              className="font-heading text-[9px] font-bold tracking-[1.2px] uppercase py-[5px] px-[10px] rounded-[4px] border cursor-pointer hover-elevate"
              style={
                gateFilter === null
                  ? {
                      color: "var(--app-text)",
                      borderColor: "var(--app-border-teal)",
                      background: "rgba(20,184,166,0.1)",
                    }
                  : {
                      color: "var(--app-text-muted)",
                      borderColor: "rgba(100,116,139,0.15)",
                      background: "transparent",
                    }
              }
              data-testid="filter-all-gates"
            >
              All Gates
            </button>
            {gateNumbers.map(num => (
              <button
                key={num}
                onClick={() => setGateFilter(num)}
                className="font-heading text-[9px] font-bold tracking-[1.2px] uppercase py-[5px] px-[10px] rounded-[4px] border cursor-pointer hover-elevate"
                style={
                  gateFilter === num
                    ? {
                        color: "var(--app-text)",
                        borderColor: "var(--app-border-teal)",
                        background: "rgba(20,184,166,0.1)",
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
          <WorkflowCard key={guide.id} guide={guide} terms={terms} />
        ))}
      </div>

      <div className="mt-[20px] bg-[rgba(249,115,22,0.06)] border border-[rgba(249,115,22,0.15)] rounded-[8px] p-[12px_16px]">
        <div className="flex items-start gap-[8px]">
          <AlertTriangle size={12} className="text-[#F97316] shrink-0 mt-[2px]" />
          <div className="text-[10px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
            <strong className="text-[#F97316]">Disclaimer:</strong> These workflows are general guides only. Actual processes may vary by regency and are subject to regulatory change. Always verify with your compliance consultant or the relevant authority.
          </div>
        </div>
      </div>
    </div>
  );
}
