import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { ComplianceTerm } from "@shared/schema";

function copyTermToClipboard(term: ComplianceTerm) {
  let text = `${term.term}\n\n`;
  text += `Definition: ${term.plainDefinition}\n\n`;
  if (term.whyItMatters && (term.whyItMatters as string[]).length > 0) {
    text += `Why it matters:\n${(term.whyItMatters as string[]).map(w => `- ${w}`).join("\n")}\n\n`;
  }
  if (term.typicalProcessSteps && (term.typicalProcessSteps as string[]).length > 0) {
    text += `Typical process:\n${(term.typicalProcessSteps as string[]).map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n`;
  }
  if (term.whatToStore && (term.whatToStore as string[]).length > 0) {
    text += `What to store:\n${(term.whatToStore as string[]).map(w => `- ${w}`).join("\n")}\n\n`;
  }
  if (term.commonPitfalls && (term.commonPitfalls as string[]).length > 0) {
    text += `Common pitfalls:\n${(term.commonPitfalls as string[]).map(p => `- ${p}`).join("\n")}\n`;
  }
  navigator.clipboard.writeText(text);
}

export default function GlossarySection() {
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
    copyTermToClipboard(term);
    setCopiedId(term.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mb-12">
      <h3
        className="font-heading font-extrabold text-[16px] text-[#14B8A6] mb-6 pb-[10px] border-b border-b-[rgba(20,184,166,0.12)] tracking-[-0.2px]"
        data-testid="glossary-heading"
      >
        Compliance Terminology Decoder
      </h3>

      <div className="pl-5 border-l-2 border-l-[rgba(245,158,11,0.25)] text-[12px] font-light text-[#94A3B8] leading-[1.7] italic mb-8 bg-[rgba(245,158,11,0.03)] p-[14px_18px] rounded-r-[8px]" data-testid="glossary-disclaimer">
        This guide provides general operational guidance and document-handling tips. It is not legal or tax advice. Requirements can vary by regency and may change. Confirm with your licensed consultant or relevant authority.
      </div>

      <div className="mb-5">
        <div className="relative">
          <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#64748B] text-[14px]">{"\u2315"}</span>
          <input
            type="text"
            data-testid="glossary-search"
            placeholder="Search terms, definitions, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F2040] border border-[rgba(255,255,255,0.07)] rounded-[8px] py-[11px] pl-[38px] pr-[14px] text-[13px] text-[#F1F5F9] placeholder:text-[#475569] outline-none focus:border-[rgba(20,184,166,0.35)] transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-[6px] mb-6" data-testid="glossary-tag-filters">
        {allTags.map(tag => (
          <button
            key={tag}
            data-testid={`tag-filter-${tag}`}
            onClick={() => toggleTag(tag)}
            className={`font-heading text-[9px] font-bold tracking-[1.5px] uppercase py-[5px] px-[11px] rounded-full cursor-pointer transition-all duration-150 border ${
              selectedTags.has(tag)
                ? "bg-[rgba(20,184,166,0.18)] border-[#14B8A6] text-[#14B8A6]"
                : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-[#64748B] hover:text-[#94A3B8] hover:border-[rgba(255,255,255,0.12)]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-[13px] text-[#64748B] py-8 text-center">Loading glossary terms...</div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-[13px] text-[#64748B] py-8 text-center" data-testid="glossary-empty">
          No terms match your search.
        </div>
      )}

      <div className="space-y-[6px]">
        {filtered.map(term => {
          const isOpen = openTerms.has(term.id);
          const tags = term.tags as string[];
          const whyItMatters = term.whyItMatters as string[];
          const steps = term.typicalProcessSteps as string[] | null;
          const whatToStore = term.whatToStore as string[];
          const pitfalls = term.commonPitfalls as string[] | null;

          return (
            <div
              key={term.id}
              data-testid={`glossary-term-${term.slug}`}
              className={`bg-[#0F2040] border rounded-[8px] transition-colors duration-150 ${
                isOpen ? "border-[rgba(20,184,166,0.22)]" : "border-[rgba(255,255,255,0.07)]"
              }`}
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
                  <span className="font-heading font-extrabold text-[14px] text-[#F1F5F9] tracking-[-0.1px] truncate">
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
                    className="text-[10px] font-bold py-[4px] px-[10px] rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#64748B] hover:text-[#94A3B8] hover:border-[rgba(255,255,255,0.14)] transition-colors cursor-pointer"
                    title="Copy term details"
                  >
                    {copiedId === term.id ? "\u2713 Copied" : "Copy"}
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
                    <div className="px-[20px] pb-[20px] pt-0 border-t border-t-[rgba(255,255,255,0.05)]">
                      <div className="pt-[16px]">
                        <div className="text-[13px] font-light text-[#94A3B8] leading-[1.7] mb-4">
                          {term.plainDefinition}
                        </div>

                        {whyItMatters.length > 0 && (
                          <div className="mb-4">
                            <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#F59E0B] mb-[8px]">
                              Why it matters
                            </div>
                            <ul className="space-y-[5px]">
                              {whyItMatters.map((item, i) => (
                                <li key={i} className="flex items-start gap-[8px] text-[12px] text-[#94A3B8] leading-[1.6]">
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
                              Typical process
                            </div>
                            <ol className="space-y-[4px] list-none">
                              {steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-[10px] text-[12px] text-[#94A3B8] leading-[1.6]">
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
                            What to store in DSCVR
                          </div>
                          <ul className="space-y-[5px]">
                            {whatToStore.map((item, i) => (
                              <li key={i} className="flex items-start gap-[8px] text-[12px] text-[#94A3B8] leading-[1.6]">
                                <span className="w-[4px] h-[4px] rounded-full bg-[#14B8A6] shrink-0 mt-[7px]" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {pitfalls && pitfalls.length > 0 && (
                          <div className="mb-4">
                            <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#EF4444] mb-[8px]">
                              Common pitfalls
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

                        <div className="text-[10px] text-[#475569] mt-3">
                          Last updated: {term.lastUpdated}
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
