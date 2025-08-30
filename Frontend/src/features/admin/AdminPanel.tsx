import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3,
  Package,
  Store,
  Plus,
  Edit,
  Trash2,
  Crown,
  UserCheck,
  Eye,
  Lock,
  Unlock,
  Activity,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Database,
  Server,
  Wifi,
  WifiOff,
  Clock,
  Calendar,
  FileText,
  Mail,
  Phone,
  MapPin,
  IndianRupee
} from "lucide-react";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  storeId?: string;
  storeName?: string;
  avatar?: string;
  permissions: string[];
}

interface Store {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  status: 'active' | 'inactive';
  employees: number;
  revenue: number;
  leads: number;
  sales: number;
}

interface SystemMetric {
  name: string;
  value: string;
  change: string;
  status: 'good' | 'warning' | 'critical';
  icon: typeof Activity;
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "sales" as UserRole,
    storeId: "",
    permissions: [] as string[]
  });
  const [storeFormData, setStoreFormData] = useState({
    name: "",
    address: "",
    manager: "",
    phone: ""
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    userId: "",
    userEmail: "",
    userName: "",
    newPassword: "",
    confirmPassword: "",
    sendEmail: true
  });
  const { user, hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Mock data
  const systemUsers: SystemUser[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@bikebiz.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2 hours ago',
      permissions: ['all'],
      avatar: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Store Manager',
      email: 'manager@bikebiz.com',
      role: 'manager',
      status: 'active',
      lastLogin: '1 day ago',
      storeId: '1',
      storeName: 'Mumbai Central Store',
      permissions: ['view_analytics', 'manage_leads', 'manage_inventory'],
      avatar: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Sales Executive',
      email: 'sales@bikebiz.com',
      role: 'sales',
      status: 'active',
      lastLogin: '30 minutes ago',
      storeId: '1',
      storeName: 'Mumbai Central Store',
      permissions: ['manage_leads', 'view_inventory'],
      avatar: '/placeholder.svg'
    },
    {
      id: '4',
      name: 'Read Only User',
      email: 'viewer@bikebiz.com',
      role: 'viewer',
      status: 'inactive',
      lastLogin: '3 days ago',
      storeId: '1',
      storeName: 'Mumbai Central Store',
      permissions: ['view_leads', 'view_inventory'],
      avatar: '/placeholder.svg'
    }
  ];

  const stores: Store[] = [
    {
      id: '1',
      name: 'Mumbai Central Store',
      address: 'Shop 123, Mumbai Central, Maharashtra 400008',
      manager: 'Store Manager',
      phone: '+91 98765 43210',
      status: 'active',
      employees: 8,
      revenue: 2500000,
      leads: 156,
      sales: 42
    },
    {
      id: '2',
      name: 'Andheri Branch',
      address: 'Unit 45, Andheri West, Maharashtra 400053',
      manager: 'Priya Sharma',
      phone: '+91 87654 32109',
      status: 'active',
      employees: 6,
      revenue: 1800000,
      leads: 123,
      sales: 35
    },
    {
      id: '3',
      name: 'Pune Outlet',
      address: 'FC Road, Pune, Maharashtra 411005',
      manager: 'Rajesh Kumar',
      phone: '+91 76543 21098',
      status: 'inactive',
      employees: 4,
      revenue: 950000,
      leads: 78,
      sales: 18
    }
  ];

  const systemMetrics: SystemMetric[] = [
    {
      name: 'System Uptime',
      value: '99.9%',
      change: '+0.1%',
      status: 'good',
      icon: Server
    },
    {
      name: 'Database Performance',
      value: '250ms',
      change: '-50ms',
      status: 'good',
      icon: Database
    },
    {
      name: 'Active Sessions',
      value: '24',
      change: '+6',
      status: 'good',
      icon: Users
    },
    {
      name: 'API Response Time',
      value: '150ms',
      change: '+25ms',
      status: 'warning',
      icon: Activity
    }
  ];

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      admin: Crown,
      manager: UserCheck,
      sales: Users,
      viewer: Eye
    };
    return icons[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const handleCreateUser = () => {
    if (!userFormData.name || !userFormData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "User Created",
      description: `${userFormData.name} has been added to the system.`,
    });
    
    setUserDialogOpen(false);
    setUserFormData({
      name: "",
      email: "",
      role: "sales",
      storeId: "",
      permissions: []
    });
  };

  const handleCreateStore = () => {
    if (!storeFormData.name || !storeFormData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Store Created",
      description: `${storeFormData.name} has been added to the system.`,
    });

    setStoreDialogOpen(false);
    setStoreFormData({
      name: "",
      address: "",
      manager: "",
      phone: ""
    });
  };

  const handleResetPassword = () => {
    if (!passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Reset Successfully",
      description: `Password has been reset for ${passwordFormData.userName}. ${passwordFormData.sendEmail ? 'Email notification sent.' : ''}`,
    });

    setPasswordDialogOpen(false);
    setPasswordFormData({
      userId: "",
      userEmail: "",
      userName: "",
      newPassword: "",
      confirmPassword: "",
      sendEmail: true
    });
  };

  const handleExportData = (dataType: string) => {
    toast({
      title: "Export Started",
      description: `${dataType} data export has been initiated.`,
    });
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast({
      title: "User Status Updated",
      description: `User status changed to ${newStatus}.`,
    });
  };

  const UserDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={userFormData.name}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={userFormData.role} onValueChange={(value: UserRole) => setUserFormData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="manager">Store Manager</SelectItem>
                          <SelectItem value="sales">Sales Executive</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Store</Label>
                      <Select value={userFormData.storeId} onValueChange={(value) => setUserFormData(prev => ({ ...prev, storeId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select store" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Stores</SelectItem>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUserDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} className="flex-1">
                  {selectedUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={userFormData.name}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={userFormData.role} onValueChange={(value: UserRole) => setUserFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Store Manager</SelectItem>
                      <SelectItem value="sales">Sales Executive</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Store</Label>
                  <Select value={userFormData.storeId} onValueChange={(value) => setUserFormData(prev => ({ ...prev, storeId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Stores</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUserDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} className="flex-1">
                  {selectedUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  const StoreDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selectedStore ? 'Edit Store' : 'Create New Store'}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input
                    value={storeFormData.name}
                    onChange={(e) => setStoreFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter store name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={storeFormData.address}
                    onChange={(e) => setStoreFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Manager</Label>
                    <Input
                      value={storeFormData.manager}
                      onChange={(e) => setStoreFormData(prev => ({ ...prev, manager: e.target.value }))}
                      placeholder="Manager name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={storeFormData.phone}
                      onChange={(e) => setStoreFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStoreDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateStore} className="flex-1">
                  {selectedStore ? 'Update Store' : 'Create Store'}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedStore ? 'Edit Store' : 'Create New Store'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                  value={storeFormData.name}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter store name"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={storeFormData.address}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Manager</Label>
                  <Input
                    value={storeFormData.manager}
                    onChange={(e) => setStoreFormData(prev => ({ ...prev, manager: e.target.value }))}
                    placeholder="Manager name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={storeFormData.phone}
                    onChange={(e) => setStoreFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStoreDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateStore} className="flex-1">
                  {selectedStore ? 'Update Store' : 'Create Store'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  const PasswordDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Reset User Password</DrawerTitle>
            </DrawerHeader>
            <div className="px-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>User</Label>
                  <Input
                    value={`${passwordFormData.userName} (${passwordFormData.userEmail})`}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordFormData.newPassword}
                    onChange={(e) => setPasswordFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={passwordFormData.sendEmail}
                    onChange={(e) => setPasswordFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  />
                  <Label htmlFor="sendEmail">Send email notification to user</Label>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPasswordDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleResetPassword} className="flex-1">
                  Reset Password
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset User Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <Input
                  value={`${passwordFormData.userName} (${passwordFormData.userEmail})`}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordFormData.newPassword}
                  onChange={(e) => setPasswordFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendEmailDesktop"
                  checked={passwordFormData.sendEmail}
                  onChange={(e) => setPasswordFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                />
                <Label htmlFor="sendEmailDesktop">Send email notification to user</Label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPasswordDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleResetPassword} className="flex-1">
                  Reset Password
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  if (!hasPermission('all')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">System administration and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportData('System')}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="passwords">Passwords</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${
                        metric.status === 'good' ? 'bg-green-100' :
                        metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          metric.status === 'good' ? 'text-green-600' :
                          metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <Badge variant={
                        metric.status === 'good' ? 'default' :
                        metric.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {metric.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <span className="font-bold">{systemUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Users</span>
                  <span className="font-bold text-green-600">
                    {systemUsers.filter(u => u.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Admins</span>
                  <span className="font-bold text-red-600">
                    {systemUsers.filter(u => u.role === 'admin').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Stores</span>
                  <span className="font-bold">{stores.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Stores</span>
                  <span className="font-bold text-green-600">
                    {stores.filter(s => s.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue</span>
                  <span className="font-bold text-primary">
                    ₹{(stores.reduce((sum, s) => sum + s.revenue, 0) / 100000).toFixed(1)}L
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Performance</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Usage</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Database Health</span>
                    <span>98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Button onClick={() => {
              setSelectedUser(null);
              setUserFormData({
                name: "",
                email: "",
                role: "sales",
                storeId: "",
                permissions: []
              });
              setUserDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <Card key={user.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserFormData({
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                storeId: user.storeId || "",
                                permissions: user.permissions
                              });
                              setUserDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={getRoleColor(user.role)}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {user.role}
                          </Badge>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </div>
                        
                        {user.storeName && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Store className="w-3 h-3" />
                            {user.storeName}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Last login: {user.lastLogin}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Switch
                          checked={user.status === 'active'}
                          onCheckedChange={() => handleToggleUserStatus(user.id, user.status)}
                        />
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                          <Button variant="outline" size="sm">
                            <Lock className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Store Management</h2>
            <Button onClick={() => {
              setSelectedStore(null);
              setStoreFormData({
                name: "",
                address: "",
                manager: "",
                phone: ""
              });
              setStoreDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <Card key={store.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{store.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(store.status)}>
                            {store.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {store.employees} employees
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedStore(store);
                          setStoreFormData({
                            name: store.name,
                            address: store.address,
                            manager: store.manager,
                            phone: store.phone
                          });
                          setStoreDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">{store.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Manager: {store.manager}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{store.phone}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          ₹{(store.revenue / 100000).toFixed(1)}L
                        </div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{store.leads}</div>
                        <div className="text-xs text-muted-foreground">Leads</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{store.sales}</div>
                        <div className="text-xs text-muted-foreground">Sales</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <h2 className="text-xl font-semibold">System Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Optimize Database
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  View System Logs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Server className="w-4 h-4 mr-2" />
                  Server Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Configuration
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable system maintenance mode</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatic daily backups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">System email notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">User Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new user registration</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">API Access</Label>
                      <p className="text-sm text-muted-foreground">Enable external API access</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable debug logging</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Password Management</h3>
              <p className="text-muted-foreground">Reset user passwords and manage security settings</p>
            </div>
            <Button onClick={() => setPasswordDialogOpen(true)}>
              <Lock className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemUsers.map((user) => (
              <Card key={user.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Last login: {user.lastLogin}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setPasswordFormData({
                        userId: user.id,
                        userEmail: user.email,
                        userName: user.name,
                        newPassword: "",
                        confirmPassword: "",
                        sendEmail: true
                      });
                      setPasswordDialogOpen(true);
                    }}
                  >
                    <Lock className="w-3 h-3 mr-2" />
                    Reset Password
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure system-wide security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Enforce Strong Passwords</Label>
                      <p className="text-sm text-muted-foreground">Require complex passwords</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Password Expiry (days)</Label>
                    <Input type="number" placeholder="90" className="mt-1" />
                  </div>
                  <div>
                    <Label>Max Login Attempts</Label>
                    <Input type="number" placeholder="5" className="mt-1" />
                  </div>
                  <div>
                    <Label>Session Duration (hours)</Label>
                    <Input type="number" placeholder="8" className="mt-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UserDialog />
      <StoreDialog />
      <PasswordDialog />
    </div>
  );
};

export default AdminPanel;
