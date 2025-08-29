import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

export type UserRole = 'global_admin' | 'store_admin' | 'sales_executive' | 'procurement_admin' | 'procurement_executive';

export interface Store {
  id: string;
  name: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  city: string;
  state: string;
  whatsapp?: string;
  latitude?: number;
  longitude?: number;
  gstnumber?: string;
  pancard?: string;
  manager?: string;
  createdDate: string;
  googlemaplink: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  storeId?: string;
  storeName?: string;
  stores?: Store[]; // For global admin
  managedStore?: Store; // For store admin
  city?: string;
  department?: string;
  managedCity?: string; // For procurement admin - city they manage
  reportingTo?: string; // For procurement executive - reports to procurement admin
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
  // Helper functions
  canManageStores: () => boolean;
  canManageUsers: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  global_admin: ['all'], // Global admin has all permissions across all stores
  store_admin: [
    'manage_store',           // Store configuration and settings
    'manage_store_users',     // Create and manage sales executives for their store
    'manage_leads',           // Full lead management within store
    'manage_inventory',       // Full inventory management within store
    'match_engine',           // Access to match engine functionality
    'view_analytics',         // Store-specific analytics
    'create_sales',           // Sales transaction creation
    'view_reports',           // Store-specific reports
    'manage_test_rides',      // Test ride scheduling and management
    'view_leads',             // View lead details
    'view_inventory',         // View inventory details
    'update_lead_status',     // Update lead status and notes
    'schedule_followups',     // Schedule follow-up activities
    'send_messages',          // Send messages to customers
    'export_data',            // Export store-specific data
    'manage_store_analytics', // Advanced store analytics
    'approve_sales'           // Approve high-value sales
  ],
  sales_executive: [
    'manage_leads',           // Lead management within assigned store
    'view_inventory',         // View inventory (read-only for most)
    'match_engine',           // Access to match engine functionality
    'create_sales',           // Sales transaction creation (with limits)
    'manage_test_rides',      // Test ride scheduling and management
    'send_messages',          // Send messages to customers
    'schedule_followups',     // Schedule follow-up activities
    'view_leads',             // View lead details
    'update_lead_status',     // Update lead status and notes
    'view_basic_analytics',   // Basic performance analytics
    'generate_leads'          // Lead generation activities
  ],
  procurement_admin: [
    'manage_procurement',     // Overall procurement management for city
    'manage_city_inventory',  // Add and assign inventory across city stores
    'create_procurement_users', // Create procurement executives
    'manage_procurement_users', // Manage procurement executives
    'approve_vehicle_acquisition', // Approve vehicle purchases
    'assign_inventory_to_stores', // Assign vehicles to specific stores
    'view_procurement_analytics', // Procurement performance analytics
    'manage_vehicle_verification', // Oversee vehicle verification process
    'set_procurement_targets',    // Set KPI targets for procurement
    'approve_procurement_expenses', // Approve procurement-related expenses
    'view_city_inventory',       // View all inventory in managed city
    'manage_vendor_relationships', // Manage relationships with vehicle vendors
    'review_vehicle_assessments', // Review assessments by procurement executives
    'export_procurement_data'     // Export procurement reports and data
  ],
  procurement_executive: [
    'hunt_vehicles',          // Search and identify vehicles in market
    'verify_vehicles',        // Verify vehicle condition and parameters
    'photograph_vehicles',    // Take and upload vehicle photos
    'score_vehicles',         // Score vehicles on assessment parameters
    'submit_vehicle_reports', // Submit vehicle assessment reports
    'record_payment_proof',   // Record proof of payment and documents
    'update_vehicle_status',  // Update status of vehicles being processed
    'view_assigned_vehicles', // View vehicles assigned for verification
    'manage_vehicle_documents', // Manage vehicle documentation
    'track_vehicle_acquisition', // Track acquisition process status
    'communicate_with_vendors', // Communicate with vehicle vendors
    'submit_expense_claims'   // Submit procurement-related expense claims
  ]
};

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
        avatar: '/placeholder.svg',
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
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
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
