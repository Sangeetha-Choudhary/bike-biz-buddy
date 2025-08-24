import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/components/Login";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import Leads from "@/components/Leads";
import Inventory from "@/components/Inventory";
import MatchEngine from "@/components/MatchEngine";
import Analytics from "@/components/Analytics";
import AdminPanel from "@/components/AdminPanel";
import StoreManagement from "@/components/StoreManagement";
import UserManagement from "@/components/UserManagement";
import ProcurementManagement from "@/components/ProcurementManagement";
import VehicleVerification from "@/components/VehicleVerification";
import BottomNavigation from "@/components/BottomNavigation";
import PermissionWrapper from "@/components/PermissionWrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { Package } from "lucide-react";

const queryClient = new QueryClient();

// Main application component that handles routing based on authentication
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const isMobile = useIsMobile();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Render page content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <PermissionWrapper permission="view_analytics">
            <Dashboard />
          </PermissionWrapper>
        );
      case "leads":
        return (
          <PermissionWrapper permission="view_leads">
            <Leads />
          </PermissionWrapper>
        );
      case "inventory":
        return (
          <PermissionWrapper permission="view_inventory">
            <Inventory />
          </PermissionWrapper>
        );
      case "match-engine":
        return (
          <PermissionWrapper permission="match_engine">
            <MatchEngine />
          </PermissionWrapper>
        );
      case "stores":
        return (
          <PermissionWrapper permission="manage_store">
            <StoreManagement />
          </PermissionWrapper>
        );
      case "users":
        return (
          <PermissionWrapper permission="manage_store_users">
            <UserManagement />
          </PermissionWrapper>
        );
      case "analytics":
        return (
          <PermissionWrapper permission="view_analytics">
            <Analytics />
          </PermissionWrapper>
        );
      case "admin":
        return (
          <PermissionWrapper role="global_admin">
            <AdminPanel />
          </PermissionWrapper>
        );
      case "procurement":
        return (
          <PermissionWrapper permission="manage_procurement">
            <ProcurementManagement />
          </PermissionWrapper>
        );
      case "vehicle-verification":
        return (
          <PermissionWrapper permission="verify_vehicles">
            <VehicleVerification />
          </PermissionWrapper>
        );
      default:
        return (
          <PermissionWrapper permission="view_analytics">
            <Dashboard />
          </PermissionWrapper>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation - Hidden on Mobile */}
      <div className="hidden lg:block">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">BikeBiz</h2>
              <p className="text-xs text-muted-foreground">{user?.role || 'User'}</p>
            </div>
          </div>
          <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isMobile ? 'pt-16 pb-20' : 'lg:ml-64'} min-h-screen`}>
        {renderPageContent()}
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden">
        <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
