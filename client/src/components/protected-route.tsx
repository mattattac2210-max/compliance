import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import UpgradePage from "@/components/upgrade-page";

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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
      <div className="text-[#14B8A6] font-heading text-sm tracking-widest uppercase animate-pulse">Loading…</div>
    </div>
  );
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!user?.isPro) {
    return <UpgradePage />;
  }
  return <>{children}</>;
}
