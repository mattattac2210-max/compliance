import { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/context";
import { useToast } from "@/hooks/use-toast";

const UpgradeModalContext = createContext<{
  openUpgradeModal: () => void;
}>({ openUpgradeModal: () => {} });

export function useUpgradeModal() {
  return useContext(UpgradeModalContext);
}

export function UpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <UpgradeModalContext.Provider value={{ openUpgradeModal: () => setShow(true) }}>
      {children}
      <UpgradeModal open={show} onClose={() => setShow(false)} />
    </UpgradeModalContext.Provider>
  );
}

function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const features = [
    { title: t.upgrade.modalFeature1, sub: t.upgrade.modalFeature1Sub },
    { title: t.upgrade.modalFeature2, sub: t.upgrade.modalFeature2Sub },
    { title: t.upgrade.modalFeature3, sub: t.upgrade.modalFeature3Sub },
    { title: t.upgrade.modalFeature4, sub: t.upgrade.modalFeature4Sub, soon: t.upgrade.modalFeature4Soon },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="upgrade-modal-overlay"
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            data-testid="upgrade-modal"
            style={{
              background: "#0F2040",
              border: "1px solid rgba(20,184,166,0.25)",
              borderRadius: "14px",
              padding: "36px 32px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>&#10022;</span>
              <span style={{ fontFamily: "Montserrat", fontSize: "18px", fontWeight: 900, color: "#14B8A6", letterSpacing: "2px" }}>
                {t.upgrade.modalTitle}
              </span>
            </div>

            <p style={{ fontFamily: "Lato", fontSize: "14px", color: "#94A3B8", marginBottom: "28px", lineHeight: 1.6 }}>
              {t.upgrade.modalSubtitle}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ color: "#14B8A6", fontSize: "14px", marginTop: "2px", flexShrink: 0 }}>&#10003;</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "Montserrat", fontSize: "13px", fontWeight: 700, color: "#F1F5F9" }}>
                        {f.title}
                      </span>
                      {f.soon && (
                        <span style={{
                          fontFamily: "Montserrat", fontSize: "8px", fontWeight: 700,
                          color: "#F59E0B", background: "rgba(245,158,11,0.12)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          borderRadius: "4px", padding: "2px 6px",
                          letterSpacing: "0.5px", textTransform: "uppercase",
                        }}>
                          {f.soon}
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: "Lato", fontSize: "12px", color: "#64748B", lineHeight: 1.5 }}>
                      {f.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              data-testid="button-upgrade-pro"
              onClick={() => {
                console.log("Stripe checkout placeholder");
                toast({ title: t.upgrade.comingSoonToast });
              }}
              style={{
                width: "100%",
                padding: "14px",
                background: "#14B8A6",
                color: "#FFFFFF",
                fontFamily: "Montserrat",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "14px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0D9488")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#14B8A6")}
            >
              {t.upgrade.upgradeButton}
            </button>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontFamily: "Lato", fontSize: "10px", color: "#64748B" }}>
                {t.upgrade.stripeNote}
              </span>
            </div>

            <button
              data-testid="button-close-upgrade"
              onClick={onClose}
              style={{
                display: "block", width: "100%",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "8px",
                padding: "10px",
                color: "#64748B",
                fontFamily: "Montserrat",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
            >
              &times; Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
