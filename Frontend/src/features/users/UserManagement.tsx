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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, Store, User } from "@/contexts/AuthContext";
import PermissionWrapper from "@/components/common/PermissionWrapper";
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
  Briefcase,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface UserFormData {
  name: string;
  email: string;
  password: string;
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
  managedCity?: string;
  reportingTo?: string;
}

// Add UserData interface to fix the error
interface UserData {
  username: string;
  email: string;
  password?: string;
  role: "global_admin" | "store_admin" | "sales_executive" | "procurement_admin" | "procurement_executive";
  store?: string;
  phone?: string;
  department?: string;
  city?: string;
}

const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("users");

  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "sales_executive",
    storeId: "",
    storeName: "",
    department: "Lead Generation",
    phone: "",
    city: "",
  });

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

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load stores first, then users
        await loadStoresData();
        await loadUsersData();
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const loadUsersData = async () => {
    try {
      const usersData = await apiService.getUsers();
      
      const formattedUsers: User[] = usersData.map((user: any) => ({
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        permissions: [], // Will be set based on role in frontend
        storeId: user.store || '',
        storeName: '',  // This will be populated if we can get store details
        city: user.city || '',
        department: user.department || getDefaultDepartment(user.role),
        managedCity: user.role === 'procurement_admin' ? user.city : undefined,
      }));

      // If we have store data, we can match store IDs to names
      if (stores.length > 0) {
        formattedUsers.forEach(user => {
          if (user.storeId) {
            const matchingStore = stores.find(store => store.id === user.storeId);
            if (matchingStore) {
              user.storeName = matchingStore.name;
              user.city = matchingStore.city || user.city;
            }
          }
        });
      }

      // Sort users with newest first (assuming newer users have larger IDs)
      formattedUsers.sort((a, b) => {
        // Sort by creation time (larger MongoDB IDs are newer)
        return b.id.localeCompare(a.id);
      });

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

  const getDefaultDepartment = (role: string) => {
    switch (role) {
      case "store_admin": return "Store Management";
      case "sales_executive": return "Lead Generation";
      case "procurement_admin": return "Procurement Administration";
      case "procurement_executive": return "Vehicle Procurement";
      default: return "";
    }
  };

  const loadStoresData = async () => {
    try {
      const storesData = await apiService.getStores();
      
      const formattedStores = storesData.map((store: any) => ({
        id: store._id,
        name: store.storename,
        location: `${store.city}, ${store.state}`,
        address: store.address,
        phone: store.phone,
        email: store.storeemail,
        city: store.city,
        state: store.state,
        manager: store.manager || '',
        createdDate: store.createdAt ? 
          new Date(store.createdAt).toISOString().split("T")[0] : 
          new Date().toISOString().split("T")[0],
        status: store.status || 'active',
      }));

      if (user?.role === "global_admin") {
        setStores(formattedStores);
      } else if (user?.role === "store_admin" && user?.storeId) {
        // Filter to only show this admin's store
        const adminStore = formattedStores.filter(s => s.id === user.storeId);
        setStores(adminStore);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      toast({
        title: "Error Loading Stores",
        description: "Failed to load stores from database.",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    // Validate required fields
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including password.",
        variant: "destructive",
      });
      return;
    }

    // Role-specific validation
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
      setIsSubmitting(true);
      
      // Format the phone number to include +91 prefix if it doesn't have it
      let formattedPhone = userFormData.phone || '';
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        // If phone starts with numbers only, add +91 prefix
        if (/^\d+$/.test(formattedPhone)) {
          formattedPhone = `+91${formattedPhone}`;
        }
      }
      
      // Create user data for API with properly formatted phone
      const userData: UserData = {
        username: userFormData.name,
        email: userFormData.email,
        password: userFormData.password,
        role: userFormData.role,
        store: userFormData.storeId || undefined,
        phone: formattedPhone,
        department: userFormData.department,
        city: userFormData.city
      };

      // Call API to create user
      const response = await apiService.createUser(userData);

      // Generate permissions based on role (frontend only)
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

      // Get store name from the selected store
      let selectedStoreName = "";
      let selectedStoreCity = userFormData.city;
      if (userFormData.storeId) {
        const selectedStore = stores.find(s => s.id === userFormData.storeId);
        if (selectedStore) {
          selectedStoreName = selectedStore.name;
          selectedStoreCity = selectedStore.city || userFormData.city;
        }
      }

      const newUser: User = {
        id: response._id,
        name: userFormData.name,
        email: userFormData.email,
        phone: formattedPhone,
        role: userFormData.role,
        permissions,
        storeId: userFormData.storeId,
        storeName: selectedStoreName,
        city: selectedStoreCity,
        department: userFormData.department,
        managedCity: userFormData.role === 'procurement_admin' ? userFormData.city : undefined,
      };

      setUsers((prev) => [newUser, ...prev]);
      setAddUserOpen(false);
      resetUserForm();

      toast({
        title: "User Created Successfully!",
        description: `${newUser.name} has been added as a ${userFormData.role.replace("_", " ")}.`,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error Creating User",
        description: error instanceof Error ? error.message : "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    if (!userFormData.name || !userFormData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format the phone number to include +91 prefix if it doesn't have it
      let formattedPhone = userFormData.phone || '';
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        // If phone starts with numbers only, add +91 prefix
        if (/^\d+$/.test(formattedPhone)) {
          formattedPhone = `+91${formattedPhone}`;
        }
      }
      
      // Create update data with properly formatted phone
      const updateData: Partial<UserData> = {
        username: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        store: userFormData.storeId || undefined,
        phone: formattedPhone, // Use the formatted phone number
        department: userFormData.department,
        city: userFormData.city
      };
      
      // Only include password if it was changed
      if (userFormData.password) {
        updateData.password = userFormData.password;
      }

      // Call API to update user
      const response = await apiService.updateUser(selectedUser.id, updateData);
      
      // Update the user in the local state
      const updatedUser: User = {
        ...selectedUser,
        name: userFormData.name,
        email: userFormData.email,
        phone: userFormData.phone || '',
        role: userFormData.role,
        storeId: userFormData.storeId,
        storeName: userFormData.storeName,
        city: userFormData.city,
        department: userFormData.department,
      };

      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      setEditUserOpen(false);
      
      toast({
        title: "User Updated Successfully!",
        description: `${updatedUser.name}'s information has been updated.`,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error Updating User",
        description: error instanceof Error ? error.message : "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      
      // Call API to delete user
      await apiService.deleteUser(selectedUser.id);
      
      // Remove user from the local state
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setDeleteUserDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: "User Deleted Successfully!",
        description: `${selectedUser.name} has been removed from the system.`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error Deleting User",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      name: "",
      email: "",
      password: "",
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

  const getRoleBadge = (role: string) => {
    const variants = {
      global_admin: "bg-red-100 text-red-800 border-red-200",
      store_admin: "bg-blue-100 text-blue-800 border-blue-200",
      sales_executive: "bg-green-100 text-green-800 border-green-200",
      procurement_admin: "bg-purple-100 text-purple-800 border-purple-200",
      procurement_executive: "bg-orange-100 text-orange-800 border-orange-200",
    };
    const labels = {
      global_admin: "Global Admin",
      store_admin: "Store Admin",
      sales_executive: "Sales Executive",
      procurement_admin: "Procurement Admin",
      procurement_executive: "Procurement Executive",
    };
    return {
      className:
        variants[role as keyof typeof variants] || variants.sales_executive,
      label: labels[role as keyof typeof labels] || "Sales Executive",
    };
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStore = !filterStore || user.storeId === filterStore;
    return matchesSearch && matchesRole && matchesStore;
  });

  const UserCard = ({ user: userData }: { user: User }) => {
    const roleBadge = getRoleBadge(userData.role);
    const initials = getInitials(userData.name);
    
    // Choose avatar background color based on role
    const getAvatarClass = (role: string) => {
      switch (role) {
        case "global_admin": return "bg-red-100 text-red-800";
        case "store_admin": return "bg-blue-100 text-blue-800";
        case "sales_executive": return "bg-green-100 text-green-800";
        case "procurement_admin": return "bg-purple-100 text-purple-800";
        case "procurement_executive": return "bg-orange-100 text-orange-800";
        default: return "bg-primary/10 text-primary";
      }
    };
    
    return (
      <Card className="border border-border hover:border-primary/20 transition-colors">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={userData.name} />
                  <AvatarFallback className={getAvatarClass(userData.role)}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-lg">{userData.name}</h3>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>
              <Badge className={roleBadge.className}>{roleBadge.label}</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              {userData.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{userData.phone}</span>
                </div>
              )}
              
              {userData.storeName && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{userData.storeName}</span>
                </div>
              )}
              
              {userData.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{userData.city}</span>
                </div>
              )}
              
              {userData.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{userData.department}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <PermissionWrapper permission="manage_store_users">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedUser(userData);
                    setUserFormData({
                      name: userData.name,
                      email: userData.email,
                      password: "", // Empty password field for edit form
                      role: userData.role as any,
                      storeId: userData.storeId || "",
                      storeName: userData.storeName || "",
                      department: userData.department || "",
                      phone: userData.phone || "",
                      city: userData.city || "",
                    });
                    setEditUserOpen(true);
                  }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </PermissionWrapper>
              
              <PermissionWrapper permission="manage_store_users">
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setSelectedUser(userData);
                    setDeleteUserDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
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
              ? "Manage users across the entire system"
              : "Manage your store team and sales executives"}
          </p>
        </div>
        <div className="flex gap-2">
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
            placeholder="Search users by name, email or phone..."
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
        {user?.role === "global_admin" && stores.length > 0 && (
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
          <Avatar className="h-16 w-16 mx-auto mb-4">
            <AvatarFallback className="bg-muted">
              <Users className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
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
                  placeholder="John Smith"
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
                  placeholder="john@bikebiz.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userPhone">
                  Phone/Contact Number
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-input bg-muted text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="userPhone"
                  type="tel"
                  value={userFormData.phone}
                  className="rounded-l-none"
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="9876543210"
                  pattern="^[6-9]\d{9}$"
                  required
                />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userPassword">Password *</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => 
                    setUserFormData(prev => ({ 
                      ...prev, 
                      password: e.target.value 
                    }))
                  }
                  placeholder="Enter secure password"
                />
              </div>
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
                  {(user?.role === "procurement_admin" ||
                    user?.role === "global_admin") && (
                    <option value="procurement_executive">Procurement Executive</option>
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
                          {admin.name} - {admin.managedCity || admin.city || 'Unknown'}
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
            <Button 
              onClick={handleAddUser} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Creating...
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editUserName">Full Name *</Label>
                <Input
                  id="editUserName"
                  value={userFormData.name}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUserEmail">Email *</Label>
                <Input
                  id="editUserEmail"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editUserPhone">
                  Phone/Contact Number
                   <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-input bg-muted text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="editUserPhone"
                  type="tel"
                  value={userFormData.phone}
                  className="rounded-l-none"
                  onChange={(e) =>
                    setUserFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="9876543210"
                  pattern="^[6-9]\d{9}$"
                  required
                />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUserPassword">Password (leave blank to keep unchanged)</Label>
                <Input
                  id="editUserPassword"
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => 
                    setUserFormData(prev => ({ 
                      ...prev, 
                      password: e.target.value 
                    }))
                  }
                  placeholder="New password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editUserRole">Role *</Label>
                <select
                  id="editUserRole"
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
                      <option value="procurement_admin">Procurement Admin</option>
                    </>
                  )}
                  {(user?.role === "store_admin" || user?.role === "global_admin") && (
                    <option value="sales_executive">Sales Executive</option>
                  )}
                  {(user?.role === "procurement_admin" || user?.role === "global_admin") && (
                    <option value="procurement_executive">Procurement Executive</option>
                  )}
                </select>
              </div>
              {userFormData.role === "store_admin" || userFormData.role === "sales_executive" ? (
                <div className="space-y-2">
                  <Label htmlFor="editUserStore">Store *</Label>
                  <select
                    id="editUserStore"
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
                    disabled={user?.role === "store_admin"}
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="editUserCity">City</Label>
                  <Input
                    id="editUserCity"
                    value={userFormData.city}
                    onChange={(e) =>
                      setUserFormData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="User's city"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Updating...
                </span>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete user {selectedUser?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteUserDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Deleting...
                </span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
