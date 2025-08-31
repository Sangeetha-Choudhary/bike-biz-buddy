import RBAC from 'easy-rbac';

// Simple role-based access control configuration
const opts = {
  global_admin: {
    can: ['*'], // Global admin can do everything
  },

  store_admin: {
    can: [
      'manage_store_users',
      'manage_leads',
      'manage_inventory',
      'view_analytics',
      'create_sales',
      'view_reports',
      'manage_test_rides',
    ],
  },

  sales_executive: {
    can: [
      'view_leads',
      'update_lead_status',
      'create_sales',
      'view_inventory',
      'schedule_followups',
      'send_messages',
    ],
  },

  procurement_admin: {
    can: [
      'manage_procurement',
      'manage_city_inventory',
      'create_procurement_users',
      'manage_procurement_users',
      'approve_vehicle_acquisition',
      'assign_inventory_to_stores',
      'view_procurement_analytics',
      'manage_vehicle_verification',
    ],
  },

  procurement_executive: {
    can: [
      'hunt_vehicles',
      'verify_vehicles',
      'photograph_vehicles',
      'score_vehicles',
      'submit_vehicle_reports',
      'record_payment_proof',
      'update_vehicle_status',
      'view_assigned_vehicles',
    ],
  },
};

// Create RBAC instance
const rbac = new RBAC(opts);

export default rbac;
