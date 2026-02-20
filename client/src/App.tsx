import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/i18n/context";
import { ProtectedRoute, ProRoute } from "@/components/protected-route";
import { UpgradeModalProvider } from "@/components/upgrade-modal";
import AppShell from "@/components/app-shell";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import LandingPage from "@/pages/landing";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ProfilePage from "@/pages/profile";
import VaultPage from "@/pages/vault";
import TimelinePage from "@/pages/timeline";
import AlertsPage from "@/pages/alerts";
import AdminDashboardPage from "@/pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/app">
        <ProtectedRoute>
          <AppShell pageTitle="Dashboard" activeNav="compliance">
            <Dashboard />
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin-dashboard">
        <ProtectedRoute>
          <AdminDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/profile">
        <ProtectedRoute>
          <AppShell pageTitle="Profile" activeNav="profile">
            <ProfilePage />
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/vault">
        <ProtectedRoute>
          <AppShell pageTitle="Document Vault" activeNav="vault">
            <ProRoute>
              <VaultPage />
            </ProRoute>
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/timeline">
        <ProtectedRoute>
          <AppShell pageTitle="Compliance Timeline" activeNav="timeline">
            <ProRoute>
              <TimelinePage />
            </ProRoute>
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/alerts">
        <ProtectedRoute>
          <AppShell pageTitle="Alerts" activeNav="alerts">
            <ProRoute>
              <AlertsPage />
            </ProRoute>
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <TooltipProvider>
            <UpgradeModalProvider>
              <Toaster />
              <Router />
            </UpgradeModalProvider>
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
