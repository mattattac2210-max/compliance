import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useLanguage, LanguageSelector } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Lock, FileText, Clock, BookOpen, ArrowRight, AlertTriangle, Globe, Check, X } from "lucide-react";

const GATE_STATIC = [
  { num: "PT", abbr: "PMA", color: "var(--t2)", isDashed: true },
  { num: "1", abbr: "ZONE", color: "var(--accent)" },
  { num: "2", abbr: "NIB", color: "var(--blue)" },
  { num: "3", abbr: "SLF", color: "var(--purple)" },
  { num: "4", abbr: "TAX", color: "var(--gold)" },
  { num: "5", abbr: "STAFF", color: "var(--grn)" },
  { num: "6", abbr: "SAFE", color: "#FCA5A5" },
  { num: "7", abbr: "OTA", color: "var(--accent)", isGlowing: true },
];

function StaggeredHeadline({ lines, highlightFirst }: { lines: string[]; highlightFirst?: boolean }) {
  const words = lines.flatMap((line, li) =>
    line.split(" ").map((word, wi) => ({ word, lineIdx: li, key: `${li}-${wi}` }))
  );

  let wordIndex = 0;
  return (
    <h1 className="font-heading font-black text-[clamp(36px,6vw,64px)] leading-[1.05] tracking-tight" style={{ color: "var(--txt)" }}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(" ").map((word, wi) => {
            const idx = wordIndex++;
            const isHighlight = highlightFirst && idx === 0;
            return (
              <motion.span
                key={`${li}-${wi}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4, ease: "easeOut" }}
                className="inline-block mr-[0.3em]"
                style={isHighlight ? { color: "var(--accent)" } : undefined}
              >
                {word}
              </motion.span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

function GatePreviewCard({ gate, index, tooltip, title, role }: { gate: typeof GATE_STATIC[0]; index: number; tooltip: string; title: string; role: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-testid={`card-gate-preview-${index}`}
    >
      <div
        className="rounded-xl p-4 min-w-[200px] transition-transform duration-200 group-hover:-translate-y-1"
        style={{
          background: "var(--surface)",
          border: `1px ${gate.isDashed ? "dashed" : "solid"} var(--b)`,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold shrink-0"
            style={{ background: "var(--accent-tint)", border: `2px solid ${gate.color}`, color: "var(--txt)" }}
          >
            {gate.num}
          </div>
          <span className="text-[11px] font-heading font-bold tracking-wider uppercase" style={{ color: gate.color }}>
            {gate.abbr}
          </span>
        </div>
        <p className="text-sm font-heading font-semibold mb-2 leading-snug" style={{ color: "var(--t2)" }}>{title}</p>
        <span
          className="text-[10px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
          style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-tint2)", color: gate.color }}
        >
          {role}
        </span>
        <div className="absolute bottom-3 right-3 opacity-40 group-hover:opacity-70 transition-opacity">
          <Lock className="h-3.5 w-3.5" style={{ color: "var(--t2)" }} />
        </div>
      </div>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] rounded px-3 py-1 z-10"
            style={{ color: "var(--t2)", background: "var(--bg2)", border: "1px solid var(--accent-tint2)" }}
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeatureCard({ icon, title, body, index, comingSoon }: {
  icon: React.ReactNode; title: string; body: string; index: number; comingSoon?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`rounded-xl p-6 ${comingSoon ? "opacity-70" : ""}`}
      style={{
        background: "var(--surface)",
        borderTop: "2px solid var(--accent)",
        border: "1px solid var(--accent-tint)",
      }}
      data-testid={`card-feature-${index}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div style={{ color: "var(--accent)" }}>{icon}</div>
        <h3 className="font-heading font-bold text-lg" style={{ color: "var(--txt)" }}>{title}</h3>
        {comingSoon && (
          <span className="text-[10px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded-full" style={{ background: "var(--gold-tint)", color: "var(--gold)", border: "1px solid var(--gold-tint)" }}>
            {comingSoon}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--t2)" }}>{body}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const gatesRef = useRef<HTMLDivElement>(null);

  const { data: vaultSummary } = useQuery<{ total: number; completed: number }>({
    queryKey: ["/api/vault/summary"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToGates = () => {
    gatesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const l = t.landing;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--txt)" }}>
      <style>{`
        @keyframes tealPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--accent-tint2); }
          50% { box-shadow: 0 0 0 4px transparent; }
        }
        .teal-pulse { animation: tealPulse 2s ease-in-out infinite; }
      `}</style>
      {/* SECTION 1 — Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}
        style={{
          background: "var(--bg)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--accent-tint)",
        }}
        data-testid="landing-header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl tracking-[3px]" style={{ color: "var(--accent)" }}>DSCVR</span>
            <span className="text-xs font-heading hidden sm:inline" style={{ color: "var(--t3)" }}>{t.header.subtitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            {isAuthenticated ? (
              <>
                <Link to="/vault" className="text-[10px] font-heading font-bold tracking-wider uppercase transition-colors hidden sm:inline" style={{ color: "var(--t2)" }} data-testid="link-vault">{t.nav.vault}</Link>
                <Link to="/timeline" className="text-[10px] font-heading font-bold tracking-wider uppercase transition-colors hidden sm:inline" style={{ color: "var(--t2)" }} data-testid="link-timeline">{t.nav.timeline}</Link>
                <Link to="/alerts" className="text-[10px] font-heading font-bold tracking-wider uppercase transition-colors hidden sm:inline" style={{ color: "var(--t2)" }} data-testid="link-alerts">{t.nav.alerts}</Link>
                <Link to="/profile" className="text-[10px] font-heading font-bold tracking-wider uppercase transition-colors hidden sm:inline" style={{ color: "var(--t2)" }} data-testid="link-profile">{t.nav.profile}</Link>
                <Link
                  to="/app"
                  className={`font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2 rounded-md transition-colors ${scrolled ? "teal-pulse" : ""}`}
                  style={{ background: "var(--accent)", color: "var(--bg)" }}
                  data-testid="link-go-to-app"
                >
                  {l.goToApp}
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2 rounded-md transition-colors" style={{ color: "var(--t2)", border: "1px solid var(--charcoal)" }} data-testid="link-signin">
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className={`font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2 rounded-md transition-colors ${scrolled ? "teal-pulse" : ""}`}
                  style={{ background: "var(--accent)", color: "var(--bg)" }}
                  data-testid="link-get-access"
                >
                  {l.getAccess}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {/* SECTION 2 — Hero */}
      <section className="min-h-[90vh] flex items-center pt-20 relative overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(var(--accent-tint) 1px, transparent 1px), linear-gradient(90deg, var(--accent-tint) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 space-y-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-[11px] font-bold tracking-[3px] uppercase"
                style={{ color: "var(--accent)" }}
              >
                {l.heroKicker}
              </motion.p>
              <StaggeredHeadline lines={[l.heroHeadline1, l.heroHeadline2, l.heroHeadline3]} highlightFirst />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-lg font-light leading-relaxed max-w-xl"
                style={{ color: "var(--t2)" }}
              >
                {l.heroSub}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="flex flex-wrap gap-3"
              >
                {isAuthenticated ? (
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-2 font-heading font-bold text-sm tracking-wider px-6 py-3 rounded-lg transition-colors"
                    style={{ background: "var(--accent)", color: "var(--bg)" }}
                    data-testid="link-hero-go-to-app"
                  >
                    {l.goToApp} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 font-heading font-bold text-sm tracking-wider px-6 py-3 rounded-lg transition-colors"
                      style={{ background: "var(--accent)", color: "var(--bg)" }}
                      data-testid="link-hero-register"
                    >
                      {l.ctaPrimary}
                    </Link>
                    <button
                      onClick={scrollToGates}
                      className="inline-flex items-center gap-2 font-heading font-bold text-sm tracking-wider px-6 py-3 rounded-lg transition-colors"
                      style={{ border: "1px solid var(--charcoal)", color: "var(--t2)" }}
                      data-testid="button-see-inside"
                    >
                      {l.ctaSecondary}
                    </button>
                  </>
                )}
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-xs"
                style={{ color: "var(--t4)" }}
              >
                {l.trustLine}
              </motion.p>
            </div>

            {/* Right column: Preview card */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className="relative rounded-xl overflow-hidden">
                <div style={{ filter: "blur(3px)", pointerEvents: "none" }} className="space-y-3 p-4">
                  {GATE_STATIC.slice(0, 3).map((g, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-4"
                      style={{
                        background: "var(--surface)",
                        border: `1px ${g.isDashed ? "dashed" : "solid"} var(--b)`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-bold"
                          style={{ background: "var(--accent-tint)", border: `2px solid ${g.color}`, color: "var(--txt)" }}
                        >
                          {g.num}
                        </div>
                        <div>
                          <p className="text-sm font-heading font-semibold" style={{ color: "var(--t2)" }}>{l.gatePreviewTitles[i]}</p>
                          <p className="text-[10px]" style={{ color: "var(--t3)" }}>{l.gatePreviewRoles[i]}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {isAuthenticated ? (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                    style={{ background: "var(--bg)", opacity: 0.85, backdropFilter: "blur(1px)" }}
                  >
                    <p className="text-sm font-heading text-center px-4" style={{ color: "var(--t2)" }}>
                      {vaultSummary ? `${Math.round((vaultSummary.completed / Math.max(vaultSummary.total, 1)) * 100)}% ${t.vault.completionLabel}` : ""}
                    </p>
                    <Link
                      to="/app"
                      className="mt-3 inline-flex items-center gap-2 font-heading font-bold text-xs tracking-wider px-4 py-2 rounded-md"
                      style={{ background: "var(--accent)", color: "var(--bg)" }}
                      data-testid="link-overlay-go-to-app"
                    >
                      {l.goToApp}
                    </Link>
                  </div>
                ) : (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                    style={{ background: "var(--bg)", opacity: 0.9, backdropFilter: "blur(2px)" }}
                  >
                    <Lock className="h-8 w-8 mb-3" style={{ color: "var(--accent)" }} />
                    <p className="font-heading font-bold text-[13px] tracking-[1px]" style={{ color: "var(--t2)" }}>
                      {l.previewLockLabel}
                    </p>
                    <Link
                      to="/register"
                      className="mt-4 inline-flex items-center font-heading font-bold text-xs tracking-wider px-5 py-2 rounded-md"
                      style={{ background: "var(--accent)", color: "var(--bg)" }}
                      data-testid="link-preview-register"
                    >
                      {l.previewLockCta}
                    </Link>
                    <Link to="/login" className="mt-2 text-xs hover:underline" style={{ color: "var(--accent)" }} data-testid="link-overlay-signin">
                      {l.lockedOverlaySignIn}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 3 — The Stakes (urgency block) */}
      <section className="py-12 px-4 sm:px-6" data-testid="section-urgency">
        <div
          className="max-w-5xl mx-auto rounded-xl p-6 sm:p-8"
          style={{
            background: "var(--gold-tint)",
            border: "1px solid var(--gold-tint)",
            borderLeft: "4px solid var(--gold)",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
            <div>
              <h2 className="font-heading font-bold text-sm tracking-wider uppercase mb-4" style={{ color: "var(--gold)" }} data-testid="text-urgency-heading">
                {l.urgencyHeading}
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--t2)" }}>
                {l.urgencyBody}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 4 — The Seven Gates (tease section) */}
      <section ref={gatesRef} className="py-16 px-4 sm:px-6" id="gates" data-testid="section-gates">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading font-black text-3xl sm:text-4xl mb-4" style={{ color: "var(--txt)" }} data-testid="text-gates-heading">
              {l.gatesHeading}
            </h2>
            <p className="text-base max-w-2xl mx-auto italic" style={{ color: "var(--t2)" }}>
              {l.gatesSub}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {GATE_STATIC.map((gate, i) => (
              <GatePreviewCard key={i} gate={gate} index={i} tooltip={l.gatesLockedTooltip} title={l.gatePreviewTitles[i]} role={l.gatePreviewRoles[i]} />
            ))}
          </div>
          <div
            className="rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--accent-tint)" }}
          >
            <Lock className="h-5 w-5 shrink-0" style={{ color: "var(--t3)" }} />
            <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--t2)" }}>
              {l.gatesCta}
            </p>
            <div className="flex gap-3 shrink-0">
              {isAuthenticated ? (
                <Link
                  to="/app"
                  className="font-heading font-bold text-xs tracking-wider px-5 py-2.5 rounded-md transition-colors"
                  style={{ background: "var(--accent)", color: "var(--bg)" }}
                  data-testid="link-gates-go-to-app"
                >
                  {l.goToApp}
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="font-heading font-bold text-xs tracking-wider px-5 py-2.5 rounded-md transition-colors"
                    style={{ background: "var(--accent)", color: "var(--bg)" }}
                    data-testid="link-gates-register"
                  >
                    {l.previewLockCta}
                  </Link>
                  <Link
                    to="/login"
                    className="font-heading font-bold text-xs tracking-wider px-5 py-2.5 rounded-md transition-colors"
                    style={{ border: "1px solid var(--charcoal)", color: "var(--t2)" }}
                    data-testid="link-gates-signin"
                  >
                    {t.nav.login}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 5 — What DSCVR Does (features) */}
      <section className="py-16 px-4 sm:px-6" data-testid="section-features">
        <div className="max-w-7xl mx-auto text-[#e81a2d]">
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-center mb-12" style={{ color: "var(--txt)" }} data-testid="text-features-heading">
            {l.featuresHeading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <FeatureCard icon={<FileText className="h-6 w-6" />} title={l.feature1Title} body={l.feature1Body} index={0} />
            <FeatureCard icon={<Clock className="h-6 w-6" />} title={l.feature2Title} body={l.feature2Body} index={1} />
            <FeatureCard icon={<BookOpen className="h-6 w-6" />} title={l.feature3Title} body={l.feature3Body} index={2} />
          </div>
          <FeatureCard icon={<ArrowRight className="h-6 w-6" />} title={l.feature4Title} body={l.feature4Body} index={3} comingSoon={l.feature4Soon} />
        </div>
      </section>
      {/* SECTION 6 — What DSCVR Does NOT (credibility/trust) */}
      <section className="py-16 px-4 sm:px-6" data-testid="section-scope">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-center mb-10" style={{ color: "var(--txt)" }}>
            {l.scopeHeading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="rounded-xl p-6"
              style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-tint2)" }}
            >
              <h3 className="font-heading font-bold text-sm tracking-wider uppercase mb-4" style={{ color: "var(--accent)" }}>
                {l.scopeTracks}
              </h3>
              <ul className="space-y-2.5">
                {l.scopeTrackItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--t2)" }}>
                    <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-xl p-6"
              style={{ background: "rgba(239,68,68,0.03)", border: "1px solid rgba(239,68,68,0.1)" }}
            >
              <h3 className="font-heading font-bold text-sm tracking-wider uppercase mb-4" style={{ color: "#FCA5A5" }}>
                {l.scopeNot}
              </h3>
              <ul className="space-y-2.5">
                {l.scopeNotItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--t2)" }}>
                    <X className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-center mt-6 max-w-2xl mx-auto italic" style={{ color: "var(--t3)" }}>
            {l.scopeDisclaimer}
          </p>
        </div>
      </section>
      {/* SECTION 7 — Language support callout */}
      <section className="py-8 px-4 sm:px-6" data-testid="section-language">
        <div
          className="max-w-5xl mx-auto rounded-xl py-6 px-8 text-center"
          style={{ background: "var(--accent-tint)", border: "1px solid var(--accent-tint2)" }}
        >
          <p className="flex items-center justify-center gap-2 text-sm font-heading" style={{ color: "var(--t2)" }}>
            <Globe className="h-4 w-4" style={{ color: "var(--accent)" }} />
            {l.langBanner}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--t3)" }}>{l.langSub}</p>
        </div>
      </section>
      {/* SECTION 8 — Final CTA */}
      <section className="py-20 px-4 sm:px-6" data-testid="section-final-cta">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-heading font-black text-3xl sm:text-4xl" style={{ color: "var(--txt)" }} data-testid="text-final-heading">
            {l.finalHeading}
          </h2>
          <p className="text-lg" style={{ color: "var(--t2)" }}>{l.finalSub}</p>
          {isAuthenticated ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-2 font-heading font-bold text-sm tracking-wider px-8 py-4 rounded-lg transition-colors"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
              data-testid="link-final-go-to-app"
            >
              {l.goToApp}
            </Link>
          ) : (
            <>
              <div>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 font-heading font-bold text-sm tracking-wider px-8 py-4 rounded-lg transition-colors"
                  style={{ background: "var(--accent)", color: "var(--bg)" }}
                  data-testid="link-final-register"
                >
                  {l.finalCta}
                </Link>
              </div>
              <Link to="/login" className="text-sm transition-colors" style={{ color: "var(--accent)" }} data-testid="link-final-signin">
                {l.finalSignIn}
              </Link>
            </>
          )}
          <p className="text-xs" style={{ color: "var(--t4)" }}>{l.trustLine}</p>
        </div>
      </section>
      {/* SECTION 9 — Footer */}
      <footer className="py-12 px-4 sm:px-6" style={{ borderTop: "1px solid var(--b)" }} data-testid="section-footer">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="font-heading font-black text-lg tracking-[3px]" style={{ color: "var(--accent)" }}>DSCVR</div>
          <p className="text-xs font-heading" style={{ color: "var(--t3)" }}>{t.header.subtitle} — {t.header.rightLabel1}</p>
          <p className="text-xs max-w-lg mx-auto leading-relaxed" style={{ color: "var(--t4)" }}>
            {l.footerDisclaimer}
          </p>
          <div className="flex items-center justify-between text-xs pt-4" style={{ color: "var(--t4)" }}>
            <span>EN · UK · ID</span>
            <span>© 2026 DSCVR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
