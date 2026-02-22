import { Component, type ErrorInfo, type ReactNode } from "react";
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
import AdminControlRoom from "@/pages/admin-dashboard";
import CalendarPage from "@/pages/calendar";
import DisclaimersPage from "@/pages/disclaimers";
import GlossaryPage from "@/pages/glossary";
import WorkflowsPage from "@/pages/workflows";
import HowItWorksPage from "@/pages/how-it-works";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App Error Boundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", maxWidth: 600, margin: "80px auto", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 16, color: "#E8192C" }}>Something went wrong</h1>
          <p style={{ color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
            The application encountered an error. Please try refreshing the page.
          </p>
          <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, fontSize: 12, textAlign: "left", overflow: "auto", color: "#333", marginBottom: 20 }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 24px", background: "#E8192C", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/app">
        <ProtectedRoute>
          <AppShell pageTitle="dashboard" activeNav="compliance">
            <Dashboard />
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin-dashboard">
        <ProtectedRoute>
          <AdminControlRoom />
        </ProtectedRoute>
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/profile">
        <ProtectedRoute>
          <AppShell pageTitle="profile" activeNav="profile">
            <ProfilePage />
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/vault">
        <ProtectedRoute>
          <AppShell pageTitle="vault" activeNav="vault">
            <ProRoute>
              <VaultPage />
            </ProRoute>
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/calendar">
        <ProtectedRoute>
          <AppShell pageTitle="calendar" activeNav="calendar">
            <ProRoute>
              <CalendarPage />
            </ProRoute>
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/timeline">
        <ProtectedRoute>
          <AppShell pageTitle="timeline" activeNav="timeline">
            <ProRoute>
              <TimelinePage />
            </ProRoute>
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/alerts">
        <ProtectedRoute>
          <AppShell pageTitle="alerts" activeNav="alerts">
            <ProRoute>
              <AlertsPage />
            </ProRoute>
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/disclaimers">
        <ProtectedRoute>
          <AppShell pageTitle="disclaimers" activeNav="disclaimers">
            <DisclaimersPage />
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/glossary">
        <ProtectedRoute>
          <AppShell pageTitle="glossary" activeNav="glossary">
            <GlossaryPage />
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route path="/workflows">
        <ProtectedRoute>
          <AppShell pageTitle="workflows" activeNav="workflows">
            <WorkflowsPage />
          </AppShell>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
