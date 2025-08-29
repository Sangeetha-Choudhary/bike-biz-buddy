import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, Store, User } from "@/contexts/AuthContext";
import PermissionWrapper from "@/components/PermissionWrapper";
import {
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Calendar,
  Building,
  Edit,
  Trash2,
  Plus,
  Users,
  Settings,
  Eye,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  Target,
  Clock,
  Star,
  Activity,
  Loader2,
} from "lucide-react";
import StateCitySelector from '@/components/ui/StateCitySelector';
import apiService from '@/services/api';

interface StoreFormData {
  storename: string;
  address: string;
  googlemaplink: string;
  city: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  pancard?: string;
  state: string;
  gstnumber?: string;
  storeemail: string;
  whatsapp: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  status?: 'active' | 'inactive';
  password?: string; // Added for store creation
}

interface UserFormData {
  name: string;
  email: string;
  department: string;
  phone?: string;
}

const StoreManagement = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeUsers, setStoreUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeDetailsOpen, setStoreDetailsOpen] = useState(false);
  const [addStoreOpen, setAddStoreOpen] = useState(false);
  const [editStoreOpen, setEditStoreOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [storeFormData, setStoreFormData] = useState<StoreFormData>({
    storename: "",
    address: "",
    googlemaplink: "",
    city: "",
    phone: "",
    state: "",
    storeemail: "",
    whatsapp: "",

    // latitude, longitude, gstnumber, pancard are now optional
  });

  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: "",
    email: "",
    department: "Lead Generation",
    phone: "",
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, hasPermission } = useAuth();
  
  // Load stores and users data
  useEffect(() => {
    loadStoresData();
    loadUsersData();
  }, [user]);

  const loadStoresData = async () => {
    try {
      setLoading(true);
      const storesData = await apiService.getStores();

      // Transform API response to match frontend interface
      const transformedStores = storesData.map((store: any) => ({
        id: store._id,
        name: store.storename,
        location: `${store.city}, ${store.state}`,
        address: store.address,
        phone: store.phone,
        whatsapp: store.whatsapp,
        email: store.storeemail || store.email,
        googlemaplink: store.googlemaplink,
        city: store.city,
        state: store.state,
        latitude: store.latitude,
        longitude: store.longitude,
        gstnumber: store.gstnumber,
        pancard: store.pancard,
        manager: store.manager?.name || "",
        createdDate: new Date(store.createdAt || store.createdDate).toISOString().split("T")[0],
        status: store.status || "active",
        isDeleted: store.isDeleted || false,
        deletedAt: store.deletedAt ? new Date(store.deletedAt).toISOString().split("T")[0] : null,
      }));

      setStores(transformedStores);
    } catch (error) {
      console.error('Error loading stores:', error);
      toast({
        title: "Error Loading Stores",
        description: error instanceof Error ? error.message : "Failed to load stores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsersData = async () => {
    try {
      // Load users for the current store
      if (user?.storeId) {
        const usersData = await apiService.getStoreUsers(user.storeId);

        // Transform API response to match frontend interface
        const transformedUsers = usersData.map((userData: any) => ({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions || [],
          storeId: userData.storeId,
          storeName: userData.storeName || "",
          city: userData.city || "",
          department: userData.department || "Sales & Fulfillment",
        }));

        setStoreUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddStore = async () => {
    if (
      !storeFormData.storename ||
      !storeFormData.city ||
      !storeFormData.state ||
      !storeFormData.phone ||
      !storeFormData.whatsapp ||
      !storeFormData.address ||
      !storeFormData.storeemail
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanedFormData: StoreFormData = {
        ...storeFormData,
        googlemaplink: storeFormData.googlemaplink?.trim() ? storeFormData.googlemaplink : undefined,
        pancard: storeFormData.pancard?.trim() ? storeFormData.pancard : undefined,
        gstnumber: storeFormData.gstnumber?.trim() ? storeFormData.gstnumber : undefined,
        latitude: storeFormData.latitude !== undefined && storeFormData.latitude !== 0 ? storeFormData.latitude : undefined,
        longitude: storeFormData.longitude !== undefined && storeFormData.longitude !== 0 ? storeFormData.longitude : undefined,
        password: "DefaultPass@123", // Adding default password since it's required by the backend
      };
      const newStore = await apiService.createStore(cleanedFormData);

      // Transform response and add to stores list
      const transformedStore: Store = {
        id: newStore._id,
        name: newStore.storename || newStore.name,
        location: `${newStore.city}, ${newStore.state}`,
        address: newStore.address,
        phone: newStore.phone,
        email: newStore.storeemail || newStore.email,
        googlemaplink: newStore.googlemaplink,
        city: newStore.city,
        state: newStore.state,
        manager: newStore.manager?.name || "",
        // createdDate: new Date(newStore.createdAt || newStore.createdDate).toISOString().split("T")[0],
        createdDate: (newStore.createdAt || newStore.createdDate)
          ? new Date(newStore.createdAt || newStore.createdDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: newStore.status || "active",
        whatsapp: newStore.whatsapp || "",
        latitude: newStore.latitude,
        longitude: newStore.longitude,
        gstnumber: newStore.gstnumber,
        pancard: newStore.pancard,
      };

      setStores((prev) => [transformedStore, ...prev]);
      setAddStoreOpen(false);
      resetStoreForm();
``
      toast({
        title: "Store Created Successfully!",
        description: `${transformedStore.name} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: "Error Creating Store",
        description: error instanceof Error ? error.message : "Failed to create store",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUser = async () => {
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

      const userData = {
        ...userFormData,
        storeId: user?.storeId || selectedStore?.id || "",
      };

      const newUser = await apiService.createUser(userData);

      // Transform response and add to users list
      const transformedUser: User = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions || [],
        storeId: newUser.storeId,
        storeName: newUser.storeName || "",
        city: newUser.city || "",
        department: newUser.department,
      };

      setStoreUsers((prev) => [transformedUser, ...prev]);
      setAddUserOpen(false);
      resetUserForm();

      toast({
        title: "Sales Executive Added!",
        description: `${transformedUser.name} has been added to the store.`,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error Adding User",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStore = async () => {
    if (!selectedStore) return;

    try {
      setIsSubmitting(true);
      
      // Prepare data for API - convert from frontend format to backend format
      const storeUpdateData = {
        storename: storeFormData.storename,
        address: storeFormData.address,
        googlemaplink: storeFormData.googlemaplink?.trim() ? storeFormData.googlemaplink : undefined,
        city: storeFormData.city,
        latitude: storeFormData.latitude !== undefined ? storeFormData.latitude : undefined,
        longitude: storeFormData.longitude !== undefined ? storeFormData.longitude : undefined,
        phone: storeFormData.phone,
        whatsapp: storeFormData.whatsapp,
        state: storeFormData.state,
        storeemail: storeFormData.storeemail,
        pancard: storeFormData.pancard?.trim() ? storeFormData.pancard : undefined,
        gstnumber: storeFormData.gstnumber?.trim() ? storeFormData.gstnumber : undefined,
        status: storeFormData.status || 'active'
      };
      
      const updatedStore = await apiService.updateStore(selectedStore.id, storeUpdateData);

      // Transform response and update stores list
      const transformedStore: Store = {
        id: updatedStore._id || updatedStore.id,
        name: updatedStore.storename || updatedStore.name,
        location: `${updatedStore.city}, ${updatedStore.state}`,
        address: updatedStore.address,
        phone: updatedStore.phone,
        email: updatedStore.storeemail || updatedStore.email,
        googlemaplink: updatedStore.googlemaplink,
        city: updatedStore.city,
        state: updatedStore.state,
        manager: updatedStore.manager?.name || "",
        createdDate: (updatedStore.createdAt || updatedStore.createdDate) 
          ? new Date(updatedStore.createdAt || updatedStore.createdDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: updatedStore.status || 'active', // Ensure status is always set
        whatsapp: updatedStore.whatsapp,
        latitude: updatedStore.latitude,
        longitude: updatedStore.longitude,
        gstnumber: updatedStore.gstnumber,
        pancard: updatedStore.pancard,
        isDeleted: updatedStore.isDeleted || false,
        deletedAt: updatedStore.deletedAt ? new Date(updatedStore.deletedAt).toISOString().split("T")[0] : null,
      };

      setStores(prev => prev.map(store =>
        store.id === selectedStore.id ? transformedStore : store
      ));

      setEditStoreOpen(false);
      resetStoreForm();

      toast({
        title: "Store Updated Successfully!",
        description: `${transformedStore.name} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating store:', error);
      toast({
        title: "Error Updating Store",
        description: error instanceof Error ? error.message : "Failed to update store",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await apiService.deleteStore(storeId);
    
      // Remove deleted store from the list
      setStores(prev => prev.filter(store => store.id !== storeId));

      toast({
        title: "Store Deleted",
        description: "Store has been soft deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting store:', error);
      toast({
        title: "Error Deleting Store",
        description: error instanceof Error ? error.message : "Failed to delete store",
        variant: "destructive",
      });
    }
  };
  
  const handleRestoreStore = async (storeId: string) => {
    try {
      await apiService.restoreStore(storeId);
      setStores(prev => prev.map(store => 
        store.id === storeId ? { ...store, isDeleted: false, status: 'active' } : store
      ));

      toast({
        title: "Store Restored",
        description: "Store has been restored successfully.",
      });
    } catch (error) {
      console.error('Error restoring store:', error);
      toast({
        title: "Error Restoring Store",
        description: error instanceof Error ? error.message : "Failed to restore store",
        variant: "destructive",
      });
    }
  };

  const resetStoreForm = () => {
    setStoreFormData({
      storename: "",
      address: "",
      googlemaplink: "",
      city: "",
      latitude: undefined,
      longitude: undefined,
      phone: "",
      pancard: undefined,
      state: "",
      gstnumber: undefined,
      storeemail: "",
      whatsapp: undefined,
    });
  };

  const resetUserForm = () => {
    setUserFormData({
      name: "",
      email: "",
      department: "Lead Generation",
      phone: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-red-100 text-red-800 border-red-200",
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const getDepartmentBadge = (department: string) => {
    const variants = {
      "Lead Generation": "bg-blue-100 text-blue-800 border-blue-200",
      "Sales & Fulfillment": "bg-green-100 text-green-800 border-green-200",
      "Store Management": "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      variants[department as keyof typeof variants] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const filteredStores = stores.filter((store) => {
    const name = store.name ?? "";
    const city = store.city ?? "";
    const location = store.location ?? "";
    const term = searchTerm.toLowerCase();
    
    // Filter based on search term
    const matchesSearch = (
      name.toLowerCase().includes(term) ||
      city.toLowerCase().includes(term) ||
      location.toLowerCase().includes(term)
    );
    
    // Filter out deleted stores
    if (store.isDeleted) {
      return false;
    }
    
    return matchesSearch;
  });

  const StoreCard = ({ store }: { store: Store }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {store.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {store.city}, {store.state}
                  </p>
                </div>
              </div>
            </div>
            <Badge className={getStatusBadge(store.status || 'active')}>
              {(store.status || 'active').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{store.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {store.phone}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {store.email}
            </div>
            {store.manager && (
              <div className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                Manager: {store.manager}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created: {store.createdDate}</span>
            <span>{store.state}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <PermissionWrapper permission="manage_store">
              {!store.isDeleted ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedStore(store);
                      setStoreFormData({
                        storename: store.name,
                        address: store.address || "",
                        googlemaplink: store.googlemaplink || "",
                        city: store.city,
                        latitude: store.latitude ?? undefined,
                        longitude: store.longitude ?? undefined,
                        phone: store.phone || "",
                        pancard: store.pancard ?? undefined,
                        state: store.state,
                        gstnumber: store.gstnumber ?? undefined,
                        storeemail: store.email || "",
                        whatsapp: store.whatsapp || "",
                      });
                      setEditStoreOpen(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteStore(store.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRestoreStore(store.id)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Restore
                </Button>
              )}
            </PermissionWrapper>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const UserCard = ({ user }: { user: User }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h5 className="font-medium text-sm">{user.name}</h5>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge className={getDepartmentBadge(user.department || "")}>
              {user.department}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Role: Sales Executive • {user.city}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StoreDetailsDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={storeDetailsOpen} onOpenChange={setStoreDetailsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Store Details</DrawerTitle>
              <DrawerDescription>
                {selectedStore
                  ? `Information for ${selectedStore.name}`
                  : "Loading..."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <ScrollArea className="max-h-[70vh]">
                {selectedStore && (
                  <Tabs
                    value={currentTab}
                    onValueChange={setCurrentTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold">Store Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedStore.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedStore.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedStore.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedStore.email}</span>
                          </div>
                          {selectedStore.manager && (
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-muted-foreground" />
                              <span>Manager: {selectedStore.manager}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Store Team</h3>
                        <Button
                          size="sm"
                          onClick={() => (window.location.hash = "#users")}
                          variant="outline"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Manage Team
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {storeUsers
                          .filter((u) => u.storeId === selectedStore.id)
                          .map((user) => (
                            <UserCard key={user.id} user={user} />
                          ))}
                        {storeUsers.filter(
                          (u) => u.storeId === selectedStore.id
                        ).length === 0 && (
                            <div className="text-center py-8">
                              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground mb-2">
                                No sales executives assigned to this store
                              </p>
                              <p className="text-xs text-muted-foreground mb-4">
                                Use User Management to add team members
                              </p>
                              <Button
                                size="sm"
                                onClick={() => (window.location.hash = "#users")}
                                variant="outline"
                              >
                                <Users className="w-3 h-3 mr-1" />
                                Go to User Management
                              </Button>
                            </div>
                          )}
                      </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Card className="p-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Sales
                              </p>
                              <p className="font-semibold">₹2.5L</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Leads
                              </p>
                              <p className="font-semibold">45</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Inventory
                              </p>
                              <p className="font-semibold">23</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Conversion
                              </p>
                              <p className="font-semibold">68%</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </ScrollArea>
            </div>
            <DrawerFooter>
              <Button
                variant="outline"
                onClick={() => setStoreDetailsOpen(false)}
              >
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={storeDetailsOpen} onOpenChange={setStoreDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Store Details</DialogTitle>
              <DialogDescription>
                {selectedStore
                  ? `Information for ${selectedStore.name}`
                  : "Loading..."}
              </DialogDescription>
            </DialogHeader>
            {selectedStore && (
              <Tabs
                value={currentTab}
                onValueChange={setCurrentTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        Store Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedStore.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedStore.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedStore.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedStore.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        Contact & Management
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedStore.email}
                            </p>
                          </div>
                        </div>
                        {selectedStore.manager && (
                          <div className="flex items-center gap-3">
                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Store Manager</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedStore.manager}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Created</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedStore.createdDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Store Team</h3>
                    <Button
                      onClick={() => (window.location.hash = "#users")}
                      variant="outline"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Team
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storeUsers
                      .filter((u) => u.storeId === selectedStore.id)
                      .map((user) => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    {storeUsers.filter((u) => u.storeId === selectedStore.id)
                      .length === 0 && (
                        <div className="col-span-2 text-center py-8">
                          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h4 className="font-semibold mb-2">
                            No Team Members Yet
                          </h4>
                          <p className="text-muted-foreground mb-4">
                            Use User Management to add sales executives to this
                            store
                          </p>
                          <Button
                            onClick={() => (window.location.hash = "#users")}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Go to User Management
                          </Button>
                        </div>
                      )}
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <h3 className="font-semibold text-lg">Store Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Monthly Sales
                          </p>
                          <p className="text-xl font-bold">₹2.5L</p>
                          <p className="text-xs text-green-600">
                            +12% vs last month
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Active Leads
                          </p>
                          <p className="text-xl font-bold">45</p>
                          <p className="text-xs text-blue-600">+8 this week</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Inventory
                          </p>
                          <p className="text-xl font-bold">23</p>
                          <p className="text-xs text-purple-600">
                            Available units
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Target className="w-8 h-8 text-orange-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Conversion Rate
                          </p>
                          <p className="text-xl font-bold">68%</p>
                          <p className="text-xs text-orange-600">
                            Above target
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
              Store Management
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
              ? "Manage all stores and their operations"
              : "Manage your store and team"}
          </p>
        </div>
        <PermissionWrapper permission="all">
          <Button
            onClick={() => {
              resetStoreForm();
              setAddStoreOpen(true);
            }}
            className="w-full lg:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Store
          </Button>
        </PermissionWrapper>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search stores by name, city, or location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Show Deleted Toggle - Removed */}
          <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((store, index) => (
          <StoreCard 
            key={`store-${store.id || index}`}  
            store={{
              ...store,
              status: store.status || 'active'  // Ensure status is never undefined
            }} 
          />
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Stores Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No stores match your search criteria"
              : "No stores available"}
          </p>
          <PermissionWrapper permission="all">
            <Button onClick={() => setAddStoreOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Store
            </Button>
          </PermissionWrapper>
        </div>
      )}

      {/* Add Store Dialog */}
      <Dialog open={addStoreOpen} onOpenChange={setAddStoreOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Store</DialogTitle>
            <DialogDescription>
              Create a new store location with all necessary details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Store Information</h3>

              <div className="space-y-2">
                <Label htmlFor="storename">
                  Store Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="storename"
                  type="text"
                  value={storeFormData.storename}
                  onChange={(e) =>
                    setStoreFormData((prev) => ({
                      ...prev,
                      storename: e.target.value,
                    }))
                  }
                  placeholder="Store Name"
                  required
                />
              </div>

              {/* State City Selector */}
              <StateCitySelector
                selectedState={storeFormData.state}
                selectedCity={storeFormData.city}
                onStateChange={(stateName) =>
                  setStoreFormData((prev) => ({
                    ...prev,
                    state: stateName
                  }))
                }
                onCityChange={(cityName) =>
                  setStoreFormData((prev) => ({
                    ...prev,
                    city: cityName
                  }))
                }
                stateLabel="State"
                cityLabel="City"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone (India)
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-input bg-muted text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      className="rounded-l-none"
                      placeholder="9876543210"
                      maxLength={10}
                      value={storeFormData.phone}
                      onChange={(e) =>
                        setStoreFormData((prev) => ({
                          ...prev,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      pattern="^[6-9]\d{9}$"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">
                    Whatsapp Number (India)
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-input bg-muted text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="whatsapp"
                      type="tel"
                      inputMode="numeric"
                      className="rounded-l-none"
                      placeholder="9876543210"
                      maxLength={10}
                      value={storeFormData.whatsapp ?? ""}
                      onChange={(e) =>
                        setStoreFormData((prev) => ({
                          ...prev,
                          whatsapp: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                      pattern="^[6-9]\d{9}$"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="address"
                  value={storeFormData.address}
                  onChange={(e) =>
                    setStoreFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="123 Dr. D.N. Road, Mumbai Central, Mumbai - 400008"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="googlemaplink">Google Map Link</Label>
                <Input
                  id="googlemaplink"
                  type="url"
                  value={storeFormData.googlemaplink ?? ""}
                  onChange={(e) =>
                    setStoreFormData((prev) => ({
                      ...prev,
                      googlemaplink: e.target.value || undefined,
                    }))
                  }
                  placeholder="https://maps.app.goo.gl/..."
                  pattern="https?://(maps\.google\.com|goo\.gl|maps\.app\.goo\.gl).*"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={storeFormData.latitude ?? 0}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({
                        ...prev,
                        latitude: Number.isNaN(e.target.valueAsNumber)
                          ? 0
                          : e.target.valueAsNumber || undefined,
                      }))
                    }
                    placeholder="Enter latitude (e.g., 12.9716)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={storeFormData.longitude ?? 0}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({
                        ...prev,
                        longitude: Number.isNaN(e.target.valueAsNumber)
                          ? 0
                          : e.target.valueAsNumber || undefined,
                      }))
                    }
                    placeholder="Enter longitude (e.g., 77.5946)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeemail">
                  Store Email
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="storeemail"
                  type="email"
                  value={storeFormData.storeemail}
                  onChange={(e) =>
                    setStoreFormData((prev) => ({
                      ...prev,
                      storeemail: e.target.value,
                    }))
                  }
                  placeholder="mumbai@bikebiz.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstnumber">
                    GST Number
                  </Label>
                  <Input
                    id="gstnumber"
                    type="text"
                    maxLength={15}
                    value={storeFormData.gstnumber ?? ""}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({
                        ...prev,
                        gstnumber: e.target.value.toUpperCase() || undefined,
                      }))
                    }
                    placeholder="Enter GST Number (e.g., 27ABCDE1234F1Z5)"
                    pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pancard">
                    PAN Number
                  </Label>
                  <Input
                    id="pancard"
                    type="text"
                    maxLength={10}
                    value={storeFormData.pancard ?? ""}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({
                        ...prev,
                        pancard: e.target.value.toUpperCase() || undefined,
                      }))
                    }
                    placeholder="ABCDE1234F"
                    pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStoreOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStore} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Building className="w-4 h-4 mr-2" />
              Create Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Store Dialog */}
      <Dialog open={editStoreOpen} onOpenChange={setEditStoreOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>
              Update store information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Same form fields as Add Store */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Store Information</h3>

              <div className="space-y-2">
                <Label htmlFor="edit-storename">
                  Store Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="edit-storename"
                  type="text"
                  value={storeFormData.storename}
                  onChange={(e) =>
                    setStoreFormData((prev) => ({
                      ...prev,
                      storename: e.target.value,
                    }))
                  }
                  placeholder="Store Name"
                  required
                />
              </div>

              {/* State City Selector */}
              <StateCitySelector
                selectedState={storeFormData.state}
                selectedCity={storeFormData.city}
                onStateChange={(stateName) =>
                  setStoreFormData((prev) => ({
                    ...prev,
                    state: stateName
                  }))
                }
                onCityChange={(cityName) =>
                  setStoreFormData((prev) => ({
                    ...prev,
                    city: cityName
                  }))
                }
                stateLabel="State"
                cityLabel="City"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone (India)
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-input bg-muted text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      className="rounded-l-none"
                      placeholder="9876543210"
                      maxLength={10}
                      value={storeFormData.phone}
                      onChange={(e) =>
                        setStoreFormData((prev) => ({
                          ...prev,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      pattern="^[6-9]\d{9}$"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">
                    Whatsapp Number (India)
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-input bg-muted text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="whatsapp"
                      type="tel"
                      inputMode="numeric"
                      className="rounded-l-none"
                      placeholder="9876543210"
                      maxLength={10}
                      value={storeFormData.whatsapp ?? ""}
                      onChange={(e) =>
                        setStoreFormData((prev) => ({
                          ...prev,
                          whatsapp: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                      pattern="^[6-9]\d{9}$"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="address"
                  value={storeFormData.address}
                  onChange={(e) =>
                    setStoreFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="123 Dr. D.N. Road, Mumbai Central, Mumbai - 400008"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="googlemaplink">Google Map Link</Label>
                <Input
                  id="googlemaplink"
                  type="url"
                  value={storeFormData.googlemaplink}
                  onChange={(e) =>
                    setStoreFormData((prev) => ({
                      ...prev,
                      googlemaplink: e.target.value,
                    }))
                  }
                  placeholder="https://maps.app.goo.gl/..."
                  pattern="https?://(maps\.google\.com|goo\.gl|maps\.app\.goo\.gl).*"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">
                    Latitude
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={storeFormData.latitude ?? 0}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({
                        ...prev,
                        latitude: Number.isNaN(e.target.valueAsNumber)
                          ? 0
                          : e.target.valueAsNumber || undefined,
                      }))
                    }
                    placeholder="Enter latitude (e.g., 12.9716)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">
                    Longitude
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={storeFormData.longitude ?? 0}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({
                        ...prev,
                        longitude: Number.isNaN(e.target.valueAsNumber)
                          ? 0
                          : e.target.valueAsNumber || undefined,
                      }))
                    }
                    placeholder="Enter longitude (e.g., 77.5946)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeemail">
                  Store Email
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="storeemail"
                  type="email"
                  value={storeFormData.storeemail}
                  onChange={(e) =>
                    setStoreFormData((prev) => ({
                      ...prev,
                      storeemail: e.target.value,
                    }))
                  }
                  placeholder="mumbai@bikebiz.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstnumber">
                    GST Number
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </Label>
                  <Input
                    id="gstnumber"
                    type="text"
                    maxLength={15}
                    value={storeFormData.gstnumber ?? ""}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({
                        ...prev,
                        gstnumber: e.target.value.toUpperCase() || undefined,
                      }))
                    }
                    placeholder="Enter GST Number (e.g., 27ABCDE1234F1Z5)"
                    pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pancard">
                    PAN Number
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </Label>
                  <Input
                    id="pancard"
                    type="text"
                    maxLength={10}
                    value={storeFormData.pancard ?? ""}
                    onChange={(e) =>
                      setStoreFormData((prev) => ({
                        ...prev,
                        pancard: e.target.value.toUpperCase() || undefined,
                      }))
                    }
                    placeholder="ABCDE1234F"
                    pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStoreOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStore} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Edit className="w-4 h-4 mr-2" />
              Update Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sales Executive</DialogTitle>
            <DialogDescription>
              Add a new sales executive to the store team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Priya Sharma"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
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

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={userFormData.department}
                onValueChange={(value) =>
                  setUserFormData((prev) => ({ ...prev, department: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead Generation">
                    Lead Generation
                  </SelectItem>
                  <SelectItem value="Sales & Fulfillment">
                    Sales & Fulfillment
                  </SelectItem>
                  <SelectItem value="Customer Service">
                    Customer Service
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                value={userFormData.phone}
                onChange={(e) =>
                  setUserFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Plus className="w-4 h-4 mr-2" />
              Add Executive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreManagement;