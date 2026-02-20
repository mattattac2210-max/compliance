import { useLanguage } from "@/i18n/context";
import PageHeader from "@/components/page-header";
import { Scale, Building2, Search, Zap, MapPin, RefreshCw, Calendar, HandshakeIcon, AlertTriangle, ExternalLink, CheckCircle2, ClipboardList, Target, Landmark, Lightbulb, BarChart3, FileText, LockKeyhole } from "lucide-react";

const AUTHORITY_NAMES = [
  "OSS / BKPM", "Bapenda Badung/Gianyar", "Kantor Pajak (KPP)", "BPJS Kesehatan",
  "BPJamsostek", "DPMPTSP", "Imigrasi Bali", "PU Perkim",
  "DAMKAR", "Dinas Lingkungan Hidup", "Dinas Ketenagakerjaan", "Kelian Banjar",
];

const COMMITMENT_ICONS = [
  <Calendar className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />,
  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />,
  <HandshakeIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />,
  <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />,
  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />,
];

export default function DisclaimersPage() {
  const { t } = useLanguage();

  return (
    <div className="relative z-[5] max-w-5xl mx-auto pt-10 pb-16 px-6 md:px-10" data-testid="disclaimers-page">
      <PageHeader
        eyebrow={t.disclaimers.eyebrow}
        title={t.disclaimers.title}
        titleAccent={t.disclaimers.titleAccent}
        subtitle={t.disclaimers.subtitle}
        meta={[
          { label: t.disclaimers.metaReviewed },
          { label: t.disclaimers.metaMonthly },
          { label: t.disclaimers.metaAllUsers, dotColor: "var(--gold)" },
        ]}
      />

      <div className="space-y-7">

      {/* CRITICAL BANNER */}
      <div
        className="rounded-xl p-[18px_22px] flex gap-4 items-start"
        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)" }}
        data-testid="disclaimers-critical-banner"
      >
        <Scale className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-extrabold text-[13px] text-red-300 mb-1.5 tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            {t.disclaimers.criticalTitle}
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--t2)" }}>
            {t.disclaimers.criticalBody}
          </p>
        </div>
      </div>

      {/* SECTION 1 */}
      <Section num="01" title={t.disclaimers.s1Title} icon={<ClipboardList size={16} className="ml-auto" />}>
        <Card variant="warn" icon={<AlertTriangle className="w-3.5 h-3.5" />} title={t.disclaimers.s1Card1Title}>
          {t.disclaimers.s1Card1Body}
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Card variant="neutral" icon={<Building2 className="w-3.5 h-3.5" />} title={t.disclaimers.s1Card2Title}>
            {t.disclaimers.s1Card2Body}
          </Card>
          <Card variant="neutral" icon={<Search className="w-3.5 h-3.5" />} title={t.disclaimers.s1Card3Title}>
            {t.disclaimers.s1Card3Body}
          </Card>
        </div>
      </Section>

      {/* SECTION 2 */}
      <Section num="02" title={t.disclaimers.s2Title} icon={<Target size={16} className="ml-auto" />}>
        <Card variant="info" icon={<CheckCircle2 className="w-3.5 h-3.5" />} title={t.disclaimers.s2Card1Title}>
          {t.disclaimers.s2Card1Body}
        </Card>
        <Card variant="warn" icon={<AlertTriangle className="w-3.5 h-3.5" />} title={t.disclaimers.s2Card2Title}>
          {t.disclaimers.s2Card2Body}
        </Card>
      </Section>

      {/* SECTION 3 */}
      <Section num="03" title={t.disclaimers.s3Title} icon={<Landmark size={16} className="ml-auto" />}>
        <Card variant="warn" icon={<Zap className="w-3.5 h-3.5" />} title={t.disclaimers.s3Card1Title}>
          {t.disclaimers.s3Card1Body}
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Card variant="neutral" icon={<MapPin className="w-3.5 h-3.5" />} title={t.disclaimers.s3Card2Title}>
            {t.disclaimers.s3Card2Body}
          </Card>
          <Card variant="neutral" icon={<RefreshCw className="w-3.5 h-3.5" />} title={t.disclaimers.s3Card3Title}>
            {t.disclaimers.s3Card3Body}
          </Card>
        </div>
      </Section>

      {/* SECTION 4: AUTHORITIES */}
      <Section num="04" title={t.disclaimers.s4Title} icon={<Landmark size={16} className="ml-auto" />}>
        <Card variant="info" icon={<Lightbulb size={14} />} title={t.disclaimers.s4PrimaryRule}>
          {t.disclaimers.s4PrimaryRuleBody}
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
          {AUTHORITY_NAMES.map((name, i) => {
            const auth = t.disclaimers.authorities[i];
            return (
              <div
                key={name}
                className="rounded-lg p-3"
                style={{ background: "var(--surface)", border: "1px solid var(--b)" }}
                data-testid={`authority-card-${name.replace(/[^a-zA-Z]/g, "").toLowerCase()}`}
              >
                <div className="font-bold text-[11px] mb-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--txt)" }}>{name}</div>
                <div className="text-[11px] leading-snug" style={{ color: "var(--t3)" }}>{auth?.desc}</div>
                <span className="inline-block mt-1.5 font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ color: "var(--accent)", background: "var(--accent-tint)" }}>
                  {auth?.type}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* SECTION 5: CONTENT ACCURACY */}
      <Section num="05" title={t.disclaimers.s5Title} icon={<RefreshCw size={16} className="ml-auto" />}>
        <div className="rounded-xl p-[22px_26px]" style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-tint2)" }}>
          <div className="flex items-center gap-3 mb-3.5">
            <HandshakeIcon className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <div>
              <div className="font-extrabold text-[15px]" style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>{t.disclaimers.commitmentTitle}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--t2)" }}>{t.disclaimers.commitmentSub}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {t.disclaimers.commitments.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-lg"
                style={{ background: "var(--bg)", border: "1px solid var(--accent-tint)" }}
              >
                {COMMITMENT_ICONS[i]}
                <div className="text-[12px] leading-relaxed" style={{ color: "var(--t2)" }}>
                  <strong className="text-[11px] tracking-wide block mb-0.5" style={{ color: "var(--txt)", fontFamily: "var(--font-display)" }}>{c.title}</strong>
                  {c.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Card variant="warn" icon={<AlertTriangle className="w-3.5 h-3.5" />} title={t.disclaimers.s5Card1Title}>
            {t.disclaimers.s5Card1Body}
          </Card>
          <Card variant="neutral" icon={<BarChart3 size={14} />} title={t.disclaimers.s5Card2Title}>
            {t.disclaimers.s5Card2Body}
          </Card>
        </div>
      </Section>

      {/* SECTION 6: LIABILITY */}
      <Section num="06" title={t.disclaimers.s6Title} icon={<Scale size={16} className="ml-auto" />}>
        <Card variant="warn" icon={<AlertTriangle className="w-3.5 h-3.5" />} title={t.disclaimers.s6Card1Title}>
          {t.disclaimers.s6Card1Body}
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Card variant="neutral" icon={<FileText size={14} />} title={t.disclaimers.s6Card2Title}>
            {t.disclaimers.s6Card2Body}
          </Card>
          <Card variant="neutral" icon={<LockKeyhole size={14} />} title={t.disclaimers.s6Card3Title}>
            {t.disclaimers.s6Card3Body}
          </Card>
        </div>
      </Section>

      {/* ACCEPTANCE */}
      <div
        className="rounded-xl p-[18px_22px] flex items-start gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--b)" }}
        data-testid="disclaimers-acceptance"
      >
        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--accent-tint)", border: "2px solid var(--accent)" }}>
          <CheckCircle2 className="w-3 h-3" style={{ color: "var(--accent)" }} />
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--t2)" }}>
          <strong style={{ color: "var(--txt)" }}>{t.disclaimers.acceptanceStrong}</strong>{" "}
          {t.disclaimers.acceptanceBody}
        </p>
      </div>
      </div>
    </div>
  );
}

function Section({ num, title, icon, children }: { num: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5" data-testid={`disclaimers-section-${num}`}>
      <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid var(--b)" }}>
        <span className="font-mono text-[10px] rounded px-2 py-0.5" style={{ color: "var(--accent)", background: "var(--accent-tint)", border: "1px solid var(--accent-tint2)" }}>
          {num}
        </span>
        <span className="font-extrabold text-[15px]" style={{ fontFamily: "var(--font-display)", color: "var(--txt)" }}>{title}</span>
        {icon}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Card({ variant, icon, title, children }: { variant: "warn" | "info" | "neutral"; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const variantStyles: Record<string, React.CSSProperties> = {
    warn: { background: "rgba(245,158,11,0.08)", border: "1px solid var(--b)", borderLeft: "3px solid var(--gold)" },
    info: { background: "var(--accent-tint)", border: "1px solid var(--b)", borderLeft: "3px solid var(--accent)" },
    neutral: { background: "var(--surface)", border: "1px solid var(--b)", borderLeft: "3px solid var(--t3)" },
  };
  return (
    <div className="rounded-xl p-4" style={variantStyles[variant]}>
      <div className="font-bold text-[12px] mb-1.5 flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--txt)" }}>
        {icon}
        {title}
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--t2)" }}>{children}</p>
    </div>
  );
}
