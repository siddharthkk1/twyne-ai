import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RedirectNewUser from "./components/RedirectNewUser";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import OnboardingChat from "./pages/OnboardingChat";
import OnboardingSelection from "./pages/OnboardingSelection";
import OnboardingPaste from "./pages/OnboardingPaste";
import OnboardingResults from "./pages/OnboardingResults";
import Mirror from "./pages/Mirror";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import Index from "./pages/Index";
import LandingV2 from "./pages/LandingV2";
import { useAuth } from "./contexts/AuthContext";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Homepage wrapper that redirects logged-in users
const HomeWrapper = () => {
  const { user, isLoading, isNewUser } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (user) {
    // If user is new (no profile data), redirect to onboarding
    if (isNewUser) {
      return <Navigate to="/onboarding" />;
    }
    // Otherwise redirect to mirror
    return <Navigate to="/mirror" />;
  }
  
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <RedirectNewUser />
          <Routes>
            <Route path="/" element={<HomeWrapper />} />
            <Route path="/landing-v2" element={<LandingV2 />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            {/* Move auth callback route outside of protected routes */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* Onboarding routes without authentication protection */}
            <Route path="/onboarding" element={<OnboardingSelection />} />
            <Route path="/onboarding-chat" element={<OnboardingChat />} />
            <Route path="/onboarding-paste" element={<OnboardingPaste />} />
            <Route path="/onboarding-results" element={<OnboardingResults />} />
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/mirror" element={<Mirror />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
