import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import PermissionWrapper from "@/components/PermissionWrapper";
import { 
  Search, 
  Filter, 
  MapPin, 
  Fuel,
  Calendar,
  IndianRupee,
  Eye,
  Edit,
  Package,
  Phone,
  Mail,
  User,
  CreditCard,
  FileText,
  Star,
  Shield,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  Share2,
  Calculator,
  Users,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  MoreVertical,
  Camera,
  Award,
  Settings,
  History,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  AlertTriangle,
  Info,
  X,
  ChevronRight,
  Gauge,
  Wrench,
  Battery,
  Zap,
  CheckSquare,
  XSquare
} from "lucide-react";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  originalPrice?: number;
  km: number;
  fuel: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  location: string;
  status: 'available' | 'test_ride' | 'reserved' | 'sold' | 'maintenance';
  image: string;
  images?: string[];
  description?: string;
  features?: string[];
  documents?: string[];
  inspectionScore?: number;
  previousOwners?: number;
  insurance?: string;
  registrationState?: string;
  registrationNumber?: string;
  engineNumber?: string;
  chassisNumber?: string;
  seller?: string;
  sellerPhone?: string;
  purchaseDate?: string;
  addedDate: string;
  lastUpdated: string;
  views?: number;
  inquiries?: number;
  testRides?: number;
  serviceHistory?: ServiceRecord[];
  specifications?: VehicleSpecs;
  pricing?: PricingDetails;
}

interface ServiceRecord {
  id: string;
  date: string;
  type: 'maintenance' | 'repair' | 'inspection';
  description: string;
  cost: number;
  serviceCenter: string;
  nextServiceDue?: string;
}

interface VehicleSpecs {
  engineDisplacement: string;
  maxPower: string;
  maxTorque: string;
  mileage: string;
  fuelCapacity: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  groundClearance: string;
  seatHeight: string;
  wheelbase: string;
  tyreSize: string;
  brakes: string;
  suspension: string;
}

interface PricingDetails {
  costPrice: number;
  marketValue: number;
  depreciation: number;
  refurbishment: number;
  margin: number;
  finalPrice: number;
}

interface VehicleFormData {
  brand: string;
  model: string;
  variant: string;
  year: string;
  price: string;
  originalPrice: string;
  km: string;
  fuel: string;
  condition: string;
  location: string;
  status: string;
  description: string;
  features: string[];
  registrationNumber: string;
  engineNumber: string;
  chassisNumber: string;
  seller: string;
  sellerPhone: string;
  insurance: string;
  registrationState: string;
}

const STORAGE_KEY = 'bikebiz_inventory';

const Inventory = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editVehicleOpen, setEditVehicleOpen] = useState(false);
  const [leadGenOpen, setLeadGenOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  const [filterCriteria, setFilterCriteria] = useState({
    status: "",
    condition: "",
    brand: "",
    priceRange: "",
    yearRange: "",
    location: ""
  });
  const [vehicleFormData, setVehicleFormData] = useState<VehicleFormData>({
    brand: "",
    model: "",
    variant: "",
    year: "",
    price: "",
    originalPrice: "",
    km: "",
    fuel: "",
    condition: "",
    location: "",
    status: "available",
    description: "",
    features: [],
    registrationNumber: "",
    engineNumber: "",
    chassisNumber: "",
    seller: "",
    sellerPhone: "",
    insurance: "",
    registrationState: ""
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { hasPermission, user } = useAuth();

  // Load vehicles from localStorage on component mount and filter by store for sales users
  useEffect(() => {
    const storedVehicles = localStorage.getItem(STORAGE_KEY);
    let allVehicles = [];

    if (storedVehicles) {
      try {
        allVehicles = JSON.parse(storedVehicles);
      } catch (error) {
        console.error('Error parsing stored vehicles:', error);
        initializeDefaultVehicles();
        return;
      }
    } else {
      initializeDefaultVehicles();
      return;
    }

    // Filter vehicles by store for store-specific users
    if ((user?.role === 'store_admin' || user?.role === 'sales_executive') && user?.storeName) {
      const storeVehicles = allVehicles.filter((vehicle: Vehicle) =>
        vehicle.location === user.storeName ||
        vehicle.location.includes(user.storeName.split(' ')[0])
      );
      setVehicles(storeVehicles);
    } else {
      // Global admin sees all vehicles
      setVehicles(allVehicles);
    }
  }, [user]);

  // Save vehicles to localStorage whenever vehicles array changes
  // For sales users, merge with existing vehicles from other stores
  useEffect(() => {
    if (vehicles.length > 0) {
      if ((user?.role === 'store_admin' || user?.role === 'sales_executive') && user?.storeName) {
        // For sales users, merge their store vehicles with others
        const storedVehicles = localStorage.getItem(STORAGE_KEY);
        if (storedVehicles) {
          try {
            const allVehicles = JSON.parse(storedVehicles);
            // Remove old vehicles from this store and add current ones
            const otherStoreVehicles = allVehicles.filter((v: Vehicle) =>
              v.location !== user.storeName && !v.location.includes(user.storeName.split(' ')[0])
            );
            const updatedVehicles = [...otherStoreVehicles, ...vehicles];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
          } catch (error) {
            console.error('Error saving vehicles:', error);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
          }
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
        }
      } else {
        // Admin saves all vehicles directly
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
      }
    }
  }, [vehicles, user]);

  const initializeDefaultVehicles = () => {
    const defaultVehicles: Vehicle[] = [
      {
        id: '1',
        brand: "Honda",
        model: "Activa 6G",
        variant: "Deluxe",
        year: 2022,
        price: 85000,
        originalPrice: 95000,
        km: 8500,
        fuel: "Petrol",
        condition: "Excellent",
        location: "Mumbai Central Store",
        status: "available",
        image: "/placeholder.svg",
        images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
        description: "Well-maintained Honda Activa 6G with excellent fuel economy. Perfect for city commuting. Single owner, all documents available.",
        features: ["CBS (Combi Brake System)", "LED Headlight", "Digital Display", "Mobile Charging Port", "Under Seat Storage", "External Fuel Filler"],
        documents: ["RC (Registration Certificate)", "Insurance", "Service Records", "NOC", "Pollution Certificate"],
        inspectionScore: 9.2,
        previousOwners: 1,
        insurance: "Valid till Mar 2025",
        registrationState: "Maharashtra",
        registrationNumber: "MH 01 AB 1234",
        engineNumber: "JF50ET1234567",
        chassisNumber: "ME4JF50ETXK123456",
        seller: "Rajesh Kumar",
        sellerPhone: "+91 98765 43210",
        purchaseDate: "2024-01-15",
        addedDate: "2024-01-16",
        lastUpdated: "2024-01-16",
        views: 45,
        inquiries: 12,
        testRides: 5,
        specifications: {
          engineDisplacement: "109.51 cc",
          maxPower: "7.79 PS @ 8000 rpm",
          maxTorque: "8.79 Nm @ 6500 rpm",
          mileage: "60 kmpl",
          fuelCapacity: "5.3L",
          weight: "109 kg",
          length: "1833 mm",
          width: "684 mm",
          height: "1156 mm",
          groundClearance: "153 mm",
          seatHeight: "780 mm",
          wheelbase: "1238 mm",
          tyreSize: "Front: 90/90-12, Rear: 90/90-12",
          brakes: "Front: Drum, Rear: Drum with CBS",
          suspension: "Front: Telescopic, Rear: Spring loaded hydraulic"
        },
        pricing: {
          costPrice: 75000,
          marketValue: 82000,
          depreciation: 13000,
          refurbishment: 3000,
          margin: 10000,
          finalPrice: 85000
        }
      },
      {
        id: '2',
        brand: "TVS",
        model: "Jupiter",
        variant: "Classic",
        year: 2021,
        price: 72000,
        originalPrice: 85000,
        km: 12000,
        fuel: "Petrol",
        condition: "Good",
        location: "Andheri Store",
        status: "test_ride",
        image: "/placeholder.svg",
        images: ["/placeholder.svg", "/placeholder.svg"],
        description: "Reliable TVS Jupiter with good performance and comfort. Ideal for daily use. Well maintained with regular servicing.",
        features: ["External Fuel Filler", "Mobile Charging", "LED DRL", "Front Disc Brake", "Sync Braking System"],
        documents: ["RC", "Insurance", "Service Records", "Pollution Certificate"],
        inspectionScore: 8.5,
        previousOwners: 1,
        insurance: "Valid till Jun 2024",
        registrationState: "Maharashtra",
        registrationNumber: "MH 02 CD 5678",
        engineNumber: "TVS567890123",
        chassisNumber: "TVS12345678901234",
        seller: "Priya Sharma",
        sellerPhone: "+91 87654 32109",
        purchaseDate: "2024-01-10",
        addedDate: "2024-01-11",
        lastUpdated: "2024-01-16",
        views: 32,
        inquiries: 8,
        testRides: 3,
        specifications: {
          engineDisplacement: "109.7 cc",
          maxPower: "7.47 PS @ 7500 rpm",
          maxTorque: "8.4 Nm @ 6500 rpm",
          mileage: "62 kmpl",
          fuelCapacity: "5L",
          weight: "108 kg",
          length: "1834 mm",
          width: "650 mm",
          height: "1115 mm",
          groundClearance: "153 mm",
          seatHeight: "765 mm",
          wheelbase: "1275 mm",
          tyreSize: "Front: 90/90-12, Rear: 90/90-12",
          brakes: "Front: Disc, Rear: Drum with SBT",
          suspension: "Front: Telescopic, Rear: Gas filled"
        }
      },
      {
        id: '3',
        brand: "Bajaj",
        model: "Pulsar 150",
        variant: "Neon",
        year: 2020,
        price: 95000,
        originalPrice: 110000,
        km: 15000,
        fuel: "Petrol",
        condition: "Good",
        location: "Borivali Store",
        status: "reserved",
        image: "/placeholder.svg",
        description: "Sporty Bajaj Pulsar 150 with powerful engine and stylish design. Great for city and highway rides.",
        features: ["Digital Console", "LED Tail Light", "Split Seats", "Electric Start", "Alloy Wheels"],
        documents: ["RC", "Insurance", "Service Records", "NOC"],
        inspectionScore: 8.8,
        previousOwners: 2,
        insurance: "Valid till Dec 2024",
        registrationState: "Maharashtra",
        registrationNumber: "MH 04 EF 9012",
        addedDate: "2024-01-12",
        lastUpdated: "2024-01-16",
        views: 28,
        inquiries: 6,
        testRides: 2
      },
      {
        id: '4',
        brand: "Hero",
        model: "Splendor Plus",
        variant: "Standard",
        year: 2023,
        price: 68000,
        originalPrice: 75000,
        km: 3200,
        fuel: "Petrol",
        condition: "Excellent",
        location: "Mumbai Central Store",
        status: "available",
        image: "/placeholder.svg",
        description: "Brand new Hero Splendor Plus with excellent fuel efficiency and low maintenance.",
        features: ["i3S Technology", "LED DRL", "Analogue-Digital Console", "Self Start", "Alloy Wheels"],
        documents: ["RC", "Insurance", "Service Records", "Warranty Card"],
        inspectionScore: 9.5,
        previousOwners: 1,
        insurance: "Valid till Nov 2026",
        registrationState: "Maharashtra",
        addedDate: "2024-01-14",
        lastUpdated: "2024-01-16",
        views: 55,
        inquiries: 15,
        testRides: 7
      }
    ];
    setVehicles(defaultVehicles);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "bg-success/10 text-success border-success/20",
      test_ride: "bg-warning/10 text-warning border-warning/20",
      reserved: "bg-info/10 text-info border-info/20",
      sold: "bg-muted text-muted-foreground border-muted",
      maintenance: "bg-destructive/10 text-destructive border-destructive/20"
    };
    const labels = {
      available: "Available",
      test_ride: "Test Ride",
      reserved: "Reserved",
      sold: "Sold",
      maintenance: "Maintenance"
    };
    return {
      className: variants[status as keyof typeof variants] || variants.available,
      label: labels[status as keyof typeof labels] || "Available"
    };
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      Excellent: "text-success",
      Good: "text-warning",
      Fair: "text-info",
      Poor: "text-destructive"
    };
    return colors[condition as keyof typeof colors] || "text-muted-foreground";
  };

  const handleAddVehicle = () => {
    if (!vehicleFormData.brand || !vehicleFormData.model || !vehicleFormData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // For store-specific users, automatically set location to their store
    const vehicleLocation = (user?.role === 'store_admin' || user?.role === 'sales_executive') && user?.storeName
      ? user.storeName
      : vehicleFormData.location;

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      brand: vehicleFormData.brand,
      model: vehicleFormData.model,
      variant: vehicleFormData.variant,
      year: parseInt(vehicleFormData.year),
      price: parseInt(vehicleFormData.price),
      originalPrice: parseInt(vehicleFormData.originalPrice) || parseInt(vehicleFormData.price),
      km: parseInt(vehicleFormData.km),
      fuel: vehicleFormData.fuel,
      condition: vehicleFormData.condition as Vehicle['condition'],
      location: vehicleLocation,
      status: vehicleFormData.status as Vehicle['status'],
      image: "/placeholder.svg",
      description: vehicleFormData.description,
      features: vehicleFormData.features,
      registrationNumber: vehicleFormData.registrationNumber,
      engineNumber: vehicleFormData.engineNumber,
      chassisNumber: vehicleFormData.chassisNumber,
      seller: vehicleFormData.seller,
      sellerPhone: vehicleFormData.sellerPhone,
      insurance: vehicleFormData.insurance,
      registrationState: vehicleFormData.registrationState,
      inspectionScore: Math.floor(Math.random() * 3) + 8, // Random score between 8-10
      previousOwners: 1,
      documents: ["RC", "Insurance"],
      addedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      views: 0,
      inquiries: 0,
      testRides: 0
    };

    setVehicles(prev => [newVehicle, ...prev]);
    setAddVehicleOpen(false);
    resetVehicleForm();

    toast({
      title: "Vehicle Added Successfully!",
      description: `${newVehicle.brand} ${newVehicle.model} has been added to inventory.`,
    });
  };

  const handleEditVehicle = () => {
    if (!selectedVehicle || !vehicleFormData.brand || !vehicleFormData.model || !vehicleFormData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const updatedVehicle: Vehicle = {
      ...selectedVehicle,
      brand: vehicleFormData.brand,
      model: vehicleFormData.model,
      variant: vehicleFormData.variant,
      year: parseInt(vehicleFormData.year),
      price: parseInt(vehicleFormData.price),
      originalPrice: parseInt(vehicleFormData.originalPrice) || parseInt(vehicleFormData.price),
      km: parseInt(vehicleFormData.km),
      fuel: vehicleFormData.fuel,
      condition: vehicleFormData.condition as Vehicle['condition'],
      location: vehicleFormData.location,
      status: vehicleFormData.status as Vehicle['status'],
      description: vehicleFormData.description,
      features: vehicleFormData.features,
      registrationNumber: vehicleFormData.registrationNumber,
      engineNumber: vehicleFormData.engineNumber,
      chassisNumber: vehicleFormData.chassisNumber,
      seller: vehicleFormData.seller,
      sellerPhone: vehicleFormData.sellerPhone,
      insurance: vehicleFormData.insurance,
      registrationState: vehicleFormData.registrationState,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? updatedVehicle : v));
    setEditVehicleOpen(false);
    setSelectedVehicle(null);
    resetVehicleForm();

    toast({
      title: "Vehicle Updated Successfully!",
      description: `${updatedVehicle.brand} ${updatedVehicle.model} has been updated.`,
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    toast({
      title: "Vehicle Deleted",
      description: `${vehicle.brand} ${vehicle.model} has been removed from inventory.`,
    });
  };

  const handleDuplicateVehicle = (vehicle: Vehicle) => {
    const duplicatedVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      registrationNumber: "",
      engineNumber: "",
      chassisNumber: "",
      status: "available",
      addedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      views: 0,
      inquiries: 0,
      testRides: 0
    };

    setVehicles(prev => [duplicatedVehicle, ...prev]);
    toast({
      title: "Vehicle Duplicated",
      description: `${vehicle.brand} ${vehicle.model} has been duplicated.`,
    });
  };

  const resetVehicleForm = () => {
    setVehicleFormData({
      brand: "",
      model: "",
      variant: "",
      year: "",
      price: "",
      originalPrice: "",
      km: "",
      fuel: "",
      condition: "",
      location: "",
      status: "available",
      description: "",
      features: [],
      registrationNumber: "",
      engineNumber: "",
      chassisNumber: "",
      seller: "",
      sellerPhone: "",
      insurance: "",
      registrationState: ""
    });
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    // Increment view count
    setVehicles(prev => prev.map(v => 
      v.id === vehicle.id 
        ? { ...v, views: (v.views || 0) + 1 }
        : v
    ));
    setViewDetailsOpen(true);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      variant: vehicle.variant || "",
      year: vehicle.year.toString(),
      price: vehicle.price.toString(),
      originalPrice: vehicle.originalPrice?.toString() || vehicle.price.toString(),
      km: vehicle.km.toString(),
      fuel: vehicle.fuel,
      condition: vehicle.condition,
      location: vehicle.location,
      status: vehicle.status,
      description: vehicle.description || "",
      features: vehicle.features || [],
      registrationNumber: vehicle.registrationNumber || "",
      engineNumber: vehicle.engineNumber || "",
      chassisNumber: vehicle.chassisNumber || "",
      seller: vehicle.seller || "",
      sellerPhone: vehicle.sellerPhone || "",
      insurance: vehicle.insurance || "",
      registrationState: vehicle.registrationState || ""
    });
    setEditVehicleOpen(true);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterCriteria.status || vehicle.status === filterCriteria.status;
    const matchesCondition = !filterCriteria.condition || vehicle.condition === filterCriteria.condition;
    const matchesBrand = !filterCriteria.brand || vehicle.brand === filterCriteria.brand;
    const matchesLocation = !filterCriteria.location || vehicle.location === filterCriteria.location;

    // Price range filter
    let matchesPriceRange = true;
    if (filterCriteria.priceRange) {
      const [min, max] = filterCriteria.priceRange.split('-').map(Number);
      if (max) {
        matchesPriceRange = vehicle.price >= min && vehicle.price <= max;
      } else {
        matchesPriceRange = vehicle.price >= min;
      }
    }

    // Year range filter
    let matchesYearRange = true;
    if (filterCriteria.yearRange) {
      const [minYear, maxYear] = filterCriteria.yearRange.split('-').map(Number);
      if (maxYear) {
        matchesYearRange = vehicle.year >= minYear && vehicle.year <= maxYear;
      } else {
        matchesYearRange = vehicle.year >= minYear;
      }
    }

    return matchesSearch && matchesStatus && matchesCondition && matchesBrand && matchesLocation && matchesPriceRange && matchesYearRange;
  });

  const getInventoryStats = () => {
    const total = vehicles.length;
    const available = vehicles.filter(v => v.status === 'available').length;
    const testRide = vehicles.filter(v => v.status === 'test_ride').length;
    const reserved = vehicles.filter(v => v.status === 'reserved').length;
    const sold = vehicles.filter(v => v.status === 'sold').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
    const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
    
    return { total, available, testRide, reserved, sold, maintenance, totalValue };
  };

  const stats = getInventoryStats();

  const VehicleDetailsContent = () => (
    <ScrollArea className="max-h-[80vh]">
      <div className="space-y-6">
        {selectedVehicle && (
          <>
            {/* Vehicle Images */}
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                <Package className="w-16 h-16 text-muted-foreground" />
                <div className="absolute top-2 left-2">
                  <Badge className={getStatusBadge(selectedVehicle.status).className}>
                    {getStatusBadge(selectedVehicle.status).label}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant="outline" className="bg-background/80">
                    <Eye className="w-3 h-3 mr-1" />
                    {selectedVehicle.views || 0}
                  </Badge>
                </div>
              </div>
              
              {/* Vehicle Basic Info */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                  {selectedVehicle.variant && (
                    <p className="text-muted-foreground">{selectedVehicle.variant}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusBadge(selectedVehicle.status).className}>
                      {getStatusBadge(selectedVehicle.status).label}
                    </Badge>
                    {selectedVehicle.inspectionScore && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="text-sm font-medium">{selectedVehicle.inspectionScore}/10</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <span className="text-xl font-bold text-primary">
                        {selectedVehicle.price.toLocaleString()}
                      </span>
                    </div>
                    {selectedVehicle.originalPrice && selectedVehicle.originalPrice > selectedVehicle.price && (
                      <div className="text-xs text-muted-foreground line-through">
                        ₹{selectedVehicle.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Condition</div>
                    <div className={`font-medium ${getConditionColor(selectedVehicle.condition)}`}>
                      {selectedVehicle.condition}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Tabs */}
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="documents">Docs</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Year: {selectedVehicle.year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      <span className="text-sm">Mileage: {selectedVehicle.km.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4" />
                      <span className="text-sm">Fuel: {selectedVehicle.fuel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Location: {selectedVehicle.location}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Owners: {selectedVehicle.previousOwners}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Insurance: {selectedVehicle.insurance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Registration: {selectedVehicle.registrationState}</span>
                    </div>
                    {selectedVehicle.registrationNumber && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">Reg No: {selectedVehicle.registrationNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedVehicle.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedVehicle.description}</p>
                  </div>
                )}

                {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedVehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-success" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="specs" className="space-y-4">
                {selectedVehicle.specifications ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3">Engine & Performance</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>Engine: {selectedVehicle.specifications.engineDisplacement}</div>
                        <div>Max Power: {selectedVehicle.specifications.maxPower}</div>
                        <div>Max Torque: {selectedVehicle.specifications.maxTorque}</div>
                        <div>Mileage: {selectedVehicle.specifications.mileage}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Dimensions</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>Length: {selectedVehicle.specifications.length}</div>
                        <div>Width: {selectedVehicle.specifications.width}</div>
                        <div>Height: {selectedVehicle.specifications.height}</div>
                        <div>Weight: {selectedVehicle.specifications.weight}</div>
                        <div>Wheelbase: {selectedVehicle.specifications.wheelbase}</div>
                        <div>Ground Clearance: {selectedVehicle.specifications.groundClearance}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Features</h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>Brakes: {selectedVehicle.specifications.brakes}</div>
                        <div>Suspension: {selectedVehicle.specifications.suspension}</div>
                        <div>Tyre Size: {selectedVehicle.specifications.tyreSize}</div>
                        <div>Fuel Capacity: {selectedVehicle.specifications.fuelCapacity}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Specifications not available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                {selectedVehicle.documents && selectedVehicle.documents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedVehicle.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{doc}</span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No documents available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Vehicle History</h4>
                    <Badge variant="outline">{selectedVehicle.previousOwners} Previous Owner(s)</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-sm font-medium">Added to Inventory</div>
                        <div className="text-xs text-muted-foreground">{selectedVehicle.addedDate}</div>
                      </div>
                    </div>
                    
                    {selectedVehicle.purchaseDate && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <CreditCard className="w-4 h-4 text-success" />
                        <div>
                          <div className="text-sm font-medium">Purchase Date</div>
                          <div className="text-xs text-muted-foreground">{selectedVehicle.purchaseDate}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Edit className="w-4 h-4 text-warning" />
                      <div>
                        <div className="text-sm font-medium">Last Updated</div>
                        <div className="text-xs text-muted-foreground">{selectedVehicle.lastUpdated}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedVehicle.views || 0}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{selectedVehicle.inquiries || 0}</div>
                    <div className="text-xs text-muted-foreground">Inquiries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{selectedVehicle.testRides || 0}</div>
                    <div className="text-xs text-muted-foreground">Test Rides</div>
                  </div>
                </div>
                
                {selectedVehicle.pricing && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Pricing Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cost Price:</span>
                        <span>₹{selectedVehicle.pricing.costPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Value:</span>
                        <span>₹{selectedVehicle.pricing.marketValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>Depreciation:</span>
                        <span>-₹{selectedVehicle.pricing.depreciation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-warning">
                        <span>Refurbishment:</span>
                        <span>₹{selectedVehicle.pricing.refurbishment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-success">
                        <span>Margin:</span>
                        <span>₹{selectedVehicle.pricing.margin.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-primary">
                        <span>Final Price:</span>
                        <span>₹{selectedVehicle.pricing.finalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-4">
              <PermissionWrapper permission="manage_inventory">
                <Button 
                  variant="outline" 
                  onClick={() => openEditDialog(selectedVehicle)}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Vehicle
                </Button>
              </PermissionWrapper>
              <Button 
                onClick={() => {
                  setViewDetailsOpen(false);
                  // Add lead generation logic here
                }}
                className="w-full"
              >
                <Heart className="w-4 h-4 mr-2" />
                Generate Lead
              </Button>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );

  const VehicleFormContent = () => (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Select value={vehicleFormData.brand} onValueChange={(value) => setVehicleFormData(prev => ({ ...prev, brand: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Honda">Honda</SelectItem>
                    <SelectItem value="TVS">TVS</SelectItem>
                    <SelectItem value="Bajaj">Bajaj</SelectItem>
                    <SelectItem value="Hero">Hero</SelectItem>
                    <SelectItem value="Yamaha">Yamaha</SelectItem>
                    <SelectItem value="Royal Enfield">Royal Enfield</SelectItem>
                    <SelectItem value="Suzuki">Suzuki</SelectItem>
                    <SelectItem value="KTM">KTM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={vehicleFormData.model}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g., Activa 6G"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant">Variant</Label>
                <Input
                  id="variant"
                  value={vehicleFormData.variant}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, variant: e.target.value }))}
                  placeholder="e.g., Deluxe, Standard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={vehicleFormData.year}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="2023"
                  min="2000"
                  max="2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={vehicleFormData.price}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="85000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={vehicleFormData.originalPrice}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  placeholder="95000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="km">Kilometers *</Label>
                <Input
                  id="km"
                  type="number"
                  value={vehicleFormData.km}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, km: e.target.value }))}
                  placeholder="8500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel">Fuel Type *</Label>
                <Select value={vehicleFormData.fuel} onValueChange={(value) => setVehicleFormData(prev => ({ ...prev, fuel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="CNG">CNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={vehicleFormData.condition} onValueChange={(value) => setVehicleFormData(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={vehicleFormData.location} onValueChange={(value) => setVehicleFormData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai Central Store">Mumbai Central Store</SelectItem>
                    <SelectItem value="Andheri Store">Andheri Store</SelectItem>
                    <SelectItem value="Borivali Store">Borivali Store</SelectItem>
                    <SelectItem value="Thane Store">Thane Store</SelectItem>
                    <SelectItem value="Pune Store">Pune Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={vehicleFormData.status} onValueChange={(value) => setVehicleFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="test_ride">Test Ride</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={vehicleFormData.description}
                onChange={(e) => setVehicleFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the vehicle..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seller">Seller Name</Label>
                <Input
                  id="seller"
                  value={vehicleFormData.seller}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, seller: e.target.value }))}
                  placeholder="Seller name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellerPhone">Seller Phone</Label>
                <Input
                  id="sellerPhone"
                  value={vehicleFormData.sellerPhone}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, sellerPhone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationState">Registration State</Label>
                <Select value={vehicleFormData.registrationState} onValueChange={(value) => setVehicleFormData(prev => ({ ...prev, registrationState: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance Validity</Label>
                <Input
                  id="insurance"
                  value={vehicleFormData.insurance}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, insurance: e.target.value }))}
                  placeholder="Valid till Mar 2025"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={vehicleFormData.registrationNumber}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  placeholder="MH 01 AB 1234"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="engineNumber">Engine Number</Label>
                <Input
                  id="engineNumber"
                  value={vehicleFormData.engineNumber}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, engineNumber: e.target.value }))}
                  placeholder="Engine number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chassisNumber">Chassis Number</Label>
                <Input
                  id="chassisNumber"
                  value={vehicleFormData.chassisNumber}
                  onChange={(e) => setVehicleFormData(prev => ({ ...prev, chassisNumber: e.target.value }))}
                  placeholder="Chassis number"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );

  const VehicleDialog = ({ isEdit = false }) => (
    <>
      {isMobile ? (
        <Drawer open={isEdit ? editVehicleOpen : addVehicleOpen} onOpenChange={isEdit ? setEditVehicleOpen : setAddVehicleOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</DrawerTitle>
              <DrawerDescription>
                {isEdit ? 'Update vehicle information' : 'Add a new vehicle to inventory'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <VehicleFormContent />
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (isEdit) {
                      setEditVehicleOpen(false);
                      setSelectedVehicle(null);
                    } else {
                      setAddVehicleOpen(false);
                    }
                    resetVehicleForm();
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={isEdit ? handleEditVehicle : handleAddVehicle} 
                  className="flex-1"
                >
                  {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isEdit ? editVehicleOpen : addVehicleOpen} onOpenChange={isEdit ? setEditVehicleOpen : setAddVehicleOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
              <DialogDescription>
                {isEdit ? 'Update vehicle information' : 'Add a new vehicle to inventory'}
              </DialogDescription>
            </DialogHeader>
            <VehicleFormContent />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (isEdit) {
                    setEditVehicleOpen(false);
                    setSelectedVehicle(null);
                  } else {
                    setAddVehicleOpen(false);
                  }
                  resetVehicleForm();
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={isEdit ? handleEditVehicle : handleAddVehicle} 
                className="flex-1"
              >
                {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background p-3 lg:p-4 pb-20 lg:pb-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">Inventory</h1>
            {(user?.role === 'store_admin' || user?.role === 'sales_executive') && user?.storeName && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <MapPin className="w-3 h-3 mr-1" />
                {user.storeName}
              </Badge>
            )}
          </div>
          <p className="text-sm lg:text-base text-muted-foreground hidden lg:block">
            {(user?.role === 'store_admin' || user?.role === 'sales_executive') ? `Manage vehicles for ${user?.storeName}` : 'Manage your two-wheeler inventory with advanced features'}
          </p>
        </div>
        <PermissionWrapper permission="manage_inventory">
          <Button
            onClick={() => {
              resetVehicleForm();
              setAddVehicleOpen(true);
            }}
            className="w-full lg:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </PermissionWrapper>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search vehicles..."
            className="pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)} className="flex-1 lg:flex-none h-11">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <PermissionWrapper permission="manage_inventory">
            <Button variant="outline" onClick={() => {
              const dataStr = JSON.stringify(vehicles, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = 'inventory.json';
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }} className="hidden lg:flex h-11">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionWrapper>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterCriteria.status} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="test_ride">Test Ride</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={filterCriteria.condition} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Conditions</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={filterCriteria.brand} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, brand: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Brands</SelectItem>
                    {Array.from(new Set(vehicles.map(v => v.brand))).map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Select value={filterCriteria.priceRange} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, priceRange: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Prices</SelectItem>
                    <SelectItem value="0-50000">Under ₹50k</SelectItem>
                    <SelectItem value="50000-75000">₹50k - ₹75k</SelectItem>
                    <SelectItem value="75000-100000">₹75k - ₹1L</SelectItem>
                    <SelectItem value="100000-150000">₹1L - ₹1.5L</SelectItem>
                    <SelectItem value="150000">Above ₹1.5L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year Range</Label>
                <Select value={filterCriteria.yearRange} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, yearRange: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                    <SelectItem value="2021-2022">2021-2022</SelectItem>
                    <SelectItem value="2019-2020">2019-2020</SelectItem>
                    <SelectItem value="2017-2018">2017-2018</SelectItem>
                    <SelectItem value="2015-2016">2015-2016</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={filterCriteria.location} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {Array.from(new Set(vehicles.map(v => v.location))).map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setFilterCriteria({
                status: "", condition: "", brand: "", priceRange: "", yearRange: "", location: ""
              })}>
                Clear Filters
              </Button>
              <Button onClick={() => setFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs lg:text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-2xl font-bold text-success">{stats.available}</div>
            <div className="text-xs lg:text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-2xl font-bold text-warning">{stats.testRide}</div>
            <div className="text-xs lg:text-sm text-muted-foreground">Test Rides</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-2xl font-bold text-info">{stats.reserved}</div>
            <div className="text-xs lg:text-sm text-muted-foreground">Reserved</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-2xl font-bold text-muted-foreground">{stats.sold}</div>
            <div className="text-xs lg:text-sm text-muted-foreground">Sold</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-2xl font-bold text-primary">₹{(stats.totalValue / 100000).toFixed(1)}L</div>
            <div className="text-xs lg:text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {filteredVehicles.map((vehicle) => {
          const status = getStatusBadge(vehicle.status);
          return (
            <Card key={vehicle.id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-video bg-muted relative">
                <div className="absolute top-2 left-2">
                  <Badge className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PermissionWrapper permission="manage_inventory" hideOnNoAccess>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background" onClick={() => openEditDialog(vehicle)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </PermissionWrapper>
                  <PermissionWrapper permission="manage_inventory" hideOnNoAccess>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background" onClick={() => handleDuplicateVehicle(vehicle)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </PermissionWrapper>
                  <PermissionWrapper permission="manage_inventory" hideOnNoAccess>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-destructive text-destructive hover:text-destructive-foreground" onClick={() => handleDeleteVehicle(vehicle.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </PermissionWrapper>
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Package className="w-12 h-12" />
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {vehicle.inspectionScore && (
                    <Badge variant="outline" className="bg-background/80 text-xs">
                      <Star className="w-3 h-3 mr-1 fill-warning text-warning" />
                      {vehicle.inspectionScore}
                    </Badge>
                  )}
                  {vehicle.views !== undefined && (
                    <Badge variant="outline" className="bg-background/80 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      {vehicle.views}
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-3 lg:p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-base lg:text-lg text-foreground line-clamp-1">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    {vehicle.variant && (
                      <p className="text-xs lg:text-sm text-muted-foreground">{vehicle.variant}</p>
                    )}
                    <div className="grid grid-cols-3 gap-2 lg:flex lg:items-center lg:gap-4 text-xs lg:text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="truncate">{vehicle.year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" />
                        <span className="truncate">{vehicle.km.toLocaleString()}k</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="w-3 h-3" />
                        <span className="truncate">{vehicle.fuel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-primary" />
                        <span className="text-lg lg:text-xl font-bold text-primary">
                          {(vehicle.price / 1000).toFixed(0)}k
                        </span>
                      </div>
                      {vehicle.originalPrice && vehicle.originalPrice > vehicle.price && (
                        <div className="text-xs text-muted-foreground line-through">
                          ₹{(vehicle.originalPrice / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div className={`text-xs lg:text-sm font-medium ${getConditionColor(vehicle.condition)}`}>
                      {vehicle.condition}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs lg:text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{vehicle.location}</span>
                  </div>

                  {vehicle.registrationNumber && (
                    <div className="flex items-center gap-1 text-xs lg:text-sm text-muted-foreground">
                      <CreditCard className="w-3 h-3" />
                      <span className="truncate">{vehicle.registrationNumber}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => handleViewDetails(vehicle)}
                    >
                      <Eye className="w-3 h-3 lg:mr-1" />
                      <span className="hidden lg:inline">Details</span>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => {
                        // Add lead generation logic
                        toast({
                          title: "Lead Generated",
                          description: `Interest logged for ${vehicle.brand} ${vehicle.model}`,
                        });
                      }}
                    >
                      <Heart className="w-3 h-3 lg:mr-1" />
                      <span className="hidden lg:inline">Interest</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
          <p className="text-muted-foreground mb-4">
            {vehicles.length === 0 
              ? "Start by adding your first vehicle to the inventory."
              : "Try adjusting your search or filter criteria."
            }
          </p>
          <PermissionWrapper permission="manage_inventory">
            <Button onClick={() => {
              resetVehicleForm();
              setAddVehicleOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </PermissionWrapper>
        </div>
      )}

      {/* Vehicle Details Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Vehicle Details</DrawerTitle>
              <DrawerDescription>
                Complete information about this vehicle
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <VehicleDetailsContent />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Vehicle Details</DialogTitle>
              <DialogDescription>
                Complete information about this vehicle
              </DialogDescription>
            </DialogHeader>
            <VehicleDetailsContent />
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Vehicle Dialogs */}
      <VehicleDialog isEdit={false} />
      <VehicleDialog isEdit={true} />
    </div>
  );
};

export default Inventory;
