import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/context";

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
  { id: "g0", num: "PT", abbr: "PMA", color: "var(--t2)", borderColor: "rgba(148,163,184,0.3)", glowColor: "transparent", layerColor: "var(--t2)", rolePillBg: "rgba(148,163,184,0.08)", rolePillBorder: "rgba(148,163,184,0.15)", rolePillColor: "var(--t2)", alertTypes: [{ type: "amber", icon: "\u25B2" }], infoBlockBorders: ["var(--accent2)", "var(--t3)"], portalUrls: ["https://ahu.go.id", "https://oss.go.id", "https://pajak.go.id"], isDashed: true },
  { id: "g1", num: "1", abbr: "ZONE", color: "var(--accent)", borderColor: "var(--accent)", glowColor: "var(--accent-tint)", layerColor: "var(--accent)", rolePillBg: "var(--accent-tint)", rolePillBorder: "var(--accent-tint2)", rolePillColor: "var(--accent)", alertTypes: [{ type: "amber", icon: "\u25B2" }], infoBlockBorders: ["var(--accent)", "#F59E0B"], portalUrls: ["https://gistarubali.id", "https://oss.go.id", "https://rdtr.atrbpn.go.id"], zoneColors: ["#FF85B3", "#FB923C", "#EF4444", "#EAB308", "#22C55E", "#166534"] },
  { id: "g2", num: "2", abbr: "NIB", color: "#60A5FA", borderColor: "#3B82F6", glowColor: "rgba(59,130,246,0.12)", layerColor: "#60A5FA", rolePillBg: "rgba(59,130,246,0.08)", rolePillBorder: "rgba(59,130,246,0.18)", rolePillColor: "#60A5FA", alertTypes: [{ type: "amber", icon: "\u25B2" }], infoBlockBorders: ["#3B82F6", "#F59E0B"], portalUrls: ["https://oss.go.id", "https://www.bps.go.id/id/business-register", "https://bkpm.go.id"] },
  { id: "g3", num: "3", abbr: "SLF", color: "#A78BFA", borderColor: "#8B5CF6", glowColor: "rgba(139,92,246,0.12)", layerColor: "#A78BFA", rolePillBg: "rgba(139,92,246,0.08)", rolePillBorder: "rgba(139,92,246,0.18)", rolePillColor: "#A78BFA", alertTypes: [{ type: "red", icon: "\u25B2" }], infoBlockBorders: ["#8B5CF6", "var(--accent)"], portalUrls: ["https://simbg.pu.go.id", "https://oss.go.id", "https://dpmptsp.badungkab.go.id"] },
  { id: "g4", num: "4", abbr: "TAX", color: "#F59E0B", borderColor: "#F59E0B", glowColor: "rgba(245,158,11,0.12)", layerColor: "#F59E0B", rolePillBg: "rgba(245,158,11,0.08)", rolePillBorder: "rgba(245,158,11,0.18)", rolePillColor: "#F59E0B", alertTypes: [{ type: "amber", icon: "\u25B2" }], infoBlockBorders: ["#F59E0B", "var(--t3)"], portalUrls: ["https://e-palapa.badungkab.go.id", "https://djponline.pajak.go.id", "https://pajak.go.id/reformasi-pajak/coretax", "https://bapenda.badungkab.go.id"] },
  { id: "g5", num: "5", abbr: "STAFF", color: "#22C55E", borderColor: "#22C55E", glowColor: "rgba(34,197,94,0.1)", layerColor: "#22C55E", rolePillBg: "rgba(34,197,94,0.08)", rolePillBorder: "rgba(34,197,94,0.18)", rolePillColor: "#22C55E", alertTypes: [{ type: "red", icon: "\u25B2" }], infoBlockBorders: ["#22C55E", "var(--t3)"], portalUrls: ["https://edabu.bpjs-kesehatan.go.id", "https://sipp.bpjsketenagakerjaan.go.id", "https://imigrasi.go.id", "https://bkpm.go.id"] },
  { id: "g6", num: "6", abbr: "SAFE", color: "#FCA5A5", borderColor: "#EF4444", glowColor: "rgba(239,68,68,0.1)", layerColor: "#FCA5A5", rolePillBg: "rgba(239,68,68,0.08)", rolePillBorder: "rgba(239,68,68,0.18)", rolePillColor: "#FCA5A5", alertTypes: [{ type: "teal", icon: "\u25C6" }], infoBlockBorders: ["#EF4444", "var(--t3)"], portalUrls: ["https://jdih.kemenparekraf.go.id", "https://damkar.badungkab.go.id"] },
  { id: "g7", num: "7", abbr: "OTA", color: "var(--accent)", borderColor: "var(--accent)", glowColor: "var(--accent-tint2)", layerColor: "var(--accent)", rolePillBg: "var(--accent-tint)", rolePillBorder: "var(--accent-tint2)", rolePillColor: "var(--accent)", alertTypes: [{ type: "red", icon: "\u25B2" }], infoBlockBorders: ["var(--accent)", "#EF4444"], portalUrls: ["https://airbnb.com", "https://partner.booking.com", "https://kemenparekraf.go.id"] },
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
      infoBlocks: tr.infoBlocks.map((ib, ii) => ({ title: ib.title, borderColor: s.infoBlockBorders[ii] || "var(--t3)", content: ib.content, items: ib.items })),
      portals: tr.portals.map((p, pi) => ({ label: p.label, url: s.portalUrls[pi] || "" })),
      zones: tr.zones && s.zoneColors ? tr.zones.map((z, zi) => ({ color: s.zoneColors![zi] || "#999", name: z.name, status: z.status })) : undefined,
      isDashed: s.isDashed,
    };
  }), [content]);
}

function GateCard({ gate, isOpen, onToggle }: { gate: GateData; isOpen: boolean; onToggle: () => void }) {
  const { t } = useLanguage();
  return (
    <div
      data-testid={`gate-card-${gate.id}`}
      className={`rounded-[10px] border transition-all duration-200 cursor-pointer ${
        isOpen
          ? "bg-[var(--accent-tint)]"
          : ""
      }`}
      style={{
        borderColor: isOpen ? "var(--app-border-teal)" : "var(--b)",
        ...(!isOpen ? { background: "var(--surface)" } : {}),
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
          <div className="font-heading font-extrabold text-[15px] mb-[3px] tracking-[-0.2px]" style={{ color: "var(--txt)" }}>
            {gate.title}
          </div>
          <div className="text-[12px] font-light italic" style={{ color: "var(--t3)" }}>{gate.subtitle}</div>
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
              isOpen ? "rotate-45 text-[var(--accent)]" : ""
            }`}
            style={{
              background: "var(--app-expand-bg)",
              ...(!isOpen ? { color: "var(--t3)" } : {}),
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
            <div className="border-t px-[22px] pb-[22px]" style={{ borderColor: "var(--b)" }}>
              <div className="pt-[18px]">
                <div className="flex items-start gap-3 p-[12px_16px] rounded-[7px] mb-4 bg-[var(--accent-tint)] border border-[var(--accent-tint2)]">
                  <span className="text-[13px] shrink-0 mt-[1px] text-[var(--accent)]">{"\u25C8"}</span>
                  <div className="text-[12px] leading-[1.6]" style={{ color: "var(--t2)" }}>
                    <strong className="font-heading font-bold text-[var(--accent)] text-[11px] tracking-[0.5px] block mb-[3px]">
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
                          : "bg-[var(--accent-tint)] border border-[var(--accent-tint2)] text-[var(--accent)]"
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
                        style={{ background: "var(--app-zone-bg)", borderColor: "var(--b)" }}
                      >
                        <div className="w-[10px] h-[10px] rounded-full shrink-0" style={{ background: zone.color }} />
                        <div>
                          <span className="font-heading text-[11px] font-bold block" style={{ color: "var(--app-text-bright)" }}>{zone.name}</span>
                          <span className="text-[10px] block" style={{ color: "var(--t3)" }}>{zone.status}</span>
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
                      <h4 className="font-heading text-[9px] font-bold tracking-[2px] uppercase mb-[9px]" style={{ color: "var(--t3)" }}>
                        {block.title}
                      </h4>
                      {block.items ? (
                        <ul className="list-disc">
                          {block.items.map((item, j) => (
                            <li
                              key={j}
                              className="text-[13px] leading-[1.65] ml-[14px] mb-[3px] [&_strong]:font-bold"
                              style={{ color: "var(--t2)" }}
                              dangerouslySetInnerHTML={{ __html: item }}
                            />
                          ))}
                        </ul>
                      ) : (
                        <p
                          className="text-[13px] leading-[1.65] [&_strong]:font-bold"
                          style={{ color: "var(--t2)" }}
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase mb-[9px] mt-[16px]" style={{ color: "var(--t3)" }}>
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
                      className="inline-flex items-center gap-[6px] text-[12px] font-bold py-[7px] px-[13px] rounded-[5px] no-underline border border-[var(--accent-tint2)] bg-[var(--accent-tint)] text-[var(--accent)] hover-elevate"
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

interface ComplianceFlowProps {
  expandGate7?: boolean;
}

export default function ComplianceFlow({ expandGate7 }: ComplianceFlowProps) {
  const [openGates, setOpenGates] = useState<Set<string>>(new Set());
  const { t } = useLanguage();
  const gates = useTranslatedGates();

  useEffect(() => {
    if (expandGate7) {
      setOpenGates((prev) => {
        const next = new Set(prev);
        next.add("g7");
        return next;
      });
    }
  }, [expandGate7]);

  const toggleGate = (id: string) => {
    setOpenGates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const structuralGates = gates.filter((g) => ["g0", "g1", "g2", "g3"].includes(g.id));
  const parallelGates = gates.filter((g) => ["g4", "g5"].includes(g.id));
  const lateGates = gates.filter((g) => ["g6", "g7"].includes(g.id));

  return (
    <div>
      <div className="relative z-[5] max-w-5xl mx-auto pt-10 pb-8 px-6 md:px-10">
        <div className="font-heading text-[10px] font-bold tracking-[4px] uppercase text-[var(--accent2)] mb-[18px] flex items-center gap-3">
          <span className="block w-[28px] h-[1px] bg-[var(--accent2)] shrink-0" />
          {t.flow.tagline}
        </div>
        <h1 className="font-heading font-black text-[50px] leading-[1.06] tracking-[-1.5px] mb-[18px] max-md:text-[34px]" style={{ color: "var(--txt)" }}>
          {t.flow.heroTitle1}<br />
          <span className="text-[var(--accent)]">{t.flow.heroTitle2}</span>
        </h1>
        <p className="text-[16px] font-light leading-[1.8] max-w-[580px]" style={{ color: "var(--t2)" }}>
          {t.flow.heroDesc}
        </p>

        <div className="mt-9 grid grid-cols-2 border rounded-[10px] overflow-hidden max-md:grid-cols-1" style={{ borderColor: "var(--b)" }}>
          <div className="p-[22px_26px] border-r bg-[var(--accent-tint)] max-md:border-r-0 max-md:border-b" style={{ borderColor: "var(--b)" }}>
            <div className="font-heading text-[9px] font-extrabold tracking-[3px] uppercase text-[var(--accent)] mb-[14px]">
              {t.flow.dscvrTracks}
            </div>
            {t.flow.trackItems.map((item) => (
              <div key={item} className="flex items-start gap-[10px] mb-2 text-[13px] leading-[1.5]" style={{ color: "var(--t2)" }}>
                <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent)] shrink-0 mt-[6px]" />
                {item}
              </div>
            ))}
          </div>
          <div className="p-[22px_26px] bg-[rgba(239,68,68,0.03)]">
            <div className="font-heading text-[9px] font-extrabold tracking-[3px] uppercase mb-[14px]" style={{ color: "var(--app-red-alert-text)" }}>
              {t.flow.dscvrDoesNot}
            </div>
            {t.flow.doesNotItems.map((item) => (
              <div key={item} className="flex items-start gap-[10px] mb-2 text-[13px] leading-[1.5]" style={{ color: "var(--t2)" }}>
                <span className="w-[5px] h-[5px] rounded-full shrink-0 mt-[6px]" style={{ background: "var(--app-red-alert-text)" }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex mt-6 border rounded-[10px] overflow-hidden max-md:flex-col" style={{ borderColor: "var(--b)" }} data-testid="stats-row">
          {statValues.map((n, i) => ({ n, l: t.flow.statsLabels[i] })).map((stat, i) => (
            <div key={i} className={`flex-1 p-[18px_22px] ${i < 3 ? "border-r max-md:border-r-0 max-md:border-b" : ""}`} style={i < 3 ? { borderColor: "var(--b)" } : undefined}>
              <div className="font-heading font-black text-[26px] text-[var(--accent)] leading-none mb-[5px] tracking-[-0.5px]">{stat.n}</div>
              <div className="text-[11px]" style={{ color: "var(--t3)" }}>{stat.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-[5] max-w-5xl mx-auto px-6 md:px-10 pb-16">
        <div className="absolute left-[calc(3.5rem+36px)] top-0 bottom-20 w-[1px] bg-gradient-to-b from-[var(--accent-tint2)] via-[var(--accent-tint2)] to-transparent z-0 max-md:left-[calc(1.25rem+36px)]" />

        <div className="grid grid-cols-[72px_1fr] gap-x-5 items-center mb-[10px] mt-2 relative z-[2]">
          <div />
          <div>
            <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--t3)" }}>
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
                    <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--t3)" }}>
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
            <div className="font-heading text-[9px] font-bold tracking-[3px] uppercase py-1 pl-[2px]" style={{ color: "var(--t3)" }}>
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
          <div className="bg-gradient-to-br from-[var(--accent-tint)] to-[rgba(34,197,94,0.05)] border rounded-[10px] p-[26px_30px] flex items-center gap-[22px]" style={{ borderColor: "var(--app-border-teal)" }}>
            <span className="text-[32px] shrink-0">{"\u2713"}</span>
            <div>
              <div className="font-heading font-black text-[17px] text-[var(--accent)] tracking-[-0.2px] mb-[5px]">
                {t.flow.fullyCompliantTitle}
              </div>
              <div className="text-[13px] font-light leading-[1.7] italic" style={{ color: "var(--t3)" }}>
                {t.flow.fullyCompliantDesc}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-9 ml-[92px] pl-5 border-l-2 border-l-[rgba(100,116,139,0.25)] text-[12px] font-light leading-[1.7] italic max-md:ml-0" style={{ color: "var(--t3)" }}>
          {t.flow.disclaimer}
        </div>
      </div>
    </div>
  );
}
