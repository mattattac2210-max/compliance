import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { ComplianceTerm } from "@shared/schema";
import { useLanguage } from "@/i18n/context";
import type { Language } from "@/i18n/types";

interface TermContent {
  plainDefinition: string;
  whyItMatters: string[];
  typicalProcessSteps: string[] | null;
  whatToStore: string[];
  commonPitfalls: string[] | null;
}

function getTermContent(term: ComplianceTerm, language: Language): TermContent {
  if (language === "en" || !term.translations) {
    return {
      plainDefinition: term.plainDefinition,
      whyItMatters: term.whyItMatters as string[],
      typicalProcessSteps: term.typicalProcessSteps as string[] | null,
      whatToStore: term.whatToStore as string[],
      commonPitfalls: term.commonPitfalls as string[] | null,
    };
  }

  const translation = term.translations[language];
  if (!translation) {
    return {
      plainDefinition: term.plainDefinition,
      whyItMatters: term.whyItMatters as string[],
      typicalProcessSteps: term.typicalProcessSteps as string[] | null,
      whatToStore: term.whatToStore as string[],
      commonPitfalls: term.commonPitfalls as string[] | null,
    };
  }

  return {
    plainDefinition: translation.plainDefinition,
    whyItMatters: translation.whyItMatters,
    typicalProcessSteps: translation.typicalProcessSteps ?? null,
    whatToStore: translation.whatToStore,
    commonPitfalls: translation.commonPitfalls ?? null,
  };
}

function copyTermToClipboard(term: ComplianceTerm, content: TermContent) {
  let text = `${term.term}\n\n`;
  text += `Definition: ${content.plainDefinition}\n\n`;
  if (content.whyItMatters && content.whyItMatters.length > 0) {
    text += `Why it matters:\n${content.whyItMatters.map(w => `- ${w}`).join("\n")}\n\n`;
  }
  if (content.typicalProcessSteps && content.typicalProcessSteps.length > 0) {
    text += `Typical process:\n${content.typicalProcessSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n`;
  }
  if (content.whatToStore && content.whatToStore.length > 0) {
    text += `What to store:\n${content.whatToStore.map(w => `- ${w}`).join("\n")}\n\n`;
  }
  if (content.commonPitfalls && content.commonPitfalls.length > 0) {
    text += `Common pitfalls:\n${content.commonPitfalls.map(p => `- ${p}`).join("\n")}\n`;
  }
  navigator.clipboard.writeText(text);
}

export default function GlossarySection() {
  const { lang: language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [openTerms, setOpenTerms] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: terms = [], isLoading } = useQuery<ComplianceTerm[]>({
    queryKey: ["/api/terms"],
  });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    terms.forEach(t => (t.tags as string[]).forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [terms]);

  const filtered = useMemo(() => {
    let result = terms;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.term.toLowerCase().includes(q) ||
        t.plainDefinition.toLowerCase().includes(q) ||
        (t.tags as string[]).some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (selectedTags.size > 0) {
      result = result.filter(t =>
        (t.tags as string[]).some(tag => selectedTags.has(tag))
      );
    }
    return result;
  }, [terms, search, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const toggleTerm = (id: string) => {
    setOpenTerms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (e: React.MouseEvent, term: ComplianceTerm) => {
    e.stopPropagation();
    const content = getTermContent(term, language);
    copyTermToClipboard(term, content);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mb-12">
      <h3
        className="font-heading font-extrabold text-[16px] text-[#14B8A6] mb-6 pb-[10px] tracking-[-0.2px]"
        style={{ borderBottom: "1px solid var(--app-border-teal-subtle)" }}
        data-testid="glossary-heading"
      >
        {t.glossary.heading}
      </h3>

      <div
        className="pl-5 border-l-2 border-l-[rgba(245,158,11,0.25)] text-[12px] font-light leading-[1.7] italic mb-8 bg-[rgba(245,158,11,0.03)] p-[14px_18px] rounded-r-[8px]"
        style={{ color: "var(--app-text-secondary)" }}
        data-testid="glossary-disclaimer"
      >
        {t.glossary.disclaimer}
      </div>

      <div className="mb-5">
        <div className="relative">
          <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px]" style={{ color: "var(--app-text-muted)" }}>{"\u2315"}</span>
          <input
            type="text"
            data-testid="glossary-search"
            placeholder={t.glossary.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[8px] py-[11px] pl-[38px] pr-[14px] text-[13px] outline-none focus:border-[rgba(20,184,166,0.35)] transition-colors border"
            style={{
              background: "var(--app-input-bg)",
              borderColor: "var(--app-border)",
              color: "var(--app-text)",
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-[6px] mb-6" data-testid="glossary-tag-filters">
        {allTags.map(tag => (
          <button
            key={tag}
            data-testid={`tag-filter-${tag}`}
            onClick={() => toggleTag(tag)}
            className={`font-heading text-[9px] font-bold tracking-[1.5px] uppercase py-[5px] px-[11px] rounded-full cursor-pointer transition-all duration-150 border hover-elevate ${
              selectedTags.has(tag)
                ? "bg-[rgba(20,184,166,0.18)] border-[#14B8A6] text-[#14B8A6]"
                : ""
            }`}
            style={!selectedTags.has(tag) ? {
              background: "var(--app-expand-bg)",
              borderColor: "var(--app-border)",
              color: "var(--app-text-muted)",
            } : undefined}
          >
            {tag}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-[13px] py-8 text-center" style={{ color: "var(--app-text-muted)" }}>{t.glossary.loadingText}</div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-[13px] py-8 text-center" style={{ color: "var(--app-text-muted)" }} data-testid="glossary-empty">
          {t.glossary.noResults}
        </div>
      )}

      <div className="space-y-[6px]">
        {filtered.map(term => {
          const isOpen = openTerms.has(term.id);
          const tags = term.tags as string[];
          const content = getTermContent(term, language);
          const whyItMatters = content.whyItMatters;
          const steps = content.typicalProcessSteps;
          const whatToStore = content.whatToStore;
          const pitfalls = content.commonPitfalls;

          return (
            <div
              key={term.id}
              data-testid={`glossary-term-${term.slug}`}
              className="rounded-[8px] transition-colors duration-150 border"
              style={{
                background: "var(--app-panel)",
                borderColor: isOpen ? "var(--app-border-teal)" : "var(--app-border)",
              }}
            >
              <div
                data-testid={`glossary-toggle-${term.slug}`}
                className="w-full flex items-center justify-between gap-3 p-[16px_20px] cursor-pointer text-left bg-transparent"
                onClick={() => toggleTerm(term.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTerm(term.id); } }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-[11px] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`}
                    style={{ color: "#14B8A6" }}
                  >
                    {"\u25B6"}
                  </span>
                  <span className="font-heading font-extrabold text-[14px] tracking-[-0.1px] truncate" style={{ color: "var(--app-text)" }}>
                    {term.term}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="font-heading text-[8px] font-bold tracking-[1.5px] uppercase py-[2px] px-[7px] rounded bg-[rgba(13,148,136,0.08)] border border-[rgba(20,184,166,0.12)] text-[#0D9488] hidden sm:inline-block"
                    >
                      {tag}
                    </span>
                  ))}
                  <button
                    data-testid={`copy-term-${term.slug}`}
                    onClick={(e) => handleCopy(e, term)}
                    className="text-[10px] font-bold py-[4px] px-[10px] rounded border transition-colors cursor-pointer hover-elevate"
                    style={{
                      background: "var(--app-expand-bg)",
                      borderColor: "var(--app-border)",
                      color: "var(--app-text-muted)",
                    }}
                    title="Copy term details"
                  >
                    {copiedId === term.id ? t.glossary.copySuccess : t.glossary.copyLabel}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-[20px] pb-[20px] pt-0" style={{ borderTop: "1px solid var(--app-border)" }}>
                      <div className="pt-[16px]">
                        <div className="text-[13px] font-light leading-[1.7] mb-4" style={{ color: "var(--app-text-secondary)" }}>
                          {content.plainDefinition}
                        </div>

                        {whyItMatters.length > 0 && (
                          <div className="mb-4">
                            <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#F59E0B] mb-[8px]">
                              {t.glossary.whyItMatters}
                            </div>
                            <ul className="space-y-[5px]">
                              {whyItMatters.map((item, i) => (
                                <li key={i} className="flex items-start gap-[8px] text-[12px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
                                  <span className="w-[4px] h-[4px] rounded-full bg-[#F59E0B] shrink-0 mt-[7px]" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {steps && steps.length > 0 && (
                          <div className="mb-4">
                            <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#14B8A6] mb-[8px]">
                              {t.glossary.typicalProcessSteps}
                            </div>
                            <ol className="space-y-[4px] list-none">
                              {steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-[10px] text-[12px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
                                  <span className="font-heading font-bold text-[10px] text-[#0D9488] bg-[rgba(13,148,136,0.1)] rounded w-[20px] h-[20px] flex items-center justify-center shrink-0 mt-[1px]">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#14B8A6] mb-[8px]">
                            {t.glossary.whatToStore}
                          </div>
                          <ul className="space-y-[5px]">
                            {whatToStore.map((item, i) => (
                              <li key={i} className="flex items-start gap-[8px] text-[12px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
                                <span className="w-[4px] h-[4px] rounded-full bg-[#14B8A6] shrink-0 mt-[7px]" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {pitfalls && pitfalls.length > 0 && (
                          <div className="mb-4">
                            <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#EF4444] mb-[8px]">
                              {t.glossary.commonPitfalls}
                            </div>
                            <ul className="space-y-[5px]">
                              {pitfalls.map((item, i) => (
                                <li key={i} className="flex items-start gap-[8px] text-[12px] text-[#FCA5A5] leading-[1.6]">
                                  <span className="w-[4px] h-[4px] rounded-full bg-[#EF4444] shrink-0 mt-[7px]" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-[10px] mt-3" style={{ color: "var(--app-text-dim)" }}>
                          {t.glossary.lastUpdated}: {term.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
