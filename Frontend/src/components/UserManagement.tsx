import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, Store, User } from "@/contexts/AuthContext";
import PermissionWrapper from "@/components/PermissionWrapper";
import { apiService } from "@/services/api";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Building,
  Shield,
  TrendingUp,
  UserPlus,
  Crown,
  Star,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ChevronRight,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface UserFormData {
  name: string;
  email: string;

  role:
    | "store_admin"
    | "sales_executive"
    | "procurement_admin"
    | "procurement_executive";
  storeId: string;
  storeName: string;
  department: string;
  phone?: string;
  city: string;
  managedCity?: string; // For procurement admin
  reportingTo?: string; // For procurement executive
}

// interface StoreFormData {
//   name: string;
//   location: string;
//   address: string;
//   phone: string;
//   email: string;
//   city: string;
//   state: string;
//   managerName: string;
//   managerEmail: string;
//   latitude: number;
//   longitude: number;
//   googleMapLink?: string;
//   whatsappNumber: string;
//   gstNumber?: string;
//   panNumber?: string;
// }

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("users");

  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: "",
    email: "",

    role: "sales_executive",
    storeId: "",
    storeName: "",
    department: "Lead Generation",
    phone: "",
    city: "",
  });

  // const [storeFormData, setStoreFormData] = useState<StoreFormData>({
  //   name: "",
  //   location: "",
  //   address: "",
  //   phone: "",
  //   email: "",
  //   city: "",
  //   state: "",
  //   managerName: "",
  //   managerEmail: "",
  //   latitude: 0,
  //   longitude: 0,
  //   googleMapLink: "",
  //   whatsappNumber: "",
  //   gstNumber: "",
  //   panNumber: "",
  // });

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, hasPermission } = useAuth();

  // Reset department when role changes to prevent invalid combinations
  useEffect(() => {
    if (userFormData.role === "store_admin") {
      setUserFormData((prev) => ({ ...prev, department: "Store Management" }));
    } else if (userFormData.role === "procurement_admin") {
      setUserFormData((prev) => ({
        ...prev,
        department: "Procurement Administration",
      }));
    } else if (userFormData.role === "procurement_executive") {
      setUserFormData((prev) => ({
        ...prev,
        department: "Vehicle Procurement",
      }));
    } else if (
      userFormData.role === "sales_executive" &&
      !["Lead Generation", "Sales & Fulfillment", "Customer Service"].includes(
        userFormData.department
      )
    ) {
      setUserFormData((prev) => ({ ...prev, department: "Lead Generation" }));
    }
  }, [userFormData.role]);

  // Load sample data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        loadUsersData();
        loadStoresData();
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);
  // _id: user._id,
  //       username: user.username,
  //       email: user.email,
  //       role: user.role,
  //       redirectUrl: roleBasedRedirect[user.role] || "/dashboard",
  //       token: generateToken(user._id),
  const loadUsersData = async () => {
    try {
      const usersData = await apiService.getUsers();
      const formattedUsers: User[] = usersData.map((user: any) => ({
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role,
        permissions: [], // Will be set based on role in frontend
        storeId: user.store ? "1" : undefined,
        storeName: user.store,
        city: "Mumbai", // Default city
        department:
          user.role === "store_admin"
            ? "Store Management"
            : user.role === "sales_executive"
            ? "Sales"
            : user.role === "procurement_admin"
            ? "Procurement"
            : "Vehicle Acquisition",
      }));

      if (user?.role === "global_admin") {
        // Global admin sees all users
        setUsers(formattedUsers);
      } else if (user?.role === "store_admin" && user?.storeId) {
        // Store admin sees only users from their store
        const storeUsers = formattedUsers.filter(
          (u) => u.storeId === user.storeId
        );
        setUsers(storeUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error Loading Users",
        description: "Failed to load users from database.",
        variant: "destructive",
      });
    }
  };

  const loadStoresData = () => {
    const sampleStores: Store[] = [
      {
        id: "1",
        name: "Mumbai Central Store",
        location: "Mumbai Central",
        address: "123 Dr. D.N. Road, Mumbai Central, Mumbai - 400008",
        phone: "+91 22 2123 4567",
        email: "mumbai@bikebiz.com",
        city: "Mumbai",
        state: "Maharashtra",
        manager: "Rajesh Patel",
        createdDate: "2024-01-01",
        status: "active",
      }, 
      {
        id: "2",
        name: "Delhi Karol Bagh Store",
        location: "Karol Bagh",
        address: "456 Karol Bagh Market, New Delhi - 110005",
        phone: "+91 11 2123 4567",
        email: "delhi@bikebiz.com",
        city: "Delhi",
        state: "Delhi",
        manager: "Amit Sharma",
        createdDate: "2024-01-01",
        status: "active",
      },
      {
        id: "3",
        name: "Bangalore Koramangala Store",
        location: "Koramangala",
        address: "789 Koramangala 4th Block, Bangalore - 560034",
        phone: "+91 80 2123 4567",
        email: "bangalore@bikebiz.com",
        city: "Bangalore",
        state: "Karnataka",
        manager: "Karthik Reddy",
        createdDate: "2024-01-01",
        status: "active",
      },
    ];

    if (user?.role === "global_admin") {
      setStores(sampleStores);
    } else if (user?.role === "store_admin" && user?.managedStore) {
      setStores([user.managedStore]);
    } else {
      setStores([]);
    }
  };

  const handleAddUser = async () => {
    // Validate required fields based on role
    if (!userFormData.name || !userFormData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Role-specific validation
    if (
      userFormData.role === "procurement_admin" &&
      !userFormData.managedCity
    ) {
      toast({
        title: "Missing Information",
        description: "Please select a managed city for Procurement Admin.",
        variant: "destructive",
      });
      return;
    }

    if (
      userFormData.role === "procurement_executive" &&
      !userFormData.reportingTo
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please select a reporting manager for Procurement Executive.",
        variant: "destructive",
      });
      return;
    }

    if (
      (userFormData.role === "store_admin" ||
        userFormData.role === "sales_executive") &&
      !userFormData.storeId
    ) {
      toast({
        title: "Missing Information",
        description: "Please select a store for this role.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create user data for API
      const userData = {
        username: userFormData.name,
        email: userFormData.email,
        password: "default123", // Default password that user can change later
        role: userFormData.role,
        store:
          userFormData.role === "procurement_admin" ||
          userFormData.role === "procurement_executive"
            ? undefined
            : userFormData.storeName,
      };

      // Call API to create user
      const response = await apiService.createUser(userData);

      // Generate appropriate permissions based on role
      let permissions: string[] = [];
      if (userFormData.role === "store_admin") {
        permissions = [
          "manage_store",
          "manage_store_users",
          "manage_leads",
          "manage_inventory",
          "match_engine",
          "view_analytics",
        ];
      } else if (userFormData.role === "sales_executive") {
        permissions = [
          "manage_leads",
          "view_inventory",
          "match_engine",
          "create_sales",
          "manage_test_rides",
        ];
      } else if (userFormData.role === "procurement_admin") {
        permissions = [
          "manage_procurement",
          "manage_city_inventory",
          "create_procurement_users",
          "manage_procurement_users",
          "approve_vehicle_acquisition",
          "assign_inventory_to_stores",
          "view_procurement_analytics",
        ];
      } else if (userFormData.role === "procurement_executive") {
        permissions = [
          "hunt_vehicles",
          "verify_vehicles",
          "photograph_vehicles",
          "score_vehicles",
          "submit_vehicle_reports",
          "record_payment_proof",
          "update_vehicle_status",
        ];
      }

      const newUser: User = {
        id: response._id,
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        permissions,
        storeId:
          userFormData.role === "procurement_admin" ||
          userFormData.role === "procurement_executive"
            ? undefined
            : userFormData.storeId,
        storeName:
          userFormData.role === "procurement_admin" ||
          userFormData.role === "procurement_executive"
            ? undefined
            : userFormData.storeName,
        city: userFormData.city,
        department: userFormData.department,
        managedCity:
          userFormData.role === "procurement_admin"
            ? userFormData.managedCity
            : undefined,
        reportingTo:
          userFormData.role === "procurement_executive"
            ? userFormData.reportingTo
            : undefined,
      };

      setUsers((prev) => [newUser, ...prev]);
      setAddUserOpen(false);
      resetUserForm();

      const locationText =
        userFormData.role === "procurement_admin"
          ? userFormData.managedCity
          : userFormData.role === "procurement_executive"
          ? "procurement team"
          : userFormData.storeName;

      toast({
        title: "User Created Successfully!",
        description: `${
          newUser.name
        } has been added as a ${userFormData.role.replace(
          "_",
          " "
        )} for ${locationText}. They can login with email: ${
          userFormData.email
        } and password: default123`,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error Creating User",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // const handleAddStoreWithAdmin = () => {
  //   if (
  //     !storeFormData.name ||
  //     !storeFormData.city ||
  //     !storeFormData.managerName ||
  //     !storeFormData.managerEmail
  //   ) {
  //     toast({
  //       title: "Missing Information",
  //       description: "Please fill in all required fields.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   const storeId = Date.now().toString();

  //   // Create the store
  //   const newStore: Store = {
  //     id: storeId,
  //     name: storeFormData.name,
  //     location: storeFormData.location,
  //     address: storeFormData.address,
  //     phone: storeFormData.phone,
  //     email: storeFormData.email,
  //     city: storeFormData.city,
  //     state: storeFormData.state,
  //     manager: storeFormData.managerName,
  //     createdDate: new Date().toISOString().split("T")[0],
  //     status: "active",
  //   };

  //   // Create the store admin user
  //   const newStoreAdmin: User = {
  //     id: (Date.now() + 1).toString(),
  //     name: storeFormData.managerName,
  //     email: storeFormData.managerEmail,
  //     role: "store_admin",
  //     permissions: [
  //       "manage_store",
  //       "manage_store_users",
  //       "manage_leads",
  //       "manage_inventory",
  //       "match_engine",
  //       "view_analytics",
  //     ],
  //     storeId: storeId,
  //     storeName: storeFormData.name,
  //     city: storeFormData.city,
  //     department: "Store Management",
  //     managedStore: newStore,
  //   };

  //   setStores((prev) => [newStore, ...prev]);
  //   setUsers((prev) => [newStoreAdmin, ...prev]);
  //   setAddStoreOpen(false);
  //   resetStoreForm();

  //   toast({
  //     title: "Store & Admin Created Successfully!",
  //     description: `${newStore.name} has been created with ${newStoreAdmin.name} as Store Admin.`,
  //   });
  // };

  const resetUserForm = () => {
    setUserFormData({
      name: "",
      email: "",

      role: "sales_executive",
      storeId: "",
      storeName: "",
      department: "Lead Generation",
      phone: "",
      city: "",
      managedCity: "",
      reportingTo: "",
    });
  };

  // const resetStoreForm = () => {
  //   setStoreFormData({
  //     name: "",
  //     location: "",
  //     address: "",
  //     phone: "",
  //     email: "",
  //     city: "",
  //     state: "",
  //     managerName: "",
  //     managerEmail: "",
  //     latitude: 0,
  //     longitude: 0,
  //     googleMapLink: "",
  //     whatsappNumber: "",
  //     gstNumber: "",
  //     panNumber: "",
  //   });
  // };

  const getRoleBadge = (role: string) => {
    const variants = {
      global_admin: "bg-red-100 text-red-800 border-red-200",
      store_admin: "bg-blue-100 text-blue-800 border-blue-200",
      sales_executive: "bg-green-100 text-green-800 border-green-200",
    };
    const labels = {
      global_admin: "Global Admin",
      store_admin: "Store Admin",
      sales_executive: "Sales Executive",
    };
    return {
      className:
        variants[role as keyof typeof variants] || variants.sales_executive,
      label: labels[role as keyof typeof labels] || "Sales Executive",
    };
  };

  const getDepartmentBadge = (department: string) => {
    const variants = {
      "Store Management": "bg-purple-100 text-purple-800 border-purple-200",
      "Lead Generation": "bg-blue-100 text-blue-800 border-blue-200",
      "Sales & Fulfillment": "bg-green-100 text-green-800 border-green-200",
      "Customer Service": "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      variants[department as keyof typeof variants] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStore = !filterStore || user.storeId === filterStore;
    return matchesSearch && matchesRole && matchesStore;
  });

  const UserCard = ({ user: userData }: { user: User }) => {
    const roleBadge = getRoleBadge(userData.role);
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {userData.role === "global_admin" && (
                    <Crown className="w-6 h-6 text-red-600" />
                  )}
                  {userData.role === "store_admin" && (
                    <Shield className="w-6 h-6 text-blue-600" />
                  )}
                  {userData.role === "sales_executive" && (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {userData.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {userData.email}
                  </p>
                </div>
              </div>
              <Badge className={roleBadge.className}>{roleBadge.label}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{userData.storeName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{userData.city}</span>
              </div>
              {userData.department && (
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <Badge className={getDepartmentBadge(userData.department)}>
                    {userData.department}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedUser(userData);
                  setUserDetailsOpen(true);
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                View Details
              </Button>
              <PermissionWrapper permission="all">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(userData);
                    setUserFormData({
                      name: userData.name,
                      email: userData.email,

                      role: userData.role as any,
                      storeId: userData.storeId || "",
                      storeName: userData.storeName || "",
                      department: userData.department || "",
                      phone: "",
                      city: userData.city || "",
                    });
                    setEditUserOpen(true);
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </PermissionWrapper>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
              User Management
            </h1>
            {user?.role === "store_admin" && user?.storeName && (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20"
              >
                <Building className="w-3 h-3 mr-1" />
                {user.storeName}
              </Badge>
            )}
          </div>
          <p className="text-sm lg:text-base text-muted-foreground">
            {user?.role === "global_admin"
              ? "Manage users and stores across the entire system"
              : "Manage your store team and sales executives"}
          </p>
        </div>
        <div className="flex gap-2">
          {/* <PermissionWrapper permission="all">
            <Button
              onClick={() => {
                resetStoreForm();
                setAddStoreOpen(true);
              }}
              variant="outline"
            >
              <Building className="w-4 h-4 mr-2" />
              Add Store & Admin
            </Button>
          </PermissionWrapper> */}
          <PermissionWrapper permission="manage_store_users">
            <Button
              onClick={() => {
                resetUserForm();
                if (user?.role === "store_admin") {
                  setUserFormData((prev) => ({
                    ...prev,
                    storeId: user.storeId || "",
                    storeName: user.storeName || "",
                    city: user.city || "",
                  }));
                }
                setAddUserOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </PermissionWrapper>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter by role"
          title="Filter by role"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All Roles</option>
          <option value="store_admin">Store Admin</option>
          <option value="sales_executive">Sales Executive</option>
          <option value="procurement_admin">Procurement Admin</option>
          <option value="procurement_executive">Procurement Executive</option>
        </select>
        {user?.role === "global_admin" && (
          <select
            aria-label="Filter by store"
            title="Filter by store"
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
            className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Stores</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((userData) => (
          <UserCard key={userData.id} user={userData} />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No users match your search criteria"
              : "No users available"}
          </p>
          <PermissionWrapper permission="manage_store_users">
            <Button onClick={() => setAddUserOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add First User
            </Button>
          </PermissionWrapper>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign them to a store.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Full Name *</Label>
                <Input
                  id="userName"
                  value={userFormData.name}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Priya Sharma"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="priya@bikebiz.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userPhone">Phone/Contact Number</Label>
                <Input
                  id="userPhone"
                  type="tel"
                  value={userFormData.phone}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Enter phone/contact number"
                />
              </div>
              {/* <div className="space-y-2"> */}
              {/* <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={userFormData.password || ''}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  /> */}
              {/* </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userRole">Role *</Label>
                <select
                  id="userRole"
                  title="Select role"
                  value={userFormData.role}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      role: e.target.value as any,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {user?.role === "global_admin" && (
                    <>
                      <option value="store_admin">Store Admin</option>
                      <option value="procurement_admin">
                        Procurement Admin
                      </option>
                    </>
                  )}
                  {(user?.role === "store_admin" ||
                    user?.role === "global_admin") && (
                    <option value="sales_executive">Sales Executive</option>
                  )}
                  {user?.role === "procurement_admin" && (
                    <option value="procurement_executive">
                      Procurement Executive
                    </option>
                  )}
                </select>
              </div>
              {userFormData.role === "procurement_admin" ? (
                <div className="space-y-2">
                  <Label htmlFor="userCity">Managed City *</Label>
                  <select
                    id="userCity"
                    title="Select managed city"
                    value={userFormData.managedCity || ""}
                    onChange={(e) =>
                      setUserFormData((prev) => ({
                        ...prev,
                        managedCity: e.target.value,
                        city: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select city</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Pune">Pune</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                </div>
              ) : userFormData.role === "procurement_executive" ? (
                <div className="space-y-2">
                  <Label htmlFor="reportingTo">Reports To *</Label>
                  <select
                    id="reportingTo"
                    title="Select procurement admin"
                    value={userFormData.reportingTo || ""}
                    onChange={(e) =>
                      setUserFormData((prev) => ({
                        ...prev,
                        reportingTo: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select procurement admin</option>
                    {users
                      .filter((u) => u.role === "procurement_admin")
                      .map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} - {admin.managedCity}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="userStore">Store *</Label>
                  <select
                    id="userStore"
                    title="Select store"
                    value={userFormData.storeId}
                    onChange={(e) => {
                      const store = stores.find((s) => s.id === e.target.value);
                      setUserFormData((prev) => ({
                        ...prev,
                        storeId: e.target.value,
                        storeName: store?.name || "",
                        city: store?.city || "",
                      }));
                    }}
                    disabled={
                      user?.role === "store_admin" || stores.length === 0
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Store & Admin Dialog */}
    </div>
  );
};

export default UserManagement;
