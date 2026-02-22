import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
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

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState("step1");
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});

  const toggleFaq = useCallback((idx: number) => {
    setOpenFaq((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  useEffect(() => {
    const stepIds = STEPS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveStep(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
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
          <a className="nav-link ac" href="#" data-testid="link-how-it-works">How it works</a>
          <a href="/#features" className="nav-link" data-testid="link-features">Features</a>
          <a href="/#pricing" className="nav-link" data-testid="link-pricing">Pricing</a>
        </div>
        <div className="nav-r">
          <Link to="/login">
            <button className="btn-out" data-testid="button-sign-in">Sign in</button>
          </Link>
          <Link to="/register">
            <button className="btn-red" data-testid="button-get-pro">Get Pro &mdash; no lock-in</button>
          </Link>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className="ph">
        <div className="ph-inner">
          <div className="ph-breadcrumb">
            <Link to="/" data-testid="link-breadcrumb-home">DSCVR</Link>
            <span className="ph-breadcrumb-sep">&rsaquo;</span>
            <span className="ph-breadcrumb-current">How it works</span>
          </div>
          <div className="ph-tag">Platform walkthrough</div>
          <h1 className="ph-h1">From zero to fully compliant.<br />Here&rsquo;s exactly how.</h1>
          <p className="ph-sub">A step-by-step guide to using DSCVR &mdash; from creating your account through to live alerts, document management, and staying ahead of regulatory changes.</p>
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
            onClick={() => setActiveStep(s.id)}
            data-testid={`step-float-${s.id}`}
          >
            <div className="ph-step-n">{s.num}</div>
            <div className="ph-step-l">{s.label}</div>
          </a>
        ))}
      </div>

      {/* STEPS */}
      <div className="section white" id="step1">
        <div className="wrap">

          {/* Step 01 */}
          <div className="step-block" data-testid="step-block-1">
            <div className="step-num-col"><div className="step-n">01</div><div className="step-line" /></div>
            <div className="step-content">
              <div className="step-head">
                <div className="step-icon" style={{ background: "rgba(37,99,235,.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#2563EB" strokeWidth="1.5"><circle cx="9" cy="6" r="3" /><path d="M2 16c0-3.87 3.13-7 7-7s7 3.13 7 7" /></svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span className="step-title">Register &amp; set up your account</span>
                    <span className="free-badge">Free</span>
                  </div>
                </div>
              </div>
              <p className="step-body">Creating a DSCVR account takes under 2 minutes. Enter your email and password &mdash; that&rsquo;s it. No credit card required. Your free account gives you permanent access to the gate overview and regulations hub. You can stay on the free account as long as you like.</p>
              <div className="blist">
                <div className="bitem"><CheckSvg /> <span>Register with email &mdash; no credit card, no trial timer, no expiry</span></div>
                <div className="bitem"><CheckSvg /> <span>Set your preferred language &mdash; English, Indonesian, or Ukrainian</span></div>
                <div className="bitem"><CheckSvg /> <span>Your free account is permanent &mdash; gate overview and regulations hub never lock</span></div>
              </div>
              <div className="note">
                <p className="note-txt"><strong>Free vs Pro:</strong> The free account is designed to help you understand your compliance picture before committing to anything. It shows you the compliance landscape in full &mdash; what&rsquo;s required, which gates apply to you, what each term means. Pro unlocks tracking, deadlines, alerts and documents.</p>
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
                    <span className="step-title">Map your property</span>
                    <span className="free-badge">Free</span>
                  </div>
                </div>
              </div>
              <p className="step-body">Tell DSCVR about your property &mdash; type, regency, number of staff, OTA listings, and current permit status. This takes about 5 minutes. DSCVR uses this information to determine exactly which compliance obligations apply to you, filtered for your property type and regency.</p>
              <div className="blist">
                <div className="bitem"><CheckSvg /> <span><strong>Property type</strong> &mdash; commercial villa, homestay, boutique resort. Affects which licenses apply.</span></div>
                <div className="bitem"><CheckSvg /> <span><strong>Regency</strong> &mdash; Badung, Gianyar, Denpasar, or elsewhere. Local taxes and permit requirements differ.</span></div>
                <div className="bitem"><CheckSvg /> <span><strong>Staff count</strong> &mdash; determines BPJS thresholds and THR calculation approach</span></div>
                <div className="bitem"><CheckSvg /> <span><strong>OTA listings</strong> &mdash; which platforms (Airbnb, Booking.com, etc) triggers OTA verification requirements</span></div>
                <div className="bitem"><CheckSvg /> <span><strong>Current status</strong> &mdash; which permits you already hold. DSCVR starts your gate map from where you are now.</span></div>
              </div>

              <div className="step-detail" style={{ marginTop: "18px" }}>
                <div className="sd-bar">
                  <div className="sd-dot" style={{ background: "#FF5F57" }} />
                  <div className="sd-dot" style={{ background: "#FFBD2E" }} />
                  <div className="sd-dot" style={{ background: "#28CA41" }} />
                  <span className="sd-title">PROPERTY PROFILE &mdash; Villa Kerti, Badung</span>
                </div>
                <div className="sd-body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--b)", borderRadius: "7px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "5px" }}>Property</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--txt)" }}>Commercial Villa</div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>Badung Regency</div>
                    </div>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--b)", borderRadius: "7px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "5px" }}>Staff</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--txt)" }}>4 employees</div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>BPJS required</div>
                    </div>
                    <div style={{ background: "var(--bg)", border: "1px solid var(--b)", borderRadius: "7px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "5px" }}>OTA Listings</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--txt)" }}>3 platforms</div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>Airbnb &middot; Booking &middot; Agoda</div>
                    </div>
                    <div style={{ background: "rgba(232,25,44,.04)", border: "1px solid rgba(232,25,44,.12)", borderRadius: "7px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "5px" }}>Compliance events/yr</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--red)" }}>127</div>
                      <div style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>Tracked by DSCVR</div>
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
                    <span className="step-title">See your compliance gates</span>
                    <span className="free-badge">Free</span>
                  </div>
                </div>
              </div>
              <p className="step-body">DSCVR maps your entire compliance journey into 8 sequential gates &mdash; from entity registration through to OTA platform verification. The free account shows you the full gate structure: what each gate requires, where you currently sit, and what&rsquo;s blocking you. Progress tracking and detailed blocking-item analysis require Pro.</p>

              <div className="gate-map" style={{ marginTop: "16px" }}>
                <div className="gate-row free-g">
                  <div className="gate-badge" style={{ background: "rgba(22,163,74,.12)", color: "#16A34A", border: "1.5px solid rgba(22,163,74,.3)" }}>G0</div>
                  <div className="gate-info"><div className="gate-name">Foundation</div><div className="gate-desc">NPWP, PT or CV entity, bank account structure</div></div>
                  <span className="gate-access" style={{ background: "rgba(37,99,235,.08)", color: "var(--blue)" }}>Free view</span>
                </div>
                <div className="gate-row free-g">
                  <div className="gate-badge" style={{ background: "rgba(22,163,74,.12)", color: "#16A34A", border: "1.5px solid rgba(22,163,74,.3)" }}>G1</div>
                  <div className="gate-info"><div className="gate-name">Zoning &amp; Land</div><div className="gate-desc">RTRW zoning check, Sertifikat Hak Sewa, IMB/PBG</div></div>
                  <span className="gate-access" style={{ background: "rgba(37,99,235,.08)", color: "var(--blue)" }}>Free view</span>
                </div>
                <div className="gate-row free-g">
                  <div className="gate-badge" style={{ background: "rgba(217,119,6,.12)", color: "var(--gold)", border: "1.5px solid rgba(217,119,6,.3)" }}>G2</div>
                  <div className="gate-info"><div className="gate-name">NIB &amp; OSS Registration</div><div className="gate-desc">NIB via OSS, KBLI classification, NIB verification (Mar 2026 deadline)</div></div>
                  <span className="gate-access" style={{ background: "rgba(37,99,235,.08)", color: "var(--blue)" }}>Free view</span>
                </div>
                <div className="gate-row pro-g">
                  <div className="gate-badge" style={{ background: "rgba(124,58,237,.1)", color: "var(--purple)", border: "1.5px solid rgba(124,58,237,.25)" }}>G3</div>
                  <div className="gate-info"><div className="gate-name">Building &amp; SLF</div><div className="gate-desc">PBG building permit, SLF operational certificate, construction compliance</div></div>
                  <span className="gate-access" style={{ background: "rgba(232,25,44,.07)", color: "var(--red)" }}>Pro tracking</span>
                </div>
                <div className="gate-row pro-g">
                  <div className="gate-badge" style={{ background: "rgba(217,119,6,.1)", color: "var(--gold)", border: "1.5px solid rgba(217,119,6,.22)" }}>G4</div>
                  <div className="gate-info"><div className="gate-name">Tax &amp; LKPM</div><div className="gate-desc">CoreTax registration, PB1 hotel tax, monthly filing schedule, LKPM quarterly</div></div>
                  <span className="gate-access" style={{ background: "rgba(232,25,44,.07)", color: "var(--red)" }}>Pro tracking</span>
                </div>
                <div className="gate-row pro-g">
                  <div className="gate-badge" style={{ background: "rgba(22,163,74,.1)", color: "var(--grn)", border: "1.5px solid rgba(22,163,74,.22)" }}>G5</div>
                  <div className="gate-info"><div className="gate-name">Staff &amp; BPJS</div><div className="gate-desc">BPJS Kesehatan, BPJamsostek, payroll, THR obligations</div></div>
                  <span className="gate-access" style={{ background: "rgba(232,25,44,.07)", color: "var(--red)" }}>Pro tracking</span>
                </div>
                <div className="gate-row pro-g">
                  <div className="gate-badge" style={{ background: "rgba(232,25,44,.1)", color: "var(--red)", border: "1.5px solid rgba(232,25,44,.22)" }}>G6</div>
                  <div className="gate-info"><div className="gate-name">Safety Certificates</div><div className="gate-desc">DAMKAR fire safety, monthly APAR, pool, electrical, water quality</div></div>
                  <span className="gate-access" style={{ background: "rgba(232,25,44,.07)", color: "var(--red)" }}>Pro tracking</span>
                </div>
                <div className="gate-row" style={{ background: "rgba(37,99,235,.05)", borderColor: "rgba(37,99,235,.14)" }}>
                  <div className="gate-badge" style={{ background: "rgba(37,99,235,.12)", color: "var(--blue)", border: "1.5px solid rgba(37,99,235,.3)" }}>G7</div>
                  <div className="gate-info"><div className="gate-name">OTA Verified</div><div className="gate-desc">Airbnb, Booking.com, Agoda, Vrbo &mdash; all require NIB + permit confirmation</div></div>
                  <span className="gate-access" style={{ background: "rgba(37,99,235,.08)", color: "var(--blue)" }}>Goal state</span>
                </div>
              </div>

              <div className="note" style={{ marginTop: "14px" }}>
                <p className="note-txt"><strong>Free account shows:</strong> all gate names, what each requires, your current status. <strong>Pro unlocks:</strong> progress percentages, blocking item detail, vault integration that auto-updates gate completion when documents are uploaded.</p>
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
                    <span className="step-title">Upgrade to Pro</span>
                    <span className="pro-badge">Pro</span>
                  </div>
                </div>
              </div>
              <p className="step-body">When you&rsquo;re ready to move from seeing your compliance picture to actively managing it, upgrade to Pro. No lock-in: you pay month-to-month and can cancel anytime from your account settings. Your data &mdash; property, vault, calendar &mdash; stays exactly as you left it if you ever pause and restart.</p>
              <div className="blist">
                <div className="bitem"><CheckSvg /> <span><strong>IDR 450,000/month</strong> for a single property. No setup fees, no annual commitment.</span></div>
                <div className="bitem"><CheckSvg /> <span><strong>IDR 850,000/month</strong> for Pro+ &mdash; up to 10 properties, unlimited staff, cross-property dashboard.</span></div>
                <div className="bitem"><CheckSvg /> <span>Cancel anytime from Account Settings. No cancellation fees, no retention calls.</span></div>
                <div className="bitem"><CheckSvg /> <span>Your compliance calendar pre-populates immediately &mdash; 120+ events loaded on upgrade.</span></div>
              </div>
              <div className="pill-row">
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>Calendar unlocked</div>
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>Alerts active</div>
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>Vault enabled</div>
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>Gate tracking live</div>
                <div className="pill" style={{ background: "rgba(22,163,74,.08)", color: "#14532D", border: "1px solid rgba(22,163,74,.18)" }}>Staff routing</div>
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
                    <span className="step-title">Set up alerts &amp; your document vault</span>
                    <span className="pro-badge">Pro</span>
                  </div>
                </div>
              </div>
              <p className="step-body">After upgrading, spend 10 minutes on the two most impactful setup steps: configuring who gets which alerts, and uploading any documents you already have. Both will immediately change how well your compliance is covered.</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "10px" }}>Alert routing &mdash; assign by obligation type</div>
                  <div className="routing-diagram">
                    <div className="route-row">
                      <div className="route-from">Tax filings (PB1, PPh, SPT)</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to"><span className="route-chip" style={{ background: "rgba(217,119,6,.1)", color: "#92400E", border: "1px solid rgba(217,119,6,.2)" }}>Accountant</span></div>
                    </div>
                    <div className="route-row">
                      <div className="route-from">APAR &amp; fire checks</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to"><span className="route-chip" style={{ background: "rgba(22,163,74,.1)", color: "#14532D", border: "1px solid rgba(22,163,74,.2)" }}>Caretaker</span></div>
                    </div>
                    <div className="route-row">
                      <div className="route-from">BPJS contributions</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to">
                        <span className="route-chip" style={{ background: "rgba(22,163,74,.1)", color: "#14532D", border: "1px solid rgba(22,163,74,.2)" }}>Manager</span>
                        <span className="route-chip" style={{ background: "rgba(217,119,6,.1)", color: "#92400E", border: "1px solid rgba(217,119,6,.2)" }}>Accountant</span>
                      </div>
                    </div>
                    <div className="route-row">
                      <div className="route-from">Banjar contributions</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to"><span className="route-chip" style={{ background: "rgba(124,58,237,.1)", color: "#4C1D95", border: "1px solid rgba(124,58,237,.2)" }}>Villa Manager</span></div>
                    </div>
                    <div className="route-row">
                      <div className="route-from">All overdue items</div>
                      <div className="route-arrow">&rarr;</div>
                      <div className="route-to"><span className="route-chip" style={{ background: "rgba(232,25,44,.1)", color: "#991B1B", border: "1px solid rgba(232,25,44,.2)" }}>Owner</span></div>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--t3)", lineHeight: "1.55" }}>Staff receive alerts via app, email, or WhatsApp/SMS &mdash; no app install required for WhatsApp. They confirm completion on their phone, optionally uploading a receipt photo.</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" as const, color: "var(--t4)", marginBottom: "10px" }}>Vault &mdash; upload what you already have</div>
                  <div className="vault-cats">
                    <div className="vault-cat">
                      <div className="vc-head"><span style={{ color: "var(--red)" }}>&bull;</span> Safety</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--red)" }} />DAMKAR cert</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--red)" }} />APAR logbook</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--red)" }} />Electrical cert</div>
                    </div>
                    <div className="vault-cat">
                      <div className="vc-head"><span style={{ color: "var(--gold)" }}>&bull;</span> Tax</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--gold)" }} />PB1 receipts</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--gold)" }} />CoreTax filings</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--gold)" }} />SPT confirmation</div>
                    </div>
                    <div className="vault-cat">
                      <div className="vc-head"><span style={{ color: "var(--grn)" }}>&bull;</span> Permits</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--grn)" }} />NIB certificate</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--grn)" }} />SLF certificate</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--grn)" }} />IMB/PBG copy</div>
                    </div>
                    <div className="vault-cat">
                      <div className="vc-head"><span style={{ color: "var(--blue)" }}>&bull;</span> BPJS</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--blue)" }} />Monthly receipts</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--blue)" }} />Enrollment certs</div>
                      <div className="vc-item"><div className="vc-dot" style={{ background: "var(--blue)" }} />Staff records</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--t3)", lineHeight: "1.55" }}>Each upload is linked to its gate and compliance event. Missing documents show as gaps. When Satpol PP visits, everything is on your phone in one place.</div>
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
                    <span className="step-title">Stay ahead &mdash; regulatory intelligence</span>
                    <span className="pro-badge">Pro</span>
                  </div>
                </div>
              </div>
              <p className="step-body">Indonesia&rsquo;s regulatory environment is actively changing. CoreTax replaced eFiling in 2025. OSS NIB verification requirements have evolved. OTA platform requirements shifted ahead of the March 2026 deadline. DSCVR monitors government portals and regulatory sources, and notifies you when anything that affects your property changes &mdash; before the deadline hits.</p>
              <div className="blist">
                <div className="bitem"><CheckSvg /> <span><strong>Government portal monitoring</strong> &mdash; OSS, CoreTax, eDabu, e-Palapa and more watched daily</span></div>
                <div className="bitem"><CheckSvg /> <span><strong>Region-filtered alerts</strong> &mdash; Badung notices go to Badung operators only. No noise from irrelevant regencies.</span></div>
                <div className="bitem"><CheckSvg /> <span><strong>Calendar auto-adjusts</strong> &mdash; when a deadline moves, your compliance calendar shifts automatically</span></div>
                <div className="bitem"><CheckSvg /> <span><strong>In-plain-English summaries</strong> &mdash; what changed, what it means for you, what you need to do</span></div>
              </div>

              <div className="tl" style={{ marginTop: "18px" }}>
                <div className="tl-item">
                  <div className="tl-left">
                    <div className="tl-dot" style={{ borderColor: "var(--red)", background: "rgba(232,25,44,.12)" }} />
                    <div className="tl-conn" style={{ background: "var(--b)" }} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-label">Change detected &mdash; CoreTax maintenance scheduled</div>
                    <div className="tl-sub">System detects announcement on DJP portal. Affects PPh 21 and PPh 25 filing window for March 5&ndash;6.</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-left">
                    <div className="tl-dot" style={{ borderColor: "var(--gold)", background: "rgba(217,119,6,.12)" }} />
                    <div className="tl-conn" style={{ background: "var(--b)" }} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-label">Admin reviews and approves</div>
                    <div className="tl-sub">DSCVR team verifies the change, drafts plain-English notification, determines affected operators.</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-left">
                    <div className="tl-dot" style={{ borderColor: "var(--blue)", background: "rgba(37,99,235,.12)" }} />
                    <div className="tl-conn" style={{ background: "var(--b)" }} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-label">You receive a notification</div>
                    <div className="tl-sub">In-app alert (and email if enabled): &ldquo;CoreTax maintenance March 5&ndash;6 &mdash; your PPh deadlines have been adjusted.&rdquo;</div>
                  </div>
                </div>
                <div className="tl-item">
                  <div className="tl-left">
                    <div className="tl-dot" style={{ borderColor: "var(--grn)", background: "rgba(22,163,74,.12)" }} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-label">Calendar adjusts automatically</div>
                    <div className="tl-sub">Your PPh 21 deadline shifts to March 7. Your accountant&rsquo;s alert updates. No action required from you.</div>
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
          <div className="ey">Common questions</div>
          <h2 className="sh2">Before you start</h2>
          <div className="faq-list" data-testid="faq-list">
            {FAQ_ITEMS.map((item, idx) => {
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
        <h2 className="cta-h">Ready to get on top of it?</h2>
        <p className="cta-sub">Create your free account in under 2 minutes. See exactly where you stand before committing to anything. No credit card required.</p>
        <div className="cta-btns">
          <Link to="/register">
            <button className="cta-btn-w" data-testid="button-cta-register">Create free account &mdash; no card needed</button>
          </Link>
          <a href="/#pricing">
            <button className="cta-btn-o" data-testid="button-cta-pricing">See pricing &rarr;</button>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-nav">
          <a className="footer-link" href="#" data-testid="footer-link-how">How it works</a>
          <a href="/#features" className="footer-link" data-testid="footer-link-features">Features</a>
          <a href="/#pricing" className="footer-link" data-testid="footer-link-pricing">Pricing</a>
          <Link to="/login" className="footer-link" data-testid="footer-link-signin">Sign in</Link>
        </div>
        <p className="footer-txt">DSCVR is a compliance information and tracking platform, not a licensed legal or tax advisory service. Information reflects our best understanding of current Indonesian regulations applicable to Bali villa operators and is subject to change. Always verify critical obligations with official sources or a qualified advisor. <Link to="/disclaimers">Full disclaimer &rarr;</Link></p>
      </div>
    </div>
  );
}
