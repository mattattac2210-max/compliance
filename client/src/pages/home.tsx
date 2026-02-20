import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlossarySection from "@/components/glossary";
import { ProcessNavigation } from "@/components/process-navigation";
import { ThemeToggle } from "@/components/theme-provider";
import { useLanguage, LanguageSelector } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

type TabId = "flow" | "audit" | "guide";

interface GateStyle {
  id: string;
  num: string;
  abbr: string;
  color: string;
  borderColor: string;
  glowColor: string;
  layerColor: string;
  rolePillBg: string;
  rolePillBorder: string;
  rolePillColor: string;
  alertTypes: Array<{ type: "amber" | "red" | "teal"; icon: string }>;
  infoBlockBorders: string[];
  portalUrls: string[];
  zoneColors?: string[];
  isDashed?: boolean;
}

interface GateData {
  id: string;
  num: string;
  abbr: string;
  color: string;
  borderColor: string;
  glowColor: string;
  layerLabel: string;
  layerColor: string;
  title: string;
  subtitle: string;
  rolePillText: string;
  rolePillBg: string;
  rolePillBorder: string;
  rolePillColor: string;
  dscvrRole: string;
  dscvrRoleDesc: string;
  alerts: Array<{ type: "amber" | "red" | "teal"; icon: string; content: string }>;
  infoBlocks: Array<{ title: string; borderColor: string; content: string; items?: string[] }>;
  portals: Array<{ label: string; url: string }>;
  zones?: Array<{ color: string; name: string; status: string }>;
  isDashed?: boolean;
}

const gateStyles: GateStyle[] = [
  { id: "g0", num: "PT", abbr: "PMA", color: "#94A3B8", borderColor: "rgba(148,163,184,0.3)", glowColor: "transparent", layerColor: "#94A3B8", rolePillBg: "rgba(148,163,184,0.08)", rolePillBorder: "rgba(148,163,184,0.15)", rolePillColor: "#94A3B8", alertTypes: [{ type: "amber", icon: "\u25B2" }], infoBlockBorders: ["#0D9488", "#64748B"], portalUrls: ["https://ahu.go.id", "https://oss.go.id", "https://pajak.go.id"], isDashed: true },
  { id: "g1", num: "1", abbr: "ZONE", color: "#14B8A6", borderColor: "#14B8A6", glowColor: "rgba(20,184,166,0.14)", layerColor: "#14B8A6", rolePillBg: "rgba(20,184,166,0.08)", rolePillBorder: "rgba(20,184,166,0.18)", rolePillColor: "#14B8A6", alertTypes: [{ type: "amber", icon: "\u25B2" }], infoBlockBorders: ["#14B8A6", "#F59E0B"], portalUrls: ["https://gistarubali.id", "https://oss.go.id", "https://rdtr.atrbpn.go.id"], zoneColors: ["#FF85B3", "#FB923C", "#EF4444", "#EAB308", "#22C55E", "#166534"] },
  { id: "g2", num: "2", abbr: "NIB", color: "#60A5FA", borderColor: "#3B82F6", glowColor: "rgba(59,130,246,0.12)", layerColor: "#60A5FA", rolePillBg: "rgba(59,130,246,0.08)", rolePillBorder: "rgba(59,130,246,0.18)", rolePillColor: "#60A5FA", alertTypes: [{ type: "amber", icon: "\u25B2" }], infoBlockBorders: ["#3B82F6", "#F59E0B"], portalUrls: ["https://oss.go.id", "https://www.bps.go.id/id/business-register", "https://bkpm.go.id"] },
  { id: "g3", num: "3", abbr: "SLF", color: "#A78BFA", borderColor: "#8B5CF6", glowColor: "rgba(139,92,246,0.12)", layerColor: "#A78BFA", rolePillBg: "rgba(139,92,246,0.08)", rolePillBorder: "rgba(139,92,246,0.18)", rolePillColor: "#A78BFA", alertTypes: [{ type: "red", icon: "\u25B2" }], infoBlockBorders: ["#8B5CF6", "#14B8A6"], portalUrls: ["https://simbg.pu.go.id", "https://oss.go.id", "https://dpmptsp.badungkab.go.id"] },
  { id: "g4", num: "4", abbr: "TAX", color: "#F59E0B", borderColor: "#F59E0B", glowColor: "rgba(245,158,11,0.12)", layerColor: "#F59E0B", rolePillBg: "rgba(245,158,11,0.08)", rolePillBorder: "rgba(245,158,11,0.18)", rolePillColor: "#F59E0B", alertTypes: [{ type: "amber", icon: "\u25B2" }], infoBlockBorders: ["#F59E0B", "#64748B"], portalUrls: ["https://e-palapa.badungkab.go.id", "https://djponline.pajak.go.id", "https://pajak.go.id/reformasi-pajak/coretax", "https://bapenda.badungkab.go.id"] },
  { id: "g5", num: "5", abbr: "STAFF", color: "#22C55E", borderColor: "#22C55E", glowColor: "rgba(34,197,94,0.1)", layerColor: "#22C55E", rolePillBg: "rgba(34,197,94,0.08)", rolePillBorder: "rgba(34,197,94,0.18)", rolePillColor: "#22C55E", alertTypes: [{ type: "red", icon: "\u25B2" }], infoBlockBorders: ["#22C55E", "#64748B"], portalUrls: ["https://edabu.bpjs-kesehatan.go.id", "https://sipp.bpjsketenagakerjaan.go.id", "https://imigrasi.go.id", "https://bkpm.go.id"] },
  { id: "g6", num: "6", abbr: "SAFE", color: "#FCA5A5", borderColor: "#EF4444", glowColor: "rgba(239,68,68,0.1)", layerColor: "#FCA5A5", rolePillBg: "rgba(239,68,68,0.08)", rolePillBorder: "rgba(239,68,68,0.18)", rolePillColor: "#FCA5A5", alertTypes: [{ type: "teal", icon: "\u25C6" }], infoBlockBorders: ["#EF4444", "#64748B"], portalUrls: ["https://jdih.kemenparekraf.go.id", "https://damkar.badungkab.go.id"] },
  { id: "g7", num: "7", abbr: "OTA", color: "#14B8A6", borderColor: "#14B8A6", glowColor: "rgba(20,184,166,0.22)", layerColor: "#14B8A6", rolePillBg: "rgba(20,184,166,0.08)", rolePillBorder: "rgba(20,184,166,0.18)", rolePillColor: "#14B8A6", alertTypes: [{ type: "red", icon: "\u25B2" }], infoBlockBorders: ["#14B8A6", "#EF4444"], portalUrls: ["https://airbnb.com", "https://partner.booking.com", "https://kemenparekraf.go.id"] },
];

const auditSeverities = [
  ["critical", "critical", "high", "critical", "high"],
  ["critical", "critical", "high", "medium", "medium"],
  ["critical", "high", "high", "high", "critical", "medium"],
] as const;

const auditIds = [
  ["a1", "a2", "a3", "a4", "a5"],
  ["b1", "b2", "b3", "b4", "b5"],
  ["c1", "c2", "c3", "c4", "c5", "c6"],
];

const auditNums = ["SEC-01", "SEC-02", "SEC-03"];

const guideCardStyles = [
  { num: "GUIDE-01", roleColor: "#14B8A6", roleBg: "rgba(20,184,166,0.08)", roleBorder: "rgba(20,184,166,0.18)", linkUrls: ["https://gistarubali.id"] },
  { num: "GUIDE-02", roleColor: "#60A5FA", roleBg: "rgba(59,130,246,0.08)", roleBorder: "rgba(59,130,246,0.18)", linkUrls: ["https://oss.go.id"] },
  { num: "GUIDE-03", roleColor: "#A78BFA", roleBg: "rgba(139,92,246,0.08)", roleBorder: "rgba(139,92,246,0.18)", linkUrls: ["https://simbg.pu.go.id"] },
  { num: "GUIDE-04", roleColor: "#F59E0B", roleBg: "rgba(245,158,11,0.08)", roleBorder: "rgba(245,158,11,0.18)", linkUrls: ["https://e-palapa.badungkab.go.id", "https://djponline.pajak.go.id"] },
  { num: "GUIDE-05", roleColor: "#22C55E", roleBg: "rgba(34,197,94,0.08)", roleBorder: "rgba(34,197,94,0.18)", linkUrls: ["https://edabu.bpjs-kesehatan.go.id", "https://sipp.bpjsketenagakerjaan.go.id"] },
  { num: "GUIDE-06", roleColor: "#14B8A6", roleBg: "rgba(20,184,166,0.08)", roleBorder: "rgba(20,184,166,0.18)", linkUrls: ["https://kemenparekraf.go.id"] },
];

const statValues = ["7", "8\u201314wk", "5yr", "31 Mar"];

function useTranslatedGates(): GateData[] {
  const { content } = useLanguage();
  return useMemo(() => gateStyles.map((s, i) => {
    const tr = content.gates[i];
    return {
      id: s.id,
      num: s.num,
      abbr: s.abbr,
      color: s.color,
      borderColor: s.borderColor,
      glowColor: s.glowColor,
      layerLabel: tr.layerLabel,
      layerColor: s.layerColor,
      title: tr.title,
      subtitle: tr.subtitle,
      rolePillText: tr.rolePillText,
      rolePillBg: s.rolePillBg,
      rolePillBorder: s.rolePillBorder,
      rolePillColor: s.rolePillColor,
      dscvrRole: tr.dscvrRole,
      dscvrRoleDesc: tr.dscvrRoleDesc,
      alerts: s.alertTypes.map((at, ai) => ({ ...at, content: tr.alerts[ai]?.content || "" })),
      infoBlocks: tr.infoBlocks.map((ib, ii) => ({ title: ib.title, borderColor: s.infoBlockBorders[ii] || "#64748B", content: ib.content, items: ib.items })),
      portals: tr.portals.map((p, pi) => ({ label: p.label, url: s.portalUrls[pi] || "" })),
      zones: tr.zones && s.zoneColors ? tr.zones.map((z, zi) => ({ color: s.zoneColors![zi] || "#999", name: z.name, status: z.status })) : undefined,
      isDashed: s.isDashed,
    };
  }), [content]);
}

interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  severity: "critical" | "high" | "medium" | "low";
}


function GateCard({ gate, isOpen, onToggle }: { gate: GateData; isOpen: boolean; onToggle: () => void }) {
  const { t } = useLanguage();
  return (
    <div
      data-testid={`gate-card-${gate.id}`}
      className={`rounded-[10px] border transition-all duration-200 cursor-pointer ${
        isOpen
          ? "bg-[rgba(13,148,136,0.04)]"
          : ""
      }`}
      style={{
        borderColor: isOpen ? "var(--app-border-teal)" : "var(--app-border)",
        ...(!isOpen ? { background: "var(--app-panel)" } : {}),
      }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between gap-4 p-[18px_22px]">
        <div>
          <div
            className="font-heading text-[9px] font-bold tracking-[2.5px] uppercase mb-[5px]"
            style={{ color: gate.layerColor }}
          >
            {gate.layerLabel}
          </div>
          <div className="font-heading font-extrabold text-[15px] mb-[3px] tracking-[-0.2px]" style={{ color: "var(--app-text)" }}>
            {gate.title}
          </div>
          <div className="text-[12px] font-light italic" style={{ color: "var(--app-text-muted)" }}>{gate.subtitle}</div>
        </div>
        <div className="flex items-center gap-[10px] shrink-0">
          <span
            className="font-heading text-[9px] font-bold tracking-[1px] uppercase py-[4px] px-[10px] rounded whitespace-nowrap"
            style={{
              background: gate.rolePillBg,
              border: `1px solid ${gate.rolePillBorder}`,
              color: gate.rolePillColor,
            }}
          >
            {gate.rolePillText}
          </span>
          <div
            className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[18px] font-light transition-all duration-200 ${
              isOpen ? "rotate-45 text-[#14B8A6]" : ""
            }`}
            style={{
              background: "var(--app-expand-bg)",
              ...(!isOpen ? { color: "var(--app-text-muted)" } : {}),
            }}
          >
            +
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-t px-[22px] pb-[22px]" style={{ borderColor: "var(--app-border)" }}>
              <div className="pt-[18px]">
                <div className="flex items-start gap-3 p-[12px_16px] rounded-[7px] mb-4 bg-[rgba(20,184,166,0.06)] border border-[rgba(20,184,166,0.15)]">
                  <span className="text-[13px] shrink-0 mt-[1px] text-[#14B8A6]">{"\u25C8"}</span>
                  <div className="text-[12px] leading-[1.6]" style={{ color: "var(--app-text-secondary)" }}>
                    <strong className="font-heading font-bold text-[#14B8A6] text-[11px] tracking-[0.5px] block mb-[3px]">
                      {gate.dscvrRole}
                    </strong>
                    {gate.dscvrRoleDesc}
                  </div>
                </div>

                {gate.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`flex gap-[10px] items-start p-[11px_14px] rounded-[7px] mb-[14px] text-[13px] leading-[1.65] ${
                      alert.type === "amber"
                        ? "bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.18)]"
                        : alert.type === "red"
                          ? "bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.18)]"
                          : "bg-[rgba(13,148,136,0.06)] border border-[rgba(20,184,166,0.18)] text-[#14B8A6]"
                    }`}
                    style={{
                      color: alert.type === "amber"
                        ? "var(--app-amber-alert-text)"
                        : alert.type === "red"
                          ? "var(--app-red-alert-text)"
                          : undefined,
                    }}
                  >
                    <span className="text-[13px] shrink-0 mt-[2px]">{alert.icon}</span>
                    <span dangerouslySetInnerHTML={{ __html: alert.content }} />
                  </div>
                ))}

                {gate.zones && (
                  <div className="grid grid-cols-3 gap-[7px] mb-[14px] max-md:grid-cols-2">
                    {gate.zones.map((zone) => (
                      <div
                        key={zone.name}
                        className="flex items-center gap-2 p-[8px_10px] rounded-[6px] border"
                        style={{ background: "var(--app-zone-bg)", borderColor: "var(--app-border)" }}
                      >
                        <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: zone.color }} />
                        <div>
                          <span className="font-heading text-[11px] font-bold block" style={{ color: "var(--app-text-bright)" }}>{zone.name}</span>
                          <span className="text-[10px] block" style={{ color: "var(--app-text-muted)" }}>{zone.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-[10px] mb-[14px] max-md:grid-cols-1">
                  {gate.infoBlocks.map((block, i) => (
                    <div
                      key={i}
                      className="rounded-[7px] p-[14px_16px] border-l-2"
                      style={{ background: "var(--app-info-block-bg)", borderLeftColor: block.borderColor }}
                    >
                      <h4 className="font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[9px]" style={{ color: "var(--app-text-muted)" }}>
                        {block.title}
                      </h4>
                      {block.items ? (
                        <ul className="list-disc">
                          {block.items.map((item, j) => (
                            <li
                              key={j}
                              className="text-[13px] leading-[1.65] ml-[14px] mb-[3px] [&_strong]:font-bold"
                              style={{ color: "var(--app-text-secondary)" }}
                              dangerouslySetInnerHTML={{ __html: item }}
                            />
                          ))}
                        </ul>
                      ) : (
                        <p
                          className="text-[13px] leading-[1.65] [&_strong]:font-bold"
                          style={{ color: "var(--app-text-secondary)" }}
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase mb-[9px] mt-[16px]" style={{ color: "var(--app-text-muted)" }}>
                  {t.flow.governmentPortals}
                </div>
                <div className="flex flex-wrap gap-[7px]">
                  {gate.portals.map((portal) => (
                    <a
                      key={portal.url}
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`portal-link-${gate.id}`}
                      className="inline-flex items-center gap-[6px] text-[12px] font-bold py-[7px] px-[13px] rounded-[5px] no-underline border border-[rgba(20,184,166,0.18)] bg-[rgba(13,148,136,0.06)] text-[#14B8A6] hover-elevate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {"\u2197"} {portal.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Connector() {
  return (
    <div className="h-[28px] flex items-center pl-[36px] relative z-[1]">
      <div className="flex flex-col items-center gap-1">
        <div className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--app-border-teal)" }} />
        <div className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--app-border-teal)" }} />
        <div className="w-[3px] h-[3px] rounded-full" style={{ background: "var(--app-border-teal)" }} />
      </div>
    </div>
  );
}

function NodeButton({ gate, onClick }: { gate: GateData; onClick: () => void }) {
  return (
    <button
      data-testid={`node-btn-${gate.id}`}
      className="w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center transition-transform duration-200 hover:scale-[1.08] shrink-0 cursor-pointer"
      style={{
        background: "var(--app-node-bg)",
        border: gate.isDashed ? `2px dashed ${gate.borderColor}` : `2px solid ${gate.borderColor}`,
        boxShadow: `0 0 18px ${gate.glowColor}`,
      }}
      onClick={onClick}
    >
      <span className="font-heading font-black text-[22px] leading-none tracking-[-0.5px]" style={{ color: gate.color }}>
        {gate.num}
      </span>
      <span className="text-[9px] font-bold tracking-[1.5px] uppercase mt-[3px] opacity-60" style={{ color: gate.borderColor }}>
        {gate.abbr}
      </span>
    </button>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("flow");
  const [openGates, setOpenGates] = useState<Set<string>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Map<string, "checked" | "flagged" | "warn">>(new Map());
  const { t, content } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const gates = useTranslatedGates();

  const translatedAuditSections = useMemo(() => content.auditSections.map((sec, si) => ({
    num: auditNums[si],
    title: sec.title,
    items: sec.items.map((item, ii) => ({
      id: auditIds[si][ii],
      title: item.title,
      desc: item.desc,
      severity: auditSeverities[si][ii],
    })),
  })), [content]);

  const translatedGuideCards = useMemo(() => content.guideCards.map((card, i) => ({
    ...guideCardStyles[i],
    title: card.title,
    role: card.role,
    desc: card.desc,
    links: card.links.map((l, li) => ({ label: l.label, url: guideCardStyles[i].linkUrls[li] || "" })),
  })), [content]);

  const translatedTimeline = content.timelineItems;

  const toggleGate = (id: string) => {
    setOpenGates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cycleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (!current) next.set(id, "checked");
      else if (current === "checked") next.set(id, "flagged");
      else if (current === "flagged") next.set(id, "warn");
      else next.delete(id);
      return next;
    });
  };

  const structuralGates = gates.filter((g) => ["g0", "g1", "g2", "g3"].includes(g.id));
  const parallelGates = gates.filter((g) => ["g4", "g5"].includes(g.id));
  const lateGates = gates.filter((g) => ["g6", "g7"].includes(g.id));

  return (
    <div className="min-h-screen relative z-[1]">
      <header className="sticky top-0 z-[200] flex items-center justify-between px-14 py-4 backdrop-blur-[14px] border-b max-md:px-5" style={{ background: "var(--app-header-bg)", borderColor: "var(--app-border)" }} data-testid="header">
        <div className="font-heading font-black text-[20px] tracking-[2px] text-[#14B8A6]">
          {t.header.brand}
          <span className="font-normal text-[10px] tracking-[3px] block mt-[2px] uppercase" style={{ color: "var(--app-text-muted)" }}>
            {t.header.subtitle}
          </span>
        </div>
        <div className="inline-flex items-center gap-[7px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.22)] rounded-full py-[6px] px-[14px] font-heading text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "var(--app-red-alert-text)" }} data-testid="deadline-pill">
          <span className="w-[7px] h-[7px] rounded-full bg-[#EF4444] animate-blink shrink-0" />
          {t.header.deadlinePill}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[11px] text-right leading-[1.8] max-md:hidden" style={{ color: "var(--app-text-muted)" }}>
            {t.header.rightLabel1}<br />{t.header.rightLabel2}
          </div>
          <LanguageSelector />
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="text-[10px] font-heading font-bold tracking-[1.5px] uppercase text-[#14B8A6] hover:text-[#5EEAD4] transition-colors" data-testid="link-profile">
                {t.nav.profile}
              </Link>
              <button onClick={() => logout()} className="text-[10px] font-heading font-bold tracking-[1.5px] uppercase hover:text-[#EF4444] transition-colors" style={{ color: "var(--app-text-muted)" }} data-testid="button-logout">
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-[10px] font-heading font-bold tracking-[1.5px] uppercase text-[#14B8A6] hover:text-[#5EEAD4] transition-colors" data-testid="link-login">
              {t.nav.login}
            </Link>
          )}
        </div>
      </header>

      <div className="sticky top-[57px] z-[150] backdrop-blur-[14px] border-b px-14 flex max-md:px-5" style={{ background: "var(--app-header-bg)", borderColor: "var(--app-border)" }} data-testid="tab-nav">
        {[
          { id: "flow" as const, label: t.tabs.flow },
          { id: "audit" as const, label: t.tabs.audit },
          { id: "guide" as const, label: t.tabs.guide },
        ].map((tab) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            className={`font-heading font-bold text-[11px] tracking-[1.5px] uppercase py-[14px] px-[22px] border-b-2 cursor-pointer transition-all duration-200 mb-[-1px] bg-transparent ${
              activeTab === tab.id
                ? "text-[#14B8A6] border-b-[#14B8A6]"
                : "border-b-transparent hover:text-[#14B8A6]"
            }`}
            style={activeTab !== tab.id ? { color: "var(--app-text-muted)" } : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "flow" && (
        <div>
          <div className="relative z-[5] max-w-[1000px] mx-auto pt-14 pb-11 px-14 max-md:px-5">
            <div className="font-heading text-[10px] font-bold tracking-[4px] uppercase text-[#0D9488] mb-[18px] flex items-center gap-3">
              <span className="block w-[28px] h-[1px] bg-[#0D9488] shrink-0" />
              {t.flow.tagline}
            </div>
            <h1 className="font-heading font-black text-[50px] leading-[1.06] tracking-[-1.5px] mb-[18px] max-md:text-[34px]" style={{ color: "var(--app-text)" }}>
              {t.flow.heroTitle1}<br />
              <span className="text-[#14B8A6]">{t.flow.heroTitle2}</span>
            </h1>
            <p className="text-[16px] font-light leading-[1.8] max-w-[580px]" style={{ color: "var(--app-text-secondary)" }}>
              {t.flow.heroDesc}
            </p>

            <div className="mt-9 grid grid-cols-2 border rounded-[10px] overflow-hidden max-md:grid-cols-1" style={{ borderColor: "var(--app-border)" }}>
              <div className="p-[22px_26px] border-r bg-[rgba(20,184,166,0.04)] max-md:border-r-0 max-md:border-b" style={{ borderColor: "var(--app-border)" }}>
                <div className="font-heading text-[9px] font-extrabold tracking-[3px] uppercase text-[#14B8A6] mb-[14px]">
                  {t.flow.dscvrTracks}
                </div>
                {t.flow.trackItems.map((item) => (
                  <div key={item} className="flex items-start gap-[10px] mb-2 text-[13px] leading-[1.5]" style={{ color: "var(--app-text-secondary)" }}>
                    <span className="w-[5px] h-[5px] rounded-full bg-[#14B8A6] shrink-0 mt-[6px]" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="p-[22px_26px] bg-[rgba(239,68,68,0.03)]">
                <div className="font-heading text-[9px] font-extrabold tracking-[3px] uppercase mb-[14px]" style={{ color: "var(--app-red-alert-text)" }}>
                  {t.flow.dscvrDoesNot}
                </div>
                {t.flow.doesNotItems.map((item) => (
                  <div key={item} className="flex items-start gap-[10px] mb-2 text-[13px] leading-[1.5]" style={{ color: "var(--app-text-secondary)" }}>
                    <span className="w-[5px] h-[5px] rounded-full shrink-0 mt-[6px]" style={{ background: "var(--app-red-alert-text)" }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex mt-6 border rounded-[10px] overflow-hidden max-md:flex-col" style={{ borderColor: "var(--app-border)" }} data-testid="stats-row">
              {statValues.map((n, i) => ({ n, l: t.flow.statsLabels[i] })).map((stat, i) => (
                <div key={i} className={`flex-1 p-[18px_22px] ${i < 3 ? "border-r max-md:border-r-0 max-md:border-b" : ""}`} style={i < 3 ? { borderColor: "var(--app-border)" } : undefined}>
                  <div className="font-heading font-black text-[26px] text-[#14B8A6] leading-none mb-[5px] tracking-[-0.5px]">{stat.n}</div>
                  <div className="text-[11px]" style={{ color: "var(--app-text-muted)" }}>{stat.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-[5] max-w-[1000px] mx-auto px-14 pb-20 max-md:px-5">
            <div className="absolute left-[calc(3.5rem+36px)] top-0 bottom-20 w-[1px] bg-gradient-to-b from-[rgba(20,184,166,0.5)] via-[rgba(20,184,166,0.2)] to-transparent z-0 max-md:left-[calc(1.25rem+36px)]" />

            <div className="grid grid-cols-[72px_1fr] gap-x-5 items-center mb-[10px] mt-2 relative z-[2]">
              <div />
              <div>
                <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--app-text-muted)" }}>
                  {t.flow.sectionFoundation}
                </div>
                <div className="h-[1px] bg-gradient-to-r from-[rgba(100,116,139,0.3)] to-transparent" />
              </div>
            </div>

            {structuralGates.map((gate, i) => (
              <div key={gate.id}>
                <div className="relative z-[2] mb-[6px]">
                  <div className="grid grid-cols-[72px_1fr] gap-x-5 items-start">
                    <NodeButton gate={gate} onClick={() => toggleGate(gate.id)} />
                    <GateCard gate={gate} isOpen={openGates.has(gate.id)} onToggle={() => toggleGate(gate.id)} />
                  </div>
                </div>
                {i < structuralGates.length - 1 && <Connector />}
                {i === 0 && (
                  <>
                    <Connector />
                    <div className="grid grid-cols-[72px_1fr] gap-x-5 items-center mb-[10px] relative z-[2]">
                      <div />
                      <div>
                        <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--app-text-muted)" }}>
                          {t.flow.sectionStructural}
                        </div>
                        <div className="h-[1px] bg-gradient-to-r from-[rgba(100,116,139,0.3)] to-transparent" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            <Connector />

            <div className="grid grid-cols-[72px_1fr] gap-x-5 items-center mb-[10px] relative z-[2]">
              <div />
              <div>
                <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--app-text-muted)" }}>
                  {t.flow.sectionOperational}
                </div>
                <div className="h-[1px] bg-gradient-to-r from-[rgba(100,116,139,0.3)] to-transparent" />
              </div>
            </div>

            <div className="grid grid-cols-[72px_1fr] gap-x-5 items-start mb-[6px] relative z-[2]">
              <div className="flex flex-col items-center gap-[10px] pt-2">
                {parallelGates.map((gate) => (
                  <NodeButton key={gate.id} gate={gate} onClick={() => toggleGate(gate.id)} />
                ))}
              </div>
              <div>
                {parallelGates.map((gate, i) => (
                  <div key={gate.id}>
                    <div className="font-heading text-[9px] font-bold tracking-[2.5px] uppercase text-[#F59E0B] py-[4px_0_8px] flex items-center gap-2 mb-1">
                      <span className="block w-[20px] h-[1px] bg-[rgba(245,158,11,0.4)]" />
                      {i === 0 ? t.flow.taxConcurrent : t.flow.staffConcurrent}
                    </div>
                    <div className={i === 0 ? "mb-[10px]" : ""}>
                      <GateCard gate={gate} isOpen={openGates.has(gate.id)} onToggle={() => toggleGate(gate.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Connector />

            {lateGates.map((gate, i) => (
              <div key={gate.id}>
                <div className="relative z-[2] mb-[6px]">
                  <div className="grid grid-cols-[72px_1fr] gap-x-5 items-start">
                    <NodeButton gate={gate} onClick={() => toggleGate(gate.id)} />
                    <GateCard gate={gate} isOpen={openGates.has(gate.id)} onToggle={() => toggleGate(gate.id)} />
                  </div>
                </div>
                {i < lateGates.length - 1 && <Connector />}
              </div>
            ))}

            <div className="mt-[10px] ml-[92px] max-md:ml-0">
              <div className="bg-gradient-to-br from-[rgba(13,148,136,0.09)] to-[rgba(34,197,94,0.05)] border rounded-[10px] p-[26px_30px] flex items-center gap-[22px]" style={{ borderColor: "var(--app-border-teal)" }}>
                <span className="text-[32px] shrink-0">{"\u2713"}</span>
                <div>
                  <div className="font-heading font-black text-[17px] text-[#14B8A6] tracking-[-0.2px] mb-[5px]">
                    {t.flow.fullyCompliantTitle}
                  </div>
                  <div className="text-[13px] font-light leading-[1.7] italic" style={{ color: "var(--app-text-muted)" }}>
                    {t.flow.fullyCompliantDesc}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 ml-[92px] pl-5 border-l-2 border-l-[rgba(100,116,139,0.25)] text-[12px] font-light leading-[1.7] italic max-md:ml-0" style={{ color: "var(--app-text-muted)" }}>
              {t.flow.disclaimer}
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div>
          <div className="relative z-[5] max-w-[1000px] mx-auto pt-14 pb-11 px-14 max-md:px-5">
            <div className="font-heading text-[10px] font-bold tracking-[4px] uppercase text-[#0D9488] mb-[18px] flex items-center gap-3">
              <span className="block w-[28px] h-[1px] bg-[#0D9488] shrink-0" />
              {t.audit.tagline}
            </div>
            <h1 className="font-heading font-black text-[50px] leading-[1.06] tracking-[-1.5px] mb-[18px] max-md:text-[34px]" style={{ color: "var(--app-text)" }}>
              {t.audit.heroTitle1}<br />
              <span className="text-[#14B8A6]">{t.audit.heroTitle2}</span>
            </h1>
            <p className="text-[16px] font-light leading-[1.8] max-w-[580px]" style={{ color: "var(--app-text-secondary)" }}>
              {t.audit.heroDesc}
            </p>
          </div>

          <div className="relative z-[5] max-w-[1000px] mx-auto px-14 pb-20 max-md:px-5">
            <div className="flex gap-[10px] items-start p-[20px_24px] rounded-[10px] mb-10 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)]" data-testid="audit-alert">
              <span className="text-[28px] shrink-0">{"\u26A0"}</span>
              <div>
                <h2 className="font-heading font-extrabold text-[18px] mb-[6px] tracking-[-0.2px]" style={{ color: "var(--app-text)" }}>
                  {t.audit.deadlineTitle}
                </h2>
                <p className="text-[13px] font-light leading-[1.7]" style={{ color: "var(--app-text-secondary)" }}>
                  {t.audit.deadlineDesc}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-7 p-[14px_18px] border rounded-[8px] flex-wrap" style={{ background: "var(--app-expand-bg)", borderColor: "var(--app-border)" }} data-testid="audit-legend">
              {[
                { color: "#22C55E", label: t.audit.legendCompliant },
                { color: "#EF4444", label: t.audit.legendFlagged },
                { color: "#F59E0B", label: t.audit.legendNeedsAttention },
                { color: "#64748B", label: t.audit.legendNotChecked },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-[7px] text-[12px]" style={{ color: "var(--app-text-secondary)" }}>
                  <div className="w-[10px] h-[10px] rounded-[3px] shrink-0" style={{ background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>

            {translatedAuditSections.map((section) => (
              <div key={section.num}>
                <div className="font-heading font-extrabold text-[13px] text-[#14B8A6] tracking-[0.3px] mb-[14px] pb-[10px] border-b flex items-center gap-[10px]" style={{ borderColor: "rgba(20,184,166,0.12)" }}>
                  <span className="font-heading text-[9px] font-bold tracking-[2px] bg-[rgba(13,148,136,0.12)] border border-[rgba(20,184,166,0.2)] text-[#0D9488] py-[3px] px-[9px] rounded uppercase">
                    {section.num}
                  </span>
                  {section.title}
                </div>
                <ul className="list-none mb-8">
                  {section.items.map((item) => {
                    const status = checkedItems.get(item.id);
                    return (
                      <li
                        key={item.id}
                        data-testid={`checklist-item-${item.id}`}
                        className={`grid grid-cols-[22px_1fr_auto] gap-3 items-start p-[13px_16px] rounded-[8px] mb-1 border cursor-pointer transition-colors duration-150 ${
                          status === "checked"
                            ? "bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.14)]"
                            : status === "flagged"
                              ? "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.14)]"
                              : status === "warn"
                                ? "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.14)]"
                                : "border-[rgba(226,232,240,0.06)] hover:bg-[rgba(255,255,255,0.035)]"
                        }`}
                        style={!status ? { background: "var(--app-expand-bg)" } : undefined}
                        onClick={() => cycleCheck(item.id)}
                      >
                        <div
                          className={`w-[20px] h-[20px] rounded flex items-center justify-center text-[11px] shrink-0 mt-[1px] transition-all duration-150 font-bold ${
                            status === "checked"
                              ? "bg-[#22C55E] border-[#22C55E] text-white"
                              : status === "flagged"
                                ? "bg-[#EF4444] border-[#EF4444] text-white"
                                : status === "warn"
                                  ? "bg-[#F59E0B] border-[#F59E0B] text-white"
                                  : "border-[1.5px] border-[#64748B]"
                          }`}
                        >
                          {status === "checked" ? "\u2713" : status === "flagged" ? "\u2717" : status === "warn" ? "!" : ""}
                        </div>
                        <div>
                          <div className="font-heading font-bold text-[13px] mb-[3px] tracking-[-0.1px]" style={{ color: "var(--app-text)" }}>
                            {item.title}
                          </div>
                          <div className="text-[12px] font-light leading-[1.55]" style={{ color: "var(--app-text-muted)" }}>{item.desc}</div>
                        </div>
                        <span
                          className={`font-heading text-[9px] font-bold tracking-[1px] py-[3px] px-[8px] rounded shrink-0 self-start mt-[2px] uppercase ${
                            item.severity === "critical"
                              ? "bg-[rgba(239,68,68,0.12)]"
                              : item.severity === "high"
                                ? "bg-[rgba(245,158,11,0.12)]"
                                : item.severity === "medium"
                                  ? "bg-[rgba(20,184,166,0.12)] text-[#14B8A6]"
                                  : "bg-[rgba(148,163,184,0.12)]"
                          }`}
                          style={{
                            color: item.severity === "critical"
                              ? "var(--app-red-alert-text)"
                              : item.severity === "high"
                                ? "var(--app-amber-alert-text)"
                                : item.severity === "low"
                                  ? "var(--app-text-secondary)"
                                  : undefined,
                          }}
                        >
                          {item.severity}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-8 pl-5 border-l-2 border-l-[rgba(100,116,139,0.25)] text-[12px] font-light leading-[1.7] italic" style={{ color: "var(--app-text-muted)" }}>
              {t.audit.disclaimer}
            </div>
          </div>
        </div>
      )}

      {activeTab === "guide" && (
        <div>
          <div className="relative z-[5] max-w-[1000px] mx-auto pt-14 pb-11 px-14 max-md:px-5">
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

          <div className="relative z-[5] max-w-[1000px] mx-auto px-14 pb-20 max-md:px-5">
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

            <GlossarySection />

            <div className="mb-12">
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
      )}
    </div>
  );
}
