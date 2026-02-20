import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/context";

interface PageHeaderProps {
  backTo?: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  badge?: { label: string; color: string };
  meta?: Array<{ label: string; dotColor?: string }>;
  children?: React.ReactNode;
}

export default function PageHeader({
  backTo = "/app",
  backLabel,
  eyebrow,
  title,
  titleAccent,
  subtitle,
  badge,
  meta,
  children,
}: PageHeaderProps) {
  const { t } = useLanguage();
  const back = backLabel || t.shell.navDashboard;

  return (
    <div className="mb-6 md:mb-8" data-testid="page-header">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm mb-5 no-underline transition-colors"
        style={{ color: "var(--accent)" }}
        data-testid="link-back"
      >
        <ArrowLeft size={16} />
        {back}
      </Link>

      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-px w-8" style={{ background: "var(--accent)" }} />
        <span
          className="text-[9px] font-bold tracking-[3px] uppercase"
          style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}
        >
          {eyebrow}
        </span>
      </div>

      <h1
        className="font-black text-[26px] md:text-[32px] leading-tight mb-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--txt)" }}
      >
        {title}
        {titleAccent && (
          <>
            {" "}
            <span style={{ color: "var(--accent)" }}>{titleAccent}</span>
          </>
        )}
        {badge && (
          <span
            className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ml-3 align-middle"
            style={{
              background: `${badge.color}15`,
              color: badge.color,
              border: `1px solid ${badge.color}30`,
            }}
          >
            {badge.label}
          </span>
        )}
      </h1>

      {subtitle && (
        <p
          className="text-sm leading-relaxed max-w-[680px]"
          style={{ color: "var(--t2)" }}
        >
          {subtitle}
        </p>
      )}

      {meta && meta.length > 0 && (
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {meta.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 font-mono text-[10px]"
              style={{ color: "var(--t3)" }}
            >
              <div
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: m.dotColor || "var(--accent)" }}
              />
              {m.label}
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
