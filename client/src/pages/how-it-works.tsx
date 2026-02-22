import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/i18n/context";
import { Globe } from "lucide-react";
import type { Language } from "@/i18n/types";
import "./landing.css";

const CheckSvg = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 4.5,8.5 10,3" /></svg>
);

const FaqArrowSvg = ({ open }: { open: boolean }) => (
  <svg className={`faq-arr${open ? " open" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3,5 7,9 11,5" /></svg>
);

const STEPS = [
  { id: "step1", num: "01", label: "Register & set up" },
  { id: "step2", num: "02", label: "Map your property" },
  { id: "step3", num: "03", label: "See your gates" },
  { id: "step4", num: "04", label: "Go Pro" },
  { id: "step5", num: "05", label: "Alerts & vault" },
  { id: "step6", num: "06", label: "Regulatory intel" },
];

const FAQ_ITEMS = [
  {
    q: "Is the free account really free forever \u2014 or does it expire?",
    a: "Yes, genuinely free forever. The free account gives you the gate overview and regulations hub with no expiry and no payment method required. We don\u2019t run free trials that flip to paid \u2014 the free tier is a separate, permanent account type.",
  },
  {
    q: "What happens if I cancel Pro \u2014 do I lose my data?",
    a: "No. If you cancel Pro, your account reverts to the free tier. Your property profile, gate status, and vault documents remain intact. You lose access to the calendar, alerts, and active tracking \u2014 but nothing is deleted. If you resubscribe, everything is exactly as you left it.",
  },
  {
    q: "My property is in Gianyar, not Badung \u2014 does DSCVR still apply?",
    a: "Yes. DSCVR covers all regencies in Bali \u2014 Badung, Gianyar, Denpasar, Tabanan, Karangasem, and others. Some local tax rates and permit specifics differ by regency (PB1 for example is set locally). When you map your property you specify your regency, and DSCVR applies the correct rates and requirements. Regulatory alerts are also region-filtered.",
  },
  {
    q: "I have a property manager who handles compliance \u2014 is DSCVR still useful?",
    a: "Very useful, actually \u2014 DSCVR is designed for this scenario. You add your property manager as a staff member and route relevant obligations directly to them via WhatsApp or email. You get confirmation notifications when they mark tasks complete and upload receipts. You maintain oversight without needing to be the one doing the work. This is how most Pro users operate.",
  },
  {
    q: "DSCVR says I\u2019m missing documents \u2014 does that mean I\u2019m non-compliant?",
    a: "Not necessarily. DSCVR tracks what you\u2019ve uploaded to the vault, and flags gaps based on that. You may well have a document that simply hasn\u2019t been uploaded yet. The flag means \u201cDSCVR can\u2019t verify this\u201d \u2014 not that the document doesn\u2019t exist. Upload what you have and the flag clears. DSCVR is a tracking platform, not an enforcement authority \u2014 it doesn\u2019t know about documents that exist outside the vault.",
  },
  {
    q: "Will DSCVR file things or deal with government portals on my behalf?",
    a: "No. DSCVR is a compliance information and tracking platform \u2014 we tell you what needs to be done, when, how, and on which portal. We don\u2019t file on your behalf, access your government accounts, or interact with any portal in your name. All filings are done by you or your accountant, using the portal links and plain-language guides DSCVR provides. We keep the manual burden low \u2014 but the actual submission stays with you.",
  },
];

const STEP_COLORS: Record<string, string> = {
  step1: "#2563EB",
  step2: "#7C3AED",
  step3: "#16A34A",
  step4: "#E8192C",
  step5: "#D97706",
  step6: "#E8192C",
};

function LandingLangSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const languages: Language[] = ["en", "uk", "id"];
  const labels: Record<Language, string> = { en: "EN", uk: "UK", id: "ID" };
  const codes: Record<Language, string> = { en: "GB", uk: "UA", id: "ID" };
  const names: Record<Language, string> = { en: "English", uk: "Українська", id: "Bahasa Indonesia" };
  return (
    <div className="relative" data-testid="landing-language-selector" style={{ marginLeft: 4 }}>
      <button onClick={() => setOpen(!open)} data-testid="landing-language-toggle"
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 20, border: "1px solid var(--b)", background: "var(--white)", color: "var(--t2)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        <Globe size={13} />
        <span>{labels[lang]}</span>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10000 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 10001, borderRadius: 8, border: "1px solid var(--b)", background: "var(--white)", boxShadow: "var(--sh2)", overflow: "hidden", minWidth: 150 }}>
            {languages.map((l) => (
              <button key={l} data-testid={`landing-lang-option-${l}`}
                onClick={() => { setLang(l); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "inherit",
                  background: l === lang ? "var(--rt)" : "transparent",
                  color: l === lang ? "var(--red)" : "var(--t2)" }}>
                <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}>{codes[l]}</span>
                <span>{names[l]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function HowItWorksPage() {
  const { t } = useLanguage();
  const stepLabels = [t.howItWorks.step1Label, t.howItWorks.step2Label, t.howItWorks.step3Label, t.howItWorks.step4Label, t.howItWorks.step5Label, t.howItWorks.step6Label];
  const [activeStep, setActiveStep] = useState("step1");
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});
  const clickCooldown = useRef(false);

  const toggleFaq = useCallback((idx: number) => {
    setOpenFaq((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const handleStepClick = useCallback((stepId: string) => {
    setActiveStep(stepId);
    clickCooldown.current = true;
    setTimeout(() => { clickCooldown.current = false; }, 1000);
  }, []);

  useEffect(() => {
    const stepIds = STEPS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        if (clickCooldown.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveStep(entry.target.id);
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );
    stepIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);


  return (
    <div className="lp">
      {/* NAV */}
      <nav className="lnav" data-testid="nav-bar">
        <Link to="/" className="logo" data-testid="link-logo">
          <div className="lm">D</div>
          <div>
            <div className="lt">DSCVR</div>
            <div className="ls">Compliance Navigator</div>
          </div>
        </Link>
        <div className="nav-links">
          <a className="nav-link ac" href="#" data-testid="link-how-it-works">{t.howItWorks.navHowItWorks}</a>
          <a href="/#features" className="nav-link" data-testid="link-features">{t.howItWorks.navFeatures}</a>
          <a href="/#pricing" className="nav-link" data-testid="link-pricing">{t.howItWorks.navPricing}</a>
        </div>
        <div className="nav-r">
          <LandingLangSelector />
          <Link to="/login">
            <button className="btn-out" data-testid="button-sign-in">{t.howItWorks.navSignIn}</button>
          </Link>
          <Link to="/register">
            <button className="btn-red" data-testid="button-get-pro">{t.howItWorks.navSignUp}</button>
          </Link>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className="ph">
        <div className="ph-inner">
          <div className="ph-breadcrumb">
            <Link to="/" data-testid="link-breadcrumb-home">DSCVR</Link>
            <span className="ph-breadcrumb-sep">&rsaquo;</span>
            <span className="ph-breadcrumb-current">{t.howItWorks.breadcrumbCurrent}</span>
          </div>
          <div className="ph-tag">{t.howItWorks.tag}</div>
          <h1 className="ph-h1">{t.howItWorks.headline.split("\n").map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</h1>
          <p className="ph-sub">{t.howItWorks.sub}</p>
        </div>
      </div>

      {/* FLOATING STEP PROGRESS BAR */}
      <div
        className="ph-progress-float visible"
        style={{ "--step-accent": STEP_COLORS[activeStep] || "#E8192C" } as React.CSSProperties}
        data-testid="step-progress-bar"
      >
        {STEPS.map((s) => (
          <a
            key={s.id}
            className={`ph-step${activeStep === s.id ? " ac" : ""}`}
            href={`#${s.id}`}
            onClick={() => handleStepClick(s.id)}
            data-testid={`step-float-${s.id}`}
          >
            <div className="ph-step-n">{s.num}</div>
            <div className="ph-step-l">{stepLabels[STEPS.indexOf(s)]}</div>
          </a>
        ))}
      </div>

      {/* STEPS */}
      <div className="section white">
        <div className="wrap">

          {/* Step 01 */}
          <div className="step-block" id="step1" data-testid="step-block-1">
            <div className="step-num-col"><div className="step-n">01</div><div className="step-line" /></div>
            <div className="step-content">
              <div className="step-head">
                <div className="step-icon" style={{ background: "rgba(37,99,235,.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#2563EB" strokeWidth="1.5"><circle cx="9" cy="6" r="3" /><path d="M2 16c0-3.87 3.13-7 7-7s7 3.13 7 7" /></svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span className="step-title">{t.howItWorks.step1Title}</span>
                    <span className="free-badge">{t.howItWorks.freeLabel}</span>
                  </div>
                </div>
              </div>
              <p className="step-body">{t.howItWorks.step1Body}</p>
              <div className="blist">
                {t.howItWorks.step1Bullets.map((b, i) => (
                  <div className="bitem" key={i}><CheckSvg /> <span>{b}</span></div>
                ))}
              </div>
              <div className="note">
                <p className="note-txt">{t.howItWorks.step1Note}</p>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="step-block" id="step2" data-testid="step-block-2">
            <div className="step-num-col"><div className="step-n">02</div><div className="step-line" /></div>
            <div className="step-content">
              <div className="step-head">
                <div className="step-icon" style={{ background: "rgba(124,58,237,.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#7C3AED" strokeWidth="1.5"><rect x="2" y="3" width="14" height="12" rx="2" /><line x1="2" y1="7" x2="16" y2="7" /><line x1="6" y1="3" x2="6" y2="7" /><line x1="12" y1="3" x2="12" y2="7" /></svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span className="step-title">{t.howItWorks.step2Title}</span>
                    <span className="free-badge">{t.howItWorks.freeLabel}</span>
                  </div>
                </div>
              </div>
              <p className="step-body">{t.howItWorks.step2Body}</p>
              <div className="blist">
                {t.howItWorks.step2Bullets.map((b, i) => (
                  <div className="bitem" key={i}><CheckSvg /> <span>{b}</span></div>
                ))}
              </div>

              <div className="step-detail" style={{ marginTop: "18px" }}>
                <div className="sd-bar">
                  <div className="sd-dot" style={{ background: "#FF5F57" }} />
                  <div className="sd-dot" style={{ background: "#FFBD2E" }} />
                  <div className="sd-dot" style={{ background: "#28CA41" }} />
                  <span className="sd-title">{t.howItWorks.ppTitle}</span>
                </div>
                <div className="sd-body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--b)", borderRadius: "7px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "5px" }}>{t.howItWorks.ppPropLabel}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--txt)" }}>{t.howItWorks.ppPropValue}</div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>{t.howItWorks.ppPropSub}</div>
                    </div>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--b)", borderRadius: "7px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "5px" }}>{t.howItWorks.ppStaffLabel}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--txt)" }}>{t.howItWorks.ppStaffValue}</div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>{t.howItWorks.ppStaffSub}</div>
                    </div>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--b)", borderRadius: "7px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "5px" }}>{t.howItWorks.ppOtaLabel}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--txt)" }}>{t.howItWorks.ppOtaValue}</div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>{t.howItWorks.ppOtaSub}</div>
                    </div>
                    <div style={{ background: "rgba(232,25,44,.04)", border: "1px solid rgba(232,25,44,.12)", borderRadius: "7px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "5px" }}>{t.howItWorks.ppEventsLabel}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--red)" }}>{t.howItWorks.ppEventsValue}</div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>{t.howItWorks.ppEventsSub}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className="step-block" id="step3" data-testid="step-block-3">
            <div className="step-num-col"><div className="step-n">03</div><div className="step-line" /></div>
            <div className="step-content">
              <div className="step-head">
                <div className="step-icon" style={{ background: "rgba(22,163,74,.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#16A34A" strokeWidth="1.5"><path d="M3 9l4 4 8-8" /><circle cx="9" cy="9" r="7.5" /></svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span className="step-title">{t.howItWorks.step3Title}</span>
                    <span className="free-badge">{t.howItWorks.freeLabel}</span>
                  </div>
                </div>
              </div>
              <p className="step-body">{t.howItWorks.step3Body}</p>

              <div className="gate-map" style={{ marginTop: "16px" }}>
                <div className="gate-row free-g">
                  <div className="gate-badge" style={{ background: "rgba(22,163,74,.12)", color: "#16A34A", border: "1.5px solid rgba(22,163,74,.3)" }}>G0</div>
                  <div className="gate-info"><div className="gate-name">{t.howItWorks.g0Name}</div><div className="gate-desc">{t.howItWorks.g0Desc}</div></div>
                  <span className="gate-access" style={{ background: "rgba(37,99,235,.08)", color: "var(--blue)" }}>{t.howItWorks.gFreeView}</span>
                </div>
                <div className="gate-row free-g">
                  <div className="gate-badge" style={{ background: "rgba(22,163,74,.12)", color: "#16A34A", border: "1.5px solid rgba(22,163,74,.3)" }}>G1</div>
                  <div className="gate-info"><div className="gate-name">{t.howItWorks.g1Name}</div><div className="gate-desc">{t.howItWorks.g1Desc}</div></div>
                  <span className="gate-access" style={{ background: "rgba(37,99,235,.08)", color: "var(--blue)" }}>{t.howItWorks.gFreeView}</span>
                </div>
                <div className="gate-row free-g">
                  <div className="gate-badge" style={{ background: "rgba(217,119,6,.12)", color: "var(--gold)", border: "1.5px solid rgba(217,119,6,.3)" }}>G2</div>
                  <div className="gate-info"><div className="gate-name">{t.howItWorks.g2Name}</div><div className="gate-desc">{t.howItWorks.g2Desc}</div></div>
                  <span className="gate-access" style={{ background: "rgba(37,99,235,.08)", color: "var(--blue)" }}>{t.howItWorks.gFreeView}</span>
                </div>
                <div className="gate-row pro-g">
                  <div className="gate-badge" style={{ background: "rgba(124,58,237,.1)", color: "var(--purple)", border: "1.5px solid rgba(124,58,237,.25)" }}>G3</div>
                  <div className="gate-info"><div className="gate-name">{t.howItWorks.g3Name}</div><div className="gate-desc">{t.howItWorks.g3Desc}</div></div>
                  <span className="gate-access" style={{ background: "rgba(232,25,44,.07)", color: "var(--red)" }}>{t.howItWorks.gProTracking}</span>
                </div>
                <div className="gate-row pro-g">
                  <div className="gate-badge" style={{ background: "rgba(217,119,6,.1)", color: "var(--gold)", border: "1.5px solid rgba(217,119,6,.22)" }}>G4</div>
                  <div className="gate-info"><div className="gate-name">{t.howItWorks.g4Name}</div><div className="gate-desc">{t.howItWorks.g4Desc}</div></div>
                  <span className="gate-access" style={{ background: "rgba(232,25,44,.07)", color: "var(--red)" }}>{t.howItWorks.gProTracking}</span>
                </div>
                <div className="gate-row pro-g">
                  <div className="gate-badge" style={{ background: "rgba(22,163,74,.1)", color: "var(--grn)", border: "1.5px solid rgba(22,163,74,.22)" }}>G5</div>
                  <div className="gate-info"><div className="gate-name">{t.howItWorks.g5Name}</div><div className="gate-desc">{t.howItWorks.g5Desc}</div></div>
                  <span className="gate-access" style={{ background: "rgba(232,25,44,.07)", color: "var(--red)" }}>{t.howItWorks.gProTracking}</span>
                </div>
                <div className="gate-row pro-g">
                  <div className="gate-badge" style={{ background: "rgba(232,25,44,.1)", color: "var(--red)", border: "1.5px solid rgba(232,25,44,.22)" }}>G6</div>
                  <div className="gate-info"><div className="gate-name">{t.howItWorks.g6Name}</div><div className="gate-desc">{t.howItWorks.g6Desc}</div></div>
                  <span className="gate-access" style={{ background: "rgba(232,25,44,.07)", color: "var(--red)" }}>{t.howItWorks.gProTracking}</span>
                </div>
                <div className="gate-row" style={{ background: "rgba(37,99,235,.05)", borderColor: "rgba(37,99,235,.14)" }}>
                  <div className="gate-badge" style={{ background: "rgba(37,99,235,.12)", color: "var(--blue)", border: "1.5px solid rgba(37,99,235,.3)" }}>G7</div>
                  <div className="gate-info"><div className="gate-name">{t.howItWorks.g7Name}</div><div className="gate-desc">{t.howItWorks.g7Desc}</div></div>
                  <span className="gate-access" style={{ background: "rgba(37,99,235,.08)", color: "var(--blue)" }}>{t.howItWorks.gGoalState}</span>
                </div>
              </div>

              <div className="note" style={{ marginTop: "14px" }}>
                <p className="note-txt">{t.howItWorks.step3Note}</p>
              </div>
            </div>
          </div>

          {/* Step 04 */}
          <div className="step-block" id="step4" data-testid="step-block-4">
            <div className="step-num-col"><div className="step-n">04</div><div className="step-line" /></div>
            <div className="step-content">
              <div className="step-head">
                <div className="step-icon" style={{ background: "rgba(232,25,44,.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#E8192C" strokeWidth="1.5"><path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 12.5L4 16L5.5 10.5L1.5 7H6.5L9 2Z" /></svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span className="step-title">{t.howItWorks.step4Title}</span>
                    <span className="pro-badge">{t.howItWorks.proLabel}</span>
                  </div>
                </div>
              </div>
              <p className="step-body">{t.howItWorks.step4Body}</p>
              <div className="blist">
                {t.howItWorks.step4Bullets.map((b, i) => (
                  <div className="bitem" key={i}><CheckSvg /> <span>{b}</span></div>
                ))}
              </div>
              <div className="pill-row">
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>{t.howItWorks.pillCalendar}</div>
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>{t.howItWorks.pillAlerts}</div>
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>{t.howItWorks.pillVault}</div>
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>{t.howItWorks.pillGates}</div>
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>{t.howItWorks.pillStaff}</div>
              </div>
            </div>
          </div>

          {/* Step 05 */}
          <div className="step-block" id="step5" data-testid="step-block-5">
            <div className="step-num-col"><div className="step-n">05</div><div className="step-line" /></div>
            <div className="step-content">
              <div className="step-head">
                <div className="step-icon" style={{ background: "rgba(217,119,6,.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#D97706" strokeWidth="1.5"><path d="M9 2C6.24 2 4 4.24 4 7c0 3.5 5 9 5 9s5-5.5 5-9c0-2.76-2.24-5-5-5z" /><circle cx="9" cy="7" r="1.5" /></svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span className="step-title">{t.howItWorks.step5Title}</span>
                    <span className="pro-badge">{t.howItWorks.proLabel}</span>
                  </div>
                </div>
              </div>
              <p className="step-body">{t.howItWorks.step5Body}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "10px" }}>{t.howItWorks.step5AlertRouting}</div>
                  <div className="routing-diagram">
                    <div className="route-row">
                      <div className="route-from">{t.howItWorks.routeFrom1}</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to"><span className="route-chip" style={{ background: "rgba(217,119,6,.1)", color: "#92400E", border: "1px solid rgba(217,119,6,.2)" }}>{t.howItWorks.routeTo1}</span></div>
                    </div>
                    <div className="route-row">
                      <div className="route-from">{t.howItWorks.routeFrom2}</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to"><span className="route-chip" style={{ background: "rgba(22,163,74,.1)", color: "#14532D", border: "1px solid rgba(22,163,74,.2)" }}>{t.howItWorks.routeTo2}</span></div>
                    </div>
                    <div className="route-row">
                      <div className="route-from">{t.howItWorks.routeFrom3}</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to">
                        <span className="route-chip" style={{ background: "rgba(22,163,74,.1)", color: "#14532D", border: "1px solid rgba(22,163,74,.2)" }}>{t.howItWorks.routeTo3}</span>
                        <span className="route-chip" style={{ background: "rgba(217,119,6,.1)", color: "#92400E", border: "1px solid rgba(217,119,6,.2)" }}>{t.howItWorks.routeTo3b}</span>
                      </div>
                    </div>
                    <div className="route-row">
                      <div className="route-from">{t.howItWorks.routeFrom4}</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to"><span className="route-chip" style={{ background: "rgba(124,58,237,.1)", color: "#4C1D95", border: "1px solid rgba(124,58,237,.2)" }}>{t.howItWorks.routeTo4}</span></div>
                    </div>
                    <div className="route-row">
                      <div className="route-from">{t.howItWorks.routeFrom5}</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to"><span className="route-chip" style={{ background: "rgba(232,25,44,.1)", color: "#991B1B", border: "1px solid rgba(232,25,44,.2)" }}>{t.howItWorks.routeTo5}</span></div>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--t3)", lineHeight: "1.55" }}>{t.howItWorks.step5StaffNote}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "10px" }}>{t.howItWorks.step5VaultUpload}</div>
                  <div className="vault-cats">
                    <div className="vault-cat">
                      <div className="vc-head"><span style={{ color: "var(--red)" }}>&bull;</span> {t.howItWorks.vaultCatSafety}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--red)" }} />{t.howItWorks.vaultSafety1}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--red)" }} />{t.howItWorks.vaultSafety2}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--red)" }} />{t.howItWorks.vaultSafety3}</div>
                    </div>
                    <div className="vault-cat">
                      <div className="vc-head"><span style={{ color: "var(--gold)" }}>&bull;</span> {t.howItWorks.vaultCatTax}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--gold)" }} />{t.howItWorks.vaultTax1}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--gold)" }} />{t.howItWorks.vaultTax2}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--gold)" }} />{t.howItWorks.vaultTax3}</div>
                    </div>
                    <div className="vault-cat">
                      <div className="vc-head"><span style={{ color: "var(--grn)" }}>&bull;</span> {t.howItWorks.vaultCatPermits}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--grn)" }} />{t.howItWorks.vaultPermits1}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--grn)" }} />{t.howItWorks.vaultPermits2}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--grn)" }} />{t.howItWorks.vaultPermits3}</div>
                    </div>
                    <div className="vault-cat">
                      <div className="vc-head"><span style={{ color: "var(--blue)" }}>&bull;</span> {t.howItWorks.vaultCatBpjs}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--blue)" }} />{t.howItWorks.vaultBpjs1}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--blue)" }} />{t.howItWorks.vaultBpjs2}</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--blue)" }} />{t.howItWorks.vaultBpjs3}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--t3)", lineHeight: "1.55" }}>{t.howItWorks.step5VaultNote}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 06 */}
          <div className="step-block" id="step6" data-testid="step-block-6">
            <div className="step-num-col"><div className="step-n">06</div></div>
            <div className="step-content">
              <div className="step-head">
                <div className="step-icon" style={{ background: "rgba(232,25,44,.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#E8192C" strokeWidth="1.5"><path d="M9 1.5L16 5.5v5c0 4.5-3.5 7-7 7.5C5.5 17.5 2 15 2 10.5v-5L9 1.5z" /></svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span className="step-title">{t.howItWorks.step6Title}</span>
                    <span className="pro-badge">{t.howItWorks.proLabel}</span>
                  </div>
                </div>
              </div>
              <p className="step-body">{t.howItWorks.step6Body}</p>
              <div className="blist">
                {t.howItWorks.step6Bullets.map((b, i) => (
                  <div className="bitem" key={i}><CheckSvg /> <span>{b}</span></div>
                ))}
              </div>

              <div className="tl" style={{ marginTop: "18px" }}>
                <div className="tl-item">
                  <div className="tl-left">
                    <div className="tl-dot" style={{ borderColor: "var(--red)", background: "rgba(232,25,44,.12)" }} />
                    <div className="tl-conn" style={{ background: "var(--b)" }} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-label">{t.howItWorks.tlLabel1}</div>
                    <div className="tl-sub">{t.howItWorks.tlSub1}</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-left">
                    <div className="tl-dot" style={{ borderColor: "var(--gold)", background: "rgba(217,119,6,.12)" }} />
                    <div className="tl-conn" style={{ background: "var(--b)" }} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-label">{t.howItWorks.tlLabel2}</div>
                    <div className="tl-sub">{t.howItWorks.tlSub2}</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-left">
                    <div className="tl-dot" style={{ borderColor: "var(--blue)", background: "rgba(37,99,235,.12)" }} />
                    <div className="tl-conn" style={{ background: "var(--b)" }} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-label">{t.howItWorks.tlLabel3}</div>
                    <div className="tl-sub">{t.howItWorks.tlSub3}</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-left">
                    <div className="tl-dot" style={{ borderColor: "var(--grn)", background: "rgba(22,163,74,.12)" }} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-label">{t.howItWorks.tlLabel4}</div>
                    <div className="tl-sub">{t.howItWorks.tlSub4}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FAQ */}
      <div className="section grey">
        <div className="wrap-sm">
          <div className="ey">{t.howItWorks.faqTitle}</div>
          <h2 className="sh2">{t.howItWorks.faqTitle}</h2>
          <div className="faq-list" data-testid="faq-list">
            {t.howItWorks.faqItems.map((item, idx) => {
              const isOpen = !!openFaq[idx];
              return (
                <div className="faq-item" key={idx}>
                  <div
                    className="faq-q"
                    onClick={() => toggleFaq(idx)}
                    data-testid={`faq-toggle-${idx}`}
                  >
                    <span className="faq-qtxt">{item.q}</span>
                    <FaqArrowSvg open={isOpen} />
                  </div>
                  <div className={`faq-a${isOpen ? " open" : ""}`} data-testid={`faq-answer-${idx}`}>
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <div className="cta-band">
        <h2 className="cta-h">{t.howItWorks.finalHeading}</h2>
        <p className="cta-sub">{t.howItWorks.finalSub}</p>
        <div className="cta-btns">
          <Link to="/register">
            <button className="cta-btn-w" data-testid="button-cta-register">{t.howItWorks.finalCta}</button>
          </Link>
          <a href="/#pricing">
            <button className="cta-btn-o" data-testid="button-cta-pricing">{t.howItWorks.seePricing}</button>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-nav">
          <a className="footer-link" href="#" data-testid="footer-link-how">{t.howItWorks.navHowItWorks}</a>
          <a href="/#features" className="footer-link" data-testid="footer-link-features">{t.howItWorks.navFeatures}</a>
          <a href="/#pricing" className="footer-link" data-testid="footer-link-pricing">{t.howItWorks.navPricing}</a>
          <Link to="/login" className="footer-link" data-testid="footer-link-signin">{t.howItWorks.navSignIn}</Link>
        </div>
        <p className="footer-txt">{t.howItWorks.footerDisclaimer} <Link to="/disclaimers">{t.howItWorks.fullDisclaimer}</Link></p>
      </div>
    </div>
  );
}
