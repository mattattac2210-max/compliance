import { useLanguage } from "@/i18n/context";
import { useUpgradeModal } from "@/components/upgrade-modal";
import { useToast } from "@/hooks/use-toast";

export default function UpgradePage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const features = [
    { title: t.upgrade.modalFeature1, sub: t.upgrade.modalFeature1Sub },
    { title: t.upgrade.modalFeature2, sub: t.upgrade.modalFeature2Sub },
    { title: t.upgrade.modalFeature3, sub: t.upgrade.modalFeature3Sub },
    { title: t.upgrade.modalFeature4, sub: t.upgrade.modalFeature4Sub, soon: t.upgrade.modalFeature4Soon },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100%", padding: "40px 20px",
    }} data-testid="upgrade-page">
      <div style={{
        background: "var(--surface2)",
        border: "1px solid var(--accent-tint2)",
        borderRadius: "14px",
        padding: "48px 40px",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span style={{ fontSize: "22px" }}>&#10022;</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 900, color: "var(--accent)", letterSpacing: "2px" }}>
            {t.upgrade.modalTitle}
          </span>
        </div>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--t2)", marginBottom: "32px", lineHeight: 1.6 }}>
          {t.upgrade.modalSubtitle}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "36px" }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent)", fontSize: "16px", marginTop: "2px", flexShrink: 0 }}>&#10003;</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: "var(--txt)" }}>
                    {f.title}
                  </span>
                  {f.soon && (
                    <span style={{
                      fontFamily: "var(--font-display)", fontSize: "8px", fontWeight: 700,
                      color: "var(--gold)", background: "rgba(245,158,11,0.12)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      borderRadius: "4px", padding: "2px 6px",
                      letterSpacing: "0.5px", textTransform: "uppercase",
                    }}>
                      {f.soon}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--t3)", lineHeight: 1.5 }}>
                  {f.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          data-testid="button-upgrade-pro-page"
          onClick={() => {
            console.log("Stripe checkout placeholder");
            toast({ title: t.upgrade.comingSoonToast });
          }}
          style={{
            width: "100%",
            padding: "16px",
            background: "var(--accent)",
            color: "#FFFFFF",
            fontFamily: "var(--font-display)",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "16px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          {t.upgrade.upgradeButton}
        </button>

        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--t3)" }}>
            {t.upgrade.stripeNote}
          </span>
        </div>
      </div>
    </div>
  );
}
