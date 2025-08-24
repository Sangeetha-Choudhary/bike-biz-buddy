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
  Activity
} from "lucide-react";

interface StoreFormData {
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  manager: string;
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
  
  const [storeFormData, setStoreFormData] = useState<StoreFormData>({
    name: "",
    location: "",
    address: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    manager: ""
  });

  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: "",
    email: "",
    department: "Lead Generation",
    phone: ""
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, hasPermission } = useAuth();

  // Load stores and users data
  useEffect(() => {
    loadStoresData();
    loadUsersData();
  }, [user]);

  const loadStoresData = () => {
    // For global admin, show all stores
    if (user?.role === 'global_admin' && user?.stores) {
      setStores(user.stores);
    } 
    // For store admin, show only their store
    else if (user?.role === 'store_admin' && user?.managedStore) {
      setStores([user.managedStore]);
    }
    else {
      setStores([]);
    }
  };

  const loadUsersData = () => {
    // Simulate loading users for the store
    const sampleUsers: User[] = [
      {
        id: '5',
        name: 'Priya Sharma',
        email: 'sales1@mumbai.com',
        role: 'sales_executive',
        permissions: ['manage_leads', 'view_inventory'],
        storeId: '1',
        storeName: 'Mumbai Central Store',
        city: 'Mumbai',
        department: 'Lead Generation'
      },
      {
        id: '6',
        name: 'Rohit Kumar',
        email: 'sales2@mumbai.com',
        role: 'sales_executive',
        permissions: ['manage_leads', 'view_inventory'],
        storeId: '1',
        storeName: 'Mumbai Central Store',
        city: 'Mumbai',
        department: 'Sales & Fulfillment'
      }
    ];

    if (user?.role === 'store_admin') {
      // Filter users for current store
      const currentStoreUsers = sampleUsers.filter(u => u.storeId === user.storeId);
      setStoreUsers(currentStoreUsers);
    } else if (user?.role === 'global_admin') {
      // Global admin sees all users
      setStoreUsers(sampleUsers);
    }
  };

  const handleAddStore = () => {
    if (!storeFormData.name || !storeFormData.city || !storeFormData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newStore: Store = {
      id: Date.now().toString(),
      name: storeFormData.name,
      location: storeFormData.location,
      address: storeFormData.address,
      phone: storeFormData.phone,
      email: storeFormData.email,
      city: storeFormData.city,
      state: storeFormData.state,
      manager: storeFormData.manager,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setStores(prev => [newStore, ...prev]);
    setAddStoreOpen(false);
    resetStoreForm();

    toast({
      title: "Store Created Successfully!",
      description: `${newStore.name} has been added to the system.`,
    });
  };

  const handleAddUser = () => {
    if (!userFormData.name || !userFormData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userFormData.name,
      email: userFormData.email,
      role: 'sales_executive',
      permissions: ['manage_leads', 'view_inventory', 'match_engine', 'create_sales'],
      storeId: user?.storeId || selectedStore?.id || '',
      storeName: user?.storeName || selectedStore?.name || '',
      city: user?.city || selectedStore?.city || '',
      department: userFormData.department
    };

    setStoreUsers(prev => [newUser, ...prev]);
    setAddUserOpen(false);
    resetUserForm();

    toast({
      title: "Sales Executive Added!",
      description: `${newUser.name} has been added to ${newUser.storeName}.`,
    });
  };

  const resetStoreForm = () => {
    setStoreFormData({
      name: "",
      location: "",
      address: "",
      phone: "",
      email: "",
      city: "",
      state: "",
      manager: ""
    });
  };

  const resetUserForm = () => {
    setUserFormData({
      name: "",
      email: "",
      department: "Lead Generation",
      phone: ""
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-red-100 text-red-800 border-red-200"
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const getDepartmentBadge = (department: string) => {
    const variants = {
      "Lead Generation": "bg-blue-100 text-blue-800 border-blue-200",
      "Sales & Fulfillment": "bg-green-100 text-green-800 border-green-200",
      "Store Management": "bg-purple-100 text-purple-800 border-purple-200"
    };
    return variants[department as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <h4 className="font-semibold text-foreground">{store.name}</h4>
                  <p className="text-sm text-muted-foreground">{store.location}, {store.city}</p>
                </div>
              </div>
            </div>
            <Badge className={getStatusBadge(store.status)}>
              {store.status.toUpperCase()}
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
            <div className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              Manager: {store.manager}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created: {store.createdDate}</span>
            <span>{store.state}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setSelectedStore(store);
                setStoreDetailsOpen(true);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
            <PermissionWrapper permission="manage_store">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSelectedStore(store);
                  setStoreFormData({
                    name: store.name,
                    location: store.location,
                    address: store.address || '',
                    phone: store.phone || '',
                    email: store.email || '',
                    city: store.city,
                    state: store.state,
                    manager: store.manager || ''
                  });
                  setEditStoreOpen(true);
                }}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
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
            <Badge className={getDepartmentBadge(user.department || '')}>
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
                {selectedStore ? `Information for ${selectedStore.name}` : 'Loading...'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <ScrollArea className="max-h-[70vh]">
                {selectedStore && (
                  <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
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
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            <span>Manager: {selectedStore.manager}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Store Team</h3>
                        <Button
                          size="sm"
                          onClick={() => window.location.hash = '#users'}
                          variant="outline"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Manage Team
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {storeUsers
                          .filter(u => u.storeId === selectedStore.id)
                          .map(user => (
                            <UserCard key={user.id} user={user} />
                          ))}
                        {storeUsers.filter(u => u.storeId === selectedStore.id).length === 0 && (
                          <div className="text-center py-8">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">No sales executives assigned to this store</p>
                            <p className="text-xs text-muted-foreground mb-4">Use User Management to add team members</p>
                            <Button
                              size="sm"
                              onClick={() => window.location.hash = '#users'}
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
                              <p className="text-xs text-muted-foreground">Sales</p>
                              <p className="font-semibold">₹2.5L</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Leads</p>
                              <p className="font-semibold">45</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Inventory</p>
                              <p className="font-semibold">23</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Conversion</p>
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
              <Button variant="outline" onClick={() => setStoreDetailsOpen(false)}>
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
                {selectedStore ? `Information for ${selectedStore.name}` : 'Loading...'}
              </DialogDescription>
            </DialogHeader>
            {selectedStore && (
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Store Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedStore.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Contact & Management</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <UserIcon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Store Manager</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.manager}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Created</p>
                            <p className="text-sm text-muted-foreground">{selectedStore.createdDate}</p>
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
                      onClick={() => window.location.hash = '#users'}
                      variant="outline"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Team
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storeUsers
                      .filter(u => u.storeId === selectedStore.id)
                      .map(user => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    {storeUsers.filter(u => u.storeId === selectedStore.id).length === 0 && (
                      <div className="col-span-2 text-center py-8">
                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h4 className="font-semibold mb-2">No Team Members Yet</h4>
                        <p className="text-muted-foreground mb-4">Use User Management to add sales executives to this store</p>
                        <Button
                          onClick={() => window.location.hash = '#users'}
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
                          <p className="text-sm text-muted-foreground">Monthly Sales</p>
                          <p className="text-xl font-bold">₹2.5L</p>
                          <p className="text-xs text-green-600">+12% vs last month</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Active Leads</p>
                          <p className="text-xl font-bold">45</p>
                          <p className="text-xs text-blue-600">+8 this week</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Inventory</p>
                          <p className="text-xl font-bold">23</p>
                          <p className="text-xs text-purple-600">Available units</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <Target className="w-8 h-8 text-orange-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                          <p className="text-xl font-bold">68%</p>
                          <p className="text-xs text-orange-600">Above target</p>
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
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Store Management</h1>
            {user?.role === 'store_admin' && user?.storeName && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Building className="w-3 h-3 mr-1" />
                {user.storeName}
              </Badge>
            )}
          </div>
          <p className="text-sm lg:text-base text-muted-foreground">
            {user?.role === 'global_admin' 
              ? 'Manage all stores and their operations' 
              : 'Manage your store and team'}
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
        <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Stores Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No stores match your search criteria' : 'No stores available'}
          </p>
          <PermissionWrapper permission="all">
            <Button onClick={() => setAddStoreOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Store
            </Button>
          </PermissionWrapper>
        </div>
      )}

      {/* Store Details Dialog */}
      <StoreDetailsDialog />

      {/* Add Store Dialog */}
      <Dialog open={addStoreOpen} onOpenChange={setAddStoreOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription>
              Create a new store location with all necessary details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={storeFormData.name}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mumbai Central Store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={storeFormData.location}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Mumbai Central"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={storeFormData.address}
                onChange={(e) => setStoreFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Dr. D.N. Road, Mumbai Central, Mumbai - 400008"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={storeFormData.city}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Mumbai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={storeFormData.state}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={storeFormData.phone}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 22 2123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={storeFormData.email}
                  onChange={(e) => setStoreFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="mumbai@bikebiz.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Store Manager</Label>
              <Input
                id="manager"
                value={storeFormData.manager}
                onChange={(e) => setStoreFormData(prev => ({ ...prev, manager: e.target.value }))}
                placeholder="Manager Name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStoreOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStore}>
              <Plus className="w-4 h-4 mr-2" />
              Create Store
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
              <Label htmlFor="userName">Full Name *</Label>
              <Input
                id="userName"
                value={userFormData.name}
                onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Priya Sharma"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email *</Label>
              <Input
                id="userEmail"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="priya@bikebiz.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={userFormData.department} onValueChange={(value) => setUserFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                  <SelectItem value="Sales & Fulfillment">Sales & Fulfillment</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPhone">Phone (Optional)</Label>
              <Input
                id="userPhone"
                value={userFormData.phone}
                onChange={(e) => setUserFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
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
