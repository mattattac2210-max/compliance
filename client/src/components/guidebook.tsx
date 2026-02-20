import { useMemo } from "react";
import { useLanguage } from "@/i18n/context";
import GlossarySection from "@/components/glossary";
import { ProcessNavigation } from "@/components/process-navigation";

const guideCardStyles = [
  { num: "GUIDE-01", roleColor: "#14B8A6", roleBg: "rgba(20,184,166,0.08)", roleBorder: "rgba(20,184,166,0.18)", linkUrls: ["https://gistarubali.id"] },
  { num: "GUIDE-02", roleColor: "#60A5FA", roleBg: "rgba(59,130,246,0.08)", roleBorder: "rgba(59,130,246,0.18)", linkUrls: ["https://oss.go.id"] },
  { num: "GUIDE-03", roleColor: "#A78BFA", roleBg: "rgba(139,92,246,0.08)", roleBorder: "rgba(139,92,246,0.18)", linkUrls: ["https://simbg.pu.go.id"] },
  { num: "GUIDE-04", roleColor: "#F59E0B", roleBg: "rgba(245,158,11,0.08)", roleBorder: "rgba(245,158,11,0.18)", linkUrls: ["https://e-palapa.badungkab.go.id", "https://djponline.pajak.go.id"] },
  { num: "GUIDE-05", roleColor: "#22C55E", roleBg: "rgba(34,197,94,0.08)", roleBorder: "rgba(34,197,94,0.18)", linkUrls: ["https://edabu.bpjs-kesehatan.go.id", "https://sipp.bpjsketenagakerjaan.go.id"] },
  { num: "GUIDE-06", roleColor: "#14B8A6", roleBg: "rgba(20,184,166,0.08)", roleBorder: "rgba(20,184,166,0.18)", linkUrls: ["https://kemenparekraf.go.id"] },
];

export default function Guidebook() {
  const { t, content } = useLanguage();

  const translatedGuideCards = useMemo(() => content.guideCards.map((card, i) => ({
    ...guideCardStyles[i],
    title: card.title,
    role: card.role,
    desc: card.desc,
    links: card.links.map((l, li) => ({ label: l.label, url: guideCardStyles[i].linkUrls[li] || "" })),
  })), [content]);

  const translatedTimeline = content.timelineItems;

  return (
    <div>
      <div className="relative z-[5] max-w-5xl mx-auto pt-10 pb-8 px-6 md:px-10">
        <div className="font-heading text-[10px] font-bold tracking-[4px] uppercase text-[#0D9488] mb-[18px] flex items-center gap-3">
          <span className="block w-[28px] h-[1px] bg-[#0D9488] shrink-0" />
          {t.guide.tagline}
        </div>
        <h1 className="font-heading font-black text-[50px] leading-[1.06] tracking-[-1.5px] mb-[18px] max-md:text-[34px]" style={{ color: "var(--app-text)" }}>
          {t.guide.heroTitle1}<br />
          <span className="text-[#14B8A6]">{t.guide.heroTitle2}</span>
        </h1>
        <p className="text-[16px] font-light leading-[1.8] max-w-[580px]" style={{ color: "var(--app-text-secondary)" }}>
          {t.guide.heroDesc}
        </p>
      </div>

      <div className="relative z-[5] max-w-5xl mx-auto px-6 md:px-10 pb-16">
        <div className="grid grid-cols-2 gap-[14px] mb-12 max-md:grid-cols-1">
          {translatedGuideCards.map((card) => (
            <div
              key={card.num}
              data-testid={`guide-card-${card.num}`}
              className="border rounded-[10px] p-[22px_24px] transition-transform duration-200 block no-underline hover:-translate-y-[2px] hover-elevate"
              style={{ background: "var(--app-panel)", borderColor: "var(--app-border)" }}
            >
              <div className="font-heading text-[9px] font-bold tracking-[2.5px] uppercase text-[#0D9488] mb-[10px]">
                {card.num}
              </div>
              <div className="font-heading font-extrabold text-[15px] mb-2 tracking-[-0.2px]" style={{ color: "var(--app-text)" }}>
                {card.title}
              </div>
              <span
                className="font-heading text-[9px] font-bold tracking-[1.5px] uppercase mb-[10px] py-[4px] px-[9px] rounded inline-block"
                style={{
                  color: card.roleColor,
                  background: card.roleBg,
                  border: `1px solid ${card.roleBorder}`,
                }}
              >
                {card.role}
              </span>
              <div className="text-[13px] font-light leading-[1.65] mb-4" style={{ color: "var(--app-text-secondary)" }}>{card.desc}</div>
              <div className="flex flex-wrap gap-[6px]">
                {card.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[5px] text-[11px] font-bold py-[5px] px-[10px] rounded no-underline text-[#14B8A6] bg-[rgba(13,148,136,0.08)] border border-[rgba(20,184,166,0.15)] hover-elevate"
                  >
                    {"\u2197"} {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div id="glossary-section" style={{ scrollMarginTop: "64px" }}>
          <GlossarySection />
        </div>

        <div id="workflows-section" className="mb-12" style={{ scrollMarginTop: "64px" }}>
          <ProcessNavigation />
        </div>

        <div className="mb-12">
          <h3 className="font-heading font-extrabold text-[16px] text-[#14B8A6] mb-6 pb-[10px] border-b tracking-[-0.2px]" style={{ borderColor: "rgba(20,184,166,0.12)" }}>
            {t.guide.timelineTitle}
          </h3>
          <div className="relative pl-8">
            <div className="absolute left-[8px] top-[8px] bottom-[8px] w-[1px] bg-gradient-to-b from-[#0D9488] to-[rgba(13,148,136,0.1)]" />
            {translatedTimeline.map((item, i) => (
              <div key={i} className="relative mb-[26px]">
                <div className="absolute left-[-28px] top-[5px] w-[11px] h-[11px] rounded-full border-[1.5px] border-[#0D9488]" style={{ background: "var(--app-node-bg)" }} />
                <div className="font-heading text-[9px] font-bold tracking-[2px] uppercase text-[#0D9488] mb-1">
                  {item.week}
                </div>
                <div className="font-heading font-bold text-[14px] mb-[5px] tracking-[-0.1px]" style={{ color: "var(--app-text)" }}>
                  {item.title}
                </div>
                <div className="text-[13px] font-light leading-[1.6]" style={{ color: "var(--app-text-muted)" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pl-5 border-l-2 border-l-[rgba(100,116,139,0.25)] text-[12px] font-light leading-[1.7] italic" style={{ color: "var(--app-text-muted)" }}>
          {t.guide.disclaimer}
        </div>
      </div>
    </div>
  );
}
