import React, { createContext, useContext, useState, useEffect } from 'react';

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
  manager?: string;
  createdDate: string;
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Sample stores data
const DEMO_STORES: Store[] = [
  {
    id: '1',
    name: 'Mumbai Central Store',
    location: 'Mumbai Central',
    address: '123 Dr. D.N. Road, Mumbai Central, Mumbai - 400008',
    phone: '+91 22 2123 4567',
    email: 'mumbai@bikebiz.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    manager: 'Rajesh Patel',
    createdDate: '2024-01-01',
    status: 'active'
  },
  {
    id: '2',
    name: 'Delhi Karol Bagh Store',
    location: 'Karol Bagh',
    address: '456 Karol Bagh Market, New Delhi - 110005',
    phone: '+91 11 2123 4567',
    email: 'delhi@bikebiz.com',
    city: 'Delhi',
    state: 'Delhi',
    manager: 'Amit Sharma',
    createdDate: '2024-01-01',
    status: 'active'
  },
  {
    id: '3',
    name: 'Bangalore Koramangala Store',
    location: 'Koramangala',
    address: '789 Koramangala 4th Block, Bangalore - 560034',
    phone: '+91 80 2123 4567',
    email: 'bangalore@bikebiz.com',
    city: 'Bangalore',
    state: 'Karnataka',
    manager: 'Karthik Reddy',
    createdDate: '2024-01-01',
    status: 'active'
  },
  {
    id: '4',
    name: 'Wakad Store',
    location: 'Wakad',
    address: '101 Wakad Road, Hinjewadi Phase 1, Pune - 411057',
    phone: '+91 20 2123 4567',
    email: 'wakad@bikebiz.com',
    city: 'Pune',
    state: 'Maharashtra',
    manager: 'Suresh Patil',
    createdDate: '2024-01-01',
    status: 'active'
  }
];

// Demo users for different roles
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@bikebiz.com',
    password: 'admin123',
    name: 'Global Admin',
    role: 'global_admin',
    permissions: ['all'],
    stores: DEMO_STORES,
    avatar: '/placeholder.svg'
  },
  {
    id: '2',
    email: 'store@mumbai.com',
    password: 'store123',
    name: 'Rajesh Patel',
    role: 'store_admin',
    permissions: ['manage_store', 'manage_store_users', 'manage_leads', 'manage_inventory', 'match_engine', 'view_analytics', 'create_sales', 'view_reports', 'manage_test_rides'],
    storeId: '1',
    storeName: 'Mumbai Central Store',
    managedStore: DEMO_STORES[0],
    city: 'Mumbai',
    department: 'Store Management',
    avatar: '/placeholder.svg'
  },
  {
    id: '3',
    email: 'store@delhi.com',
    password: 'store123',
    name: 'Amit Sharma',
    role: 'store_admin',
    permissions: ['manage_store', 'manage_store_users', 'manage_leads', 'manage_inventory', 'match_engine', 'view_analytics', 'create_sales', 'view_reports', 'manage_test_rides'],
    storeId: '2',
    storeName: 'Delhi Karol Bagh Store',
    managedStore: DEMO_STORES[1],
    city: 'Delhi',
    department: 'Store Management',
    avatar: '/placeholder.svg'
  },
  {
    id: '4',
    email: 'store@bangalore.com',
    password: 'store123',
    name: 'Karthik Reddy',
    role: 'store_admin',
    permissions: ['manage_store', 'manage_store_users', 'manage_leads', 'manage_inventory', 'match_engine', 'view_analytics', 'create_sales', 'view_reports', 'manage_test_rides'],
    storeId: '3',
    storeName: 'Bangalore Koramangala Store',
    managedStore: DEMO_STORES[2],
    city: 'Bangalore',
    department: 'Store Management',
    avatar: '/placeholder.svg'
  },
  {
    id: '5',
    email: 'sales1@mumbai.com',
    password: 'sales123',
    name: 'Priya Sharma',
    role: 'sales_executive',
    permissions: ['manage_leads', 'view_inventory', 'match_engine', 'create_sales', 'manage_test_rides', 'send_messages', 'schedule_followups'],
    storeId: '1',
    storeName: 'Mumbai Central Store',
    city: 'Mumbai',
    department: 'Lead Generation',
    avatar: '/placeholder.svg'
  },
  {
    id: '6',
    email: 'sales2@mumbai.com',
    password: 'sales123',
    name: 'Rohit Kumar',
    role: 'sales_executive',
    permissions: ['manage_leads', 'view_inventory', 'match_engine', 'create_sales', 'manage_test_rides', 'send_messages', 'schedule_followups'],
    storeId: '1',
    storeName: 'Mumbai Central Store',
    city: 'Mumbai',
    department: 'Sales & Fulfillment',
    avatar: '/placeholder.svg'
  },
  {
    id: '7',
    email: 'sales1@delhi.com',
    password: 'sales123',
    name: 'Neha Singh',
    role: 'sales_executive',
    permissions: ['manage_leads', 'view_inventory', 'match_engine', 'create_sales', 'manage_test_rides', 'send_messages', 'schedule_followups'],
    storeId: '2',
    storeName: 'Delhi Karol Bagh Store',
    city: 'Delhi',
    department: 'Lead Generation',
    avatar: '/placeholder.svg'
  },
  {
    id: '8',
    email: 'admin@wakad.com',
    password: 'admin123',
    name: 'Suresh Patil',
    role: 'store_admin',
    permissions: ['manage_store', 'manage_store_users', 'manage_leads', 'manage_inventory', 'match_engine', 'view_analytics', 'create_sales', 'view_reports', 'manage_test_rides'],
    storeId: '4',
    storeName: 'Wakad Store',
    managedStore: DEMO_STORES[3],
    city: 'Pune',
    department: 'Store Management',
    avatar: '/placeholder.svg'
  },
  {
    id: '9',
    email: 'executive@wakad.com',
    password: 'exec123',
    name: 'Anita Kulkarni',
    role: 'sales_executive',
    permissions: ['manage_leads', 'view_inventory', 'match_engine', 'create_sales', 'manage_test_rides', 'send_messages', 'schedule_followups'],
    storeId: '4',
    storeName: 'Wakad Store',
    city: 'Pune',
    department: 'Sales Executive',
    avatar: '/placeholder.svg'
  },
  {
    id: '10',
    email: 'procurement@pune.com',
    password: 'proc123',
    name: 'Vikram Deshmukh',
    role: 'procurement_admin',
    permissions: ['manage_procurement', 'manage_city_inventory', 'create_procurement_users', 'manage_procurement_users', 'approve_vehicle_acquisition', 'assign_inventory_to_stores', 'view_procurement_analytics', 'manage_vehicle_verification', 'set_procurement_targets', 'approve_procurement_expenses', 'view_city_inventory', 'manage_vendor_relationships', 'review_vehicle_assessments', 'export_procurement_data'],
    city: 'Pune',
    managedCity: 'Pune',
    department: 'Procurement Administration',
    avatar: '/placeholder.svg'
  },
  {
    id: '11',
    email: 'procurement@mumbai.com',
    password: 'proc123',
    name: 'Ravi Mehta',
    role: 'procurement_admin',
    permissions: ['manage_procurement', 'manage_city_inventory', 'create_procurement_users', 'manage_procurement_users', 'approve_vehicle_acquisition', 'assign_inventory_to_stores', 'view_procurement_analytics', 'manage_vehicle_verification', 'set_procurement_targets', 'approve_procurement_expenses', 'view_city_inventory', 'manage_vendor_relationships', 'review_vehicle_assessments', 'export_procurement_data'],
    city: 'Mumbai',
    managedCity: 'Mumbai',
    department: 'Procurement Administration',
    avatar: '/placeholder.svg'
  },
  {
    id: '12',
    email: 'exec1@pune-procurement.com',
    password: 'exec123',
    name: 'Prashant Jadhav',
    role: 'procurement_executive',
    permissions: ['hunt_vehicles', 'verify_vehicles', 'photograph_vehicles', 'score_vehicles', 'submit_vehicle_reports', 'record_payment_proof', 'update_vehicle_status', 'view_assigned_vehicles', 'manage_vehicle_documents', 'track_vehicle_acquisition', 'communicate_with_vendors', 'submit_expense_claims'],
    city: 'Pune',
    reportingTo: '10',
    department: 'Vehicle Procurement',
    avatar: '/placeholder.svg'
  },
  {
    id: '13',
    email: 'exec2@pune-procurement.com',
    password: 'exec123',
    name: 'Sneha Bhosale',
    role: 'procurement_executive',
    permissions: ['hunt_vehicles', 'verify_vehicles', 'photograph_vehicles', 'score_vehicles', 'submit_vehicle_reports', 'record_payment_proof', 'update_vehicle_status', 'view_assigned_vehicles', 'manage_vehicle_documents', 'track_vehicle_acquisition', 'communicate_with_vendors', 'submit_expense_claims'],
    city: 'Pune',
    reportingTo: '10',
    department: 'Vehicle Procurement',
    avatar: '/placeholder.svg'
  },
  {
    id: '14',
    email: 'exec1@mumbai-procurement.com',
    password: 'exec123',
    name: 'Arjun Iyer',
    role: 'procurement_executive',
    permissions: ['hunt_vehicles', 'verify_vehicles', 'photograph_vehicles', 'score_vehicles', 'submit_vehicle_reports', 'record_payment_proof', 'update_vehicle_status', 'view_assigned_vehicles', 'manage_vehicle_documents', 'track_vehicle_acquisition', 'communicate_with_vendors', 'submit_expense_claims'],
    city: 'Mumbai',
    reportingTo: '11',
    department: 'Vehicle Procurement',
    avatar: '/placeholder.svg'
  }
];

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

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('bikebiz_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('bikebiz_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (demoUser) {
      const { password: _, ...userWithoutPassword } = demoUser;
      const userWithPermissions = {
        ...userWithoutPassword,
        permissions: ROLE_PERMISSIONS[demoUser.role]
      };
      
      setUser(userWithPermissions);
      localStorage.setItem('bikebiz_user', JSON.stringify(userWithPermissions));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bikebiz_user');
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

  // Helper function to check if user can manage stores
  const canManageStores = (): boolean => {
    return hasPermission('all') || hasPermission('manage_store');
  };

  // Helper function to check if user can manage users
  const canManageUsers = (): boolean => {
    return hasPermission('all') || hasPermission('manage_store_users');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole
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
