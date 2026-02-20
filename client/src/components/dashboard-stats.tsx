import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/context";
import { useUpgradeModal } from "@/components/upgrade-modal";
import { FileCheck, Clock, AlertTriangle, Lock } from "lucide-react";
import type { Property, VaultDocument, VaultDocumentTemplate, StaffMember } from "@shared/schema";

export default function DashboardStats() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { openUpgradeModal } = useUpgradeModal();
  const isPro = user?.isPro;

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });

  const selectedPropertyId = properties[0]?.id;

  const { data: templates = [] } = useQuery<VaultDocumentTemplate[]>({
    queryKey: ["/api/vault/templates"],
    enabled: !!isPro,
  });

  const { data: documents = [] } = useQuery<VaultDocument[]>({
    queryKey: ["/api/vault", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const res = await fetch(`/api/vault?propertyId=${selectedPropertyId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!isPro && !!selectedPropertyId,
  });

  const { data: staffMembers = [] } = useQuery<StaffMember[]>({
    queryKey: ["/api/staff", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const res = await fetch(`/api/staff?propertyId=${selectedPropertyId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!isPro && !!selectedPropertyId,
  });

  const totalTemplates = templates.length;
  const uploadedCount = documents.filter(d => d.status === "uploaded" || d.status === "verified").length;
  const vaultPercent = totalTemplates > 0 ? Math.round((uploadedCount / totalTemplates) * 100) : 0;

  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringCount = documents.filter(d => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate);
    return exp > now && exp <= in90;
  }).length;

  const expiredCount = documents.filter(d => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) <= now;
  }).length;

  let complianceAlerts = 0;
  const selectedProp = properties.find(p => p.id === selectedPropertyId);
  if (selectedProp) {
    if (selectedProp.otaEntityName && selectedProp.entityName &&
        selectedProp.otaEntityName.toLowerCase().trim() !== selectedProp.entityName.toLowerCase().trim()) {
      complianceAlerts++;
    }
    if (selectedProp.landTitleType === "hgb" && selectedProp.landTitleExpiry) {
      const diff = Math.ceil((new Date(selectedProp.landTitleExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 365 * 2) complianceAlerts++;
    }
  }
  const activeStaff = staffMembers.filter(s => s.isActive);
  const bpjsGaps = activeStaff.filter(s =>
    s.bpjsKesehatanStatus === "not_registered" ||
    s.bpjsKetenagakerjaanStatus === "not_registered"
  );
  if (bpjsGaps.length > 0) complianceAlerts++;
  const kitasExpiring = activeStaff.filter(s => {
    if (!s.kitasExpiry) return false;
    const diff = Math.ceil((new Date(s.kitasExpiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 90;
  });
  complianceAlerts += kitasExpiring.length;

  const alertCount = expiringCount + expiredCount + complianceAlerts;

  const cards = [
    {
      icon: FileCheck,
      color: "#14B8A6",
      title: t.dashboard.vaultProgress,
      sub: t.dashboard.vaultProgressSub,
      value: isPro ? `${vaultPercent}%` : "—",
    },
    {
      icon: Clock,
      color: "#F59E0B",
      title: t.dashboard.expiringDocs,
      sub: t.dashboard.expiringDocsSub,
      value: isPro ? String(expiringCount) : "—",
    },
    {
      icon: AlertTriangle,
      color: "#EF4444",
      title: t.dashboard.activeAlerts,
      sub: t.dashboard.activeAlertsSub,
      value: isPro ? String(alertCount) : "—",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 md:px-14 py-5" data-testid="dashboard-stats">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border p-4 flex items-center gap-4 transition-colors"
          style={{
            borderColor: `${card.color}22`,
            background: `${card.color}08`,
          }}
          data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${card.color}18` }}
          >
            <card.icon className="w-5 h-5" style={{ color: card.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-heading font-bold tracking-wider uppercase" style={{ color: "var(--app-text-muted)" }}>
              {card.title}
            </div>
            <div className="text-xl font-heading font-black text-white leading-tight">
              {card.value}
            </div>
            <div className="text-[10px]" style={{ color: "var(--app-text-muted)" }}>
              {card.sub}
            </div>
          </div>
          {!isPro && (
            <button
              onClick={openUpgradeModal}
              className="flex-shrink-0 flex items-center gap-1 text-[9px] font-heading font-bold tracking-wider uppercase px-2 py-1 rounded-full border transition-colors hover:bg-[#14B8A6]/10"
              style={{ borderColor: "#14B8A622", color: "#14B8A6" }}
              data-testid={`button-unlock-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Lock className="w-3 h-3" />
              {t.dashboard.unlockPro}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
