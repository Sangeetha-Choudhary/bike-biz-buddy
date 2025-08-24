import { LayoutDashboard, Package, Users, BarChart3, Zap, Shield, Building, UserCog, Truck, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const BottomNavigation = ({ currentPage, onPageChange }: BottomNavigationProps) => {
  const { hasPermission } = useAuth();

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: "view_analytics"
    },
    {
      id: "leads",
      label: "Leads",
      icon: Users,
      permission: "view_leads"
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      permission: "view_inventory"
    },
    {
      id: "match-engine",
      label: "Match",
      icon: Zap,
      permission: "match_engine"
    },
    {
      id: "stores",
      label: "Stores",
      icon: Building,
      permission: "manage_store"
    },
    {
      id: "users",
      label: "Users",
      icon: UserCog,
      permission: "manage_store_users"
    },
    {
      id: "analytics",
      label: "Reports",
      icon: BarChart3,
      permission: "view_analytics"
    },
    {
      id: "procurement",
      label: "Procurement",
      icon: Truck,
      permission: "manage_procurement"
    },
    {
      id: "vehicle-verification",
      label: "Verify",
      icon: CheckSquare,
      permission: "verify_vehicles"
    }
  ];

  // Filter tabs based on user permissions
  const visibleTabs = tabs.filter(tab => hasPermission(tab.permission));

  // Add admin tab if user has admin permissions
  if (hasPermission('all')) {
    visibleTabs.push({
      id: "admin",
      label: "Admin",
      icon: Shield,
      permission: "all"
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-2 py-2 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center max-w-sm mx-auto">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onPageChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/10"
                  : "hover:bg-muted/50"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs font-medium truncate transition-all duration-200",
                isActive ? "text-primary font-semibold" : ""
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
