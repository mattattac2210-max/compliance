import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/i18n/context";
import { Globe } from "lucide-react";
import type { Language } from "@/i18n/types";
import "./landing.css";

const CheckSvg = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 4.5,8.5 10,3" /></svg>
);

const LockSvg = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="6" height="5.5" rx="1" /><path d="M4.5 5V3.5a1.5 1.5 0 0 1 3 0V5" /></svg>
);

const ArrowSvg = ({ open }: { open: boolean }) => (
  <svg className={`ct-arr${open ? " open" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="3,5 7,9 11,5" /></svg>
);

const DocIconSvg2 = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.2"><path d="M3 1.5h4l3 3V11a.5.5 0 0 1-.5.5H3A.5.5 0 0 1 2.5 11V2A.5.5 0 0 1 3 1.5z" /></svg>
);

const CheckGreenSvg = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 4.5,8.5 10,3" /></svg>
);

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

export default function LandingPage() {
  const { t } = useLanguage();
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("cal");

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="lp">
      {/* NAV */}
      <nav className="lnav">
        <Link to="/" className="logo" data-testid="link-logo">
          <div className="lm">D</div>
          <div><div className="lt">DSCVR</div><div className="ls">Compliance Navigator</div></div>
        </Link>
        <div className="nav-links">
          <Link to="/how-it-works" className="nav-link" data-testid="link-how-it-works">{t.landing.navHowItWorks}</Link>
          <a className="nav-link" href="#features" data-testid="link-features">{t.landing.navFeatures}</a>
          <a className="nav-link" href="#pricing" data-testid="link-pricing">{t.landing.navPricing}</a>
        </div>
        <div className="nav-r">
          <LandingLangSelector />
          <Link to="/login"><button className="btn-out" data-testid="button-signin">{t.landing.navSignIn}</button></Link>
          <Link to="/register"><button className="btn-red" data-testid="button-get-pro-nav">{t.landing.ctaPrimary}</button></Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="h-tag">{t.landing.heroKicker}</div>
            <h1 className="h1">{t.landing.heroHeadline1}<br /><em>{t.landing.heroHeadline2}</em><br />{t.landing.heroHeadline3}</h1>
            <p className="h-sub">{t.landing.heroSub}</p>
            <div className="h-btns">
              <Link to="/register"><button className="btn-hp" data-testid="button-get-pro-hero">{t.landing.ctaPrimary}</button></Link>
              <Link to="/how-it-works"><button className="btn-hs" data-testid="button-how-it-works-hero">{t.landing.ctaSecondary}</button></Link>
            </div>
            <p className="h-fine">{t.landing.trustLine}</p>
          </div>
          <div className="cc">
            <div className="cc-lbl">{t.landing.heroManagingLabel}</div>
            {t.landing.heroManagingRows.map((row: string, i: number) => (
              <div key={i} className={`cc-row`}><span className="cc-n">{row}</span><span className={`cc-v ${i < 2 ? "g" : i < 5 ? "r" : "grn"}`}>{t.landing.heroManagingValues[i]}</span></div>
            ))}
            <div className="cc-note">{t.landing.heroManagingNote}</div>
          </div>
        </div>

      </div>

      {/* OTA REGULATION BANNER */}
      <div className="ota-banner" data-testid="banner-ota-regulation">
        <div className="ota-banner-inner">
          <div className="ota-banner-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#E8192C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2L2 20h18L11 2z" />
              <line x1="11" y1="9" x2="11" y2="13" />
              <circle cx="11" cy="16" r="0.5" fill="#E8192C" />
            </svg>
          </div>
          <div className="ota-banner-content">
            <div className="ota-banner-headline">{t.landing.urgencyHeading}</div>
            <div className="ota-banner-body">{t.landing.urgencyBody}</div>
          </div>
          <Link to="/register">
            <button className="ota-banner-cta" data-testid="button-ota-banner-cta">Check your status</button>
          </Link>
        </div>
      </div>

      {/* PROBLEM */}
      <div className="section white" id="problem">
        <div className="wrap">
          <div className="ey">{t.landing.problemEyebrow}</div>
          <h2 className="sh2">{t.landing.problemHeading.split('\n').map((line: string, i: number, arr: string[]) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</h2>
          <p className="sp">{t.landing.problemSub}</p>
          <div className="stat-row">
            <div className="sb r">
              <div className="sbn r">{t.landing.stat1Value}</div>
              <div className="sbl">{t.landing.stat1Label}</div>
              <div className="sbd">{t.landing.stat1Desc}</div>
            </div>
            <div className="sb g">
              <div className="sbn g">{t.landing.stat2Value}</div>
              <div className="sbl">{t.landing.stat2Label}</div>
              <div className="sbd">{t.landing.stat2Desc}</div>
            </div>
            <div className="sb bl">
              <div className="sbn bl">{t.landing.stat3Value}</div>
              <div className="sbl">{t.landing.stat3Label}</div>
              <div className="sbd">{t.landing.stat3Desc}</div>
            </div>
          </div>

          {/* Obligation breakdown */}
          <div className="cg">
            {/* Tax */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(0)} data-testid="collapse-trigger-tax">
                <div className="ct-ic" style={{ background: "rgba(217,119,6,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#D97706" strokeWidth="1.5"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" /><line x1="1.5" y1="5.5" x2="12.5" y2="5.5" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">{t.landing.obTaxName}</div><div className="ct-hint">{t.landing.obTaxHint}</div></div>
                <ArrowSvg open={!!openSections[0]} />
              </div>
              <div className={`cb${openSections[0] ? " open" : ""}`}>
                <p className="cb-p">{t.landing.obTaxBody}</p>
                <div className="cb-tags">{t.landing.obTaxTags.map((tag: string, i: number) => <span key={i} className="tag tax">{tag}</span>)}</div>
              </div>
            </div>

            {/* Staff & BPJS */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(1)} data-testid="collapse-trigger-bpjs">
                <div className="ct-ic" style={{ background: "rgba(22,163,74,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#16A34A" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5" /><polyline points="4.5,7 6.5,9 9.5,5" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">{t.landing.obBpjsName}</div><div className="ct-hint">{t.landing.obBpjsHint}</div></div>
                <ArrowSvg open={!!openSections[1]} />
              </div>
              <div className={`cb${openSections[1] ? " open" : ""}`}>
                <p className="cb-p">{t.landing.obBpjsBody}</p>
                <div className="cb-tags">{t.landing.obBpjsTags.map((tag: string, i: number) => <span key={i} className="tag bpjs">{tag}</span>)}</div>
              </div>
            </div>

            {/* Banjar */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(2)} data-testid="collapse-trigger-banjar">
                <div className="ct-ic" style={{ background: "rgba(219,39,119,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#DB2777" strokeWidth="1.5"><path d="M7 1.5l5.5 3v5c0 3-2.5 5-5.5 5.5C4 14.5 1.5 12.5 1.5 9.5v-5L7 1.5z" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">{t.landing.obBanjarName}</div><div className="ct-hint">{t.landing.obBanjarHint}</div></div>
                <ArrowSvg open={!!openSections[2]} />
              </div>
              <div className={`cb${openSections[2] ? " open" : ""}`}>
                <p className="cb-p">{t.landing.obBanjarBody}</p>
                <div className="cb-tags">{t.landing.obBanjarTags.map((tag: string, i: number) => <span key={i} className="tag ban">{tag}</span>)}</div>
              </div>
            </div>

            {/* Safety */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(3)} data-testid="collapse-trigger-safety">
                <div className="ct-ic" style={{ background: "rgba(232,25,44,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#E8192C" strokeWidth="1.5"><path d="M7 1.5L13.5 12H.5L7 1.5z" /><line x1="7" y1="5.5" x2="7" y2="8.5" strokeLinecap="round" /><circle cx="7" cy="10.5" r=".65" fill="#E8192C" stroke="none" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">{t.landing.obSafetyName}</div><div className="ct-hint">{t.landing.obSafetyHint}</div></div>
                <ArrowSvg open={!!openSections[3]} />
              </div>
              <div className={`cb${openSections[3] ? " open" : ""}`}>
                <p className="cb-p">{t.landing.obSafetyBody}</p>
                <div className="cb-tags">{t.landing.obSafetyTags.map((tag: string, i: number) => <span key={i} className="tag saf">{tag}</span>)}</div>
              </div>
            </div>

            {/* OTA */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(4)} data-testid="collapse-trigger-ota">
                <div className="ct-ic" style={{ background: "rgba(37,99,235,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2563EB" strokeWidth="1.5"><circle cx="7" cy="4.5" r="2.5" /><path d="M1.5 12.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">{t.landing.obOtaName}</div><div className="ct-hint">{t.landing.obOtaHint}</div></div>
                <ArrowSvg open={!!openSections[4]} />
              </div>
              <div className={`cb${openSections[4] ? " open" : ""}`}>
                <p className="cb-p">{t.landing.obOtaBody}</p>
                <div className="cb-tags">{t.landing.obOtaTags.map((tag: string, i: number) => <span key={i} className="tag doc">{tag}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS CTA BAND */}
      <div className="hiw-band">
        <div className="hiw-inner">
          <div className="hiw-txt">
            <h3>{t.landing.hiwBandHeading}</h3>
            <p>{t.landing.hiwBandBody}</p>
            <div style={{ marginTop: "16px" }}>
              <Link to="/how-it-works"><button className="btn-hp" style={{ fontSize: "12px", padding: "10px 20px" }} data-testid="button-how-it-works-band">{t.landing.hiwBandCta}</button></Link>
            </div>
          </div>
          <div className="hiw-steps">
            <div className="hiw-step"><div className="hiw-step-n">01</div><div className="hiw-step-l">{t.landing.hiwStep1}</div></div>
            <div className="hiw-step"><div className="hiw-step-n">02</div><div className="hiw-step-l">{t.landing.hiwStep2}</div></div>
            <div className="hiw-step"><div className="hiw-step-n">03</div><div className="hiw-step-l">{t.landing.hiwStep3}</div></div>
            <div className="hiw-step"><div className="hiw-step-n">04</div><div className="hiw-step-l">{t.landing.hiwStep4}</div></div>
            <div className="hiw-step"><div className="hiw-step-n">05</div><div className="hiw-step-l">{t.landing.hiwStep5}</div></div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="section dark" id="features">
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", marginBottom: "28px", flexWrap: "wrap" }}>
            <div>
              <div className="ey w">{t.landing.proFeaturesEyebrow}</div>
              <h2 className="sh2 w" style={{ marginBottom: "8px" }}>{t.landing.proFeaturesHeading.split('\n').map((line: string, i: number, arr: string[]) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</h2>
              <p className="sp w">{t.landing.proFeaturesSub}</p>
            </div>
            <Link to="/register"><button className="btn-hp" style={{ whiteSpace: "nowrap", flexShrink: 0 }} data-testid="button-get-pro-features">{t.landing.proFeaturesCta}</button></Link>
          </div>

          <div className="ftabs">
            <button className={`ftab${activeTab === "cal" ? " ac" : ""}`} onClick={() => setActiveTab("cal")} data-testid="tab-calendar">{t.landing.tabCalendar}</button>
            <button className={`ftab${activeTab === "alerts" ? " ac" : ""}`} onClick={() => setActiveTab("alerts")} data-testid="tab-alerts">{t.landing.tabAlerts}</button>
            <button className={`ftab${activeTab === "vault" ? " ac" : ""}`} onClick={() => setActiveTab("vault")} data-testid="tab-vault">{t.landing.tabVault}</button>
            <button className={`ftab${activeTab === "gates" ? " ac" : ""}`} onClick={() => setActiveTab("gates")} data-testid="tab-gates">{t.landing.tabGates}</button>
          </div>

          {/* Calendar panel */}
          <div className={`fp two${activeTab === "cal" ? " ac" : ""}`} id="fp-cal">
            <div className="fp-txt">
              <div className="fp-h">{t.landing.calTitle.split('\n').map((line: string, i: number, arr: string[]) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</div>
              <p className="fp-p">{t.landing.calBody}</p>
              <div className="fp-buls">
                <div className="fp-bul"><CheckSvg /> {t.landing.calBul1}</div>
                <div className="fp-bul"><CheckSvg /> {t.landing.calBul2}</div>
                <div className="fp-bul"><CheckSvg /> {t.landing.calBul3}</div>
              </div>
              <div className="fp-note">{t.landing.calNote}</div>
            </div>
            <div className="fp-screen">
              <div className="fp-sbar"><div className="fp-sdot" style={{ background: "#FF5F57" }} /><div className="fp-sdot" style={{ background: "#FFBD2E" }} /><div className="fp-sdot" style={{ background: "#28CA41" }} /><div className="fp-stitle">COMPLIANCE CALENDAR — FEBRUARY 2026</div></div>
              <div className="fp-sbody">
                <div className="cal-filters-f"><span className="cf ac">All</span><span className="cf in">Tax</span><span className="cf in">BPJS</span><span className="cf in">Banjar</span><span className="cf in">Safety</span></div>
                <div className="cal-grid-f">
                  <div className="cdh">MON</div><div className="cdh">TUE</div><div className="cdh">WED</div><div className="cdh">THU</div><div className="cdh">FRI</div><div className="cdh">SAT</div><div className="cdh">SUN</div>
                  <div className="cc2 om"><div className="cn2">27</div></div><div className="cc2 om"><div className="cn2">28</div></div><div className="cc2 om"><div className="cn2">29</div></div><div className="cc2 om"><div className="cn2">30</div></div><div className="cc2 om"><div className="cn2">31</div></div>
                  <div className="cc2"><div className="cn2">1</div><div className="ce2" style={{ background: "rgba(219,39,119,.16)", borderLeftColor: "#DB2777", color: "#F9A8D4" }}>Iuran Banjar</div></div>
                  <div className="cc2"><div className="cn2">2</div></div>
                  <div className="cc2"><div className="cn2">3</div></div><div className="cc2"><div className="cn2">4</div></div><div className="cc2"><div className="cn2">5</div></div><div className="cc2"><div className="cn2">6</div></div><div className="cc2"><div className="cn2">7</div></div><div className="cc2"><div className="cn2">8</div></div><div className="cc2"><div className="cn2">9</div></div>
                  <div className="cc2"><div className="cn2">10</div><div className="ce2" style={{ background: "rgba(22,163,74,.14)", borderLeftColor: "#16A34A", color: "#86EFAC" }}>BPJS Kes.</div><div className="ce2" style={{ background: "rgba(22,163,74,.14)", borderLeftColor: "#16A34A", color: "#86EFAC" }}>BPJS Jam.</div></div>
                  <div className="cc2"><div className="cn2">11</div></div><div className="cc2"><div className="cn2">12</div></div><div className="cc2"><div className="cn2">13</div></div><div className="cc2"><div className="cn2">14</div></div>
                  <div className="cc2"><div className="cn2">15</div><div className="ce2" style={{ background: "rgba(217,119,6,.18)", borderLeftColor: "#D97706", color: "#FCD34D" }}>PPh 25</div></div>
                  <div className="cc2"><div className="cn2">16</div></div><div className="cc2"><div className="cn2">17</div></div><div className="cc2"><div className="cn2">18</div></div><div className="cc2"><div className="cn2">19</div></div>
                  <div className="cc2 td"><div className="cn2">20</div><div className="ce2" style={{ background: "rgba(217,119,6,.24)", borderLeftColor: "#D97706", color: "#FCD34D" }}>PB1 Tax</div><div className="ce2" style={{ background: "rgba(217,119,6,.24)", borderLeftColor: "#D97706", color: "#FCD34D" }}>PPh 21</div></div>
                  <div className="cc2"><div className="cn2">21</div></div><div className="cc2"><div className="cn2">22</div></div><div className="cc2"><div className="cn2">23</div></div><div className="cc2"><div className="cn2">24</div></div><div className="cc2"><div className="cn2">25</div></div><div className="cc2"><div className="cn2">26</div></div><div className="cc2"><div className="cn2">27</div></div><div className="cc2"><div className="cn2">28</div></div>
                  <div className="cc2 om"><div className="cn2">1</div></div><div className="cc2 om"><div className="cn2">2</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts panel */}
          <div className={`fp two${activeTab === "alerts" ? " ac" : ""}`} id="fp-alerts">
            <div className="fp-txt">
              <div className="fp-h">{t.landing.alertsTitle.split('\n').map((line: string, i: number, arr: string[]) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</div>
              <p className="fp-p">{t.landing.alertsBody}</p>
              <div className="fp-buls">
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>{t.landing.alertsBul1}</strong>{t.landing.alertsBul1b}</div>
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>{t.landing.alertsBul2}</strong>{t.landing.alertsBul2b}</div>
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>{t.landing.alertsBul3}</strong>{t.landing.alertsBul3b}</div>
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>{t.landing.alertsBul4}</strong>{t.landing.alertsBul4b}</div>
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>{t.landing.alertsBul5}</strong>{t.landing.alertsBul5b}</div>
              </div>
              <div className="fp-note">{t.landing.alertsNote}</div>
            </div>
            <div className="fp-screen">
              <div className="fp-sbar"><div className="fp-sdot" style={{ background: "#FF5F57" }} /><div className="fp-sdot" style={{ background: "#FFBD2E" }} /><div className="fp-sdot" style={{ background: "#28CA41" }} /><div className="fp-stitle">ALERTS + NOTIFICATION ROUTING</div></div>
              <div className="fp-sbody" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: "rgba(232,25,44,.08)", border: "1px solid rgba(232,25,44,.2)", borderRadius: "7px", padding: "10px 11px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F87171", flexShrink: 0, marginTop: "4px" }} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: "10px", fontWeight: 700, color: "var(--dk-body)", marginBottom: "2px" }}>APAR Monthly Check — 18 days overdue</div><div style={{ fontSize: "9px", color: "var(--dk-sub)", lineHeight: 1.4 }}>Fire extinguisher inspection — log in SOP Evidence Book</div></div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "8px", color: "var(--dk-muted)", flexShrink: 0 }}>Feb 1</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "7px", borderTop: "1px solid var(--dk-b2)" }}>
                    <div style={{ fontSize: "8px", color: "var(--dk-muted)", flexShrink: 0 }}>Routed to</div>
                    <div style={{ display: "flex", gap: "4px", flex: 1, flexWrap: "wrap" }}>
                      <span style={{ background: "rgba(22,163,74,.15)", border: "1px solid rgba(22,163,74,.25)", color: "#86EFAC", fontSize: "8px", fontWeight: 700, padding: "2px 7px", borderRadius: "5px" }}>Wayan (Caretaker)</span>
                      <span style={{ background: "rgba(37,99,235,.12)", border: "1px solid rgba(37,99,235,.22)", color: "#93C5FD", fontSize: "8px", fontWeight: 700, padding: "2px 7px", borderRadius: "5px" }}>Owner</span>
                    </div>
                    <div style={{ fontSize: "8px", color: "#F87171", fontWeight: 700, flexShrink: 0 }}>Pending</div>
                  </div>
                </div>
                <div style={{ background: "rgba(22,163,74,.06)", border: "1px solid rgba(22,163,74,.18)", borderRadius: "7px", padding: "10px 11px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", flexShrink: 0, marginTop: "4px" }} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: "10px", fontWeight: 700, color: "var(--dk-body)", marginBottom: "2px" }}>BPJS Kesehatan — marked done</div><div style={{ fontSize: "9px", color: "var(--dk-sub)" }}>Receipt uploaded by Kadek · Feb 18, 09:42am</div></div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "8px", color: "#4ADE80", flexShrink: 0 }}>Done</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,.04)", borderRadius: "5px", padding: "6px 8px", display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "20px", height: "20px", background: "rgba(22,163,74,.15)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "10px" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.2"><path d="M3 1.5h4l3 3V11a.5.5 0 0 1-.5.5H3A.5.5 0 0 1 2.5 11V2A.5.5 0 0 1 3 1.5z" /></svg>
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--dk-sub)" }}>BPJS_Feb2026_receipt.jpg — saved to vault automatically</div>
                  </div>
                </div>
                <div style={{ background: "rgba(217,119,6,.06)", border: "1px solid rgba(217,119,6,.18)", borderRadius: "7px", padding: "10px 11px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FBBF24", flexShrink: 0, marginTop: "4px" }} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: "10px", fontWeight: 700, color: "var(--dk-body)", marginBottom: "2px" }}>PB1 Hotel Tax — due in 2 days</div><div style={{ fontSize: "9px", color: "var(--dk-sub)" }}>Prior month room revenue — file via e-Palapa</div></div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: "8px", color: "#FBBF24", flexShrink: 0 }}>Feb 20</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "7px", borderTop: "1px solid var(--dk-b2)" }}>
                    <div style={{ fontSize: "8px", color: "var(--dk-muted)", flexShrink: 0 }}>Channels</div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <span style={{ background: "rgba(255,255,255,.07)", border: "1px solid var(--dk-b)", color: "var(--dk-sub)", fontSize: "8px", fontWeight: 700, padding: "2px 7px", borderRadius: "5px" }}>App</span>
                      <span style={{ background: "rgba(255,255,255,.07)", border: "1px solid var(--dk-b)", color: "var(--dk-sub)", fontSize: "8px", fontWeight: 700, padding: "2px 7px", borderRadius: "5px" }}>Email</span>
                      <span style={{ background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.22)", color: "#4ADE80", fontSize: "8px", fontWeight: 700, padding: "2px 7px", borderRadius: "5px" }}>WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vault panel */}
          <div className={`fp two${activeTab === "vault" ? " ac" : ""}`} id="fp-vault">
            <div className="fp-txt">
              <div className="fp-h">{t.landing.vaultTitle.split('\n').map((line: string, i: number, arr: string[]) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</div>
              <p className="fp-p">{t.landing.vaultBody}</p>
              <div className="fp-buls">
                <div className="fp-bul"><CheckSvg /> {t.landing.vaultBul1}</div>
                <div className="fp-bul"><CheckSvg /> {t.landing.vaultBul2}</div>
                <div className="fp-bul"><CheckSvg /> {t.landing.vaultBul3}</div>
                <div className="fp-bul"><CheckSvg /> {t.landing.vaultBul4}</div>
              </div>
              <div className="fp-note">{t.landing.vaultNote}</div>
            </div>
            <div className="fp-screen">
              <div className="fp-sbar"><div className="fp-sdot" style={{ background: "#FF5F57" }} /><div className="fp-sdot" style={{ background: "#FFBD2E" }} /><div className="fp-sdot" style={{ background: "#28CA41" }} /><div className="fp-stitle">DOCUMENT VAULT — 9 FILES</div></div>
              <div className="fp-sbody">
                <div className="mv-item"><div className="mv-ic"><DocIconSvg2 /></div><div className="mv-name">DAMKAR_cert_2025.pdf</div><span className="mv-tag" style={{ background: "rgba(232,25,44,.18)", color: "#FCA5A5" }}>Safety · G6</span><div className="mv-date">Jan 8</div></div>
                <div className="mv-item"><div className="mv-ic"><DocIconSvg2 /></div><div className="mv-name">NIB_OSS_verified.pdf</div><span className="mv-tag" style={{ background: "rgba(22,163,74,.18)", color: "#86EFAC" }}>Docs · G2</span><div className="mv-date">Dec 14</div></div>
                <div className="mv-item"><div className="mv-ic"><DocIconSvg2 /></div><div className="mv-name">PB1_Jan2026_receipt.pdf</div><span className="mv-tag" style={{ background: "rgba(217,119,6,.18)", color: "#FCD34D" }}>Tax · G4</span><div className="mv-date">Feb 3</div></div>
                <div className="mv-item"><div className="mv-ic"><DocIconSvg2 /></div><div className="mv-name">SLF_certificate.pdf</div><span className="mv-tag" style={{ background: "rgba(124,58,237,.18)", color: "#C4B5FD" }}>Docs · G3</span><div className="mv-date">Nov 22</div></div>
                <div className="mv-item"><div className="mv-ic"><DocIconSvg2 /></div><div className="mv-name">BPJS_Kes_Jan2026.pdf</div><span className="mv-tag" style={{ background: "rgba(22,163,74,.18)", color: "#86EFAC" }}>BPJS · G5</span><div className="mv-date">Feb 10</div></div>
              </div>
            </div>
          </div>

          {/* Gates panel */}
          <div className={`fp two${activeTab === "gates" ? " ac" : ""}`} id="fp-gates">
            <div className="fp-txt">
              <div className="fp-h">{t.landing.gatesTitle.split('\n').map((line: string, i: number, arr: string[]) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</div>
              <p className="fp-p">{t.landing.gatesBody}</p>
              <div className="fp-buls">
                <div className="fp-bul"><CheckSvg /> {t.landing.gatesBul1}</div>
                <div className="fp-bul"><CheckSvg /> {t.landing.gatesBul2}</div>
                <div className="fp-bul"><CheckSvg /> {t.landing.gatesBul3}</div>
              </div>
              <div className="fp-note">{t.landing.gatesNote}</div>
            </div>
            <div className="fp-screen">
              <div className="fp-sbar"><div className="fp-sdot" style={{ background: "#FF5F57" }} /><div className="fp-sdot" style={{ background: "#FFBD2E" }} /><div className="fp-sdot" style={{ background: "#28CA41" }} /><div className="fp-stitle">COMPLIANCE GATES — VILLA KERTI</div></div>
              <div className="fp-sbody">
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ background: "rgba(22,163,74,.07)", border: "1px solid rgba(22,163,74,.14)", borderRadius: "6px", padding: "7px 9px", display: "flex", alignItems: "center", gap: "8px" }}><div className="mg-badge dn">G0</div><div className="mg-name">Foundation — NPWP, entity</div><div className="mg-pct dn">100%</div></div>
                  <div style={{ background: "rgba(22,163,74,.07)", border: "1px solid rgba(22,163,74,.14)", borderRadius: "6px", padding: "7px 9px", display: "flex", alignItems: "center", gap: "8px" }}><div className="mg-badge dn">G1</div><div className="mg-name">Zoning — RTRW, IMB/PBG</div><div className="mg-pct dn">100%</div></div>
                  <div style={{ background: "rgba(217,119,6,.08)", border: "1px solid rgba(217,119,6,.2)", borderRadius: "6px", padding: "7px 9px", display: "flex", alignItems: "center", gap: "8px" }}><div className="mg-badge wn">G2</div><div className="mg-name">NIB &amp; OSS — Verified pending</div><div className="mg-pct wn">60%</div></div>
                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid var(--dk-b2)", borderRadius: "6px", padding: "7px 9px", display: "flex", alignItems: "center", gap: "8px" }}><div className="mg-badge lk">G3</div><div className="mg-name">Building — SLF, PBG</div><div className="mg-pct lk">—</div></div>
                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid var(--dk-b2)", borderRadius: "6px", padding: "7px 9px", display: "flex", alignItems: "center", gap: "8px" }}><div className="mg-badge lk">G4</div><div className="mg-name">Tax — CoreTax, PB1, SPT</div><div className="mg-pct lk">—</div></div>
                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid var(--dk-b2)", borderRadius: "6px", padding: "7px 9px", display: "flex", alignItems: "center", gap: "8px" }}><div className="mg-badge lk">G5</div><div className="mg-name">Staff — BPJS, THR, payroll</div><div className="mg-pct lk">—</div></div>
                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid var(--dk-b2)", borderRadius: "6px", padding: "7px 9px", display: "flex", alignItems: "center", gap: "8px" }}><div className="mg-badge lk">G6</div><div className="mg-name">Safety — DAMKAR, APAR</div><div className="mg-pct lk">—</div></div>
                  <div style={{ background: "rgba(37,99,235,.08)", border: "1px solid rgba(37,99,235,.2)", borderRadius: "6px", padding: "7px 9px", display: "flex", alignItems: "center", gap: "8px" }}><div className="mg-badge" style={{ background: "rgba(37,99,235,.18)", borderColor: "rgba(37,99,235,.4)", color: "#93C5FD" }}>G7</div><div className="mg-name" style={{ color: "#93C5FD" }}>OTA Verified — Target</div><div className="mg-pct" style={{ color: "#93C5FD" }}>Goal</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="section white" id="pricing">
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div className="ey" style={{ justifyContent: "center" }}><span style={{ display: "inline-block", width: "16px", height: "2px", background: "var(--red)", borderRadius: "1px" }} /> {t.landing.pricingEyebrow}</div>
            <h2 className="sh2">{t.landing.pricingHeading.split('\n').map((line: string, i: number, arr: string[]) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</h2>
            <p className="sp" style={{ margin: "0 auto", textAlign: "center" }}>{t.landing.pricingSub}</p>
          </div>
          <div className="tier-row">
            {/* Free */}
            <div className="tier">
              <div className="t-head">
                <div className="t-badge free">{t.landing.freeForever}</div>
                <div className="t-name">{t.landing.freeName}</div>
                <div className="t-price">{t.landing.freePrice}</div>
                <div className="t-hook">{t.landing.freeHook}</div>
              </div>
              <div className="t-body">
                {t.landing.freeItems.map((item: string, i: number) => (
                  <div key={i} className={`t-item ${i < 3 ? "inc" : "lk"}`}>{i < 3 ? <CheckSvg /> : <LockSvg />} {item}</div>
                ))}
              </div>
              <div className="t-cta">
                <Link to="/register"><button className="t-btn fb" data-testid="button-create-free">{t.landing.freeCta}</button></Link>
              </div>
            </div>

            {/* Pro */}
            <div className="tier hot">
              <div className="t-head">
                <div className="t-badge popular">{t.landing.proPopular}</div>
                <div className="t-name">{t.landing.proName}</div>
                <div className="t-price">{t.landing.proPrice}</div>
                <div className="t-hook">{t.landing.proHook}</div>
              </div>
              <div className="t-body">
                {t.landing.proItems.map((item: string, i: number) => (
                  <div key={i} className="t-item inc"><CheckGreenSvg /> {item}</div>
                ))}
              </div>
              <div className="t-cta">
                <Link to="/register"><button className="t-btn tb" data-testid="button-get-pro-pricing">{t.landing.proCta}</button></Link>
                <div className="t-note">{t.landing.proNote}</div>
              </div>
            </div>

            {/* Pro+ */}
            <div className="tier">
              <div className="t-head">
                <div className="t-badge multi">{t.landing.proPlusMulti}</div>
                <div className="t-name">{t.landing.proPlusName}</div>
                <div className="t-price">{t.landing.proPlusPrice}</div>
                <div className="t-hook">{t.landing.proPlusHook}</div>
              </div>
              <div className="t-body">
                {t.landing.proPlusItems.map((item: string, i: number) => (
                  <div key={i} className="t-item inc"><CheckSvg /> {item}</div>
                ))}
              </div>
              <div className="t-cta">
                <Link to="/register"><button className="t-btn pb" data-testid="button-get-pro-plus">{t.landing.proPlusCta}</button></Link>
                <div className="t-note">{t.landing.proPlusNote}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEGAL */}
      <div className="section grey">
        <div className="wrap-sm">
          <div className="ey">{t.landing.legalEyebrow}</div>
          <h2 className="sh2">{t.landing.legalHeading.split('\n').map((line: string, i: number, arr: string[]) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</h2>
          <p className="sp">{t.landing.legalSub}</p>
          <div className="legal-box">
            <div className="legal-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M7 1.5L13.5 12.5H.5L7 1.5z" /><line x1="7" y1="6" x2="7" y2="9.5" strokeLinecap="round" /><circle cx="7" cy="11.5" r=".65" fill="currentColor" stroke="none" /></svg>
              {t.landing.legalBoxTitle}
            </div>
            <p className="legal-body">{t.landing.legalBoxBody}</p>
            <div className="do-grid">
              <div className="do-item yes">
                <svg className="y" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 4.5,8.5 10,3" /></svg>
                <span>{t.landing.legalWeDo1}</span>
              </div>
              <div className="do-item yes">
                <svg className="y" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 4.5,8.5 10,3" /></svg>
                <span>{t.landing.legalWeDo2}</span>
              </div>
              <div className="do-item">
                <svg className="n" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2.5" y1="6" x2="9.5" y2="6" /></svg>
                <span>{t.landing.legalWeDont1}</span>
              </div>
              <div className="do-item">
                <svg className="n" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2.5" y1="6" x2="9.5" y2="6" /></svg>
                <span>{t.landing.legalWeDont2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-nav">
          <Link to="/how-it-works" className="footer-link" data-testid="link-footer-how-it-works">{t.landing.navHowItWorks}</Link>
          <a className="footer-link" href="#features" data-testid="link-footer-features">{t.landing.navFeatures}</a>
          <a className="footer-link" href="#pricing" data-testid="link-footer-pricing">{t.landing.navPricing}</a>
          <Link to="/login" className="footer-link" data-testid="link-footer-signin">{t.landing.navSignIn}</Link>
        </div>
        <p className="footer-txt">{t.landing.footerDisclaimer} <Link to="/disclaimers">Full disclaimer →</Link></p>
      </div>
    </div>
  );
}
