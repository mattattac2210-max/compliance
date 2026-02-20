import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useSupportMode } from "@/hooks/useSupportMode";
import { Link } from "wouter";
import {
  Users, Shield, Crown, Eye, ArrowLeft,
  Search, ToggleLeft, ToggleRight, ClipboardList, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface AdminUser {
  id: string;
  email: string;
  isAdmin: boolean;
  isPro: boolean;
  proGrantedAt: string | null;
  proGrantedBy: string | null;
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

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tab, setTab] = useState<"users" | "log">("users");

  if (!user?.isAdmin) {
    return <div className="p-8 text-center" style={{ color: "var(--t2)" }}>Forbidden</div>;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--txt)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl" style={{ color: "var(--txt)" }} data-testid="text-admin-heading">{t.adminDashboard.heading}</h1>
          </div>
          <Link href="/app">
            <Button variant="ghost" size="sm" style={{ color: "var(--t2)" }} data-testid="link-back-to-app">
              <ArrowLeft className="h-4 w-4 mr-1" /> {t.adminDashboard.backToApp}
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "users" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab("users")}
            style={tab === "users" ? { background: "var(--accent)", color: "var(--txt)" } : { color: "var(--t2)" }}
            data-testid="tab-users"
          >
            <Users className="h-4 w-4 mr-1" /> {t.adminDashboard.usersTab}
          </Button>
          <Button
            variant={tab === "log" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab("log")}
            style={tab === "log" ? { background: "var(--accent)", color: "var(--txt)" } : { color: "var(--t2)" }}
            data-testid="tab-access-log"
          >
            <ClipboardList className="h-4 w-4 mr-1" /> {t.adminDashboard.accessLogTab}
          </Button>
        </div>

        {tab === "users" ? <UsersTab /> : <AccessLogTab />}
      </div>
    </div>
  );
}

function UsersTab() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const supportMode = useSupportMode();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const toggleAdminMutation = useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      apiRequest("PATCH", `/api/admin/users/${id}/admin`, { isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-log"] });
    },
  });

  const toggleProMutation = useMutation({
    mutationFn: ({ id, isPro }: { id: string; isPro: boolean }) =>
      apiRequest("PATCH", `/api/admin/users/${id}/pro`, { isPro }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-log"] });
    },
  });

  const enterSupportMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest("POST", `/api/admin/support/enter/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-log"] });
    },
  });

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    pro: users.filter(u => u.isPro).length,
    admin: users.filter(u => u.isAdmin).length,
    support: users.filter(u => u.hasSupportAccess).length,
  };

  return (
    <div className="space-y-4">
      {supportMode.isActive && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between" data-testid="support-mode-inline-banner">
          <div className="flex items-center gap-2 text-sm text-amber-300">
            <Eye className="h-4 w-4" />
            <span>{t.adminDashboard.supportBannerViewing} <strong>{supportMode.targetEmail}</strong></span>
            <span className="text-amber-500/60 ml-2">{t.adminDashboard.supportBannerPrivacy}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => supportMode.exit()}
            disabled={supportMode.isExiting}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            data-testid="button-exit-support-inline"
          >
            {t.adminDashboard.exitSupport}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={t.adminDashboard.totalUsers} value={stats.total} icon={<Users className="h-4 w-4" />} />
        <StatCard label={t.adminDashboard.proUsers} value={stats.pro} icon={<Crown className="h-4 w-4 text-amber-400" />} />
        <StatCard label={t.adminDashboard.adminUsers} value={stats.admin} icon={<Shield className="h-4 w-4 text-blue-400" />} />
        <StatCard label={t.adminDashboard.supportGrants} value={stats.support} icon={<Eye className="h-4 w-4 text-green-400" />} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--t3)" }} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.adminDashboard.searchPlaceholder}
          className="pl-10"
          style={{ background: "var(--surface)", borderColor: "var(--b)", color: "var(--txt)" }}
          data-testid="input-search-users"
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-center py-8" style={{ color: "var(--t3)" }}>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-users">
            <thead>
              <tr className="text-left" style={{ borderBottom: "1px solid var(--b)" }}>
                <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.emailColumn}</th>
                <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.roleColumn}</th>
                <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.proColumn}</th>
                <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.propertiesColumn}</th>
                <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.supportColumn}</th>
                <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.lastLoginColumn}</th>
                <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.actionsColumn}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="hover:opacity-80" style={{ borderBottom: "1px solid var(--b)" }} data-testid={`row-user-${u.id}`}>
                  <td className="py-2 px-3" style={{ color: "var(--txt)" }}>
                    {u.email}
                    {u.id === currentUser?.id && <span className="text-xs ml-1" style={{ color: "var(--t3)" }}>{t.adminDashboard.selfLabel}</span>}
                  </td>
                  <td className="py-2 px-3">
                    {u.isAdmin ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Admin</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--b)", color: "var(--t2)" }}>User</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {u.isPro ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Pro</span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--t3)" }}>Free</span>
                    )}
                  </td>
                  <td className="py-2 px-3" style={{ color: "var(--t2)" }}>{u.propertyCount}</td>
                  <td className="py-2 px-3">
                    {u.hasSupportAccess ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400"><Check className="h-3 w-3" /></span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--t4)" }}>—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs" style={{ color: "var(--t3)" }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : t.adminDashboard.neverLabel}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.id !== currentUser?.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(t.adminDashboard.confirmAdminToggle)) {
                                toggleAdminMutation.mutate({ id: u.id, isAdmin: !u.isAdmin });
                              }
                            }}
                            disabled={toggleAdminMutation.isPending}
                            className="h-7 px-2 text-xs"
                            data-testid={`button-toggle-admin-${u.id}`}
                          >
                            {u.isAdmin ? <ToggleRight className="h-3 w-3 mr-1 text-blue-400" /> : <ToggleLeft className="h-3 w-3 mr-1" />}
                            {t.adminDashboard.toggleAdmin}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(t.adminDashboard.confirmProToggle)) {
                                toggleProMutation.mutate({ id: u.id, isPro: !u.isPro });
                              }
                            }}
                            disabled={toggleProMutation.isPending}
                            className="h-7 px-2 text-xs"
                            data-testid={`button-toggle-pro-${u.id}`}
                          >
                            {u.isPro ? <ToggleRight className="h-3 w-3 mr-1 text-amber-400" /> : <ToggleLeft className="h-3 w-3 mr-1" />}
                            {t.adminDashboard.togglePro}
                          </Button>
                        </>
                      )}
                      {u.hasSupportAccess && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => enterSupportMutation.mutate(u.id)}
                          disabled={enterSupportMutation.isPending}
                          className="h-7 px-2 text-xs text-green-400"
                          data-testid={`button-enter-support-${u.id}`}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {t.adminDashboard.enterSupport}
                        </Button>
                      )}
                      {!u.hasSupportAccess && u.id !== currentUser?.id && (
                        <span className="text-xs py-1" style={{ color: "var(--t4)" }}>{t.adminDashboard.noSupportAccess}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AccessLogTab() {
  const { t } = useLanguage();

  const { data: entries = [], isLoading } = useQuery<LogEntry[]>({
    queryKey: ["/api/admin/access-log"],
  });

  const actionLabels: Record<string, string> = {
    view_user_list: t.adminDashboard.actionViewUserList,
    grant_admin: t.adminDashboard.actionGrantAdmin,
    revoke_admin: t.adminDashboard.actionRevokeAdmin,
    grant_pro: t.adminDashboard.actionGrantPro,
    revoke_pro: t.adminDashboard.actionRevokePro,
    enter_support_mode: t.adminDashboard.actionEnterSupport,
    exit_support_mode: t.adminDashboard.actionExitSupport,
    view_properties: t.adminDashboard.actionViewProperties,
    view_vault: t.adminDashboard.actionViewVault,
  };

  if (isLoading) {
    return <div className="text-sm text-center py-8" style={{ color: "var(--t3)" }}>Loading...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-10 w-10 mx-auto mb-2" style={{ color: "var(--t4)" }} />
        <p className="text-sm" style={{ color: "var(--t3)" }}>{t.adminDashboard.logNoEntries}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="access-log-table">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ borderBottom: "1px solid var(--b)" }}>
            <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.logTime}</th>
            <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.logAdmin}</th>
            <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.logAction}</th>
            <th className="py-2 px-3 font-normal" style={{ color: "var(--t2)" }}>{t.adminDashboard.logTarget}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id} style={{ borderBottom: "1px solid var(--b)" }} data-testid={`row-log-${entry.id}`}>
              <td className="py-2 px-3 text-xs" style={{ color: "var(--t3)" }}>
                {new Date(entry.timestamp).toLocaleString()}
              </td>
              <td className="py-2 px-3 text-xs" style={{ color: "var(--t2)" }}>{entry.adminEmail || entry.adminId}</td>
              <td className="py-2 px-3">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--b)", color: "var(--t2)" }}>
                  {actionLabels[entry.action] || entry.action}
                </span>
              </td>
              <td className="py-2 px-3 text-xs" style={{ color: "var(--t2)" }}>
                {entry.targetUserId === entry.adminId
                  ? t.adminDashboard.selfLabel
                  : (entry.targetEmail || entry.targetUserId)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card style={{ borderColor: "var(--b)", background: "var(--surface)" }}>
      <CardContent className="py-3 px-4 flex items-center gap-3">
        <div style={{ color: "var(--t2)" }}>{icon}</div>
        <div>
          <div className="text-xl font-heading" style={{ color: "var(--txt)" }}>{value}</div>
          <div className="text-xs" style={{ color: "var(--t3)" }}>{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
