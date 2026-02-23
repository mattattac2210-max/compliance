import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/context";

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

export default function SelfAudit() {
  const [checkedItems, setCheckedItems] = useState<Map<string, "checked" | "flagged" | "warn">>(new Map());
  const { t, content } = useLanguage();

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

  return (
    <div>
      <div className="relative z-[5] max-w-5xl mx-auto pt-10 pb-8 px-6 md:px-10">
        <div className="font-heading text-[10px] font-bold tracking-[4px] uppercase text-[var(--accent2)] mb-[18px] flex items-center gap-3">
          <span className="block w-[28px] h-[1px] bg-[var(--accent2)] shrink-0" />
          {t.audit.tagline}
        </div>
        <h1 className="font-heading font-black text-[50px] leading-[1.06] tracking-[-1.5px] mb-[18px] max-md:text-[34px]" style={{ color: "var(--txt)" }}>
          {t.audit.heroTitle1}<br />
          <span className="text-[var(--accent)]">{t.audit.heroTitle2}</span>
        </h1>
        <p className="text-[16px] font-light leading-[1.8] max-w-[580px]" style={{ color: "var(--t2)" }}>
          {t.audit.heroDesc}
        </p>
      </div>

      <div className="relative z-[5] max-w-5xl mx-auto px-6 md:px-10 pb-16">
        <div className="flex gap-[10px] items-start p-[20px_24px] rounded-[10px] mb-10 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.15)]" data-testid="audit-alert">
          <span className="text-[28px] shrink-0">{"\u26A0"}</span>
          <div>
            <h2 className="font-heading font-extrabold text-[18px] mb-[6px] tracking-[-0.2px]" style={{ color: "var(--txt)" }}>
              {t.audit.deadlineTitle}
            </h2>
            <p className="text-[13px] font-light leading-[1.7]" style={{ color: "var(--t2)" }}>
              {t.audit.deadlineDesc}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-7 p-[14px_18px] border rounded-[8px] flex-wrap" style={{ background: "var(--app-expand-bg)", borderColor: "var(--b)" }} data-testid="audit-legend">
          {[
            { color: "#22C55E", label: t.audit.legendCompliant },
            { color: "#EF4444", label: t.audit.legendFlagged },
            { color: "#F59E0B", label: t.audit.legendNeedsAttention },
            { color: "var(--t3)", label: t.audit.legendNotChecked },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-[7px] text-[12px]" style={{ color: "var(--t2)" }}>
              <div className="w-[10px] h-[10px] rounded-[3px] shrink-0" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

        {translatedAuditSections.map((section) => (
          <div key={section.num}>
            <div className="font-heading font-extrabold text-[13px] text-[var(--accent)] tracking-[0.3px] mb-[14px] pb-[10px] border-b flex items-center gap-[10px]" style={{ borderColor: "var(--accent-tint)" }}>
              <span className="font-heading text-[9px] font-bold tracking-[2px] bg-[var(--accent-tint)] border border-[var(--accent-tint2)] text-[var(--accent2)] py-[3px] px-[9px] rounded uppercase">
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
                    className={`grid grid-cols-[22px_1fr_auto] gap-3 items-start p-[13px_16px] rounded-[8px] mb-1 border cursor-pointer transition-colors duration-150 ${status === "checked"
                        ? "bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.14)]"
                        : status === "flagged"
                          ? "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.14)]"
                          : status === "warn"
                            ? "bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.14)]"
                            : "border-[var(--b)] hover:bg-[var(--b)]"
                      }`}
                    style={!status ? { background: "var(--app-expand-bg)" } : undefined}
                    onClick={() => cycleCheck(item.id)}
                  >
                    <div
                      className={`w-[20px] h-[20px] rounded flex items-center justify-center text-[11px] shrink-0 mt-[1px] transition-all duration-150 font-bold ${status === "checked"
                          ? "bg-[#22C55E] border-[#22C55E] text-white"
                          : status === "flagged"
                            ? "bg-[#EF4444] border-[#EF4444] text-white"
                            : status === "warn"
                              ? "bg-[#F59E0B] border-[#F59E0B] text-white"
                              : "border-[1.5px] border-[var(--t3)]"
                        }`}
                    >
                      {status === "checked" ? "\u2713" : status === "flagged" ? "\u2717" : status === "warn" ? "!" : ""}
                    </div>
                    <div>
                      <div className="font-heading font-bold text-[13px] mb-[3px] tracking-[-0.1px]" style={{ color: "var(--txt)" }}>
                        {item.title}
                      </div>
                      <div className="text-[12px] font-light leading-[1.55]" style={{ color: "var(--t3)" }}>{item.desc}</div>
                    </div>
                    <span
                      className={`font-heading text-[9px] font-bold tracking-[1px] py-[3px] px-[8px] rounded shrink-0 self-start mt-[2px] uppercase ${item.severity === "critical"
                          ? "bg-[rgba(239,68,68,0.12)]"
                          : item.severity === "high"
                            ? "bg-[rgba(245,158,11,0.12)]"
                            : item.severity === "medium"
                              ? "bg-[var(--accent-tint)] text-[var(--accent)]"
                              : "bg-[rgba(148,163,184,0.12)]"
                        }`}
                      style={{
                        color: item.severity === "critical"
                          ? "var(--app-red-alert-text)"
                          : item.severity === "high"
                            ? "var(--app-amber-alert-text)"
                            : item.severity === "medium"
                              ? "var(--t2)"
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

        <div className="mt-8 pl-5 border-l-2 border-l-[rgba(100,116,139,0.25)] text-[12px] font-light leading-[1.7] italic" style={{ color: "var(--t3)" }}>
          {t.audit.disclaimer}
        </div>
      </div>
    </div>
  );
}
