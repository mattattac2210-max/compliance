import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { ComplianceTerm } from "@shared/schema";
import { useLanguage } from "@/i18n/context";

interface GlossaryLinkProps {
  term: ComplianceTerm;
  children: string;
}

export function GlossaryLink({ term, children }: GlossaryLinkProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  const { lang, t } = useLanguage();

  const getTranslatedContent = useCallback(() => {
    if (lang === "en" || !term.translations || !term.translations[lang]) {
      return {
        termName: term.term,
        plainDefinition: term.plainDefinition,
        whyItMatters: term.whyItMatters as string[],
        whatToStore: term.whatToStore as string[],
        commonPitfalls: (term.commonPitfalls as string[] | null) || null,
      };
    }
    
    const translation = term.translations[lang];
    return {
      termName: translation.term || term.term,
      plainDefinition: translation.plainDefinition,
      whyItMatters: translation.whyItMatters,
      whatToStore: translation.whatToStore,
      commonPitfalls: translation.commonPitfalls || null,
    };
  }, [lang, term]);

  const content = getTranslatedContent();
  const whyItMatters = content.whyItMatters;

  const updatePosition = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPopoverPos({
      top: rect.top,
      left: rect.left,
    });
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    updatePosition();
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

  return (
    <>
      <span
        ref={ref}
        className="inline"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          className="text-[#14B8A6] border-b border-dotted border-[rgba(20,184,166,0.4)] cursor-help"
          data-testid={`glossary-link-${term.slug}`}
        >
          {children}
        </span>
      </span>

      {createPortal(
        <AnimatePresence>
          {showPopover && popoverPos && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="fixed z-[9999] w-[280px] rounded-[8px] p-[14px_16px] border"
              style={{
                top: `${popoverPos.top - 8}px`,
                left: `${popoverPos.left}px`,
                transform: "translateY(-100%)",
                background: "var(--app-panel)",
                borderColor: "var(--app-border-teal)",
                boxShadow: "0 8px 24px var(--app-shadow-popover)",
              }}
              data-testid={`glossary-popover-${term.slug}`}
            >
              <div className="font-heading font-extrabold text-[13px] mb-[6px] tracking-[-0.1px]" style={{ color: "var(--app-text)" }}>
                {content.termName}
              </div>
              <div className="text-[11px] font-light leading-[1.6] mb-[8px]" style={{ color: "var(--app-text-secondary)" }}>
                {content.plainDefinition}
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
                {t.glossary.readMore}
              </button>
              <div
                className="absolute left-[20px] bottom-[-5px] w-[10px] h-[10px] rotate-45"
                style={{
                  background: "var(--app-panel)",
                  borderRight: "1px solid var(--app-border-teal)",
                  borderBottom: "1px solid var(--app-border-teal)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center backdrop-blur-[4px]"
          style={{ background: "var(--app-overlay)" }}
          onClick={() => setShowModal(false)}
          data-testid={`glossary-modal-${term.slug}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[12px] p-[28px_32px] max-w-[520px] w-[90vw] max-h-[80vh] overflow-y-auto border"
            style={{
              background: "var(--app-panel)",
              borderColor: "var(--app-border-teal)",
              boxShadow: "0 16px 48px var(--app-shadow-popover)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="font-heading font-black text-[20px] tracking-[-0.3px]" style={{ color: "var(--app-text)" }}>
                {content.termName}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-[18px] leading-none"
                style={{ color: "var(--app-text-muted)" }}
                data-testid="glossary-modal-close"
              >
                {"\u2715"}
              </button>
            </div>

            <div className="text-[13px] font-light leading-[1.7] mb-5" style={{ color: "var(--app-text-secondary)" }}>
              {content.plainDefinition}
            </div>

            {whyItMatters.length > 0 && (
              <div className="mb-5">
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

            <div className="mb-5">
              <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#14B8A6] mb-[8px]">
                {t.glossary.whatToStore}
              </div>
              <ul className="space-y-[5px]">
                {content.whatToStore.map((item, i) => (
                  <li key={i} className="flex items-start gap-[8px] text-[12px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
                    <span className="w-[4px] h-[4px] rounded-full bg-[#14B8A6] shrink-0 mt-[7px]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {content.commonPitfalls && content.commonPitfalls.length > 0 && (
              <div className="mb-4">
                <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#EF4444] mb-[8px]">
                  {t.glossary.commonPitfalls}
                </div>
                <ul className="space-y-[5px]">
                  {content.commonPitfalls.map((item, i) => (
                    <li key={i} className="flex items-start gap-[8px] text-[12px] text-[#FCA5A5] leading-[1.6]">
                      <span className="w-[4px] h-[4px] rounded-full bg-[#EF4444] shrink-0 mt-[7px]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-[10px] mt-4" style={{ color: "var(--app-text-dim)" }}>
              {t.glossary.lastUpdated}: {term.lastUpdated}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

interface GlossaryAwareTextProps {
  text: string;
  terms?: ComplianceTerm[];
  className?: string;
}

export function GlossaryAwareText({ text, terms = [], className }: GlossaryAwareTextProps) {
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
