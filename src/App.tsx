
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import OnboardingChat from "./pages/OnboardingChat";
import OnboardingSelection from "./pages/OnboardingSelection";
import OnboardingPaste from "./pages/OnboardingPaste";
import OnboardingResults from "./pages/OnboardingResults";
import Mirror from "./pages/Mirror";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import SpotifyCallback from "./pages/SpotifyCallback";
import YouTubeCallback from "./pages/YouTubeCallback";
import GoogleAuthTest from "./pages/GoogleAuthTest";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import Index from "./pages/Index";
import LandingV2 from "./pages/LandingV2";
import { useAuth } from "./contexts/AuthContext";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Homepage wrapper that redirects logged-in users with better state handling
const HomeWrapper = () => {
  const { user, isLoading, isNewUser } = useAuth();
  
  console.log("HomeWrapper render - isLoading:", isLoading, "user:", user?.email, "isNewUser:", isNewUser);
  
  // Show loading state while authentication is being determined
  if (isLoading) {
    console.log("HomeWrapper showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Only redirect authenticated users after loading is complete
  if (user && !isLoading) {
    console.log("User logged in after loading complete, isNewUser:", isNewUser);
    
    // Add a small delay to ensure AuthContext has fully processed user data
    // This prevents race conditions during OAuth callback processing
    setTimeout(() => {
      if (isNewUser) {
        console.log("Redirecting new user to onboarding");
        window.location.replace("/onboarding");
      } else {
        console.log("Redirecting existing user to mirror");
        window.location.replace("/mirror");
      }
    }, 100);
    
    // Show loading while redirect happens
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  console.log("No user, showing landing page");
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
          <Routes>
            <Route path="/" element={<HomeWrapper />} />
            <Route path="/landing-v2" element={<LandingV2 />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/google-auth-test" element={<GoogleAuthTest />} />
            {/* Separate callback routes for different OAuth flows */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/callback/spotify" element={<SpotifyCallback />} />
            <Route path="/auth/callback/youtube" element={<YouTubeCallback />} />
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
