import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Lock } from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { useUpgradeModal } from "@/components/upgrade-modal";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isError } = useAuth();

  if (isLoading) return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#F7F8FA" }}
      data-testid="auth-loading"
    >
      <div style={{
        width: 40, height: 40,
        border: "3px solid #E2E8F0",
        borderTopColor: "#E8192C",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        marginBottom: 16,
      }} />
      <div style={{
        fontFamily: "system-ui, sans-serif",
        fontSize: 14,
        color: "#4A5568",
        letterSpacing: "0.05em",
      }}>
        Loading...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (isError) return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#F7F8FA", padding: 40, textAlign: "center" }}
      data-testid="auth-error"
    >
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 18, fontWeight: 700, color: "#E8192C", marginBottom: 12 }}>
        Connection Error
      </div>
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#4A5568", marginBottom: 24, maxWidth: 400, lineHeight: 1.6 }}>
        Unable to connect to the server. Please check your connection and try again.
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{ padding: "10px 24px", background: "#E8192C", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "system-ui, sans-serif", fontSize: 14 }}
      >
        Retry
      </button>
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
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#F7F8FA" }}
      data-testid="pro-loading"
    >
      <div style={{
        width: 40, height: 40,
        border: "3px solid #E2E8F0",
        borderTopColor: "#E8192C",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        marginBottom: 16,
      }} />
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#4A5568" }}>
        Loading...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
              border: "1px solid var(--accent-tint2)",
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
              background: "var(--accent-tint)",
              border: "1px solid var(--accent-tint2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Lock size={24} style={{ color: "var(--accent)" }} />
            </div>

            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--txt)",
              marginBottom: "8px",
              letterSpacing: "-0.2px",
            }}>
              {t.upgrade.proFeature}
            </div>

            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--t2)",
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
                background: "var(--accent)",
                color: "#FFFFFF",
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
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
