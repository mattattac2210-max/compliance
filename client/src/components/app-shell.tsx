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
  List, GitBranch, User, Settings, Lock, Menu, LogOut, ChevronLeft, ChevronRight, LayoutDashboard,
  Calendar, Scale, Layers, Square, Target
} from "lucide-react";

type PageTitleKey = "dashboard" | "profile" | "vault" | "calendar" | "timeline" | "alerts" | "disclaimers" | "glossary" | "workflows";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle: PageTitleKey;
  activeNav: string;
}

const EXPANDED_W = 240;
const COLLAPSED_W = 60;

export default function AppShell({ children, pageTitle, activeNav }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("dscvr-sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { openUpgradeModal } = useUpgradeModal();
  const [location, navigate] = useLocation();
  const searchString = useSearch();
  const tabParam = new URLSearchParams(searchString).get("tab");
  const sectionParam = new URLSearchParams(searchString).get("section");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    handler(mq);
    mq.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("dscvr-sidebar-collapsed", String(collapsed)); } catch {}
  }, [collapsed]);

  const sidebarW = collapsed ? COLLAPSED_W : EXPANDED_W;

  const computedActiveNav = useMemo(() => {
    if (location === "/vault") return "vault";
    if (location === "/calendar") return "calendar";
    if (location === "/timeline") return "timeline";
    if (location === "/alerts") return "alerts";
    if (location === "/disclaimers") return "disclaimers";
    if (location === "/glossary") return "glossary";
    if (location === "/workflows") return "workflows";
    if (location === "/profile") return "profile";
    if (location === "/admin-dashboard") return "admin-dashboard";
    if (location === "/app" || location === "/") {
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

  const calendarBadgeCount = vaultSummary?.expiring ?? 0;
  const totalAlertCount = (vaultSummary?.expired ?? 0) + (vaultSummary?.expiring ?? 0);

  const iconSize = 16;
  const navSections = useMemo(() => [
    {
      label: t.shell.sectionOverview,
      items: [
        { key: "dashboard", icon: <Target size={iconSize} />, label: t.shell.navDashboard, href: "/app", pro: false },
        { key: "compliance", icon: <CheckCircle size={iconSize} />, label: t.tabs.flow, href: "/app?tab=flow", pro: false },
        { key: "audit", icon: <Square size={iconSize} />, label: t.tabs.audit, href: "/app?tab=audit", pro: false },
        { key: "guide", icon: <BookOpen size={iconSize} />, label: t.tabs.guide, href: "/app?tab=guide", pro: false },
      ],
    },
    {
      label: t.shell.sectionTracking,
      items: [
        { key: "vault", icon: <Layers size={iconSize} />, label: t.nav.vault, href: "/vault", pro: true },
        { key: "calendar", icon: <Calendar size={iconSize} />, label: t.nav.calendar, href: "/calendar", pro: true, roundBadge: isPro ? calendarBadgeCount : undefined },
        { key: "timeline", icon: <Clock size={iconSize} />, label: t.nav.timeline, href: "/timeline", pro: true },
        { key: "alerts", icon: <AlertTriangle size={iconSize} />, label: t.nav.alerts, href: "/alerts", pro: true, roundBadge: isPro ? totalAlertCount : undefined },
      ],
    },
    {
      label: t.shell.sectionReference,
      items: [
        { key: "glossary", icon: <List size={iconSize} />, label: t.glossary.heading, href: "/glossary", pro: false },
        { key: "workflows", icon: <GitBranch size={iconSize} />, label: t.processNav.heading, href: "/workflows", pro: false },
        { key: "disclaimers", icon: <Scale size={iconSize} />, label: t.nav.disclaimers, href: "/disclaimers", pro: false },
      ],
    },
    {
      label: t.shell.sectionAccount,
      items: [
        { key: "profile", icon: <User size={iconSize} />, label: t.nav.profile, href: "/profile", pro: false },
        ...(user?.isAdmin ? [{ key: "admin-dashboard", icon: <Settings size={iconSize} />, label: t.adminDashboard.heading, href: "/admin-dashboard", pro: false }] : []),
      ],
    },
  ], [t, isPro, calendarBadgeCount, totalAlertCount, user?.isAdmin]);

  const handleNavClick = (item: any) => {
    const [path, qs] = item.href.split("?");
    if (path === "/app" && location === "/app") {
      window.history.replaceState(null, "", item.href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      navigate(item.href);
    }
    setSidebarOpen(false);
  };

  const displayName = user?.firstName || user?.email?.split("@")[0] || "";
  const userInitials = user?.firstName
    ? user.firstName.slice(0, 2).toUpperCase()
    : user?.email
      ? user.email.split("@")[0].slice(0, 2).toUpperCase()
      : "??";

  return (
    <div className="relative">
      {user?.isAdmin && <SupportModeBanner />}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : `${sidebarW}px 1fr`,
          height: "100vh",
          overflow: "hidden",
          transition: "grid-template-columns 0.2s ease",
        }}
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
          onClick={(e) => {
            if (!isMobile || !sidebarOpen) return;
            const el = e.target as HTMLElement;
            if (el.closest("button, a, [role='button']")) return;
            setSidebarOpen(false);
          }}
          style={{
            width: sidebarOpen ? `${EXPANDED_W}px` : `${sidebarW}px`,
            height: "100vh",
            background: "var(--sidebar)",
            borderRight: "1px solid var(--b)",
            display: isMobile ? (sidebarOpen ? "flex" : "none") : "flex",
            flexDirection: "column",
            overflow: "hidden",
            gridRow: isMobile ? undefined : "1 / -1",
          }}
          data-testid="app-sidebar"
        >
          {/* Logo */}
          <div style={{
            padding: collapsed ? "20px 0 14px" : "20px 18px 14px",
            borderBottom: "1px solid var(--b)",
            textAlign: collapsed ? "center" : "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: collapsed ? "0" : "10px", justifyContent: collapsed ? "center" : "flex-start" }}>
              <div style={{
                width: collapsed ? 28 : 34, height: collapsed ? 28 : 34,
                background: "var(--accent)", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Layers size={collapsed ? 14 : 18} style={{ color: "#fff" }} />
              </div>
              {!collapsed && (
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "22px", color: "var(--accent)", letterSpacing: "2px" }}>
                  DSCVR
                </div>
              )}
            </div>
            {!collapsed && (
              <div style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "3px", color: "var(--t3)", textTransform: "uppercase", marginTop: "6px" }}>
                {t.shell.complianceNavigator}
              </div>
            )}
          </div>

          {/* Property selector - hidden when collapsed */}
          {!collapsed && (
            <div style={{ padding: "12px 14px 8px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "8px", fontWeight: 700, letterSpacing: "2px", color: "var(--accent)", textTransform: "uppercase", marginBottom: "6px" }}>
                {t.shell.activeProperty}
              </div>
              {activeProperty ? (
                <button
                  onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
                  data-testid="sidebar-property-selector"
                  style={{
                    width: "100%",
                    background: "var(--sidebar2)",
                    border: "1px solid var(--accent-tint2)",
                    borderRadius: "7px",
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--accent-tint2)")}
                >
                  <span
                    style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {activeProperty.propertyName}{activeProperty.regency ? `, ${activeProperty.regency}` : ""}
                  </span>
                  <span style={{ color: "var(--t3)", fontSize: "10px", flexShrink: 0, marginLeft: "4px" }}>&#9662;</span>
                </button>
              ) : (
                <button
                  onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
                  data-testid="sidebar-add-property"
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600,
                    color: "var(--accent)", padding: "4px 0",
                  }}
                >
                  {t.shell.addProperty}
                </button>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "8px 6px" : "8px 10px" }} data-testid="sidebar-nav">
            {navSections.map((section) => (
              <div key={section.label} style={{ marginBottom: collapsed ? "12px" : "16px" }}>
                {!collapsed && (
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "8px", fontWeight: 700,
                    letterSpacing: "2.5px", color: "var(--t3)", textTransform: "uppercase",
                    padding: "0 8px", marginBottom: "6px",
                  }}>
                    {section.label}
                  </div>
                )}
                {collapsed && (
                  <div style={{ height: "1px", background: "var(--b2)", margin: "0 8px 8px" }} />
                )}
                {section.items.map((item) => {
                  const isLocked = item.pro && !isPro;
                  const isActive = computedActiveNav === item.key;

                  if (isLocked) {
                    return <LockedNavItem key={item.key} icon={item.icon} label={item.label} href={item.href} isActive={isActive} collapsed={collapsed} />;
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

            {/* INTELLIGENCE section with vault completion */}
            {isPro && !collapsed && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "8px", fontWeight: 700,
                  letterSpacing: "2.5px", color: "var(--t3)", textTransform: "uppercase",
                  padding: "0 8px", marginBottom: "6px",
                }}>
                  {t.shell.sectionIntelligence}
                </div>
                <div style={{
                  margin: "0 4px",
                  background: "var(--sidebar2)",
                  border: "1px solid var(--b)",
                  borderRadius: "7px",
                  padding: "12px 12px",
                }} data-testid="sidebar-vault-completion">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, color: "var(--t2)" }}>{t.shell.vaultCompletion}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 800, color: "var(--accent)" }}>{completionPct}%</span>
                  </div>
                  <div style={{ height: "4px", background: "var(--b)", borderRadius: "2px", overflow: "hidden", marginBottom: "6px" }}>
                    <div style={{
                      height: "100%",
                      width: `${completionPct}%`,
                      background: "var(--accent)",
                      borderRadius: "2px",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--t3)" }}>
                    {vaultSummary ? `${vaultSummary.uploaded ?? 0} of ${vaultSummary.total ?? 0} documents uploaded` : ""}
                  </div>
                </div>
              </div>
            )}
            {isPro && collapsed && (
              <div style={{ height: "1px", background: "var(--b2)", margin: "0 8px 8px" }} />
            )}
          </nav>

          {/* User footer */}
          <div style={{
            padding: collapsed ? "12px 0" : "12px 14px",
            borderTop: "1px solid var(--b)",
            display: "flex",
            alignItems: collapsed ? "center" : "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? "0" : "10px",
            flexDirection: collapsed ? "column" : "row",
          }} data-testid="sidebar-user-footer">
            <NavTooltip label={collapsed ? (user?.email ?? "") : ""}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: "1.5px solid var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700,
                color: "var(--accent)", background: "var(--accent-tint)", flexShrink: 0,
                cursor: collapsed ? "pointer" : "default",
              }}>
                {userInitials}
              </div>
            </NavTooltip>
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--txt)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {user?.email || displayName}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700 }}>
                    {isPro ? (
                      <span style={{ color: "var(--accent)" }}>{t.upgrade.proLabel}</span>
                    ) : (
                      <button
                        onClick={openUpgradeModal}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent)", fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, padding: 0 }}
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
                    color: "var(--t3)", padding: "4px",
                    transition: "color 0.2s",
                    flexShrink: 0,
                    display: "flex", alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
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
              borderTop: "1px solid var(--b)",
              cursor: "pointer",
              color: "var(--t3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s",
              width: "100%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t3)")}
            title={collapsed ? t.shell.expandSidebar : t.shell.collapseSidebar}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </aside>

        <main style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1, minHeight: 0 }}>
          <div
            style={{
              height: "56px",
              background: "var(--tp-bg)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--tp-b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              flexShrink: 0,
              position: "relative",
              zIndex: 100,
              overflow: "visible",
            }}
            data-testid="topbar"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="sidebar-toggle"
                style={{ background: "transparent", border: "none", color: "var(--t2)", cursor: "pointer", padding: "4px", marginRight: "8px", display: "flex", alignItems: "center" }}
              >
                <Menu size={20} />
              </button>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, color: "var(--accent)", letterSpacing: "1px" }}>
                DSCVR
              </span>
              <span style={{ color: "var(--charcoal)", fontSize: "12px" }}>/</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 600, color: "var(--t2)" }}>
                {t.shell[`pageTitle${pageTitle.charAt(0).toUpperCase()}${pageTitle.slice(1)}` as keyof typeof t.shell] || pageTitle}
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
              background: "var(--sidebar3)",
              border: "1px solid var(--accent-tint2)",
              borderRadius: "6px",
              padding: "5px 10px",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-display)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--txt)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }}
          >
            {label}
            <div style={{
              position: "absolute", left: "-4px", top: "50%", transform: "translateY(-50%) rotate(45deg)",
              width: "7px", height: "7px", background: "var(--sidebar3)",
              borderLeft: "1px solid var(--accent-tint2)", borderBottom: "1px solid var(--accent-tint2)",
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
        border: "1px solid transparent",
        background: isActive ? "var(--sb-active-bg)" : "transparent",
        borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
        cursor: "pointer",
        transition: "background 0.15s",
        marginBottom: "2px",
        position: "relative",
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--b2)"; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? "var(--sb-active-bg)" : "transparent"; }}
    >
      <span style={{ color: isActive ? "var(--accent)" : "var(--t2)", width: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span
            style={{
              fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: isActive ? 700 : 600,
              color: isActive ? "#ffffff" : "#ededed",
              flex: 1, textAlign: "left",
            }}>
            {item.label}
          </span>
          {item.roundBadge !== undefined && item.roundBadge > 0 && (
            <span style={{
              fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700,
              background: "#EF4444", color: "#FFFFFF",
              borderRadius: "50%", width: "20px", height: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {item.roundBadge}
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

function LockedNavItem({ icon, label, href, isActive, collapsed }: { icon: ReactNode; label: string; href: string; isActive: boolean; collapsed: boolean }) {
  const [, navigate] = useLocation();
  const [hovered, setHovered] = useState(false);
  const { t } = useLanguage();

  const inner = (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`nav-locked-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <button
        onClick={() => navigate(href)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? "0" : "10px",
          padding: collapsed ? "9px 0" : "9px 12px",
          borderRadius: "7px",
          cursor: "pointer",
          marginBottom: "2px",
          width: "100%",
          border: "1px solid transparent",
          borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
          background: isActive ? "var(--sb-active-bg)" : hovered ? "var(--b2)" : "transparent",
          transition: "background 0.15s",
        }}
        data-testid={`nav-locked-btn-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <span style={{ color: isActive ? "var(--accent)" : "var(--t3)", width: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
        {!collapsed && (
          <>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 600, color: isActive ? "var(--txt)" : "var(--t2)", flex: 1, textAlign: "left" }}>
              {label}
            </span>
            <Lock size={11} style={{ color: "var(--t3)", flexShrink: 0 }} />
          </>
        )}
      </button>

      {!collapsed && (
        <AnimatePresence>
          {hovered && !isActive && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              style={{
                position: "absolute", left: "calc(100% + 12px)", top: "50%",
                transform: "translateY(-50%)", zIndex: 500,
                background: "var(--sidebar3)", border: "1px solid var(--accent-tint2)",
                borderRadius: "8px", padding: "10px 14px", width: "180px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
              data-testid={`nav-locked-tooltip-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, color: "var(--accent)", marginBottom: "4px" }}>
                {t.upgrade.proFeature}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--t2)", lineHeight: 1.5, marginBottom: "8px" }}>
                {t.upgrade.tooltipBody}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.5px" }}>
                {t.upgrade.tooltipCta} &rarr;
              </div>
              <div style={{
                position: "absolute", left: "-5px", top: "50%", transform: "translateY(-50%) rotate(45deg)",
                width: "9px", height: "9px", background: "var(--sidebar3)",
                borderLeft: "1px solid var(--accent-tint2)", borderBottom: "1px solid var(--accent-tint2)",
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );

  if (collapsed) {
    return <NavTooltip label={`${label} (Pro)`}>{inner}</NavTooltip>;
  }
  return inner;
}
