import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { ComplianceTerm } from "@shared/schema";

interface GlossaryLinkProps {
  term: ComplianceTerm;
  children: string;
}

export function GlossaryLink({ term, children }: GlossaryLinkProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const whyItMatters = term.whyItMatters as string[];

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowPopover(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowPopover(false), 200);
  };

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopover(false);
    setShowModal(true);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setShowModal(false); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showModal]);

  const whatToStore = term.whatToStore as string[];
  const pitfalls = term.commonPitfalls as string[] | null;

  return (
    <>
      <span
        ref={ref}
        className="relative inline"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          className="text-[#14B8A6] border-b border-dotted border-[rgba(20,184,166,0.4)] cursor-help"
          data-testid={`glossary-link-${term.slug}`}
        >
          {children}
        </span>

        <AnimatePresence>
          {showPopover && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="absolute bottom-full left-0 mb-2 z-[300] w-[280px] bg-[#0F2040] border border-[rgba(20,184,166,0.22)] rounded-[8px] p-[14px_16px] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              data-testid={`glossary-popover-${term.slug}`}
            >
              <div className="font-heading font-extrabold text-[13px] text-[#F1F5F9] mb-[6px] tracking-[-0.1px]">
                {term.term}
              </div>
              <div className="text-[11px] font-light text-[#94A3B8] leading-[1.6] mb-[8px]">
                {term.plainDefinition}
              </div>
              {whyItMatters.length > 0 && (
                <div className="flex items-start gap-[6px] text-[10px] text-[#F59E0B] leading-[1.5] mb-[10px]">
                  <span className="w-[3px] h-[3px] rounded-full bg-[#F59E0B] shrink-0 mt-[5px]" />
                  {whyItMatters[0]}
                </div>
              )}
              <button
                onClick={openModal}
                className="font-heading text-[9px] font-bold tracking-[1.5px] uppercase py-[4px] px-[10px] rounded bg-[rgba(20,184,166,0.1)] border border-[rgba(20,184,166,0.2)] text-[#14B8A6] cursor-pointer hover-elevate"
                data-testid={`glossary-view-full-${term.slug}`}
              >
                View full guide
              </button>
              <div className="absolute left-[20px] bottom-[-5px] w-[10px] h-[10px] bg-[#0F2040] border-r border-b border-[rgba(20,184,166,0.22)] rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </span>

      {showModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-[4px]"
          onClick={() => setShowModal(false)}
          data-testid={`glossary-modal-${term.slug}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F2040] border border-[rgba(20,184,166,0.22)] rounded-[12px] p-[28px_32px] max-w-[520px] w-[90vw] max-h-[80vh] overflow-y-auto shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="font-heading font-black text-[20px] text-[#F1F5F9] tracking-[-0.3px]">
                {term.term}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#64748B] hover:text-[#94A3B8] cursor-pointer text-[18px] leading-none"
                data-testid="glossary-modal-close"
              >
                {"\u2715"}
              </button>
            </div>

            <div className="text-[13px] font-light text-[#94A3B8] leading-[1.7] mb-5">
              {term.plainDefinition}
            </div>

            {whyItMatters.length > 0 && (
              <div className="mb-5">
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

            <div className="mb-5">
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

            <div className="text-[10px] text-[#475569] mt-4">
              Last updated: {term.lastUpdated}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

interface GlossaryAwareTextProps {
  text: string;
  terms: ComplianceTerm[];
  className?: string;
}

export function GlossaryAwareText({ text, terms, className }: GlossaryAwareTextProps) {
  const matchData = useMemo(() => {
    const entries: Array<{ pattern: string; term: ComplianceTerm }> = [];
    for (const term of terms) {
      entries.push({ pattern: term.term, term });
      const synonyms = term.synonyms as string[] | null;
      if (synonyms) {
        for (const syn of synonyms) {
          entries.push({ pattern: syn, term });
        }
      }
    }
    entries.sort((a, b) => b.pattern.length - a.pattern.length);
    return entries;
  }, [terms]);

  const rendered = useMemo(() => {
    if (!text || matchData.length === 0) return [text];

    const escapedPatterns = matchData.map(e => e.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`\\b(${escapedPatterns.join("|")})\\b`, "gi");

    const parts: Array<string | { text: string; term: ComplianceTerm }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const matchedText = match[0];
      const entry = matchData.find(e => e.pattern.toLowerCase() === matchedText.toLowerCase());
      if (entry) {
        parts.push({ text: matchedText, term: entry.term });
      } else {
        parts.push(matchedText);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }, [text, matchData]);

  return (
    <span className={className}>
      {rendered.map((part, i) => {
        if (typeof part === "string") {
          return <span key={i}>{part}</span>;
        }
        return (
          <GlossaryLink key={i} term={part.term}>
            {part.text}
          </GlossaryLink>
        );
      })}
    </span>
  );
}

export function useGlossaryTerms() {
  const { data: terms = [] } = useQuery<ComplianceTerm[]>({
    queryKey: ["/api/terms"],
  });
  return terms;
}
