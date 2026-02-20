import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Language, UITranslations, ContentTranslations } from "./types";
import { en } from "./en";
import { uk } from "./uk";
import { id } from "./id";
import { enContent } from "./en-content";
import { ukContent } from "./uk-content";
import { idContent } from "./id-content";
import { Globe } from "lucide-react";

const uiMap: Record<Language, UITranslations> = { en, uk, id };
const contentMap: Record<Language, ContentTranslations> = {
  en: enContent,
  uk: ukContent,
  id: idContent,
};

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: UITranslations;
  content: ContentTranslations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
  content: enContent,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dscvr-lang") as Language | null;
      if (stored === "en" || stored === "uk" || stored === "id") return stored;
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("dscvr-lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Language) => setLangState(l), []);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: uiMap[lang], content: contentMap[lang] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

const langLabels: Record<Language, string> = {
  en: "EN",
  uk: "UK",
  id: "ID",
};

const langCodes: Record<Language, string> = {
  en: "GB",
  uk: "UA",
  id: "ID",
};

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages: Language[] = ["en", "uk", "id"];

  return (
    <div className="relative" data-testid="language-selector">
      <button
        onClick={() => setOpen(!open)}
        data-testid="language-toggle"
        className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-full cursor-pointer hover-elevate transition-colors text-[12px] font-bold"
        style={{
          background: "var(--app-expand-bg)",
          border: "1px solid var(--app-border)",
          color: "var(--app-text-secondary)",
        }}
      >
        <Globe size={13} />
        <span>{langLabels[lang]}</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-[299]"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-[calc(100%+6px)] z-[300] rounded-[8px] border overflow-hidden min-w-[140px]"
            style={{
              background: "var(--app-panel)",
              borderColor: "var(--app-border)",
              boxShadow: "0 8px 24px var(--app-shadow-popover)",
            }}
          >
            {languages.map((l) => (
              <button
                key={l}
                data-testid={`lang-option-${l}`}
                className={`w-full text-left px-[14px] py-[10px] text-[12px] font-medium flex items-center gap-[8px] cursor-pointer transition-colors ${
                  l === lang ? "text-[#14B8A6]" : ""
                }`}
                style={{
                  background: l === lang ? "rgba(20,184,166,0.08)" : "transparent",
                  color: l !== lang ? "var(--app-text-secondary)" : undefined,
                }}
                onMouseEnter={(e) => {
                  if (l !== lang)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--app-expand-bg)";
                }}
                onMouseLeave={(e) => {
                  if (l !== lang)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
              >
                <span className="text-[10px] font-bold opacity-60">{langCodes[l]}</span>
                <span>
                  {l === "en" ? "English" : l === "uk" ? "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430" : "Bahasa Indonesia"}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
