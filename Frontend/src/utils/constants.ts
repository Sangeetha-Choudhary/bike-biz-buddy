export const USER_ROLES = {
  GLOBAL_ADMIN: 'global_admin',
  STORE_ADMIN: 'store_admin',
  SALES_EXECUTIVE: 'sales_executive',
  PROCUREMENT_ADMIN: 'procurement_admin',
  PROCUREMENT_EXECUTIVE: 'procurement_executive',
} as const;

export const PERMISSIONS = {
  // Analytics & Dashboard
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_DASHBOARD: 'view_dashboard',
  
  // User Management
  MANAGE_STORE_USERS: 'manage_store_users',
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Store Management
  MANAGE_STORE: 'manage_store',
  VIEW_STORES: 'view_stores',
  CREATE_STORES: 'create_stores',
  EDIT_STORES: 'edit_stores',
  DELETE_STORES: 'delete_stores',
  
  // Inventory Management
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  MATCH_ENGINE: 'match_engine',
  VERIFY_VEHICLES: 'verify_vehicles',
  
  // Lead Management
  VIEW_LEADS: 'view_leads',
  MANAGE_LEADS: 'manage_leads',
  CREATE_LEADS: 'create_leads',
  EDIT_LEADS: 'edit_leads',
  DELETE_LEADS: 'delete_leads',
  
  // Procurement Management
  MANAGE_PROCUREMENT: 'manage_procurement',
  VIEW_PROCUREMENT: 'view_procurement',
  CREATE_PROCUREMENT: 'create_procurement',
  EDIT_PROCUREMENT: 'edit_procurement',
  DELETE_PROCUREMENT: 'delete_procurement',
  
  // Admin Features
  ADMIN_PANEL: 'admin_panel',
  SYSTEM_SETTINGS: 'system_settings',
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.GLOBAL_ADMIN]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_STORE_USERS,
    PERMISSIONS.MANAGE_STORE,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MATCH_ENGINE,
    PERMISSIONS.VERIFY_VEHICLES,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.MANAGE_LEADS,
    PERMISSIONS.MANAGE_PROCUREMENT,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.SYSTEM_SETTINGS,
  ],
  [USER_ROLES.STORE_ADMIN]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_STORE_USERS,
    PERMISSIONS.VIEW_STORES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.MATCH_ENGINE,
    PERMISSIONS.VERIFY_VEHICLES,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.MANAGE_LEADS,
  ],
  [USER_ROLES.SALES_EXECUTIVE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.MANAGE_LEADS,
  ],
  [USER_ROLES.PROCUREMENT_ADMIN]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_PROCUREMENT,
    PERMISSIONS.VERIFY_VEHICLES,
  ],
  [USER_ROLES.PROCUREMENT_EXECUTIVE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_PROCUREMENT,
  ],
};

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Role = typeof USER_ROLES[keyof typeof USER_ROLES];
