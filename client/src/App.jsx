import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Lazy-loaded pages
const Login    = lazy(() => import("./features/auth/Login"));
const SignUp   = lazy(() => import("./features/auth/SignUp"));
const Dashboard = lazy(() => import("./features/dashboard/Dashboard"));
const Notes     = lazy(() => import("./features/notes/Notes"));
const Events    = lazy(() => import("./features/events/Events"));
const Leads     = lazy(() => import("./features/leads/Leads"));
const LeadDetail = lazy(() => import("./features/leads/LeadDetail"));
const ActivityPage = lazy(() => import("./features/activity/Activity"));
const Settings  = lazy(() => import("./features/settings/Settings"));

// Page loading fallback
const PageSkeleton = () => (
  <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
    {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: "var(--radius-xl)" }} />)}
  </div>
);

// Apply saved theme on first render
const ThemeApplier = () => {
  const mode = useSelector((s) => s.theme.mode);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode || "light");
  }, [mode]);
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeApplier />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            fontSize: "var(--font-size-sm)",
          },
          success: { iconTheme: { primary: "var(--color-success)", secondary: "#fff" } },
          error:   { iconTheme: { primary: "var(--color-danger)",  secondary: "#fff" } },
        }}
      />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/"       element={<Navigate to="/login" replace />} />

          {/* Protected app */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/notes"     element={<Notes />} />
              <Route path="/app/events"    element={<Events />} />
              <Route path="/app/leads"     element={<Leads />} />
              <Route path="/app/leads/:id" element={<LeadDetail />} />
              <Route path="/app/activity"  element={<ActivityPage />} />
              <Route path="/app/settings"  element={<Settings />} />
              <Route path="/app"           element={<Navigate to="/app/dashboard" replace />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
