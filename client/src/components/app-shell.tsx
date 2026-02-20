import { useState, useMemo, useEffect, type ReactNode } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLanguage, LanguageSelector } from "@/i18n/context";
import { ThemeToggle } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useUpgradeModal } from "@/components/upgrade-modal";
import { SupportModeBanner } from "@/components/support-mode-banner";
import {
  Hexagon, CheckCircle, BookOpen, Archive, Clock, AlertTriangle,
  List, GitBranch, User, Settings, Lock, Menu, LogOut, ChevronLeft, ChevronRight, LayoutDashboard
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle: string;
  activeNav: string;
}

const EXPANDED_W = 220;
const COLLAPSED_W = 60;

export default function AppShell({ children, pageTitle, activeNav }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("dscvr-sidebar-collapsed") === "true"; } catch { return false; }
  });
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { openUpgradeModal } = useUpgradeModal();
  const [location, navigate] = useLocation();
  const searchString = useSearch();
  const tabParam = new URLSearchParams(searchString).get("tab");
  const sectionParam = new URLSearchParams(searchString).get("section");

  useEffect(() => {
    try { localStorage.setItem("dscvr-sidebar-collapsed", String(collapsed)); } catch {}
  }, [collapsed]);

  const sidebarW = collapsed ? COLLAPSED_W : EXPANDED_W;

  const computedActiveNav = useMemo(() => {
    if (location === "/vault") return "vault";
    if (location === "/timeline") return "timeline";
    if (location === "/alerts") return "alerts";
    if (location === "/profile") return "profile";
    if (location === "/admin-dashboard") return "admin-dashboard";
    if (location === "/app" || location === "/") {
      if (tabParam === "guide" && sectionParam === "glossary") return "glossary";
      if (tabParam === "guide" && sectionParam === "workflows") return "workflows";
      if (tabParam === "flow") return "compliance";
      if (tabParam === "audit") return "audit";
      if (tabParam === "guide") return "guide";
      return "dashboard";
    }
    return activeNav;
  }, [location, tabParam, sectionParam, activeNav]);

  const { data: properties } = useQuery<any[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const activeProperty = properties?.find((p: any) => p.isActive) || properties?.[0];

  const { data: vaultSummary } = useQuery<any>({
    queryKey: ["/api/vault/summary", activeProperty?.id],
    queryFn: async () => {
      if (!activeProperty?.id) return null;
      const res = await fetch(`/api/vault/summary?propertyId=${activeProperty.id}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user?.isPro && !!activeProperty?.id,
  });

  const isPro = user?.isPro ?? false;

  const otaDeadline = new Date("2026-03-31");
  const today = new Date();
  const daysRemaining = Math.ceil((otaDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const deadlinePassed = daysRemaining <= 0;

  const completionPct = vaultSummary?.completionPct ?? 0;
  const vaultDocCount = vaultSummary ? (vaultSummary.uploaded + vaultSummary.expiring) : 0;
  const alertCount = vaultSummary?.expired ?? 0;

  const iconSize = 16;
  const navSections = useMemo(() => [
    {
      label: "OVERVIEW",
      items: [
        { key: "dashboard", icon: <LayoutDashboard size={iconSize} />, label: "Dashboard", href: "/app", pro: false },
        { key: "compliance", icon: <Hexagon size={iconSize} />, label: t.tabs.flow, href: "/app?tab=flow", pro: false },
        { key: "audit", icon: <CheckCircle size={iconSize} />, label: t.tabs.audit, href: "/app?tab=audit", pro: false },
        { key: "guide", icon: <BookOpen size={iconSize} />, label: t.tabs.guide, href: "/app?tab=guide", pro: false },
      ],
    },
    {
      label: "TRACKING",
      items: [
        { key: "vault", icon: <Archive size={iconSize} />, label: t.nav.vault, href: "/vault", pro: true, badge: isPro ? vaultDocCount : undefined },
        { key: "timeline", icon: <Clock size={iconSize} />, label: t.nav.timeline, href: "/timeline", pro: true },
        { key: "alerts", icon: <AlertTriangle size={iconSize} />, label: t.nav.alerts, href: "/alerts", pro: true, alertBadge: isPro ? alertCount : undefined },
      ],
    },
    {
      label: "REFERENCE",
      items: [
        { key: "glossary", icon: <List size={iconSize} />, label: t.glossary.heading, href: "/app?tab=guide&section=glossary", pro: false },
        { key: "workflows", icon: <GitBranch size={iconSize} />, label: t.processNav.heading, href: "/app?tab=guide&section=workflows", pro: false },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { key: "profile", icon: <User size={iconSize} />, label: t.nav.profile, href: "/profile", pro: false },
        ...(user?.isAdmin ? [{ key: "admin-dashboard", icon: <Settings size={iconSize} />, label: t.adminDashboard.heading, href: "/admin-dashboard", pro: false }] : []),
      ],
    },
  ], [t, isPro, vaultDocCount, alertCount, user?.isAdmin]);

  const handleNavClick = (item: any) => {
    if (item.pro && !isPro) {
      openUpgradeModal();
      return;
    }
    const [path, qs] = item.href.split("?");
    if (path === "/app" && location === "/app") {
      window.history.replaceState(null, "", item.href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      navigate(item.href);
    }
    setSidebarOpen(false);
  };

  const emailInitials = user?.email
    ? user.email.split("@")[0].slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="relative">
    {user?.isAdmin && <SupportModeBanner />}
    <div
      style={{ display: "grid", gridTemplateColumns: `${sidebarW}px 1fr`, height: "100vh", overflow: "hidden", transition: "grid-template-columns 0.2s ease" }}
      className="max-md:!grid-cols-[0px_1fr]"
    >
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-[998] bg-black/50"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      <aside
        className={`
          fixed md:relative z-[999] md:z-auto
          transition-all duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          width: sidebarOpen ? `${EXPANDED_W}px` : `${sidebarW}px`,
          height: "100vh",
          background: "#0A1628",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        data-testid="app-sidebar"
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? "20px 0 14px" : "20px 18px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          textAlign: collapsed ? "center" : "left",
        }}>
          <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: collapsed ? "16px" : "22px", color: "#14B8A6", letterSpacing: "2px", transition: "font-size 0.2s" }}>
            {collapsed ? "D" : "DSCVR"}
          </div>
          {!collapsed && (
            <div style={{ fontFamily: "Lato", fontSize: "9px", letterSpacing: "3px", color: "#64748B", textTransform: "uppercase", marginTop: "2px" }}>
              COMPLIANCE NAVIGATOR
            </div>
          )}
        </div>

        {/* Property selector - hidden when collapsed */}
        {!collapsed && (
          <div style={{ padding: "12px 14px 8px" }}>
            <div style={{ fontFamily: "Montserrat", fontSize: "8px", fontWeight: 700, letterSpacing: "2px", color: "#14B8A6", textTransform: "uppercase", marginBottom: "6px" }}>
              {t.shell.activeProperty}
            </div>
            {activeProperty ? (
              <button
                onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
                data-testid="sidebar-property-selector"
                style={{
                  width: "100%",
                  background: "rgba(12,26,46,0.8)",
                  border: "1px solid rgba(20,184,166,0.2)",
                  borderRadius: "7px",
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#14B8A6")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(20,184,166,0.2)")}
              >
                <span style={{ fontFamily: "Montserrat", fontSize: "13px", fontWeight: 700, color: "#F1F5F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeProperty.propertyName}
                </span>
                <span style={{ color: "#64748B", fontSize: "10px", flexShrink: 0, marginLeft: "4px" }}>&#9662;</span>
              </button>
            ) : (
              <button
                onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
                data-testid="sidebar-add-property"
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600,
                  color: "#14B8A6", padding: "4px 0",
                }}
              >
                {t.shell.addProperty}
              </button>
            )}
          </div>
        )}

        {/* Vault progress - hidden when collapsed */}
        {isPro && !collapsed && (
          <div style={{
            margin: "4px 14px 8px",
            background: "rgba(20,184,166,0.04)",
            border: "1px solid rgba(20,184,166,0.1)",
            borderRadius: "7px",
            padding: "10px 12px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontFamily: "Lato", fontSize: "11px", color: "#94A3B8" }}>{t.shell.vaultCompletion}</span>
              <span style={{ fontFamily: "Montserrat", fontSize: "12px", fontWeight: 700, color: "#14B8A6" }}>{completionPct}%</span>
            </div>
            <div style={{ height: "4px", background: "rgba(20,184,166,0.15)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${completionPct}%`,
                background: "linear-gradient(90deg, #14B8A6, #5EEAD4)",
                borderRadius: "2px",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "8px 6px" : "8px 10px" }} data-testid="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label} style={{ marginBottom: collapsed ? "12px" : "16px" }}>
              {!collapsed && (
                <div style={{
                  fontFamily: "Montserrat", fontSize: "8px", fontWeight: 700,
                  letterSpacing: "2.5px", color: "#64748B", textTransform: "uppercase",
                  padding: "0 8px", marginBottom: "6px",
                }}>
                  {section.label}
                </div>
              )}
              {collapsed && (
                <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 8px 8px" }} />
              )}
              {section.items.map((item) => {
                const isLocked = item.pro && !isPro;
                const isActive = computedActiveNav === item.key;

                if (isLocked) {
                  return <LockedNavItem key={item.key} icon={item.icon} label={item.label} collapsed={collapsed} />;
                }

                return (
                  <NavItem
                    key={item.key}
                    item={item}
                    isActive={isActive}
                    collapsed={collapsed}
                    onClick={() => handleNavClick(item)}
                  />
                );
              })}
            </div>
          ))}
        </nav>

        {/* OTA countdown */}
        {!collapsed ? (
          <div style={{
            margin: "0 14px 10px",
            background: deadlinePassed ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)",
            border: `1px solid rgba(239,68,68,0.2)`,
            borderRadius: "7px",
            padding: "10px 12px",
          }} data-testid="ota-countdown">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span className="animate-blink" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
              <span style={{ fontFamily: "Montserrat", fontSize: "8px", fontWeight: 700, letterSpacing: "2px", color: "#FCA5A5", textTransform: "uppercase" }}>
                {t.shell.otaDeadlineLabel}
              </span>
            </div>
            <div style={{ fontFamily: "Montserrat", fontSize: "11px", fontWeight: 700, color: "#FCA5A5" }}>
              31 March 2026
            </div>
            <div style={{ fontFamily: "Lato", fontSize: "10px", color: "#64748B" }}>
              {deadlinePassed ? t.shell.deadlinePassed : `${daysRemaining} ${t.shell.daysRemaining}`}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", margin: "0 0 10px" }} data-testid="ota-countdown">
            <NavTooltip label={`OTA: ${daysRemaining}d`}>
              <span className="animate-blink" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
            </NavTooltip>
          </div>
        )}

        {/* User footer */}
        <div style={{
          padding: collapsed ? "12px 0" : "12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: collapsed ? "center" : "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? "0" : "10px",
          flexDirection: collapsed ? "column" : "row",
        }} data-testid="sidebar-user-footer">
          <NavTooltip label={collapsed ? (user?.email ?? "") : ""}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "1.5px solid #14B8A6",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Montserrat", fontSize: "10px", fontWeight: 700,
              color: "#14B8A6", background: "rgba(20,184,166,0.08)", flexShrink: 0,
              cursor: collapsed ? "pointer" : "default",
            }}>
              {emailInitials}
            </div>
          </NavTooltip>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "Lato", fontSize: "11px", color: "#F1F5F9",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {user?.email}
                </div>
                <div style={{ fontFamily: "Lato", fontSize: "10px", color: "#64748B" }}>
                  {isPro ? t.upgrade.proLabel : (
                    <button
                      onClick={openUpgradeModal}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#14B8A6", fontFamily: "Lato", fontSize: "10px", padding: 0 }}
                      data-testid="sidebar-upgrade-link"
                    >
                      {t.upgrade.freeLabel} &middot; {t.upgrade.tooltipCta}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => logout()}
                title={t.shell.signOut}
                data-testid="sidebar-signout"
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#64748B", padding: "4px",
                  transition: "color 0.2s",
                  flexShrink: 0,
                  display: "flex", alignItems: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          className="hidden md:flex"
          onClick={() => setCollapsed(!collapsed)}
          data-testid="sidebar-collapse-toggle"
          style={{
            padding: "10px 0",
            background: "transparent",
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer",
            color: "#64748B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
            width: "100%",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#14B8A6")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      <main style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            height: "56px",
            background: "rgba(7,16,30,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            flexShrink: 0,
          }}
          data-testid="topbar"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="sidebar-toggle"
              style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: "4px", marginRight: "8px", display: "flex", alignItems: "center" }}
            >
              <Menu size={20} />
            </button>
            <span style={{ fontFamily: "Montserrat", fontSize: "11px", fontWeight: 700, color: "#14B8A6", letterSpacing: "1px" }}>
              DSCVR
            </span>
            <span style={{ color: "#334155", fontSize: "12px" }}>/</span>
            <span style={{ fontFamily: "Montserrat", fontSize: "11px", fontWeight: 600, color: "#94A3B8" }}>
              {pageTitle}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }} data-testid="app-content">
          {children}
        </div>
      </main>
    </div>
    </div>
  );
}

function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  if (!label) return <>{children}</>;
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ display: "inline-flex" }}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            style={{
              position: "absolute",
              left: "calc(100% + 10px)",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 600,
              background: "#0F2040",
              border: "1px solid rgba(20,184,166,0.25)",
              borderRadius: "6px",
              padding: "5px 10px",
              whiteSpace: "nowrap",
              fontFamily: "Montserrat",
              fontSize: "11px",
              fontWeight: 600,
              color: "#F1F5F9",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }}
          >
            {label}
            <div style={{
              position: "absolute", left: "-4px", top: "50%", transform: "translateY(-50%) rotate(45deg)",
              width: "7px", height: "7px", background: "#0F2040",
              borderLeft: "1px solid rgba(20,184,166,0.25)", borderBottom: "1px solid rgba(20,184,166,0.25)",
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ item, isActive, collapsed, onClick }: { item: any; isActive: boolean; collapsed: boolean; onClick: () => void }) {
  const btn = (
    <button
      data-testid={`nav-${item.key}`}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? "0" : "10px",
        width: "100%",
        padding: collapsed ? "9px 0" : "9px 12px",
        borderRadius: "7px",
        border: isActive ? "1px solid rgba(20,184,166,0.18)" : "1px solid transparent",
        background: isActive ? "rgba(20,184,166,0.1)" : "transparent",
        cursor: "pointer",
        transition: "background 0.15s",
        marginBottom: "2px",
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? "rgba(20,184,166,0.1)" : "transparent"; }}
    >
      <span style={{ color: isActive ? "#14B8A6" : "#94A3B8", width: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span style={{
            fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600,
            color: isActive ? "#F1F5F9" : "#94A3B8",
            flex: 1, textAlign: "left",
          }}>
            {item.label}
          </span>
          {item.badge !== undefined && item.badge > 0 && (
            <span style={{
              fontFamily: "Montserrat", fontSize: "9px", fontWeight: 700,
              background: "rgba(245,158,11,0.15)", color: "#F59E0B",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "10px", padding: "1px 6px", minWidth: "18px", textAlign: "center",
            }}>
              {item.badge}
            </span>
          )}
          {item.alertBadge !== undefined && item.alertBadge > 0 && (
            <span style={{
              fontFamily: "Montserrat", fontSize: "9px", fontWeight: 700,
              background: "#EF4444", color: "#FFFFFF",
              borderRadius: "10px", padding: "1px 6px", minWidth: "18px", textAlign: "center",
            }}>
              {item.alertBadge}
            </span>
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return <NavTooltip label={item.label}>{btn}</NavTooltip>;
  }
  return btn;
}

function LockedNavItem({ icon, label, collapsed }: { icon: ReactNode; label: string; collapsed: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { t } = useLanguage();
  const { openUpgradeModal } = useUpgradeModal();

  const inner = (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={openUpgradeModal}
      data-testid={`nav-locked-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? "0" : "10px",
        padding: collapsed ? "9px 0" : "9px 12px",
        borderRadius: "7px",
        opacity: 0.4,
        cursor: "pointer",
        filter: "grayscale(0.3)",
        marginBottom: "2px",
      }}>
        <span style={{ color: "#64748B", width: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
        {!collapsed && (
          <>
            <span style={{ fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600, color: "#64748B", flex: 1 }}>
              {label}
            </span>
            <Lock size={12} style={{ color: "#64748B", flexShrink: 0 }} />
          </>
        )}
      </div>

      {!collapsed && (
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              style={{
                position: "absolute", left: "calc(100% + 12px)", top: "50%",
                transform: "translateY(-50%)", zIndex: 500,
                background: "#0F2040", border: "1px solid rgba(20,184,166,0.3)",
                borderRadius: "8px", padding: "10px 14px", width: "180px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ fontFamily: "Montserrat", fontSize: "11px", fontWeight: 700, color: "#14B8A6", marginBottom: "4px" }}>
                {t.upgrade.proFeature}
              </div>
              <div style={{ fontFamily: "Lato", fontSize: "11px", color: "#94A3B8", lineHeight: 1.5, marginBottom: "8px" }}>
                {t.upgrade.tooltipBody}
              </div>
              <div style={{ fontFamily: "Montserrat", fontSize: "10px", fontWeight: 700, color: "#14B8A6", letterSpacing: "0.5px" }}>
                {t.upgrade.tooltipCta} &rarr;
              </div>
              <div style={{
                position: "absolute", left: "-5px", top: "50%", transform: "translateY(-50%) rotate(45deg)",
                width: "9px", height: "9px", background: "#0F2040",
                borderLeft: "1px solid rgba(20,184,166,0.3)", borderBottom: "1px solid rgba(20,184,166,0.3)",
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <NavTooltip label={`${label} (Pro)`}>
        {inner}
      </NavTooltip>
    );
  }
  return inner;
}
