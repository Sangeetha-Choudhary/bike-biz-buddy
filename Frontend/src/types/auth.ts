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
  googlemaplink?: string;
  status: 'active' | 'inactive';
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface User {
  id: string;
  username?: string;
  name?: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions: string[];
  storeId?: string;
  storeName?: string;
  city?: string;
  department?: string;
  managedCity?: string;
  createdAt?: string;
  updatedAt?: string;
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
  canManageStores: () => boolean;
  canManageUsers: () => boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
