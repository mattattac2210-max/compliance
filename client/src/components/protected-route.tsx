import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Lock } from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { useUpgradeModal } from "@/components/upgrade-modal";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
      <div className="text-[#14B8A6] font-heading text-sm tracking-widest uppercase animate-pulse">Loading…</div>
    </div>
  );
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <>{children}</>;
}

export function ProRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { openUpgradeModal } = useUpgradeModal();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
      <div className="text-[#14B8A6] font-heading text-sm tracking-widest uppercase animate-pulse">Loading…</div>
    </div>
  );
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!user?.isPro) {
    return (
      <div className="relative min-h-[60vh]" data-testid="pro-teaser">
        <div
          style={{
            filter: "blur(6px)",
            pointerEvents: "none",
            userSelect: "none",
            opacity: 0.6,
          }}
          aria-hidden="true"
        >
          {children}
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "rgba(7,16,30,0.85)",
              border: "1px solid rgba(20,184,166,0.3)",
              borderRadius: "16px",
              padding: "40px 36px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
            }}
            data-testid="pro-teaser-overlay"
          >
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(20,184,166,0.1)",
              border: "1px solid rgba(20,184,166,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Lock size={24} style={{ color: "#14B8A6" }} />
            </div>

            <div style={{
              fontFamily: "Montserrat",
              fontSize: "18px",
              fontWeight: 800,
              color: "#F1F5F9",
              marginBottom: "8px",
              letterSpacing: "-0.2px",
            }}>
              {t.upgrade.proFeature}
            </div>

            <div style={{
              fontFamily: "Lato",
              fontSize: "13px",
              color: "#94A3B8",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}>
              {t.upgrade.tooltipBody}
            </div>

            <button
              onClick={openUpgradeModal}
              data-testid="button-upgrade-teaser"
              style={{
                padding: "12px 28px",
                background: "#14B8A6",
                color: "#FFFFFF",
                fontFamily: "Montserrat",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0D9488")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#14B8A6")}
            >
              {t.upgrade.upgradeButton}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
