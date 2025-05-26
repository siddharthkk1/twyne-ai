
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import OnboardingChat from "@/pages/OnboardingChat";
import Mirror from "@/pages/Mirror";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import ScrollToTop from "@/components/ScrollToTop";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route element={<Layout />}>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/onboarding-chat" element={<OnboardingChat />} />
                <Route path="/mirror" element={<Mirror />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
            <Toaster />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
