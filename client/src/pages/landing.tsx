import { useState } from "react";
import { Link } from "wouter";
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

export default function LandingPage() {
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
          <Link to="/how-it-works" className="nav-link" data-testid="link-how-it-works">How it works</Link>
          <a className="nav-link" href="#features" data-testid="link-features">Features</a>
          <a className="nav-link" href="#pricing" data-testid="link-pricing">Pricing</a>
        </div>
        <div className="nav-r">
          <Link to="/login"><button className="btn-out" data-testid="button-signin">Sign in</button></Link>
          <Link to="/register"><button className="btn-red" data-testid="button-get-pro-nav">Sign up for free</button></Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="h-tag">For Bali Villa Operators</div>
            <h1 className="h1">Indonesian compliance is<br /><em>genuinely complex.</em><br />We made it manageable.</h1>
            <p className="h-sub">Tax filings across 8+ portals, monthly community obligations, annual safety certificates, OTA platform requirements — all while Indonesia transitions to new digital systems. DSCVR tracks all of it and tells you what to do next.</p>
            <div className="h-btns">
              <Link to="/register"><button className="btn-hp" data-testid="button-get-pro-hero">Sign up for free</button></Link>
              <Link to="/how-it-works"><button className="btn-hs" data-testid="button-how-it-works-hero">See how it works →</button></Link>
            </div>
            <p className="h-fine">Free account always available — gate overview and regulations, forever free. Pro unlocks the full platform: calendar, alerts, vault, tracking. Month-to-month, no lock-in, cancel anytime.</p>
          </div>
          <div className="cc">
            <div className="cc-lbl">What you're managing</div>
            <div className="cc-row"><span className="cc-n">Monthly recurring obligations</span><span className="cc-v g">7</span></div>
            <div className="cc-row"><span className="cc-n">Annual filings &amp; renewals</span><span className="cc-v g">12</span></div>
            <div className="cc-row"><span className="cc-n">Separate government portals</span><span className="cc-v r">8+</span></div>
            <div className="cc-row"><span className="cc-n">Compliance events per year</span><span className="cc-v r">120+</span></div>
            <div className="cc-row"><span className="cc-n">OTA verification deadline</span><span className="cc-v r">Mar 2026</span></div>
            <div className="cc-row"><span className="cc-n">DSCVR tracks</span><span className="cc-v grn">All of it</span></div>
            <div className="cc-note">Based on a typical commercial villa in Badung Regency with OSS NIB and OTA listings.</div>
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
            <div className="ota-banner-headline">Regulations change 31 March 2026 — your villa may lose its OTA listings</div>
            <div className="ota-banner-body">Indonesia is enforcing new accommodation verification rules. Properties that don't meet updated NIB, licensing, and safety requirements by the deadline risk being delisted from Booking.com, Airbnb, and other OTA platforms. DSCVR tracks exactly what you need — and what's missing.</div>
          </div>
          <Link to="/register">
            <button className="ota-banner-cta" data-testid="button-ota-banner-cta">Check your status</button>
          </Link>
        </div>
      </div>

      {/* PROBLEM */}
      <div className="section white" id="problem">
        <div className="wrap">
          <div className="ey">The reality</div>
          <h2 className="sh2">120+ obligations. 8 portals.<br />One mid-transition bureaucracy.</h2>
          <p className="sp">Running a villa in Bali isn't legally complicated — it's administratively overwhelming. The obligations are clear. The volume, combined with Indonesia's active digital transition, is where things fall apart.</p>
          <div className="stat-row">
            <div className="sb r">
              <div className="sbn r">120+</div>
              <div className="sbl">Compliance events per year</div>
              <div className="sbd">Monthly tax filings, BPJS, banjar, safety checks, quarterly reports, annual renewals. Miss one and it cascades.</div>
            </div>
            <div className="sb g">
              <div className="sbn g">8+</div>
              <div className="sbl">Separate government portals</div>
              <div className="sbd">CoreTax, OSS, eDabu, SIPP Online, e-Palapa, LKPM module, local e-gov, Satpol PP. None talk to each other.</div>
            </div>
            <div className="sb bl">
              <div className="sbn bl">Now</div>
              <div className="sbl">Mid-transition to digital</div>
              <div className="sbd">CoreTax replaced eFiling in 2025. OSS NIB requirements keep changing. Rules shifting in real time with sparse guidance.</div>
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
                <div className="ct-tx"><div className="ct-name">Tax obligations — 6 recurring items</div><div className="ct-hint">PB1, PPh 21, PPh 25, LKPM, SPT Tahunan, PBB</div></div>
                <ArrowSvg open={!!openSections[0]} />
              </div>
              <div className={`cb${openSections[0] ? " open" : ""}`}>
                <p className="cb-p">Tax obligations run across three separate portals. PB1 hotel tax (10% of prior month revenue) is filed monthly via e-Palapa by the 20th. PPh 21 (payroll withholding) and PPh 25 (corporate instalment) go via CoreTax — the system that replaced eFiling in 2025. LKPM investment reports are filed quarterly via OSS. The annual SPT Tahunan is via CoreTax by 30 April. PBB land tax is paid by 30 September.</p>
                <div className="cb-tags"><span className="tag tax">PB1 — 20th monthly</span><span className="tag tax">PPh 21 — 20th monthly</span><span className="tag tax">PPh 25 — 15th monthly</span><span className="tag tax">LKPM — quarterly</span><span className="tag tax">SPT Tahunan — Apr 30</span><span className="tag tax">PBB — Sep 30</span></div>
              </div>
            </div>

            {/* Staff & BPJS */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(1)} data-testid="collapse-trigger-bpjs">
                <div className="ct-ic" style={{ background: "rgba(22,163,74,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#16A34A" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5" /><polyline points="4.5,7 6.5,9 9.5,5" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">Staff &amp; BPJS — 5 items</div><div className="ct-hint">Health insurance, employment insurance, THR holiday bonuses</div></div>
                <ArrowSvg open={!!openSections[1]} />
              </div>
              <div className={`cb${openSections[1] ? " open" : ""}`}>
                <p className="cb-p">BPJS Kesehatan (4% employer + 1% employee) and BPJamsostek must both be paid by the 10th of each month. THR holiday bonuses — one month's salary — are legally required for all staff, 7 days before the relevant religious holiday. In Bali this means three separate THR events per year: Nyepi, Eid, and Christmas.</p>
                <div className="cb-tags"><span className="tag bpjs">BPJS Kesehatan — 10th monthly</span><span className="tag bpjs">BPJamsostek — 10th monthly</span><span className="tag bpjs">THR Nyepi</span><span className="tag bpjs">THR Eid</span><span className="tag bpjs">THR Christmas</span></div>
              </div>
            </div>

            {/* Banjar */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(2)} data-testid="collapse-trigger-banjar">
                <div className="ct-ic" style={{ background: "rgba(219,39,119,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#DB2777" strokeWidth="1.5"><path d="M7 1.5l5.5 3v5c0 3-2.5 5-5.5 5.5C4 14.5 1.5 12.5 1.5 9.5v-5L7 1.5z" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">Banjar &amp; community — ongoing</div><div className="ct-hint">Monthly iuran, quarterly gotong royong, annual ceremonial contributions</div></div>
                <ArrowSvg open={!!openSections[2]} />
              </div>
              <div className={`cb${openSections[2] ? " open" : ""}`}>
                <p className="cb-p">Banjar obligations are not optional — they define your standing in the community and directly affect how local authorities treat your operation. Monthly iuran (IDR 100K–1M+), quarterly gotong royong, and annual ceremonial contributions are all expected. Amounts vary by area — confirm with your Kelian Banjar. DSCVR tracks the standard schedule and flags upcoming events.</p>
                <div className="cb-tags"><span className="tag ban">Iuran Bulanan</span><span className="tag ban">Gotong Royong</span><span className="tag ban">Galungan &amp; Kuningan</span><span className="tag ban">Odalan / Melaspas</span></div>
              </div>
            </div>

            {/* Safety */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(3)} data-testid="collapse-trigger-safety">
                <div className="ct-ic" style={{ background: "rgba(232,25,44,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#E8192C" strokeWidth="1.5"><path d="M7 1.5L13.5 12H.5L7 1.5z" /><line x1="7" y1="5.5" x2="7" y2="8.5" strokeLinecap="round" /><circle cx="7" cy="10.5" r=".65" fill="#E8192C" stroke="none" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">Safety certificates — 6 items</div><div className="ct-hint">APAR monthly, DAMKAR annual, pool, electrical, water quality</div></div>
                <ArrowSvg open={!!openSections[3]} />
              </div>
              <div className={`cb${openSections[3] ? " open" : ""}`}>
                <p className="cb-p">Safety certificates are the most common cause of OTA verification blocks and Satpol PP issues. DAMKAR fire safety requires a physical inspection — book at least 30 days in advance. Monthly APAR checks must be logged in an SOP Evidence Book. Pool quarterly checks, annual electrical inspection, and water quality testing complete the set.</p>
                <div className="cb-tags"><span className="tag saf">APAR Monthly</span><span className="tag saf">APAR Annual Service</span><span className="tag saf">DAMKAR Certificate</span><span className="tag saf">Pool Safety Q-check</span><span className="tag saf">Electrical Annual</span><span className="tag saf">Water Quality Test</span></div>
              </div>
            </div>

            {/* OTA */}
            <div className="ci">
              <div className="ct2" onClick={() => toggleSection(4)} data-testid="collapse-trigger-ota">
                <div className="ct-ic" style={{ background: "rgba(37,99,235,.1)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2563EB" strokeWidth="1.5"><circle cx="7" cy="4.5" r="2.5" /><path d="M1.5 12.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" /></svg>
                </div>
                <div className="ct-tx"><div className="ct-name">OTA &amp; platform requirements — 4 items</div><div className="ct-hint">Airbnb, Booking.com, Agoda, Vrbo verification deadlines</div></div>
                <ArrowSvg open={!!openSections[4]} />
              </div>
              <div className={`cb${openSections[4] ? " open" : ""}`}>
                <p className="cb-p">Indonesian OTA platforms are required to verify that properties hold valid NIB and relevant operating permits. The March 2026 deadline affects listings on Airbnb, Booking.com, Agoda and others. Unverified properties risk delisting. DSCVR tracks your verification status, flags what's missing, and links each OTA requirement back to the specific gate that provides the required documentation.</p>
                <div className="cb-tags"><span className="tag doc">Airbnb verification</span><span className="tag doc">Booking.com NIB</span><span className="tag doc">Agoda permit check</span><span className="tag doc">Vrbo compliance</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS CTA BAND */}
      <div className="hiw-band">
        <div className="hiw-inner">
          <div className="hiw-txt">
            <h3>Want the full walk-through?</h3>
            <p>See exactly how DSCVR works — from creating your account and mapping your property through to live alerts, vault management and staying ahead of regulatory changes.</p>
            <div style={{ marginTop: "16px" }}>
              <Link to="/how-it-works"><button className="btn-hp" style={{ fontSize: "12px", padding: "10px 20px" }} data-testid="button-how-it-works-band">See the full walk-through →</button></Link>
            </div>
          </div>
          <div className="hiw-steps">
            <div className="hiw-step"><div className="hiw-step-n">01</div><div className="hiw-step-l">Register</div></div>
            <div className="hiw-step"><div className="hiw-step-n">02</div><div className="hiw-step-l">Map property</div></div>
            <div className="hiw-step"><div className="hiw-step-n">03</div><div className="hiw-step-l">See your gates</div></div>
            <div className="hiw-step"><div className="hiw-step-n">04</div><div className="hiw-step-l">Go Pro</div></div>
            <div className="hiw-step"><div className="hiw-step-n">05</div><div className="hiw-step-l">Stay compliant</div></div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="section dark" id="features">
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", marginBottom: "28px", flexWrap: "wrap" }}>
            <div>
              <div className="ey w">Pro features</div>
              <h2 className="sh2 w" style={{ marginBottom: "8px" }}>Everything you need.<br />One subscription.</h2>
              <p className="sp w">Month-to-month. No lock-in. Cancel anytime. Here's exactly what Pro gives you.</p>
            </div>
            <Link to="/register"><button className="btn-hp" style={{ whiteSpace: "nowrap", flexShrink: 0 }} data-testid="button-get-pro-features">Stay Updated — no lock-in</button></Link>
          </div>

          <div className="ftabs">
            <button className={`ftab${activeTab === "cal" ? " ac" : ""}`} onClick={() => setActiveTab("cal")} data-testid="tab-calendar">Compliance Calendar</button>
            <button className={`ftab${activeTab === "alerts" ? " ac" : ""}`} onClick={() => setActiveTab("alerts")} data-testid="tab-alerts">Alerts System</button>
            <button className={`ftab${activeTab === "vault" ? " ac" : ""}`} onClick={() => setActiveTab("vault")} data-testid="tab-vault">Document Vault</button>
            <button className={`ftab${activeTab === "gates" ? " ac" : ""}`} onClick={() => setActiveTab("gates")} data-testid="tab-gates">Gate Tracker</button>
          </div>

          {/* Calendar panel */}
          <div className={`fp two${activeTab === "cal" ? " ac" : ""}`} id="fp-cal">
            <div className="fp-txt">
              <div className="fp-h">120+ obligations.<br />Five views. Zero surprises.</div>
              <p className="fp-p">Every compliance event pre-loaded and explained. Month, week, list, category and timeline views. Filter by type, mark items filed, add your own. DSCVR knows what you owe and when — and updates automatically when regulations change.</p>
              <div className="fp-buls">
                <div className="fp-bul"><CheckSvg /> All 120+ events pre-loaded for your property type and regency</div>
                <div className="fp-bul"><CheckSvg /> Plain-language explanation on every event — portal, amounts, documents needed</div>
                <div className="fp-bul"><CheckSvg /> Deadlines auto-adjust when government portal schedules change</div>
              </div>
              <div className="fp-note">Calendar is a Pro feature. No lock-in — cancel anytime.</div>
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
              <div className="fp-h">The right person gets the alert.<br />On their phone. Right now.</div>
              <p className="fp-p">Most compliance failures aren't ignorance — they're dropped balls. The owner knows PB1 is due but the accountant wasn't told. APAR needs checking but the caretaker never got the message. DSCVR closes that gap by routing every obligation directly to whoever is responsible.</p>
              <div className="fp-buls">
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>In-app, email, and direct to staff phones</strong> — WhatsApp or SMS, no app install required</div>
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>Route by obligation type</strong> — tax to your accountant, APAR to your caretaker, banjar to your villa manager</div>
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>Staff confirm on their phone</strong> — upload a photo or receipt, updates your dashboard instantly</div>
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>14-day advance warning</strong> on every deadline — overdue items escalate automatically</div>
                <div className="fp-bul"><CheckSvg /> <strong style={{ color: "var(--dk-hi)" }}>Owner confirmation</strong> every time a task is marked done — full visibility without doing it yourself</div>
              </div>
              <div className="fp-note">Alerts are a Pro feature. No lock-in — cancel anytime.</div>
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
              <div className="fp-h">Every certificate.<br />One place. Instantly accessible.</div>
              <p className="fp-p">Upload receipts, certificates and inspection records — each linked to its compliance event. When Satpol PP arrives, you have everything on your phone in seconds. Uploads are optional but missing documents show as gaps in your compliance picture.</p>
              <div className="fp-buls">
                <div className="fp-bul"><CheckSvg /> Unlimited uploads linked to compliance events and gates</div>
                <div className="fp-bul"><CheckSvg /> Date-stamped audit trail — every upload timestamped and traceable</div>
                <div className="fp-bul"><CheckSvg /> Missing documents flagged — shows exactly where your record has gaps</div>
                <div className="fp-bul"><CheckSvg /> Export full compliance record as PDF — for audits, inspections, or accountants</div>
              </div>
              <div className="fp-note">Vault is a Pro feature. No lock-in — cancel anytime.</div>
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
              <div className="fp-h">8 gates from registered<br />to OTA-verified.</div>
              <p className="fp-p">Every obligation mapped into 8 sequential gates. Each gate shows what's required, what's blocking, and your progress percentage. Gate overview is free — full tracking with blocking-item detail and vault integration requires Pro.</p>
              <div className="fp-buls">
                <div className="fp-bul"><CheckSvg /> G0 Foundation → G7 OTA Verified, every step mapped</div>
                <div className="fp-bul"><CheckSvg /> Blocking items flagged with clear next actions and portal links</div>
                <div className="fp-bul"><CheckSvg /> Documents uploaded to Vault auto-update gate completion percentages</div>
              </div>
              <div className="fp-note">Gate overview is free. Full tracking is Pro — no lock-in.</div>
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
            <div className="ey" style={{ justifyContent: "center" }}><span style={{ display: "inline-block", width: "16px", height: "2px", background: "var(--red)", borderRadius: "1px" }} /> Pricing</div>
            <h2 className="sh2">Free account. Pro when you're ready.<br />No lock-in, ever.</h2>
            <p className="sp" style={{ margin: "0 auto", textAlign: "center" }}>Start free to understand where you stand. Upgrade to Pro when you want the full picture — calendar, alerts, vault, tracking. Month-to-month. Cancel anytime.</p>
          </div>
          <div className="tier-row">
            {/* Free */}
            <div className="tier">
              <div className="t-head">
                <div className="t-badge free">Free forever</div>
                <div className="t-name">Free</div>
                <div className="t-price">IDR 0 / month — always free</div>
                <div className="t-hook">Understand where you stand. See what's required. No credit card, no expiry.</div>
              </div>
              <div className="t-body">
                <div className="t-item inc"><CheckSvg /> Compliance gate overview — all 8 gates, read only</div>
                <div className="t-item inc"><CheckSvg /> Regulations &amp; intelligence hub — read only</div>
                <div className="t-item inc"><CheckSvg /> Full compliance glossary &amp; term definitions</div>
                <div className="t-item lk"><LockSvg /> Compliance calendar — Pro only</div>
                <div className="t-item lk"><LockSvg /> Alerts &amp; staff routing — Pro only</div>
                <div className="t-item lk"><LockSvg /> Document vault — Pro only</div>
                <div className="t-item lk"><LockSvg /> Gate tracking &amp; progress — Pro only</div>
              </div>
              <div className="t-cta">
                <Link to="/register"><button className="t-btn fb" data-testid="button-create-free">Create free account</button></Link>
              </div>
            </div>

            {/* Pro */}
            <div className="tier hot">
              <div className="t-head">
                <div className="t-badge popular">Most popular</div>
                <div className="t-name">Pro</div>
                <div className="t-price">IDR 450,000 / month · cancel anytime · no lock-in</div>
                <div className="t-hook">The full platform. Every deadline covered, every document stored, your whole team looped in.</div>
              </div>
              <div className="t-body">
                <div className="t-item inc"><CheckGreenSvg /> Full compliance calendar — 120+ events, 5 views</div>
                <div className="t-item inc"><CheckGreenSvg /> Alerts — app, email, WhatsApp/SMS to staff</div>
                <div className="t-item inc"><CheckGreenSvg /> Document vault — unlimited uploads, audit trail</div>
                <div className="t-item inc"><CheckGreenSvg /> Full gate tracking — progress % and blocking items</div>
                <div className="t-item inc"><CheckGreenSvg /> Staff routing — assign tasks by obligation type</div>
                <div className="t-item inc"><CheckGreenSvg /> Self-audit tool + regulations hub</div>
                <div className="t-item inc"><CheckGreenSvg /> Regulatory change notifications — auto-updated</div>
              </div>
              <div className="t-cta">
                <Link to="/register"><button className="t-btn tb" data-testid="button-get-pro-pricing">Stay Updated — no lock-in →</button></Link>
                <div className="t-note">IDR 450,000 per month. Cancel anytime from your account.</div>
              </div>
            </div>

            {/* Pro+ */}
            <div className="tier">
              <div className="t-head">
                <div className="t-badge multi">Multi-property</div>
                <div className="t-name">Pro+</div>
                <div className="t-price">Contact Us</div>
                <div className="t-hook">Multiple villas, one shared team, one compliance dashboard. Same no lock-in commitment.</div>
              </div>
              <div className="t-body">
                <div className="t-item inc"><CheckSvg /> Everything in Pro</div>
                <div className="t-item inc"><CheckSvg /> Up to 10 properties under one account</div>
                <div className="t-item inc"><CheckSvg /> Unlimited team members and staff accounts</div>
                <div className="t-item inc"><CheckSvg /> Per-property compliance dashboard and vault</div>
                <div className="t-item inc"><CheckSvg /> Cross-property compliance roll-up view</div>
                <div className="t-item inc"><CheckSvg /> PDF export — full audit pack, Satpol PP ready</div>
                <div className="t-item inc"><CheckSvg /> Priority support via WhatsApp</div>
              </div>
              <div className="t-cta">
                <Link to="/register"><button className="t-btn pb" data-testid="button-get-pro-plus">Stay Updated — no lock-in</button></Link>
                <div className="t-note">Contact us for pricing and setup.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEGAL */}
      <div className="section grey">
        <div className="wrap-sm">
          <div className="ey">Legal notice</div>
          <h2 className="sh2">We explain and track.<br />We don't advise.</h2>
          <p className="sp">Most compliance problems are information problems, not legal problems. DSCVR solves the information problem. For tax disputes, zoning challenges, and employment matters — you need a qualified Indonesian professional.</p>
          <div className="legal-box">
            <div className="legal-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M7 1.5L13.5 12.5H.5L7 1.5z" /><line x1="7" y1="6" x2="7" y2="9.5" strokeLinecap="round" /><circle cx="7" cy="11.5" r=".65" fill="currentColor" stroke="none" /></svg>
              What DSCVR is and is not
            </div>
            <p className="legal-body">DSCVR is a <strong>compliance information and tracking platform</strong>, not a licensed legal or tax advisory service. Information is provided for general guidance only and does not constitute legal or tax advice. Requirements vary by property type, structure and location. Always verify critical obligations with official sources or a qualified advisor before acting.</p>
            <div className="do-grid">
              <div className="do-item yes">
                <svg className="y" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 4.5,8.5 10,3" /></svg>
                <span><strong>We do</strong> explain obligations, deadlines, portals and required documents in plain language.</span>
              </div>
              <div className="do-item yes">
                <svg className="y" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 4.5,8.5 10,3" /></svg>
                <span><strong>We do</strong> track deadlines, alert you early, and flag overdue items before they become enforcement problems.</span>
              </div>
              <div className="do-item">
                <svg className="n" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2.5" y1="6" x2="9.5" y2="6" /></svg>
                <span><strong>We don't</strong> provide tax or legal advice, or tell you how to structure your business or minimise liability.</span>
              </div>
              <div className="do-item">
                <svg className="n" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2.5" y1="6" x2="9.5" y2="6" /></svg>
                <span><strong>We don't</strong> file anything on your behalf or represent you to any Indonesian government authority.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-nav">
          <Link to="/how-it-works" className="footer-link" data-testid="link-footer-how-it-works">How it works</Link>
          <a className="footer-link" href="#features" data-testid="link-footer-features">Features</a>
          <a className="footer-link" href="#pricing" data-testid="link-footer-pricing">Pricing</a>
          <Link to="/login" className="footer-link" data-testid="link-footer-signin">Sign in</Link>
        </div>
        <p className="footer-txt">DSCVR is a compliance information and tracking platform, not a licensed legal or tax advisory service. Information reflects our best understanding of current Indonesian regulations applicable to Bali villa operators and is subject to change. Always verify critical obligations with official sources or a qualified advisor. <Link to="/disclaimers">Full disclaimer →</Link></p>
      </div>
    </div>
  );
}
