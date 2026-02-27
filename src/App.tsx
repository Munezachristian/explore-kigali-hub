import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import Internships from "./pages/Internships";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Info from "./pages/Info";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Testimonials from "./pages/Testimonials";
import InformationCenters from "./pages/InformationCenters";
import InformationCenterDetail from "./pages/InformationCenterDetail";
import DashboardRedirect from "./pages/DashboardRedirect";
import Sitemap from "./pages/Sitemap";
import Volunteerism from "./pages/Volunteerism";
import UmurageKidsCenter from "./pages/UmurageKidsCenter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SeoHead } from "./components/SeoHead";
import { AdvertisementPopup } from "./components/AdvertisementPopup";
import WhatsAppButton from "./components/WhatsAppButton";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <SettingsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <SeoHead />
            <AdvertisementPopup />
            <WhatsAppButton />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/packages/:id" element={<PackageDetail />} />
              <Route path="/internships" element={<Internships />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/info" element={<Info />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/information-centers" element={<InformationCenters />} />
              <Route path="/information-centers/:id" element={<InformationCenterDetail />} />
              <Route path="/volunteerism" element={<Volunteerism />} />
              <Route path="/umurage-kids" element={<UmurageKidsCenter />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/manager" element={
                <ProtectedRoute requiredRole="tour_manager">
                  <ManagerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/accountant" element={
                <ProtectedRoute requiredRole="accountant">
                  <AccountantDashboard />
                </ProtectedRoute>
              } />
              <Route path="/client" element={
                <ProtectedRoute requiredRole="client">
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
