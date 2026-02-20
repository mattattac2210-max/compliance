import { Eye, X } from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { useSupportMode } from "@/hooks/useSupportMode";

export function SupportModeBanner() {
  const { t } = useLanguage();
  const { isActive, targetEmail, exit, isExiting } = useSupportMode();

  if (!isActive) return null;

  return (
    <div
      data-testid="support-mode-banner"
      className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-black px-4 py-2 flex items-center justify-between text-sm font-medium"
    >
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span>
          {t.adminDashboard.supportBannerViewing}{" "}
          <strong>{targetEmail}</strong>
        </span>
        <span className="opacity-70 ml-2">
          {t.adminDashboard.supportBannerPrivacy}
        </span>
      </div>
      <button
        data-testid="button-exit-support"
        onClick={() => exit()}
        disabled={isExiting}
        className="bg-black/20 hover:bg-black/30 px-3 py-1 rounded text-xs font-semibold transition-colors"
      >
        {t.adminDashboard.supportBannerExit}
      </button>
    </div>
  );
}
