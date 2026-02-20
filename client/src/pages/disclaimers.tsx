import { useLanguage } from "@/i18n/context";
import { Scale, Building2, Search, Zap, MapPin, RefreshCw, Calendar, HandshakeIcon, AlertTriangle, ExternalLink, CheckCircle2 } from "lucide-react";

const AUTHORITY_NAMES = [
  "OSS / BKPM", "Bapenda Badung/Gianyar", "Kantor Pajak (KPP)", "BPJS Kesehatan",
  "BPJamsostek", "DPMPTSP", "Imigrasi Bali", "PU Perkim",
  "DAMKAR", "Dinas Lingkungan Hidup", "Dinas Ketenagakerjaan", "Kelian Banjar",
];

const COMMITMENT_ICONS = [
  <Calendar className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />,
  <AlertTriangle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />,
  <HandshakeIcon className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />,
  <ExternalLink className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />,
  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />,
];

export default function DisclaimersPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-7 max-w-4xl" data-testid="disclaimers-page">
      {/* HERO */}
      <div data-testid="disclaimers-hero">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-px w-8 bg-teal-500/50" />
          <span className="font-montserrat text-[9px] font-bold tracking-[3px] uppercase text-teal-500">
            {t.disclaimers.eyebrow}
          </span>
          <div className="h-px w-8 bg-teal-500/50" />
        </div>
        <h1 className="font-montserrat font-black text-[28px] leading-tight mb-2">
          {t.disclaimers.title} <span className="text-teal-500">{t.disclaimers.titleAccent}</span>
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-[680px]">
          {t.disclaimers.subtitle}
        </p>
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <div className="w-[5px] h-[5px] rounded-full bg-teal-500" />
            {t.disclaimers.metaReviewed}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <div className="w-[5px] h-[5px] rounded-full bg-teal-500" />
            {t.disclaimers.metaMonthly}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <div className="w-[5px] h-[5px] rounded-full bg-amber-500" />
            {t.disclaimers.metaAllUsers}
          </div>
        </div>
      </div>

      {/* CRITICAL BANNER */}
      <div
        className="bg-red-500/[0.07] border border-red-500/25 rounded-xl p-[18px_22px] flex gap-4 items-start"
        data-testid="disclaimers-critical-banner"
      >
        <Scale className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-montserrat font-extrabold text-[13px] text-red-300 mb-1.5 tracking-wide">
            {t.disclaimers.criticalTitle}
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            {t.disclaimers.criticalBody}
          </p>
        </div>
      </div>

      {/* SECTION 1 */}
      <Section num="01" title={t.disclaimers.s1Title} icon={<span className="text-base ml-auto">📋</span>}>
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
      <Section num="02" title={t.disclaimers.s2Title} icon={<span className="text-base ml-auto">🎯</span>}>
        <Card variant="info" icon={<CheckCircle2 className="w-3.5 h-3.5" />} title={t.disclaimers.s2Card1Title}>
          {t.disclaimers.s2Card1Body}
        </Card>
        <Card variant="warn" icon={<AlertTriangle className="w-3.5 h-3.5" />} title={t.disclaimers.s2Card2Title}>
          {t.disclaimers.s2Card2Body}
        </Card>
      </Section>

      {/* SECTION 3 */}
      <Section num="03" title={t.disclaimers.s3Title} icon={<span className="text-base ml-auto">🏛️</span>}>
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
      <Section num="04" title={t.disclaimers.s4Title} icon={<span className="text-base ml-auto">🏛️</span>}>
        <Card variant="info" icon={<span className="text-[13px]">💡</span>} title={t.disclaimers.s4PrimaryRule}>
          {t.disclaimers.s4PrimaryRuleBody}
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
          {AUTHORITY_NAMES.map((name, i) => {
            const auth = t.disclaimers.authorities[i];
            return (
              <div
                key={name}
                className="bg-[#111f34] border border-white/[0.07] rounded-lg p-3"
                data-testid={`authority-card-${name.replace(/[^a-zA-Z]/g, "").toLowerCase()}`}
              >
                <div className="font-montserrat font-bold text-[11px] text-slate-100 mb-0.5">{name}</div>
                <div className="text-[11px] text-slate-500 leading-snug">{auth?.desc}</div>
                <span className="inline-block mt-1.5 font-mono text-[9px] text-teal-500 bg-teal-500/10 px-1.5 py-0.5 rounded">
                  {auth?.type}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* SECTION 5: CONTENT ACCURACY */}
      <Section num="05" title={t.disclaimers.s5Title} icon={<span className="text-base ml-auto">🔄</span>}>
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-[22px_26px]">
          <div className="flex items-center gap-3 mb-3.5">
            <HandshakeIcon className="w-5 h-5 text-teal-400" />
            <div>
              <div className="font-montserrat font-extrabold text-[15px] text-teal-500">{t.disclaimers.commitmentTitle}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t.disclaimers.commitmentSub}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {t.disclaimers.commitments.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 bg-[#07101E]/50 border border-teal-500/10 rounded-lg"
              >
                {COMMITMENT_ICONS[i]}
                <div className="text-[12px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-100 font-montserrat text-[11px] tracking-wide block mb-0.5">{c.title}</strong>
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
          <Card variant="neutral" icon={<span className="text-[13px]">📊</span>} title={t.disclaimers.s5Card2Title}>
            {t.disclaimers.s5Card2Body}
          </Card>
        </div>
      </Section>

      {/* SECTION 6: LIABILITY */}
      <Section num="06" title={t.disclaimers.s6Title} icon={<span className="text-base ml-auto">⚖️</span>}>
        <Card variant="warn" icon={<AlertTriangle className="w-3.5 h-3.5" />} title={t.disclaimers.s6Card1Title}>
          {t.disclaimers.s6Card1Body}
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Card variant="neutral" icon={<span className="text-[13px]">📄</span>} title={t.disclaimers.s6Card2Title}>
            {t.disclaimers.s6Card2Body}
          </Card>
          <Card variant="neutral" icon={<span className="text-[13px]">🔒</span>} title={t.disclaimers.s6Card3Title}>
            {t.disclaimers.s6Card3Body}
          </Card>
        </div>
      </Section>

      {/* ACCEPTANCE */}
      <div
        className="bg-[#111f34] border border-white/[0.07] rounded-xl p-[18px_22px] flex items-start gap-4"
        data-testid="disclaimers-acceptance"
      >
        <div className="w-5 h-5 bg-teal-500/10 border-2 border-teal-500 rounded flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-3 h-3 text-teal-500" />
        </div>
        <p className="text-[12px] text-slate-400 leading-relaxed">
          <strong className="text-slate-100">{t.disclaimers.acceptanceStrong}</strong>{" "}
          {t.disclaimers.acceptanceBody}
        </p>
      </div>
    </div>
  );
}

function Section({ num, title, icon, children }: { num: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5" data-testid={`disclaimers-section-${num}`}>
      <div className="flex items-center gap-3 pb-3 border-b border-white/[0.07]">
        <span className="font-mono text-[10px] text-teal-500 bg-teal-500/10 border border-teal-500/20 rounded px-2 py-0.5">
          {num}
        </span>
        <span className="font-montserrat font-extrabold text-[15px] text-slate-100">{title}</span>
        {icon}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Card({ variant, icon, title, children }: { variant: "warn" | "info" | "neutral"; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const variantClasses = {
    warn: "bg-amber-500/[0.08] border-white/[0.07] border-l-amber-500",
    info: "bg-teal-500/[0.06] border-white/[0.07] border-l-teal-500",
    neutral: "bg-[#0D1B2E] border-white/[0.07] border-l-slate-500",
  };
  return (
    <div className={`border rounded-xl p-4 border-l-[3px] ${variantClasses[variant]}`}>
      <div className="font-montserrat font-bold text-[12px] text-slate-100 mb-1.5 flex items-center gap-2">
        {icon}
        {title}
      </div>
      <p className="text-[13px] text-slate-400 leading-relaxed">{children}</p>
    </div>
  );
}
