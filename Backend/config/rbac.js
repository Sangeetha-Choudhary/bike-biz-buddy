import RBAC from "easy-rbac";

// Map roles and permissions to easy-rbac structure
const opts = {
  global_admin: {
    can: ["*",
        "manage_store",
    ], // Global admin can do everything
    inherits: ["store_admin", "procurement_admin"],
  },

  store_admin: {
    can: [
      "manage_store_users",
      "manage_leads",
      "manage_inventory",
      "match_engine",
      "view_analytics",
      "create_sales",
      "view_reports",
      "manage_test_rides",
      "view_leads",
      "view_inventory",
      "update_lead_status",
      "schedule_followups",
      "send_messages",
      "export_data",
      "manage_store_analytics",
      "approve_sales"
    ],
    inherits: ["sales_executive"],
  },

  sales_executive: {
    can: [
      "manage_leads",
      "view_inventory",
      "match_engine",
      "create_sales",
      "manage_test_rides",
      "send_messages",
      "schedule_followups",
      "view_leads",
      "update_lead_status",
      "view_basic_analytics",
      "generate_leads"
    ],
  },

  procurement_admin: {
    can: [
      "manage_procurement",
      "manage_city_inventory",
      "create_procurement_users",
      "manage_procurement_users",
      "approve_vehicle_acquisition",
      "assign_inventory_to_stores",
      "view_procurement_analytics",
      "manage_vehicle_verification",
      "set_procurement_targets",
      "approve_procurement_expenses",
      "view_city_inventory",
      "manage_vendor_relationships",
      "review_vehicle_assessments",
      "export_procurement_data"
    ],
    inherits: ["procurement_executive"],
  },

  procurement_executive: {
    can: [
      "hunt_vehicles",
      "verify_vehicles",
      "photograph_vehicles",
      "score_vehicles",
      "submit_vehicle_reports",
      "record_payment_proof",
      "update_vehicle_status",
      "view_assigned_vehicles",
      "manage_vehicle_documents",
      "track_vehicle_acquisition",
      "communicate_with_vendors",
      "submit_expense_claims"
    ],
  },
};

// Create RBAC instance
const rbac = new RBAC(opts);

// ✅ Test it in the same file
(async () => {
  console.log("🔹 RBAC Testing with full roles/permissions");

  console.log("global admin can manage and create store: ", await rbac.can("global_admin", "manage_store"));
  console.log("store admin can manage and create store: ", await rbac.can("store_admin", "manage_store"));

  console.log(
    "Global admin can manage procurement?",
    await rbac.can("global_admin", "manage_procurement") // true (inherits procurement_admin)
  );

  console.log(
    "Store admin can approve sales?",
    await rbac.can("store_admin", "approve_sales") // true
  );

  console.log(
    "Sales executive can manage procurement?",
    await rbac.can("sales_executive", "manage_procurement") // false
  );

  console.log(
    "Procurement executive can hunt vehicles?",
    await rbac.can("procurement_executive", "hunt_vehicles") // true
  );

  console.log(
    "Procurement admin can approve procurement expenses?",
    await rbac.can("procurement_admin", "approve_procurement_expenses") // true
  );
})();

export default rbac;