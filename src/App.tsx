
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RedirectNewUser from "./components/RedirectNewUser";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import OnboardingChat from "./pages/OnboardingChat";
import OnboardingSelection from "./pages/OnboardingSelection";
import OnboardingPaste from "./pages/OnboardingPaste";
import OnboardingResults from "./pages/OnboardingResults";
import Mirror from "./pages/Mirror";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

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
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
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
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
