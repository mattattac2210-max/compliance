import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { Link, Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  useEffect(() => { if (theme !== "light") setTheme("light"); }, []);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      navigate("/app");
    },
    onError: async (err: any) => {
      const msg = err?.message || "";
      if (msg.includes("loginError") || msg.includes("401")) {
        setError(t.auth.loginError);
      } else {
        setError(t.auth.loginError);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError(t.auth.emailRequired);
    if (!password) return setError(t.auth.passwordRequired);
    loginMutation.mutate();
  };

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/app" />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--bg)" }}>
      <Link to="/" data-testid="link-back-home">
        <button
          className="absolute top-5 left-5 flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-colors hover:opacity-80"
          style={{ color: "var(--t3)", background: "var(--surface)", border: "1px solid var(--accent-tint2)" }}
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </Link>
      <Card className="w-full max-w-md backdrop-blur-sm shadow-2xl" style={{ borderColor: "var(--accent-tint2)", background: "var(--surface)" }}>
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="text-2xl font-bold tracking-wider" style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}>DSCVR</div>
          <CardTitle className="text-lg" style={{ color: "var(--txt)", fontFamily: "var(--font-display)" }} data-testid="text-login-title">
            {t.auth.loginTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-500/20 rounded-md p-3" data-testid="text-login-error">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm" style={{ color: "var(--t2)" }}>{t.auth.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--t3)" }} />
                <Input
                  id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="pl-10"
                  style={{ background: "var(--surface2)", borderColor: "var(--accent-tint2)", color: "var(--txt)" }}
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm" style={{ color: "var(--t2)" }}>{t.auth.passwordLabel}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--t3)" }} />
                <Input
                  id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="pl-10"
                  style={{ background: "var(--surface2)", borderColor: "var(--accent-tint2)", color: "var(--txt)" }}
                  data-testid="input-password"
                />
              </div>
            </div>
            <Button
              type="submit" disabled={loginMutation.isPending}
              className="w-full tracking-wider"
              style={{ background: "var(--accent)", color: "var(--bg)", fontFamily: "var(--font-display)" }}
              data-testid="button-login"
            >
              {loginMutation.isPending ? "..." : t.auth.loginButton}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/register" className="text-sm transition-colors" style={{ color: "var(--accent)" }} data-testid="link-register">
              {t.auth.registerLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
