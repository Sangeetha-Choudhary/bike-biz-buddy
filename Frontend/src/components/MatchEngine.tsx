import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Search, 
  Filter,
  MapPin,
  IndianRupee,
  Calendar,
  Star,
  User,
  Package,
  Heart,
  Check,
  X,
  Phone,
  MessageCircle,
  Send,
  Clock,
  Zap,
  Target,
  RotateCcw,
  Settings,
  TrendingUp,
  Award,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface Lead {
  id: number;
  name: string;
  phone: string;
  location: string;
  interest: string;
  budget: string;
  status: 'hot' | 'warm' | 'cold';
  rating: number;
  email?: string;
  source?: string;
  lastContact?: string;
  notes?: string;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  condition: string;
  location: string;
  distance: string;
  matchScore: number;
  reasons: string[];
  availability: 'available' | 'test_drive' | 'reserved';
  seller?: string;
  features?: string[];
}

interface MatchCriteria {
  priceWeight: number;
  locationWeight: number;
  brandWeight: number;
  conditionWeight: number;
  yearWeight: number;
}

const MatchEngine = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [matchedVehicles, setMatchedVehicles] = useState<Vehicle[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [scheduleTestRideOpen, setScheduleTestRideOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filterCriteria, setFilterCriteria] = useState({
    minPrice: "",
    maxPrice: "",
    maxDistance: "",
    condition: "",
    brand: "",
    availability: ""
  });
  const [matchCriteria, setMatchCriteria] = useState<MatchCriteria>({
    priceWeight: 30,
    locationWeight: 25,
    brandWeight: 20,
    conditionWeight: 15,
    yearWeight: 10
  });
  const [messageData, setMessageData] = useState({
    message: "",
    includeImages: true,
    includePricing: true,
    includeLocation: true
  });
  const [testRideData, setTestRideData] = useState({
    date: "",
    time: "",
    duration: "30",
    notes: ""
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Sample vehicles data - defined before useEffect to avoid reference errors
  const allVehicles: Vehicle[] = [
    {
      id: 1,
      brand: "Honda",
      model: "Activa 6G",
      year: 2022,
      price: 78000,
      km: 8500,
      condition: "Excellent",
      location: "Mumbai Central Store",
      distance: "0.5 km",
      matchScore: 95,
      reasons: ["Perfect model match", "Within budget", "Same location"],
      availability: "available",
      seller: "AutoMax Motors",
      features: ["CBS", "LED Headlight", "Digital Display"]
    },
    {
      id: 2,
      brand: "Honda",
      model: "Activa 5G",
      year: 2021,
      price: 72000,
      km: 12000,
      condition: "Good",
      location: "Andheri Store",
      distance: "8 km",
      matchScore: 85,
      reasons: ["Similar model", "Within budget", "Nearby location"],
      availability: "available",
      seller: "City Bikes",
      features: ["External Fuel Filler", "Mobile Charging"]
    },
    {
      id: 3,
      brand: "TVS",
      model: "Jupiter",
      year: 2022,
      price: 75000,
      km: 9000,
      condition: "Excellent",
      location: "Mumbai Central Store",
      distance: "0.5 km",
      matchScore: 80,
      reasons: ["Same segment", "Within budget", "Same location"],
      availability: "test_drive",
      seller: "AutoMax Motors",
      features: ["LED DRL", "Front Disc Brake"]
    },
    {
      id: 4,
      brand: "Honda",
      model: "Activa 6G",
      year: 2021,
      price: 82000,
      km: 15000,
      condition: "Good",
      location: "Borivali Store",
      distance: "12 km",
      matchScore: 75,
      reasons: ["Perfect model match", "Slightly over budget", "Nearby"],
      availability: "reserved",
      seller: "Speed Wheels",
      features: ["CBS", "LED Headlight"]
    }
  ];

  // Load vehicles from localStorage with store filtering
  useEffect(() => {
    const storedVehicles = localStorage.getItem('bikebiz_inventory');
    if (storedVehicles) {
      try {
        const vehicles = JSON.parse(storedVehicles);
        // Filter vehicles by store for store-specific users
        if ((user?.role === 'store_admin' || user?.role === 'sales_executive') && user?.storeName) {
          const storeVehicles = vehicles.filter((vehicle: any) =>
            vehicle.location === user.storeName ||
            vehicle.location.includes(user.storeName.split(' ')[0])
          );
          setAvailableVehicles(storeVehicles);
        } else {
          // Global admin sees all vehicles
          setAvailableVehicles(vehicles);
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
        setAvailableVehicles(allVehicles);
      }
    } else {
      setAvailableVehicles(allVehicles);
    }
  }, [user]);

  // Generate store-specific leads based on user's store
  const getStoreSpecificLeads = (): Lead[] => {
    const storeLeadsData = {
      'Mumbai Central Store': [
        {
          id: 1,
          name: "Rajesh Kumar",
          phone: "+91 98765 43210",
          location: "Mumbai Central",
          interest: "Honda Activa 6G",
          budget: "80000",
          status: "hot" as const,
          rating: 4.5,
          email: "rajesh@email.com",
          source: "Facebook",
          lastContact: "Today",
          notes: "Looking for immediate purchase. Prefers silver color."
        },
        {
          id: 2,
          name: "Priya Sharma",
          phone: "+91 87654 32109",
          location: "Andheri West",
          interest: "TVS Jupiter",
          budget: "75000",
          status: "warm" as const,
          rating: 4.2,
          email: "priya@email.com",
          source: "Referral",
          lastContact: "Yesterday"
        }
      ],
      'Delhi Store': [
        {
          id: 11,
          name: "Amit Gupta",
          phone: "+91 91234 56780",
          location: "Connaught Place",
          interest: "Honda Activa 6G",
          budget: "82000",
          status: "hot" as const,
          rating: 4.6,
          email: "amit@email.com",
          source: "Google Ads",
          lastContact: "Today"
        },
        {
          id: 12,
          name: "Neha Singh",
          phone: "+91 89123 45678",
          location: "Karol Bagh",
          interest: "TVS Jupiter",
          budget: "77000",
          status: "warm" as const,
          rating: 4.3,
          email: "neha@email.com",
          source: "Referral",
          lastContact: "Yesterday"
        }
      ],
      'Bangalore Store': [
        {
          id: 21,
          name: "Karthik Reddy",
          phone: "+91 99876 54321",
          location: "Koramangala",
          interest: "Royal Enfield Classic 350",
          budget: "165000",
          status: "hot" as const,
          rating: 4.8,
          email: "karthik@email.com",
          source: "Instagram",
          lastContact: "1 hour ago"
        },
        {
          id: 22,
          name: "Divya Krishnan",
          phone: "+91 98765 43210",
          location: "Indiranagar",
          interest: "Honda Activa 6G",
          budget: "78000",
          status: "warm" as const,
          rating: 4.4,
          email: "divya@email.com",
          source: "Facebook",
          lastContact: "Today"
        }
      ]
    };

    // Return store-specific leads for store-specific users
    if ((user?.role === 'store_admin' || user?.role === 'sales_executive') && user?.storeName) {
      return storeLeadsData[user.storeName as keyof typeof storeLeadsData] || [];
    }

    // Return all leads for global admin
    return Object.values(storeLeadsData).flat();
  };

  const allLeads = getStoreSpecificLeads();

  // Initialize with first lead
  const currentLead = selectedLead || allLeads[0];


  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 80) return "text-warning";
    return "text-info";
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 90) return "bg-success/10 border-success/20";
    if (score >= 80) return "bg-warning/10 border-warning/20";
    return "bg-info/10 border-info/20";
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants = {
      available: "bg-success/10 text-success border-success/20",
      test_drive: "bg-warning/10 text-warning border-warning/20",
      reserved: "bg-info/10 text-info border-info/20",
      sold: "bg-muted text-muted-foreground border-muted",
      maintenance: "bg-destructive/10 text-destructive border-destructive/20"
    };
    const labels = {
      available: "Available",
      test_drive: "Test Drive",
      reserved: "Reserved",
      sold: "Sold",
      maintenance: "Maintenance"
    };
    return {
      className: variants[availability as keyof typeof variants] || variants.available,
      label: labels[availability as keyof typeof labels] || "Available"
    };
  };

  const handleRunMatch = async () => {
    setIsMatching(true);
    setMatchProgress(0);
    
    // Simulate matching process with progress
    const steps = [
      "Analyzing lead preferences...",
      "Scanning inventory...",
      "Calculating match scores...",
      "Applying filters...",
      "Sorting results..."
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMatchProgress((i + 1) * 20);
      toast({
        title: "Smart Match Engine",
        description: steps[i],
      });
    }
    
    // Apply matching logic based on criteria using real inventory data
    const filtered = availableVehicles.filter(vehicle => {
      const budget = parseInt(currentLead.budget);
      const budgetMatch = vehicle.price <= budget * 1.1; // Allow 10% over budget

      if (!budgetMatch) return false;

      // Apply additional filters
      if (filterCriteria.minPrice && vehicle.price < parseInt(filterCriteria.minPrice)) return false;
      if (filterCriteria.maxPrice && vehicle.price > parseInt(filterCriteria.maxPrice)) return false;
      if (filterCriteria.condition && vehicle.condition !== filterCriteria.condition) return false;
      if (filterCriteria.brand && vehicle.brand !== filterCriteria.brand) return false;
      if (filterCriteria.availability && vehicle.status !== filterCriteria.availability) return false;

      // Only show available vehicles for matching
      if (vehicle.status !== 'available') return false;

      return true;
    });
    
    // Recalculate match scores based on weights
    const scored = filtered.map(vehicle => {
      const budget = parseInt(currentLead.budget);
      const priceScore = Math.max(0, 100 - Math.abs(vehicle.price - budget) / budget * 100);
      const locationScore = vehicle.location.includes(currentLead.location.split(' ')[0]) ? 100 : 70;
      const brandScore = vehicle.brand.toLowerCase() === currentLead.interest.toLowerCase().split(' ')[0] ? 100 : 60;
      const conditionScore = vehicle.condition === "Excellent" ? 100 : 80;
      const yearScore = Math.max(0, (vehicle.year - 2015) / 8 * 100);

      const totalScore =
        (priceScore * matchCriteria.priceWeight +
         locationScore * matchCriteria.locationWeight +
         brandScore * matchCriteria.brandWeight +
         conditionScore * matchCriteria.conditionWeight +
         yearScore * matchCriteria.yearWeight) / 100;

      // Create match reasons based on scoring
      const reasons = [];
      if (brandScore === 100) reasons.push("Perfect brand match");
      if (priceScore > 90) reasons.push("Within budget");
      if (locationScore === 100) reasons.push("Same location");
      if (conditionScore === 100) reasons.push("Excellent condition");
      if (yearScore > 80) reasons.push("Recent model");

      return {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        km: vehicle.km,
        condition: vehicle.condition,
        location: vehicle.location,
        distance: "2.5 km", // Calculate or estimate distance
        matchScore: Math.round(totalScore),
        reasons: reasons.length > 0 ? reasons : ["Good match"],
        availability: vehicle.status || 'available',
        seller: vehicle.seller || "AutoMax Motors",
        features: vehicle.features || []
      };
    });
    
    // Sort by match score
    scored.sort((a, b) => b.matchScore - a.matchScore);
    
    setMatchedVehicles(scored);
    setIsMatching(false);
    setMatchProgress(100);
    
    toast({
      title: "Match Complete!",
      description: `Found ${scored.length} matching vehicles for ${currentLead.name}`,
    });
  };

  const handleSendToLead = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setMessageData(prev => ({
      ...prev,
      message: `Hi ${currentLead.name}! 

We found a perfect match for you:

🏍️ ${vehicle.brand} ${vehicle.model} (${vehicle.year})
💰 Price: ₹${vehicle.price.toLocaleString()}
📍 Location: ${vehicle.location}
⭐ Condition: ${vehicle.condition}
🛣️ Only ${vehicle.distance} from your location

${vehicle.features ? `✨ Key Features: ${vehicle.features.join(', ')}` : ''}

Would you like to schedule a test ride or get more details?

Best regards,
Your BikeWale Team`
    }));
    setSendMessageOpen(true);
  };

  const handleScheduleTestRide = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setScheduleTestRideOpen(true);
  };

  const handleRejectMatch = (vehicle: Vehicle) => {
    setMatchedVehicles(prev => prev.filter(v => v.id !== vehicle.id));
    toast({
      title: "Match Removed",
      description: `${vehicle.brand} ${vehicle.model} removed from matches`,
    });
  };

  const handleSendMessage = () => {
    if (!selectedVehicle) return;

    // In a real app, this would send via WhatsApp API
    const phoneNumber = currentLead.phone.replace(/\D/g, '');
    const message = encodeURIComponent(messageData.message);

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Message Sent Successfully!",
      description: `WhatsApp opened with message for ${currentLead.name} about ${selectedVehicle.brand} ${selectedVehicle.model}`,
    });
    setSendMessageOpen(false);
    setMessageData({
      message: "",
      includeImages: true,
      includePricing: true,
      includeLocation: true
    });
  };

  const handleConfirmTestRide = () => {
    if (!selectedVehicle || !testRideData.date || !testRideData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Save test ride to localStorage
    const testRideRecord = {
      id: Date.now(),
      vehicleId: selectedVehicle.id,
      vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`,
      leadId: currentLead.id,
      leadName: currentLead.name,
      leadPhone: currentLead.phone,
      date: testRideData.date,
      time: testRideData.time,
      duration: testRideData.duration,
      notes: testRideData.notes,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    const existingTestRides = JSON.parse(localStorage.getItem('bikebiz_test_rides') || '[]');
    existingTestRides.push(testRideRecord);
    localStorage.setItem('bikebiz_test_rides', JSON.stringify(existingTestRides));

    toast({
      title: "Test Ride Scheduled!",
      description: `Test ride scheduled for ${currentLead.name} on ${testRideData.date} at ${testRideData.time}`,
    });
    setScheduleTestRideOpen(false);
    setTestRideData({
      date: "",
      time: "",
      duration: "30",
      notes: ""
    });
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setMatchedVehicles([]);
    toast({
      title: "Lead Selected",
      description: `Now finding matches for ${lead.name}`,
    });
  };

  const filteredVehicles = matchedVehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MessageDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={sendMessageOpen} onOpenChange={setSendMessageOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Send to Customer</DrawerTitle>
              <DrawerDescription>
                Send vehicle details to {currentLead.name} via WhatsApp
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={messageData.message}
                      onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                      rows={10}
                      placeholder="Type your message here..."
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Include Additional Information</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="includeImages"
                          checked={messageData.includeImages}
                          onChange={(e) => setMessageData(prev => ({ ...prev, includeImages: e.target.checked }))}
                        />
                        <Label htmlFor="includeImages">Vehicle Images</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="includePricing"
                          checked={messageData.includePricing}
                          onChange={(e) => setMessageData(prev => ({ ...prev, includePricing: e.target.checked }))}
                        />
                        <Label htmlFor="includePricing">Detailed Pricing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="includeLocation"
                          checked={messageData.includeLocation}
                          onChange={(e) => setMessageData(prev => ({ ...prev, includeLocation: e.target.checked }))}
                        />
                        <Label htmlFor="includeLocation">Location & Contact Details</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSendMessageOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send WhatsApp
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={sendMessageOpen} onOpenChange={setSendMessageOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send to Customer</DialogTitle>
              <DialogDescription>
                Send vehicle details to {currentLead.name} via WhatsApp
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={messageData.message}
                  onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                  rows={12}
                  placeholder="Type your message here..."
                />
              </div>
              
              <div className="space-y-3">
                <Label>Include Additional Information</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeImages"
                      checked={messageData.includeImages}
                      onChange={(e) => setMessageData(prev => ({ ...prev, includeImages: e.target.checked }))}
                    />
                    <Label htmlFor="includeImages">Vehicle Images</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includePricing"
                      checked={messageData.includePricing}
                      onChange={(e) => setMessageData(prev => ({ ...prev, includePricing: e.target.checked }))}
                    />
                    <Label htmlFor="includePricing">Detailed Pricing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeLocation"
                      checked={messageData.includeLocation}
                      onChange={(e) => setMessageData(prev => ({ ...prev, includeLocation: e.target.checked }))}
                    />
                    <Label htmlFor="includeLocation">Location & Contact Details</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSendMessageOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  const TestRideDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={scheduleTestRideOpen} onOpenChange={setScheduleTestRideOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Schedule Test Ride</DrawerTitle>
              <DrawerDescription>
                Schedule a test ride for {currentLead.name}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={testRideData.date}
                      onChange={(e) => setTestRideData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={testRideData.time}
                      onChange={(e) => setTestRideData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={testRideData.duration} onValueChange={(value) => setTestRideData(prev => ({ ...prev, duration: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={testRideData.notes}
                    onChange={(e) => setTestRideData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special instructions or requirements..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setScheduleTestRideOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleConfirmTestRide} className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Test Ride
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={scheduleTestRideOpen} onOpenChange={setScheduleTestRideOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Test Ride</DialogTitle>
              <DialogDescription>
                Schedule a test ride for {currentLead.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={testRideData.date}
                    onChange={(e) => setTestRideData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={testRideData.time}
                    onChange={(e) => setTestRideData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={testRideData.duration} onValueChange={(value) => setTestRideData(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={testRideData.notes}
                  onChange={(e) => setTestRideData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions or requirements..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setScheduleTestRideOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleConfirmTestRide} className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Test Ride
                </Button>
              </div>
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
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Match Engine</h1>
          <p className="text-sm lg:text-base text-muted-foreground hidden lg:block">Find perfect vehicles for your leads</p>
        </div>
        {/* <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)} className="flex-1 lg:flex-none">
            <Settings className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">Settings</span>
          </Button>
        </div> */}
      </div>

      {/* Lead Selection */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Select Lead to Match</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allLeads.map((lead) => (
              <Card 
                key={lead.id} 
                className={`cursor-pointer transition-all ${
                  currentLead.id === lead.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleSelectLead(lead)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{lead.name}</h4>
                      <Badge className={
                        lead.status === 'hot' ? 'bg-red-100 text-red-800' :
                        lead.status === 'warm' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {lead.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {lead.interest}
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        ₹{parseInt(lead.budget).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {lead.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Lead Details */}
      <Card className="border-0 shadow-sm bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Selected Lead Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{currentLead.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {currentLead.phone}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {currentLead.interest}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  ₹{parseInt(currentLead.budget).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {currentLead.rating}/5
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={isMatching} onClick={handleRunMatch}>
                {isMatching ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Smart Match
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isMatching && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Matching Progress</span>
                <span>{matchProgress}%</span>
              </div>
              <Progress value={matchProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search matched vehicles..." 
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

      {/* Filter Panel */}
      {filterOpen && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Filter & Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="filters" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="criteria">Match Criteria</TabsTrigger>
              </TabsList>
              
              <TabsContent value="filters" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Min Price</Label>
                    <Input
                      value={filterCriteria.minPrice}
                      onChange={(e) => setFilterCriteria(prev => ({ ...prev, minPrice: e.target.value }))}
                      placeholder="₹ 50,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Price</Label>
                    <Input
                      value={filterCriteria.maxPrice}
                      onChange={(e) => setFilterCriteria(prev => ({ ...prev, maxPrice: e.target.value }))}
                      placeholder="₹ 1,00,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Distance</Label>
                    <Input
                      value={filterCriteria.maxDistance}
                      onChange={(e) => setFilterCriteria(prev => ({ ...prev, maxDistance: e.target.value }))}
                      placeholder="15 km"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={filterCriteria.condition} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any condition</SelectItem>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select value={filterCriteria.brand} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, brand: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any brand</SelectItem>
                        <SelectItem value="Honda">Honda</SelectItem>
                        <SelectItem value="TVS">TVS</SelectItem>
                        <SelectItem value="Bajaj">Bajaj</SelectItem>
                        <SelectItem value="Hero">Hero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select value={filterCriteria.availability} onValueChange={(value) => setFilterCriteria(prev => ({ ...prev, availability: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any availability" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="">Any availability</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="test_ride">Test Drive</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="criteria" className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <Label>Price Weight: {matchCriteria.priceWeight}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={matchCriteria.priceWeight}
                      onChange={(e) => setMatchCriteria(prev => ({ ...prev, priceWeight: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Location Weight: {matchCriteria.locationWeight}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={matchCriteria.locationWeight}
                      onChange={(e) => setMatchCriteria(prev => ({ ...prev, locationWeight: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Brand Weight: {matchCriteria.brandWeight}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={matchCriteria.brandWeight}
                      onChange={(e) => setMatchCriteria(prev => ({ ...prev, brandWeight: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Match Results */}
      {filteredVehicles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Matched Vehicles ({filteredVehicles.length})
              <Badge variant="secondary" className="ml-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                Sorted by match score
              </Badge>
            </h2>
            <div className="text-sm text-muted-foreground">
              Average match: {Math.round(filteredVehicles.reduce((sum, v) => sum + v.matchScore, 0) / filteredVehicles.length)}%
            </div>
          </div>

          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => {
              const availability = getAvailabilityBadge(vehicle.availability);
              return (
                <Card key={vehicle.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Vehicle Image Placeholder */}
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>

                      {/* Vehicle Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-foreground">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {vehicle.year}
                              </div>
                              <div>{vehicle.km.toLocaleString()} km</div>
                              <div className="text-success">{vehicle.condition}</div>
                              <div className="text-muted-foreground">{vehicle.seller}</div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className={`${getMatchScoreBg(vehicle.matchScore)} ${getMatchScoreColor(vehicle.matchScore)}`}>
                              <Target className="w-3 h-3 mr-1" />
                              {vehicle.matchScore}% Match
                            </Badge>
                            <Badge className={availability.className}>
                              {availability.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-primary" />
                            <span className="text-xl font-bold text-primary">
                              ₹{vehicle.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {vehicle.location} • {vehicle.distance}
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-foreground">Why this matches:</div>
                          <div className="flex flex-wrap gap-1">
                            {vehicle.reasons.map((reason, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        {vehicle.features && vehicle.features.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-foreground">Key Features:</div>
                            <div className="flex flex-wrap gap-1">
                              {vehicle.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleSendToLead(vehicle)}
                          >
                            <Heart className="w-3 h-3 mr-1" />
                            Send to Lead
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleScheduleTestRide(vehicle)}
                            disabled={vehicle.availability === 'reserved' || vehicle.availability === 'sold'}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Test Ride
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectMatch(vehicle)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isMatching && filteredVehicles.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
            <p className="text-muted-foreground mb-4">
              Run the smart match engine to find vehicles for {currentLead.name}
            </p>
            <Button onClick={handleRunMatch}>
              <Zap className="w-4 h-4 mr-2" />
              Run Smart Match
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <MessageDialog />
      <TestRideDialog />
    </div>
  );
};

export default MatchEngine;
