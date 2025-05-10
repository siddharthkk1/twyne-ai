
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
import Connections from "./pages/Connections";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RedirectNewUser />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingChat />
              </ProtectedRoute>
            } />
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/connections" element={<Connections />} />
              <Route path="/chat/:id" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
