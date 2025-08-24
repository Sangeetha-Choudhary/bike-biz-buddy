import React from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';

interface PermissionWrapperProps {
  children: React.ReactNode;
  permission?: string;
  role?: UserRole | UserRole[];
  fallback?: React.ReactNode;
  hideOnNoAccess?: boolean;
  showAccessDenied?: boolean;
}

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  role,
  fallback,
  hideOnNoAccess = false,
  showAccessDenied = true
}) => {
  const { user, hasPermission, hasRole } = useAuth();

  // If no user is logged in, don't show anything
  if (!user) {
    return hideOnNoAccess ? null : (fallback || <DefaultAccessDenied />);
  }

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return hideOnNoAccess ? null : (fallback || (showAccessDenied ? <DefaultAccessDenied /> : null));
  }

  // Check role if specified
  if (role && !hasRole(role)) {
    return hideOnNoAccess ? null : (fallback || (showAccessDenied ? <DefaultAccessDenied /> : null));
  }

  return <>{children}</>;
};

const DefaultAccessDenied: React.FC = () => (
  <Card className="border-destructive/50 bg-destructive/5">
    <CardContent className="p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-destructive mb-2">
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">Access Restricted</span>
      </div>
      <p className="text-xs text-muted-foreground">
        You don't have permission to view this content
      </p>
    </CardContent>
  </Card>
);

// Higher-order component for protecting entire routes
export const withPermission = (
  Component: React.ComponentType<any>,
  requiredPermission?: string,
  requiredRole?: UserRole | UserRole[]
) => {
  return (props: any) => (
    <PermissionWrapper 
      permission={requiredPermission} 
      role={requiredRole}
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this page.
              </p>
              <Badge variant="outline" className="text-sm">
                Required: {requiredPermission || requiredRole}
              </Badge>
            </CardContent>
          </Card>
        </div>
      }
    >
      <Component {...props} />
    </PermissionWrapper>
  );
};

// Hook for conditional rendering based on permissions
export const usePermissionCheck = () => {
  const { hasPermission, hasRole } = useAuth();
  
  return {
    canView: (permission?: string, role?: UserRole | UserRole[]) => {
      if (permission && !hasPermission(permission)) return false;
      if (role && !hasRole(role)) return false;
      return true;
    },
    hasPermission,
    hasRole
  };
};

// Component for showing different content based on user role
interface RoleBasedContentProps {
  admin?: React.ReactNode;
  manager?: React.ReactNode;
  sales?: React.ReactNode;
  viewer?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  admin,
  manager,
  sales,
  viewer,
  fallback
}) => {
  const { user } = useAuth();

  if (!user) return fallback || null;

  switch (user.role) {
    case 'admin':
      return <>{admin}</> || fallback || null;
    case 'manager':
      return <>{manager}</> || fallback || null;
    case 'sales':
      return <>{sales}</> || fallback || null;
    case 'viewer':
      return <>{viewer}</> || fallback || null;
    default:
      return fallback || null;
  }
};

// Component for showing sensitive data based on permissions
interface SensitiveDataProps {
  children: React.ReactNode;
  permission: string;
  placeholder?: string;
  showIcon?: boolean;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({
  children,
  permission,
  placeholder = "***",
  showIcon = true
}) => {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      {showIcon && <EyeOff className="w-3 h-3" />}
      {placeholder}
    </span>
  );
};

export default PermissionWrapper;
