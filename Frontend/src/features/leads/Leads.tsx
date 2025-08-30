import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import AddLead from "./AddLead";
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  MapPin,
  IndianRupee,
  Calendar,
  Star,
  User,
  Package,
  Eye,
  Target,
  Zap,
  Mail,
  Clock,
  TrendingUp,
  Award,
  Check
} from "lucide-react";

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
  status: string;
  seller?: string;
  features?: string[];
}

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadDetailsOpen, setLeadDetailsOpen] = useState(false);
  const [matchResults, setMatchResults] = useState<Vehicle[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  // Generate store-specific leads based on user's store
  const getStoreSpecificLeads = () => {
    const storeLeadsData = {
      'Mumbai Central Store': [
        {
          id: 1,
          name: "Rajesh Kumar",
          phone: "+91 98765 43210",
          location: "Mumbai Central",
          interest: "Honda Activa 6G",
          budget: "80000",
          status: "hot",
          rating: 4.5,
          source: "Facebook",
          date: "2024-01-15",
          lastContact: "Today"
        },
        {
          id: 2,
          name: "Priya Sharma",
          phone: "+91 87654 32109",
          location: "Andheri West",
          interest: "TVS Jupiter",
          budget: "75000",
          status: "warm",
          rating: 4.2,
          source: "Referral",
          date: "2024-01-14",
          lastContact: "Yesterday"
        },
        {
          id: 3,
          name: "Sunita Devi",
          phone: "+91 65432 10987",
          location: "Thane West",
          interest: "Hero Splendor Plus",
          budget: "65000",
          status: "hot",
          rating: 4.7,
          source: "WhatsApp",
          date: "2024-01-15",
          lastContact: "2 hours ago"
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
          status: "hot",
          rating: 4.6,
          source: "Google Ads",
          date: "2024-01-15",
          lastContact: "Today"
        },
        {
          id: 12,
          name: "Neha Singh",
          phone: "+91 89123 45678",
          location: "Karol Bagh",
          interest: "TVS Jupiter",
          budget: "77000",
          status: "warm",
          rating: 4.3,
          source: "Referral",
          date: "2024-01-14",
          lastContact: "Yesterday"
        },
        {
          id: 13,
          name: "Rohit Sharma",
          phone: "+91 87654 32190",
          location: "Lajpat Nagar",
          interest: "Bajaj Avenger",
          budget: "105000",
          status: "cold",
          rating: 3.9,
          source: "Website",
          date: "2024-01-13",
          lastContact: "2 days ago"
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
          status: "hot",
          rating: 4.8,
          source: "Instagram",
          date: "2024-01-15",
          lastContact: "1 hour ago"
        },
        {
          id: 22,
          name: "Divya Krishnan",
          phone: "+91 98765 43210",
          location: "Indiranagar",
          interest: "Honda Activa 6G",
          budget: "78000",
          status: "warm",
          rating: 4.4,
          source: "Facebook",
          date: "2024-01-14",
          lastContact: "Today"
        },
        {
          id: 23,
          name: "Suresh Kumar",
          phone: "+91 97654 32109",
          location: "Whitefield",
          interest: "TVS Apache RTR",
          budget: "125000",
          status: "cold",
          rating: 4.1,
          source: "Website",
          date: "2024-01-12",
          lastContact: "3 days ago"
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

  const getStatusBadge = (status: string) => {
    const variants = {
      hot: "bg-red-100 text-red-800 border-red-200",
      warm: "bg-orange-100 text-orange-800 border-orange-200",
      cold: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return variants[status as keyof typeof variants] || variants.cold;
  };

  const getStatusLeads = (status: string) => {
    return allLeads.filter(lead => lead.status === status);
  };

  const handleCallLead = (lead: any) => {
    toast({
      title: "Calling Customer",
      description: `Calling ${lead.name} at ${lead.phone}`,
    });
  };

  const handleWhatsAppLead = (lead: any) => {
    toast({
      title: "WhatsApp Message",
      description: `Opening WhatsApp chat with ${lead.name}`,
    });
  };

  const handleMatchLead = async (lead: any) => {
    setIsMatching(true);

    toast({
      title: "Smart Match Engine",
      description: `Analyzing inventory for ${lead.name}...`,
    });

    // Load vehicles from localStorage (inventory)
    const storedVehicles = localStorage.getItem('bikebiz_inventory');
    let availableVehicles: Vehicle[] = [];

    if (storedVehicles) {
      try {
        const vehicles = JSON.parse(storedVehicles);
        availableVehicles = vehicles.filter((v: any) => v.status === 'available');
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
    }

    // If no vehicles in localStorage, use sample data
    if (availableVehicles.length === 0) {
      availableVehicles = [
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
          status: "available",
          seller: "AutoMax Motors",
          features: ["CBS", "LED Headlight", "Digital Display"]
        },
        {
          id: 2,
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
          status: "available",
          seller: "AutoMax Motors",
          features: ["LED DRL", "Front Disc Brake"]
        }
      ];
    }

    // Simulate matching delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Apply matching logic
    const budget = parseInt(lead.budget);
    const matched = availableVehicles.map((vehicle: any) => {
      const priceScore = Math.max(0, 100 - Math.abs(vehicle.price - budget) / budget * 100);
      const locationScore = vehicle.location?.includes(lead.location.split(' ')[0]) ? 100 : 70;
      const brandScore = vehicle.brand?.toLowerCase() === lead.interest.toLowerCase().split(' ')[0] ? 100 : 60;
      const conditionScore = vehicle.condition === "Excellent" ? 100 : 80;

      const totalScore = (priceScore * 0.3 + locationScore * 0.25 + brandScore * 0.2 + conditionScore * 0.25);

      // Create match reasons
      const reasons = [];
      if (brandScore === 100) reasons.push("Perfect brand match");
      if (priceScore > 90) reasons.push("Within budget");
      if (locationScore === 100) reasons.push("Same location");
      if (conditionScore === 100) reasons.push("Excellent condition");

      return {
        ...vehicle,
        matchScore: Math.round(totalScore),
        reasons: reasons.length > 0 ? reasons : ["Good match"],
        distance: "2.5 km" // Calculate or estimate distance
      };
    }).filter((v: Vehicle) => v.matchScore > 50).sort((a: Vehicle, b: Vehicle) => b.matchScore - a.matchScore);

    setMatchResults(matched);
    setSelectedLead(lead);
    setLeadDetailsOpen(true);
    setIsMatching(false);

    toast({
      title: "Match Complete!",
      description: `Found ${matched.length} matching vehicles for ${lead.name}`,
    });
  };

  const filteredLeads = allLeads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.interest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredLeads = (status: string) => {
    return filteredLeads.filter(lead => lead.status === status);
  };

  const handleViewDetails = (lead: any) => {
    setSelectedLead(lead);
    setMatchResults([]);
    setLeadDetailsOpen(true);
  };

  const handleSendToLead = (vehicle: Vehicle, lead: any) => {
    // Create WhatsApp message
    const phoneNumber = lead.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${lead.name}!

We found a perfect match for you:

🏍️ ${vehicle.brand} ${vehicle.model} (${vehicle.year})
💰 Price: ₹${vehicle.price.toLocaleString()}
📍 Location: ${vehicle.location}
⭐ Condition: ${vehicle.condition}
🛣️ Only ${vehicle.distance} from your location

${vehicle.features ? `✨ Key Features: ${vehicle.features.join(', ')}` : ''}

Would you like to schedule a test ride or get more details?

Best regards,
Your BikeBiz Team`);

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Message Sent Successfully!",
      description: `WhatsApp opened with message for ${lead.name} about ${vehicle.brand} ${vehicle.model}`,
    });
  };

  const LeadCard = ({ lead }: { lead: typeof allLeads[0] }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{lead.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{lead.rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge className={getStatusBadge(lead.status)}>
              {lead.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {lead.phone}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {lead.location}
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {lead.interest}
            </div>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-3 h-3" />
              ₹{parseInt(lead.budget).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Source: {lead.source}</span>
            <span>Last contact: {lead.lastContact}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCallLead(lead)}
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWhatsAppLead(lead)}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              WhatsApp
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => handleMatchLead(lead)}
              disabled={isMatching}
            >
              {isMatching ? (
                <Zap className="w-3 h-3 mr-1 animate-pulse" />
              ) : (
                <Target className="w-3 h-3 mr-1" />
              )}
              {isMatching ? 'Matching...' : 'Smart Match'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(lead)}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LeadDetailsDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={leadDetailsOpen} onOpenChange={setLeadDetailsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Lead Details</DrawerTitle>
              <DrawerDescription>
                {selectedLead ? `Detailed information for ${selectedLead.name}` : 'Loading...'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <ScrollArea className="max-h-[70vh]">
                {selectedLead && (
                  <div className="space-y-6">
                    {/* Lead Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Customer Information</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{selectedLead.name}</span>
                          <Badge className={getStatusBadge(selectedLead.status)}>
                            {selectedLead.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedLead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedLead.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedLead.interest}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          <span>₹{parseInt(selectedLead.budget).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{selectedLead.rating}/5 rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Last contact: {selectedLead.lastContact}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Match Results */}
                    {matchResults.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Matched Vehicles</h3>
                          <Badge variant="secondary">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {matchResults.length} matches
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {matchResults.map((vehicle) => (
                            <Card key={vehicle.id} className="border border-border">
                              <CardContent className="p-3">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-semibold">{vehicle.brand} {vehicle.model}</h4>
                                      <p className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.km.toLocaleString()} km • {vehicle.condition}</p>
                                    </div>
                                    <Badge className={vehicle.matchScore >= 90 ? "bg-green-100 text-green-800" : vehicle.matchScore >= 80 ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}>
                                      <Target className="w-3 h-3 mr-1" />
                                      {vehicle.matchScore}% Match
                                    </Badge>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary">₹{vehicle.price.toLocaleString()}</span>
                                    <span className="text-sm text-muted-foreground">{vehicle.location}</span>
                                  </div>

                                  <div className="flex flex-wrap gap-1">
                                    {vehicle.reasons.map((reason, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        <Check className="w-3 h-3 mr-1" />
                                        {reason}
                                      </Badge>
                                    ))}
                                  </div>

                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleSendToLead(vehicle, selectedLead)}
                                  >
                                    <MessageCircle className="w-3 h-3 mr-1" />
                                    Send to Customer
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => handleMatchLead(selectedLead)}
                        disabled={isMatching}
                      >
                        {isMatching ? (
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                        ) : (
                          <Target className="w-4 h-4 mr-2" />
                        )}
                        {isMatching ? 'Finding Matches...' : 'Run Smart Match'}
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => handleCallLead(selectedLead)}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" onClick={() => handleWhatsAppLead(selectedLead)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
            <DrawerFooter>
              <Button variant="outline" onClick={() => setLeadDetailsOpen(false)}>
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={leadDetailsOpen} onOpenChange={setLeadDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>
                {selectedLead ? `Detailed information for ${selectedLead.name}` : 'Loading...'}
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-6">
                {/* Lead Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedLead.name}</span>
                      <Badge className={getStatusBadge(selectedLead.status)}>
                        {selectedLead.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.interest}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-muted-foreground" />
                      <span>₹{parseInt(selectedLead.budget).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedLead.rating}/5 rating</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Last contact: {selectedLead.lastContact}</span>
                  </div>
                </div>

                <Separator />

                {/* Match Results */}
                {matchResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Matched Vehicles</h3>
                      <Badge variant="secondary">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {matchResults.length} matches
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                      {matchResults.map((vehicle) => (
                        <Card key={vehicle.id} className="border border-border">
                          <CardContent className="p-3">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{vehicle.brand} {vehicle.model}</h4>
                                  <p className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.km.toLocaleString()} km • {vehicle.condition}</p>
                                </div>
                                <Badge className={vehicle.matchScore >= 90 ? "bg-green-100 text-green-800" : vehicle.matchScore >= 80 ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}>
                                  <Target className="w-3 h-3 mr-1" />
                                  {vehicle.matchScore}% Match
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">₹{vehicle.price.toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground">{vehicle.location}</span>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {vehicle.reasons.map((reason, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    {reason}
                                  </Badge>
                                ))}
                              </div>

                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleSendToLead(vehicle, selectedLead)}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Send to Customer
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => handleMatchLead(selectedLead)}
                    disabled={isMatching}
                  >
                    {isMatching ? (
                      <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    {isMatching ? 'Finding Matches...' : 'Run Smart Match'}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleCallLead(selectedLead)}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" onClick={() => handleWhatsAppLead(selectedLead)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Manage and track your customer leads</p>
        </div>
        <AddLead onLeadAdded={() => console.log("Lead added")} />
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search leads by name, phone, or location..." 
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

      {/* Lead Status Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredLeads.length})</TabsTrigger>
          <TabsTrigger value="hot">Hot ({getFilteredLeads('hot').length})</TabsTrigger>
          <TabsTrigger value="warm">Warm ({getFilteredLeads('warm').length})</TabsTrigger>
          <TabsTrigger value="cold">Cold ({getFilteredLeads('cold').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hot" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredLeads('hot').map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="warm" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredLeads('warm').map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cold" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredLeads('cold').map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Lead Details Dialog */}
      <LeadDetailsDialog />
    </div>
  );
};

export default Leads;
