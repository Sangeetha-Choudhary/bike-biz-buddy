import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import PermissionWrapper, { RoleBasedContent, SensitiveData } from "@/components/common/PermissionWrapper";
import { 
  Shield, 
  Users, 
  Eye, 
  Lock, 
  Crown, 
  UserCheck, 
  Package,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const RBACDemo = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">RBAC Demo</h1>
        <p className="text-muted-foreground">
          See how different roles have different access levels
        </p>
        <Badge variant="outline" className="text-sm">
          Currently logged in as: {user.role}
        </Badge>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Access Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Role</h4>
              <Badge className={
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                user.role === 'sales' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }>
                {user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                {user.role === 'manager' && <UserCheck className="w-3 h-3 mr-1" />}
                {user.role === 'sales' && <Users className="w-3 h-3 mr-1" />}
                {user.role === 'viewer' && <Eye className="w-3 h-3 mr-1" />}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Permissions</h4>
              <div className="flex flex-wrap gap-1">
                {user.permissions.includes('all') ? (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    All Permissions
                  </Badge>
                ) : (
                  user.permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Store Access</h4>
              <p className="text-sm text-muted-foreground">
                {user.storeName || 'All Stores'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission-Based Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Only Content */}
        <PermissionWrapper permission="all" showAccessDenied={true}>
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Crown className="w-5 h-5" />
                Admin Only Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>User Management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>System Settings</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Full Analytics Access</span>
                </div>
                <Button size="sm" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Access Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        </PermissionWrapper>

        {/* Manager Content */}
        <PermissionWrapper permission="manage_leads" showAccessDenied={true}>
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <UserCheck className="w-5 h-5" />
                Manager Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Lead Management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Inventory Control</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Sales Reports</span>
                </div>
                <Button size="sm" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </PermissionWrapper>

        {/* Sales Content */}
        <PermissionWrapper permission="view_leads" showAccessDenied={true}>
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Users className="w-5 h-5" />
                Sales Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>View & Manage Leads</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Inventory Access</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Basic Analytics</span>
                </div>
                <Button size="sm" className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Browse Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        </PermissionWrapper>

        {/* Viewer Content */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <Eye className="w-5 h-5" />
              Viewer Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Read-only Lead Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>View Inventory</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span>Limited Functionality</span>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-Based Content Example */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Content Example</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleBasedContent
            admin={
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Admin View</h4>
                <p className="text-red-700 text-sm">
                  You can see all sensitive data, manage users, and access system settings.
                </p>
              </div>
            }
            manager={
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Manager View</h4>
                <p className="text-blue-700 text-sm">
                  You have access to analytics, lead management, and store operations.
                </p>
              </div>
            }
            sales={
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Sales Executive View</h4>
                <p className="text-green-700 text-sm">
                  You can manage leads, view inventory, and access basic analytics.
                </p>
              </div>
            }
            viewer={
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Viewer Access</h4>
                <p className="text-gray-700 text-sm">
                  You have read-only access to leads and inventory data.
                </p>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Sensitive Data Example */}
      <Card>
        <CardHeader>
          <CardTitle>Sensitive Data Protection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Customer Phone</h4>
                <SensitiveData permission="manage_leads">
                  +91 98765 43210
                </SensitiveData>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Revenue Data</h4>
                <SensitiveData permission="view_analytics">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    ₹2,45,000
                  </div>
                </SensitiveData>
              </div>
              <div>
                <h4 className="font-semibold mb-2">System Settings</h4>
                <SensitiveData permission="all">
                  Database Configuration
                </SensitiveData>
              </div>
              <div>
                <h4 className="font-semibold mb-2">User Management</h4>
                <SensitiveData permission="all">
                  24 Active Users
                </SensitiveData>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Try Different Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Log out and try logging in with different roles to see how the interface changes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <strong>Admin:</strong> admin@bikebiz.com / admin123
              </div>
              <div>
                <strong>Manager:</strong> manager@bikebiz.com / manager123
              </div>
              <div>
                <strong>Sales:</strong> sales@bikebiz.com / sales123
              </div>
              <div>
                <strong>Viewer:</strong> viewer@bikebiz.com / viewer123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RBACDemo;
