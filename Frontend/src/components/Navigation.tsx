import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Users,
  Package,
  Zap,
  BarChart3,
  LogOut,
  User,
  Settings,
  Shield,
  Bell,
  Menu,
  X,
  Crown,
  UserCheck,
  Eye,
  Building,
  UserCog,
  Truck,
  CheckSquare
} from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation = ({ currentPage, onPageChange }: NavigationProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return null;

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'view_analytics',
      adminOnly: false
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Users,
      permission: 'view_leads',
      adminOnly: false
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      permission: 'view_inventory',
      adminOnly: false
    },
    {
      id: 'match-engine',
      label: 'Match Engine',
      icon: Zap,
      permission: 'match_engine',
      adminOnly: false
    },
    {
      id: 'stores',
      label: 'Store Management',
      icon: Building,
      permission: 'manage_store',
      adminOnly: false
    },
    {
      id: 'users',
      label: 'User Management',
      icon: UserCog,
      permission: 'manage_store_users',
      adminOnly: false
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      permission: 'view_analytics',
      adminOnly: false
    },
    {
      id: 'procurement',
      label: 'Procurement',
      icon: Truck,
      permission: 'manage_procurement',
      adminOnly: false
    },
    {
      id: 'vehicle-verification',
      label: 'Vehicle Verification',
      icon: CheckSquare,
      permission: 'verify_vehicles',
      adminOnly: false
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      permission: 'all',
      adminOnly: true
    }
  ];

  const visibleItems = navigationItems.filter(item => {
    if (item.adminOnly && user.role !== 'global_admin') return false;
    // Hide Store Management for store_admin
    if (item.id === 'stores' && user.role === 'store_admin') return false;

    return hasPermission(item.permission);
  });

  const getRoleInfo = (role: string) => {
    const roleConfig = {
      global_admin: { label: 'Global Administrator', color: 'bg-red-500', icon: Crown },
      store_admin: { label: 'Store Admin', color: 'bg-blue-500', icon: UserCheck },
      sales_executive: { label: 'Sales Executive', color: 'bg-green-500', icon: User },
      procurement_admin: { label: 'Procurement Admin', color: 'bg-purple-500', icon: Truck },
      procurement_executive: { label: 'Procurement Executive', color: 'bg-orange-500', icon: CheckSquare },
      admin: { label: 'Administrator', color: 'bg-red-500', icon: Crown },
      manager: { label: 'Store Manager', color: 'bg-blue-500', icon: UserCheck },
      sales: { label: 'Sales Executive', color: 'bg-green-500', icon: User },
      viewer: { label: 'Viewer', color: 'bg-gray-500', icon: Eye }
    };
    return roleConfig[role as keyof typeof roleConfig] || { label: 'User', color: 'bg-gray-500', icon: User };
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const ProfileContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Avatar className="w-20 h-20 mx-auto">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-3 h-3 ${roleInfo.color} rounded-full`} />
            <Badge variant="outline" className="flex items-center gap-1">
              <RoleIcon className="w-3 h-3" />
              {roleInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Store Information</h4>
          {user.storeName ? (
            <p className="text-sm text-muted-foreground">{user.storeName}</p>
          ) : (
            <p className="text-sm text-muted-foreground">All Stores Access</p>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Permissions</h4>
          <div className="flex flex-wrap gap-1">
            {user.permissions.includes('all') ? (
              <Badge className="bg-red-100 text-red-800">
                <Crown className="w-3 h-3 mr-1" />
                All Permissions
              </Badge>
            ) : (
              user.permissions.map((permission, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {permission.replace('_', ' ').toUpperCase()}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-2" />
          Account Settings
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </Button>
        <Button 
          variant="destructive" 
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold">BikeBiz CRM</h2>
            <p className="text-xs text-muted-foreground">{roleInfo.label}</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => {
                onPageChange(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
              {item.adminOnly && (
                <Crown className="w-3 h-3 ml-auto text-yellow-500" />
              )}
            </Button>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setProfileOpen(true)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 ${roleInfo.color} rounded-full`} />
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="h-8 w-8"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Mobile Menu Drawer */}
        <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DrawerContent>
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle>Navigation</DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <NavigationContent />
            </div>
          </DrawerContent>
        </Drawer>

        {/* Profile Dialog */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
            </DialogHeader>
            <ProfileContent />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r">
        <NavigationContent />
      </div>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <ProfileContent />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navigation;
