import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User, Store, AuthContextType, UserRole } from '../types/auth';
import { ROLE_PERMISSIONS } from '../utils/constants';

// Re-export types for backward compatibility
export type { User, Store, UserRole };

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('bikebiz_user');
        const token = localStorage.getItem('bikebiz_token');
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token is still valid by making a simple API call
          try {
            apiService.setToken(token);
            // Test token validity with health check or any endpoint that requires auth
            await apiService.healthCheck();
            setUser(parsedUser);
          } catch (error) {
            console.error('Token validation failed:', error);
            // Clear invalid session
            localStorage.removeItem('bikebiz_user');
            localStorage.removeItem('bikebiz_token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError("");
    try {
      // Pass credentials as an object to match the API service
      const response = await apiService.login({ email, password });
      
      // Create user object with permissions based on role
      const userWithPermissions: User = {
        id: response._id,
        email: response.email,
        name: response.username,
        role: response.role as UserRole,
        permissions: ROLE_PERMISSIONS[response.role as UserRole] || [],
        // avatar: '/placeholder.svg',
        // Add any additional fields from response if available
        storeId: response.store?.id,
        storeName: response.store?.name,
      };
      
      // Store token and user data
      apiService.setToken(response.token);
      setUser(userWithPermissions);
      localStorage.setItem('bikebiz_user', JSON.stringify(userWithPermissions));
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError("");
    localStorage.removeItem('bikebiz_user');
    apiService.removeToken();
  };

  const refreshUserData = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // For now, just refresh permissions from the static config
      // Later when you have the API, you can fetch from backend
      const updatedPermissions = ROLE_PERMISSIONS[user.role] || [];
      
      const updatedUser = {
        ...user,
        permissions: updatedPermissions
      };
      
      setUser(updatedUser);
      localStorage.setItem('bikebiz_user', JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      setError('Failed to refresh user permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Check if user has explicit 'all' permission
    if (user.permissions?.includes('all')) return true;
    
    // Check if user has the specific permission
    if (user.permissions?.includes(permission)) return true;
    
    // Fallback: Check role-based permissions from constants
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (rolePermissions && rolePermissions.includes(permission as any)) return true;
    
    // Special case for global_admin - they should have all permissions
    if (user.role === 'global_admin') return true;
    
    return false;
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role as UserRole);
    }
    return user.role === role;
  };

  const clearError = () => {
    setError("");
  };

  // Helper function to check if user can manage stores
  const canManageStores = (): boolean => {
    return hasPermission('all') || hasPermission('manage_store');
  };

  // Helper function to check if user can manage users
  const canManageUsers = (): boolean => {
    return hasPermission('all') || hasPermission('manage_store_users') || hasPermission('create_procurement_users') || hasPermission('manage_procurement_users');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshUserData,
    clearError,
    canManageStores,
    canManageUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
