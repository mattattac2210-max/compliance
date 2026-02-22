import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, Crown, Activity, AlertTriangle,
  CheckCircle, Building2, Search, ChevronRight,
  Database, Radio, ExternalLink, Send,
  BarChart2, ArrowUpRight, ArrowDownRight, Minus,
  Newspaper, Check, X, Cpu, MemoryStick,
  Wifi, Server, Clock, Zap, AlertCircle,
  TrendingUp, Filter, Globe, MapPin,
  CalendarDays, Pencil, Eye, EyeOff, Save, RotateCw,
} from "lucide-react";
import type { CalendarEventTemplate } from "@shared/schema";

interface AdminUser {
  id: string;
  email: string;
  isAdmin: boolean;
  isPro: boolean;
  proGrantedAt: string | null;
  createdAt: string;
  lastLogin: string | null;
  hasSupportAccess: boolean;
  propertyCount: number;
}

interface LogEntry {
  id: string;
  adminId: string;
  targetUserId: string;
  action: string;
  timestamp: string;
  metadata: Record<string, string> | null;
  adminEmail?: string;
  targetEmail?: string;
}

interface PlatformHealth {
  status: "healthy" | "degraded" | "error";
  uptime?: string;
  deploy?: { status: string; createdAt: string; finishedAt: string };
  cpu?: number;
  memory?: number;
  memoryMax?: number;
  requestsLastHour?: number;
  error?: string;
}

const INTEL_ITEMS = [
  {
    id: "1",
    source: "DJP / CoreTax",
    url: "https://pajak.go.id",
    title: "CoreTax portal scheduled maintenance \u2014 March 5\u20136",
    summary: "DJP has announced a 36-hour maintenance window. The filing portal will be offline.",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: "medium",
    regions: ["all"],
    gate: 4,
    status: "pending",
    whatChanged: "Maintenance banner added to CoreTax homepage. Page hash changed from a9f2c1 \u2192 b74d3e. New element: <div class=\"maintenance-notice\"> detecting scheduled downtime 2026-03-05T00:00 to 2026-03-06T12:00 WITA.",
    affected: ["PPh 21 monthly filing (due 10th)", "PPh 25 installment (due 15th)", "PPN monthly return (due 20th)"],
    suggestedActions: [
      "Push alert to all Pro users with Gate 4 obligations due March 5\u201320",
      "Advise users to file PPh 21 and PPh 25 before March 4",
      "Add calendar event: CoreTax offline March 5\u20136",
    ],
  },
  {
    id: "2",
    source: "OSS / BKPM",
    url: "https://oss.go.id",
    title: "NIB verification checklist updated \u2014 new photo requirement",
    summary: "OSS updated KBLI 55193 verification. New frontage photo requirement detected.",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    severity: "high",
    regions: ["Badung", "Gianyar", "Denpasar"],
    gate: 2,
    status: "pending",
    whatChanged: "OSS KBLI 55193 verification page hash changed from 3c8a12 \u2192 f91b44. New required upload field added: 'Foto tampak depan properti (maks 2MB, format JPG/PNG)'. Previously 6 required documents, now 7.",
    affected: ["All operators with pending NIB verification", "New PT PMA applicants in Badung/Gianyar/Denpasar", "Operators updating existing NIB"],
    suggestedActions: [
      "Notify all Pro users in affected regencies with Gate 2 incomplete",
      "Update vault document template to add 'Property frontage photo' as required",
      "Update Gate 2 checklist in compliance flow",
    ],
  },
  {
    id: "3",
    source: "Badung Regency",
    url: "https://badungkab.go.id",
    title: "PB1 hotel tax rate confirmed unchanged \u2014 Q2 2026",
    summary: "Badung Regency website updated with Q2 2026 tax schedule. Rate remains 10%.",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    severity: "low",
    regions: ["Badung"],
    gate: 4,
    status: "approved",
    whatChanged: "Q2 2026 PB1 schedule PDF replaced on Badung e-Gov portal. Hash changed from 2d1f09 \u2192 8a3c77. Content comparison: tax rate unchanged at 10%. Filing deadlines unchanged (20th of following month). No new requirements identified.",
    affected: ["Villa operators in Badung with PB1 obligations"],
    suggestedActions: [
      "No urgent action required \u2014 confirmation only",
      "Update compliance terms last-verified date for PB1 Badung",
    ],
  },
  {
    id: "4",
    source: "BPJS Kesehatan",
    url: "https://bpjs-kesehatan.go.id",
    title: "eDabu portal upgrade \u2014 new NPWP authentication flow",
    summary: "eDabu login redesigned. NPWP-based re-authentication now required.",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    severity: "medium",
    regions: ["all"],
    gate: 5,
    status: "sent",
    whatChanged: "eDabu login page completely redesigned. Previous username/password flow replaced with NPWP + password authentication. Session cookie name changed from 'edabu_sess' to 'edabu_v2_sess'. All existing sessions invalidated.",
    affected: ["All operators with staff enrolled in BPJS Kesehatan", "Monthly contribution payment workflow"],
    suggestedActions: [
      "Alert all Pro users: re-login to eDabu required with company NPWP",
      "Update Step-by-Step guide for BPJS Kesehatan monthly payment",
    ],
  },
];

const MONITORED_SITES = [
  { name: "OSS Portal", url: "oss.go.id", status: "changed", lastCheck: "8h ago", gate: 2, changeId: "2" },
  { name: "CoreTax (DJP)", url: "pajak.go.id", status: "changed", lastCheck: "2h ago", gate: 4, changeId: "1" },
  { name: "eDabu (BPJS Kesehatan)", url: "bpjs-kesehatan.go.id", status: "ok", lastCheck: "10m ago", gate: 5, changeId: "4" },
  { name: "e-Palapa (Badung)", url: "e-palapa.badungkab.go.id", status: "ok", lastCheck: "10m ago", gate: 4, changeId: null },
  { name: "SIPP Online (Jamsostek)", url: "sipp.bpjsketenagakerjaan.go.id", status: "ok", lastCheck: "10m ago", gate: 5, changeId: null },
  { name: "Badung e-Gov", url: "badungkab.go.id", status: "ok", lastCheck: "10m ago", gate: 7, changeId: "3" },
  { name: "LKPM (OSS)", url: "oss.go.id/lkpm", status: "ok", lastCheck: "10m ago", gate: 4, changeId: null },
  { name: "Satpol PP Badung", url: "satpolpp.badungkab.go.id", status: "unknown", lastCheck: "1d ago", gate: 6, changeId: null },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(iso: string | null, short = false) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-AU", short
    ? { day: "numeric", month: "short" }
    : { day: "numeric", month: "short", year: "numeric" });
}

const C = {
  accent: "#E8192C",
  pro: "#D97706",
  free: "#3B82F6",
  green: "#16A34A",
  purple: "#7C3AED",
  t3: "#64748B",
};

function KPI({ label, value, sub, icon, color = C.accent, trend, large }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color?: string;
  trend?: "up" | "down" | "flat"; large?: boolean;
}) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--b)",
      borderRadius: 12, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 10,
    }} data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)" }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <span style={{ fontSize: large ? 34 : 28, fontWeight: 900, color: "var(--txt)", lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</span>
        {trend && (
          <span style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: trend === "up" ? C.green : trend === "down" ? C.accent : "var(--t3)", display: "flex", alignItems: "center", gap: 2 }}>
            {trend === "up" ? <ArrowUpRight size={13} /> : trend === "down" ? <ArrowDownRight size={13} /> : <Minus size={13} />}
          </span>
        )}
      </div>
      {sub && <span style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.4 }}>{sub}</span>}
    </div>
  );
}

function SectionHead({ label, badge }: { label: string; badge?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--t3)" }}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>{badge}</span>
      )}
    </div>
  );
}

function SeverityPill({ sev }: { sev: string }) {
  const m: Record<string, [string, string]> = {
    high: ["rgba(239,68,68,0.12)", "#EF4444"],
    medium: ["rgba(217,119,6,0.12)", "#D97706"],
    low: ["rgba(22,163,74,0.12)", "#16A34A"],
  };
  const [bg, fg] = m[sev] || m.low;
  return <span style={{ background: bg, color: fg, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4 }}>{sev}</span>;
}

function StatusPill({ status }: { status: string }) {
  const m: Record<string, [string, string, string]> = {
    pending: ["rgba(217,119,6,0.12)", "#D97706", "Pending Review"],
    approved: ["rgba(22,163,74,0.12)", "#16A34A", "Approved"],
    sent: ["rgba(37,99,235,0.12)", "#3B82F6", "Sent"],
    dismissed: ["rgba(100,116,139,0.12)", "#94A3B8", "Dismissed"],
  };
  const [bg, fg, label] = m[status] || m.pending;
  return <span style={{ background: bg, color: fg, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4 }}>{label}</span>;
}

const CHART_TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--b)",
  borderRadius: 8,
  fontSize: 11,
  color: "var(--txt)",
};

function OverviewTab({ users }: { users: AdminUser[] }) {
  const total = users.length;
  const pro = users.filter(u => u.isPro).length;
  const free = total - pro;
  const activeWeek = users.filter(u => u.lastLogin && Date.now() - new Date(u.lastLogin).getTime() < 7 * 86400000).length;
  const withProp = users.filter(u => u.propertyCount > 0).length;
  const convRate = total > 0 ? Math.round((pro / total) * 100) : 0;

  const signupByDay = useMemo(() => {
    const map = new Map<string, { date: string; signups: number; proTotal: number }>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
      map.set(key, { date: key, signups: 0, proTotal: 0 });
    }
    users.forEach(u => {
      const d = new Date(u.createdAt);
      const key = d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
      if (map.has(key)) {
        const entry = map.get(key)!;
        entry.signups++;
        if (u.isPro) entry.proTotal++;
      }
    });
    return Array.from(map.values());
  }, [users]);

  const cumulativeData = useMemo(() => {
    let totalRun = 0, proRun = 0;
    return signupByDay.map(d => {
      totalRun += d.signups;
      proRun += d.proTotal;
      return { ...d, cumulativeTotal: totalRun, cumulativePro: proRun };
    });
  }, [signupByDay]);

  const planData = [
    { name: "Pro", value: pro, color: C.pro },
    { name: "Free", value: free, color: C.free },
  ];

  const activityData = [
    { name: "Active 7d", value: activeWeek, color: C.green },
    { name: "Active 30d", value: users.filter(u => u.lastLogin && Date.now() - new Date(u.lastLogin).getTime() < 30 * 86400000).length - activeWeek, color: "#60A5FA" },
    { name: "Inactive", value: total - users.filter(u => u.lastLogin && Date.now() - new Date(u.lastLogin).getTime() < 30 * 86400000).length, color: "var(--b)" },
  ];

  const atRisk = users.filter(u => u.isPro && (!u.lastLogin || Date.now() - new Date(u.lastLogin).getTime() > 14 * 86400000));
  const recentSignups = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <KPI label="Total Users" value={total} icon={<Users size={15} />} color={C.accent} large />
        <KPI label="Pro Members" value={pro} sub={`${convRate}% conversion rate`} icon={<Crown size={15} />} color={C.pro} trend="up" />
        <KPI label="Free Users" value={free} sub={`${total - withProp} not onboarded`} icon={<Users size={15} />} color={C.free} />
        <KPI label="Active This Week" value={activeWeek} sub={`${total > 0 ? Math.round(activeWeek / total * 100) : 0}% of all users`} icon={<Activity size={15} />} color={C.green} />
        <KPI label="With Property" value={withProp} sub="completed onboarding" icon={<Building2 size={15} />} color={C.purple} />
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: "20px 20px 12px" }}>
        <SectionHead label="User Growth \u2014 Last 30 Days" />
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={cumulativeData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gtotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.accent} stopOpacity={0.18} />
                <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gpro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.pro} stopOpacity={0.18} />
                <stop offset="95%" stopColor={C.pro} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--t3)" }} tickLine={false} interval={6} />
            <YAxis tick={{ fontSize: 10, fill: "var(--t3)" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="cumulativeTotal" name="Total" stroke={C.accent} fill="url(#gtotal)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="cumulativePro" name="Pro" stroke={C.pro} fill="url(#gpro)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: "20px 20px 12px" }}>
          <SectionHead label="Daily Signups" />
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={signupByDay} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--t3)" }} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 9, fill: "var(--t3)" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="signups" name="Signups" fill={C.accent} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: "20px 20px 12px" }}>
          <SectionHead label="Plan Split" />
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={planData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                {planData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: "20px 20px 12px" }}>
          <SectionHead label="Activity" />
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={activityData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                {activityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: 18 }}>
          <SectionHead label="Recent Signups" />
          {recentSignups.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--t3)" }}>No users yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentSignups.map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--txt)" }}>{u.email}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>{fmtDate(u.createdAt, true)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {u.isPro && <span style={{ background: "rgba(217,119,6,0.12)", color: C.pro, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>PRO</span>}
                    {u.propertyCount > 0 && <span style={{ background: "rgba(22,163,74,0.12)", color: C.green, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>{u.propertyCount}p</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: 18 }}>
          <SectionHead label="At Risk \u2014 Pro, Inactive 14d+" badge={atRisk.length} />
          {atRisk.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.green, fontSize: 12 }}>
              <CheckCircle size={14} /> All Pro users active recently
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {atRisk.map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--txt)" }}>{u.email}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>Last seen: {u.lastLogin ? timeAgo(u.lastLogin) : "never"}</div>
                  </div>
                  <AlertTriangle size={14} style={{ color: "#EF4444" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomersTab({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pro" | "free" | "inactive">("all");

  const toggleProMutation = useMutation({
    mutationFn: ({ id, isPro }: { id: string; isPro: boolean }) =>
      apiRequest("PATCH", `/api/admin/users/${id}/pro`, { isPro }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
  });

  const enterSupportMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("POST", `/api/admin/support/enter/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/support/status"] }),
  });

  const filtered = users.filter(u => {
    if (!u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "pro") return u.isPro;
    if (filter === "free") return !u.isPro;
    if (filter === "inactive") return !u.lastLogin || Date.now() - new Date(u.lastLogin).getTime() > 7 * 86400000;
    return true;
  });

  const funnelData = [
    { stage: "Registered", value: users.length },
    { stage: "Has Property", value: users.filter(u => u.propertyCount > 0).length },
    { stage: "Active 7d", value: users.filter(u => u.lastLogin && Date.now() - new Date(u.lastLogin).getTime() < 7 * 86400000).length },
    { stage: "Pro", value: users.filter(u => u.isPro).length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: "18px 20px 12px" }}>
        <SectionHead label="Onboarding Funnel" />
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "var(--t3)" }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "var(--t2)" }} tickLine={false} axisLine={false} width={90} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Bar dataKey="value" fill={C.accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email..."
            data-testid="input-search-customers"
            style={{
              width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8,
              background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 8,
              color: "var(--txt)", fontSize: 12, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        {(["all", "pro", "free", "inactive"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} data-testid={`button-filter-${f}`} style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
            border: "1px solid", textTransform: "capitalize",
            borderColor: filter === f ? "var(--accent)" : "var(--b)",
            background: filter === f ? "var(--accent)" : "var(--surface)",
            color: filter === f ? "#fff" : "var(--t2)",
          }}>
            {f} {filter === f && `(${filtered.length})`}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} data-testid="table-customers">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--b)" }}>
                {["Email", "Plan", "Properties", "Last Login", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--t3)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isInactive = !u.lastLogin || Date.now() - new Date(u.lastLogin).getTime() > 7 * 86400000;
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--b)" }} data-testid={`row-customer-${u.id}`}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--txt)" }}>
                      {u.email}
                      {u.id === currentUserId && <span style={{ fontSize: 9, color: "var(--t3)", marginLeft: 4 }}>(you)</span>}
                      {u.isAdmin && <span style={{ marginLeft: 6, background: "rgba(37,99,235,0.12)", color: "#3B82F6", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>ADMIN</span>}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {u.isPro
                        ? <span style={{ background: "rgba(217,119,6,0.12)", color: C.pro, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>PRO</span>
                        : <span style={{ background: "var(--b2)", color: "var(--t3)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>FREE</span>}
                    </td>
                    <td style={{ padding: "10px 14px", color: u.propertyCount > 0 ? "var(--txt)" : "var(--t4)" }}>
                      {u.propertyCount > 0 ? u.propertyCount : "\u2014"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ color: isInactive ? "#EF4444" : C.green, fontSize: 11 }}>
                        {u.lastLogin ? timeAgo(u.lastLogin) : "Never"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--t3)", whiteSpace: "nowrap" }}>
                      {fmtDate(u.createdAt, true)}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {u.id !== currentUserId && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => toggleProMutation.mutate({ id: u.id, isPro: !u.isPro })}
                            disabled={toggleProMutation.isPending}
                            data-testid={`button-toggle-pro-${u.id}`}
                            style={{
                              padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "1px solid",
                              borderColor: u.isPro ? "rgba(239,68,68,0.3)" : "rgba(217,119,6,0.3)",
                              background: u.isPro ? "rgba(239,68,68,0.08)" : "rgba(217,119,6,0.08)",
                              color: u.isPro ? "#EF4444" : C.pro,
                            }}
                          >
                            {u.isPro ? "Revoke Pro" : "Grant Pro"}
                          </button>
                          {u.hasSupportAccess && (
                            <button
                              onClick={() => enterSupportMutation.mutate(u.id)}
                              data-testid={`button-view-as-${u.id}`}
                              style={{ padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "1px solid rgba(22,163,74,0.3)", background: "rgba(22,163,74,0.08)", color: C.green }}
                            >
                              View as
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--t3)", fontSize: 12 }}>No users match filters</div>
        )}
      </div>
    </div>
  );
}

function IntelligenceTab() {
  const [intel, setIntel] = useState(INTEL_ITEMS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState<"all" | "changed" | "ok">("all");

  const pending = intel.filter(i => i.status === "pending").length;
  const filteredSites = MONITORED_SITES.filter(s => siteFilter === "all" || s.status === siteFilter);

  const approve = (id: string) => setIntel(p => p.map(i => i.id === id ? { ...i, status: "approved" } : i));
  const send = (id: string) => setIntel(p => p.map(i => i.id === id ? { ...i, status: "sent" } : i));
  const dismiss = (id: string) => setIntel(p => p.map(i => i.id === id ? { ...i, status: "dismissed" } : i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Radio size={14} style={{ color: "var(--accent)" }} />
            <SectionHead label={`Government Site Monitor \u2014 ${MONITORED_SITES.filter(s => s.status === "ok").length}/${MONITORED_SITES.length} clear`} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "changed", "ok"] as const).map(f => (
              <button key={f} onClick={() => setSiteFilter(f)} data-testid={`button-site-filter-${f}`} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer",
                border: "1px solid", textTransform: "capitalize",
                borderColor: siteFilter === f ? "var(--accent)" : "var(--b)",
                background: siteFilter === f ? "var(--accent)" : "transparent",
                color: siteFilter === f ? "#fff" : "var(--t3)",
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {filteredSites.map(site => {
            const linkedIntel = site.changeId ? intel.find(i => i.id === site.changeId) : null;
            return (
              <div
                key={site.name}
                onClick={() => site.changeId && setExpanded(site.changeId)}
                style={{
                  padding: "10px 14px", borderRadius: 8, cursor: site.changeId ? "pointer" : "default",
                  background: site.status === "changed" ? "rgba(217,119,6,0.06)" : site.status === "unknown" ? "rgba(100,116,139,0.06)" : "var(--bg2)",
                  border: `1px solid ${site.status === "changed" ? "rgba(217,119,6,0.25)" : site.status === "unknown" ? "rgba(100,116,139,0.18)" : "var(--b)"}`,
                  transition: "opacity 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--txt)" }}>{site.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: site.status === "ok" ? C.green : site.status === "changed" ? "#D97706" : "#94A3B8" }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>Gate {site.gate} · {site.lastCheck}</div>
                {site.status === "changed" && (
                  <div style={{ fontSize: 10, color: "#D97706", fontWeight: 700, marginTop: 4 }}>
                    {linkedIntel ? `${linkedIntel.status === "sent" ? "\u2713 Sent" : linkedIntel.status === "approved" ? "\u2713 Approved" : "! Needs review"} \u2014 click to view` : "Change detected"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHead label="Regulatory Intelligence Feed" badge={pending} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {intel.map(item => {
            const isExpanded = expanded === item.id;
            return (
              <div key={item.id} data-testid={`intel-item-${item.id}`} style={{
                background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12,
                overflow: "hidden", opacity: item.status === "dismissed" ? 0.45 : 1,
              }}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                  style={{ padding: 18, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--txt)" }}>{item.title}</span>
                        <SeverityPill sev={item.severity} />
                        <StatusPill status={item.status} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <Globe size={10} style={{ color: "var(--t3)" }} />
                        <span style={{ fontSize: 10, color: "var(--t3)" }}>{item.source}</span>
                        <span style={{ color: "var(--t4)" }}>\u00b7</span>
                        <span style={{ fontSize: 10, color: "var(--t3)" }}>Gate {item.gate}</span>
                        <span style={{ color: "var(--t4)" }}>\u00b7</span>
                        <MapPin size={10} style={{ color: "var(--t3)" }} />
                        <span style={{ fontSize: 10, color: "var(--t3)" }}>{item.regions.includes("all") ? "All regions" : item.regions.join(", ")}</span>
                        <span style={{ color: "var(--t4)" }}>\u00b7</span>
                        <Clock size={10} style={{ color: "var(--t3)" }} />
                        <span style={{ fontSize: 10, color: "var(--t3)" }}>{timeAgo(item.detectedAt)}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, margin: "8px 0 0" }}>{item.summary}</p>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--t3)", flexShrink: 0, marginTop: 2 }}>
                      {isExpanded ? "\u25b2" : "\u25bc"}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--b)", background: "var(--bg2)" }}>
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--b)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8 }}>
                        What Changed
                      </div>
                      <div style={{
                        fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "var(--t2)",
                        background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 6,
                        padding: "10px 14px", lineHeight: 1.7,
                      }}>
                        {item.whatChanged}
                      </div>
                    </div>

                    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--b)" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8 }}>
                        What's Affected
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {item.affected.map((a, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <AlertCircle size={12} style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontSize: 12, color: "var(--t2)" }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ padding: "14px 18px", borderBottom: item.status !== "dismissed" ? "1px solid var(--b)" : undefined }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8 }}>
                        Suggested Actions
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {item.suggestedActions.map((a, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontSize: 12, color: C.green, flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                            <span style={{ fontSize: 12, color: "var(--t2)" }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(item.status === "pending" || item.status === "approved") && (
                      <div style={{ padding: "12px 18px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {item.status === "pending" && (
                          <button onClick={() => approve(item.id)} data-testid={`button-approve-${item.id}`} style={{
                            padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                            border: "1px solid rgba(22,163,74,0.3)", background: "rgba(22,163,74,0.08)", color: C.green,
                            display: "flex", alignItems: "center", gap: 5,
                          }}>
                            <Check size={11} /> Approve
                          </button>
                        )}
                        <button onClick={() => send(item.id)} data-testid={`button-send-${item.id}`} style={{
                          padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                          border: "1px solid rgba(37,99,235,0.3)", background: "rgba(37,99,235,0.08)", color: "#3B82F6",
                          display: "flex", alignItems: "center", gap: 5,
                        }}>
                          <Send size={11} /> {item.status === "pending" ? "Approve & Send" : "Send to Users"}
                        </button>
                        {item.status === "pending" && (
                          <button onClick={() => dismiss(item.id)} data-testid={`button-dismiss-${item.id}`} style={{
                            padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                            border: "1px solid var(--b)", background: "transparent", color: "var(--t3)",
                            display: "flex", alignItems: "center", gap: 5,
                          }}>
                            <X size={11} /> Dismiss
                          </button>
                        )}
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                          padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                          border: "1px solid var(--b)", background: "transparent", color: "var(--t3)",
                          display: "flex", alignItems: "center", gap: 5, textDecoration: "none",
                        }}>
                          <ExternalLink size={11} /> Open Portal
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlatformTab({ users }: { users: AdminUser[] }) {
  const { data: health } = useQuery<PlatformHealth>({
    queryKey: ["/api/admin/platform-health"],
    refetchInterval: 60000,
  });

  const { data: logEntries = [] } = useQuery<LogEntry[]>({
    queryKey: ["/api/admin/access-log"],
  });

  const cpuHistory = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${23 - i}h ago`,
      cpu: Math.random() * 30 + 5,
      memory: Math.random() * 40 + 20,
    })).reverse();
  }, []);

  const requestHistory = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: d.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
        requests: Math.floor(Math.random() * 200 + 50),
        errors: Math.floor(Math.random() * 10),
      };
    });
  }, []);

  const actionColors: Record<string, string> = {
    grant_pro: C.pro, revoke_pro: "#EF4444",
    grant_admin: "#3B82F6", revoke_admin: "#EF4444",
    enter_support_mode: C.green, exit_support_mode: "#94A3B8",
    view_user_list: "#64748B",
  };

  const healthCards = [
    {
      label: "API Service",
      value: health?.status === "healthy" ? "Healthy" : health?.status === "degraded" ? "Degraded" : "Unknown",
      sub: health?.uptime ? `Uptime: ${health.uptime}` : "Checking...",
      color: health?.status === "healthy" ? C.green : "#D97706",
      icon: <Server size={14} />,
    },
    {
      label: "Database",
      value: "Connected",
      sub: `${users.length} users \u00b7 PostgreSQL`,
      color: C.green,
      icon: <Database size={14} />,
    },
    {
      label: "File Storage",
      value: "Local Disk",
      sub: "\u26a0 Migrate to Supabase Storage",
      color: "#D97706",
      icon: <MemoryStick size={14} />,
    },
    {
      label: "Notifications",
      value: "Not Live",
      sub: "\u26a0 Alerts UI only \u2014 no delivery yet",
      color: "#EF4444",
      icon: <Wifi size={14} />,
    },
    {
      label: "Last Deploy",
      value: health?.deploy ? new Date(health.deploy.finishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "\u2014",
      sub: health?.deploy?.status || "Checking...",
      color: C.green,
      icon: <Zap size={14} />,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {healthCards.map(card => (
          <div key={card.label} data-testid={`health-${card.label.toLowerCase().replace(/\s+/g, "-")}`} style={{
            background: "var(--surface)", border: `1px solid ${card.color}28`,
            borderRadius: 12, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: card.color }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)" }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: card.color, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 10, color: "var(--t3)", lineHeight: 1.4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: "18px 18px 10px" }}>
          <SectionHead label="CPU & Memory \u2014 24h" />
          <div style={{ fontSize: 10, color: "#D97706", marginBottom: 8 }}>
            \u26a0 Simulated data \u2014 add RENDER_API_KEY for live metrics
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={cpuHistory} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "var(--t3)" }} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: "var(--t3)" }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Line type="monotone" dataKey="cpu" name="CPU" stroke={C.accent} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="memory" name="Memory" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, padding: "18px 18px 10px" }}>
          <SectionHead label="HTTP Requests \u2014 7 Days" />
          <div style={{ fontSize: 10, color: "#D97706", marginBottom: 8 }}>
            \u26a0 Simulated data \u2014 add RENDER_API_KEY for live metrics
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={requestHistory} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--t3)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--t3)" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="requests" name="Requests" fill={C.green} radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="errors" name="Errors" fill={C.accent} radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--b)" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--t3)" }}>
            Admin Action Log
          </span>
        </div>
        {logEntries.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--t3)", fontSize: 12 }}>No actions logged yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} data-testid="table-action-log">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--b)" }}>
                  {["Time", "Admin", "Action", "Target"].map(h => (
                    <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--t3)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logEntries.slice(0, 30).map(entry => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid var(--b)" }} data-testid={`row-log-${entry.id}`}>
                    <td style={{ padding: "8px 14px", color: "var(--t3)", fontSize: 11, whiteSpace: "nowrap" }}>
                      {new Date(entry.timestamp).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "8px 14px", color: "var(--t2)", fontSize: 11 }}>
                      {entry.adminEmail || entry.adminId?.slice(0, 8)}
                    </td>
                    <td style={{ padding: "8px 14px" }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        background: `${actionColors[entry.action] || "#64748B"}18`,
                        color: actionColors[entry.action] || "#64748B",
                        textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                      }}>
                        {entry.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "8px 14px", color: "var(--t2)", fontSize: 11 }}>
                      {entry.targetEmail || entry.targetUserId?.slice(0, 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const FREQ_LABELS: Record<string, string> = {
  monthly: "Monthly", quarterly: "Quarterly", annual: "Annual",
  "one-time": "One-time", holiday: "Holiday",
};

const TYPE_COLORS: Record<string, string> = {
  tax: "#F59E0B", bpjs: "#22C55E", banjar: "#E879F9", safety: "#FCA5A5",
  docs: "#A78BFA", ops: "#FB923C", ota: "#14B8A6",
};

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function CalendarTab() {
  const { data: templates = [], isLoading } = useQuery<CalendarEventTemplate[]>({
    queryKey: ["/api/calendar-templates"],
    queryFn: () => fetch("/api/calendar-templates", { credentials: "include" }).then(r => r.json()),
  });

  const [search, setSearch] = useState("");
  const [freqFilter, setFreqFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CalendarEventTemplate>>({});

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/calendar-templates/${id}`, { isActive });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/calendar-templates"] }),
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CalendarEventTemplate> }) => {
      await apiRequest("PATCH", `/api/calendar-templates/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-templates"] });
      setEditingId(null);
    },
  });

  const filtered = useMemo(() => {
    return templates.filter(t => {
      if (freqFilter !== "all" && t.frequency !== freqFilter) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return t.eventKey.toLowerCase().includes(s) ||
               t.titleEn.toLowerCase().includes(s) ||
               t.shortEn.toLowerCase().includes(s);
      }
      return true;
    });
  }, [templates, search, freqFilter, typeFilter]);

  const counts = useMemo(() => {
    const byFreq: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const t of templates) {
      byFreq[t.frequency] = (byFreq[t.frequency] || 0) + 1;
      byType[t.type] = (byType[t.type] || 0) + 1;
    }
    return { byFreq, byType, active: templates.filter(t => t.isActive).length, total: templates.length };
  }, [templates]);

  function startEdit(t: CalendarEventTemplate) {
    setEditingId(t.id);
    setEditForm({ dueDay: t.dueDay, dueMonth: t.dueMonth, titleEn: t.titleEn, shortEn: t.shortEn, descEn: t.descEn, titleUk: t.titleUk, shortUk: t.shortUk, titleId: t.titleId, shortId: t.shortId });
  }

  function saveEdit() {
    if (!editingId) return;
    updateTemplate.mutate({ id: editingId, updates: editForm });
  }

  if (isLoading) return <div style={{ padding: 40, textAlign: "center", color: "var(--t3)", fontSize: 13 }}>Loading templates...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Total", value: counts.total, color: "var(--accent)" },
          { label: "Active", value: counts.active, color: "#16A34A" },
          { label: "Inactive", value: counts.total - counts.active, color: "#EF4444" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 10, padding: "12px 18px", minWidth: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
          </div>
        ))}
        {Object.entries(counts.byFreq).map(([freq, count]) => (
          <div key={freq} style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 10, padding: "12px 18px", minWidth: 80 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--txt)" }}>{count}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{FREQ_LABELS[freq] || freq}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }} />
          <input
            data-testid="input-search-templates"
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search event key, title..."
            style={{ width: "100%", padding: "7px 10px 7px 30px", borderRadius: 7, border: "1px solid var(--b)", background: "var(--surface)", color: "var(--txt)", fontSize: 12, outline: "none" }}
          />
        </div>
        <select data-testid="select-freq-filter" value={freqFilter} onChange={e => setFreqFilter(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid var(--b)", background: "var(--surface)", color: "var(--txt)", fontSize: 12 }}>
          <option value="all">All Frequencies</option>
          {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select data-testid="select-type-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid var(--b)", background: "var(--surface)", color: "var(--txt)", fontSize: 12 }}>
          <option value="all">All Types</option>
          {Object.keys(TYPE_COLORS).map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
        </select>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--b)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--b)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionHead label={`Calendar Event Templates (${filtered.length})`} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} data-testid="table-calendar-templates">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--b)" }}>
                {["Active", "Key", "Title", "Type", "Freq", "Due", "Gate", "Actions"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const isEditing = editingId === t.id;
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--b)", opacity: t.isActive ? 1 : 0.5, background: isEditing ? "rgba(20,184,166,0.04)" : undefined }}>
                    <td style={{ padding: "8px 10px" }}>
                      <button
                        data-testid={`toggle-active-${t.eventKey}`}
                        onClick={() => toggleActive.mutate({ id: t.id, isActive: !t.isActive })}
                        style={{ background: "none", border: "none", cursor: "pointer", color: t.isActive ? "#16A34A" : "#EF4444", padding: 2 }}
                        title={t.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                      >
                        {t.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </td>
                    <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 11, color: "var(--accent)" }}>{t.eventKey}</td>
                    <td style={{ padding: "8px 10px", maxWidth: 240 }}>
                      {isEditing ? (
                        <input
                          data-testid="input-edit-title"
                          value={editForm.titleEn || ""}
                          onChange={e => setEditForm(f => ({ ...f, titleEn: e.target.value }))}
                          style={{ width: "100%", padding: "4px 6px", borderRadius: 4, border: "1px solid var(--accent)", background: "var(--bg)", color: "var(--txt)", fontSize: 11 }}
                        />
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{t.titleEn}</span>
                      )}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ background: `${TYPE_COLORS[t.type] || "#94A3B8"}22`, color: TYPE_COLORS[t.type] || "#94A3B8", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, textTransform: "uppercase" }}>{t.type}</span>
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 10, fontWeight: 600, color: "var(--t2)" }}>{FREQ_LABELS[t.frequency] || t.frequency}</td>
                    <td style={{ padding: "8px 10px", fontSize: 11 }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {(t.frequency !== "monthly") && (
                            <select
                              data-testid="select-edit-month"
                              value={editForm.dueMonth ?? ""}
                              onChange={e => setEditForm(f => ({ ...f, dueMonth: e.target.value === "" ? null : Number(e.target.value) }))}
                              style={{ padding: "3px 4px", borderRadius: 4, border: "1px solid var(--accent)", background: "var(--bg)", color: "var(--txt)", fontSize: 10, width: 50 }}
                            >
                              {MONTH_SHORT.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                          )}
                          <input
                            data-testid="input-edit-day"
                            type="number" min={1} max={31}
                            value={editForm.dueDay || ""}
                            onChange={e => setEditForm(f => ({ ...f, dueDay: Number(e.target.value) }))}
                            style={{ width: 36, padding: "3px 4px", borderRadius: 4, border: "1px solid var(--accent)", background: "var(--bg)", color: "var(--txt)", fontSize: 10, textAlign: "center" }}
                          />
                        </div>
                      ) : (
                        <span style={{ color: "var(--t2)" }}>
                          {t.frequency === "monthly" ? `Day ${t.dueDay}` : t.dueMonth !== null && t.dueMonth !== undefined ? `${MONTH_SHORT[t.dueMonth]} ${t.dueDay}` : `Day ${t.dueDay}`}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: 11, color: "var(--t2)" }}>G{t.gate}</td>
                    <td style={{ padding: "8px 10px" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button data-testid="button-save-edit" onClick={saveEdit} disabled={updateTemplate.isPending}
                            style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 4, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                            {updateTemplate.isPending ? <RotateCw size={10} className="animate-spin" /> : <Save size={10} />} Save
                          </button>
                          <button data-testid="button-cancel-edit" onClick={() => setEditingId(null)}
                            style={{ background: "rgba(255,255,255,0.06)", color: "var(--t2)", border: "1px solid var(--b)", borderRadius: 4, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button data-testid={`button-edit-${t.eventKey}`} onClick={() => startEdit(t)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", padding: 2 }} title="Edit">
                          <Pencil size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminControlRoom() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"overview" | "customers" | "intelligence" | "platform" | "calendar">("overview");

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  if (!user?.isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--t2)", fontSize: 14 }}>
        Access denied
      </div>
    );
  }

  const pendingIntel = INTEL_ITEMS.filter(i => i.status === "pending").length;

  const TABS = [
    { key: "overview" as const, label: "Overview", icon: <BarChart2 size={13} />, badge: undefined },
    { key: "customers" as const, label: "Customers", icon: <Users size={13} />, badge: users.length },
    { key: "intelligence" as const, label: "Intelligence", icon: <Radio size={13} />, badge: pendingIntel },
    { key: "calendar" as const, label: "Calendar", icon: <CalendarDays size={13} />, badge: undefined },
    { key: "platform" as const, label: "Platform", icon: <Server size={13} />, badge: undefined },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--txt)" }}>
      <div style={{
        height: 56, background: "var(--sidebar)", borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", position: "sticky", top: 0, zIndex: 50, gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff" }}>D</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>DSCVR</div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Control Room</div>
            </div>
          </div>
          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          <div style={{ display: "flex", gap: 2, overflow: "auto" }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} data-testid={`tab-${t.key}`} style={{
                padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: "none", display: "flex", alignItems: "center", gap: 5,
                background: tab === t.key ? "rgba(255,255,255,0.12)" : "transparent",
                color: tab === t.key ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "all 0.12s", whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {t.icon} {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span style={{
                    background: t.key === "intelligence" ? "var(--accent)" : "rgba(255,255,255,0.18)",
                    color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 10,
                  }}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => navigate("/app")} data-testid="button-back-to-app" style={{
          padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer",
          border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
        }}>
          <ChevronRight size={11} /> App
        </button>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--t3)", fontSize: 13 }}>Loading...</div>
        ) : (
          <>
            {tab === "overview" && <OverviewTab users={users} />}
            {tab === "customers" && <CustomersTab users={users} currentUserId={user.id} />}
            {tab === "intelligence" && <IntelligenceTab />}
            {tab === "calendar" && <CalendarTab />}
            {tab === "platform" && <PlatformTab users={users} />}
          </>
        )}
      </div>
    </div>
  );
}