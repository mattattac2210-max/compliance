import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { Link, Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--app-bg)" }}>
      <Card className="w-full max-w-md border-[#14B8A6]/20 bg-[#0F1A2E]/90 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="text-[#14B8A6] font-heading text-2xl font-bold tracking-wider">DSCVR</div>
          <CardTitle className="text-white font-heading text-lg" data-testid="text-login-title">
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
              <Label htmlFor="email" className="text-slate-300 text-sm">{t.auth.emailLabel}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="pl-10 bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm">{t.auth.passwordLabel}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="pl-10 bg-[#162036] border-[#14B8A6]/20 text-white placeholder:text-slate-500"
                  data-testid="input-password"
                />
              </div>
            </div>
            <Button
              type="submit" disabled={loginMutation.isPending}
              className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white font-heading tracking-wider"
              data-testid="button-login"
            >
              {loginMutation.isPending ? "..." : t.auth.loginButton}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/register" className="text-[#14B8A6] hover:text-[#5EEAD4] text-sm transition-colors" data-testid="link-register">
              {t.auth.registerLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
