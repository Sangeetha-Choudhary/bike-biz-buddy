import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  IndianRupee,
  Search,
  Heart,
  Calendar,
  Fuel,
  Gauge,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BikeOption {
  id: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  mileage: string;
  fuelType: string;
  image: string;
  location: string;
  rating: number;
  store: string;
}

interface AddLeadProps {
  onLeadAdded: () => void;
}

const AddLead = ({ onLeadAdded }: AddLeadProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState("personal");
  const [selectedStores, setSelectedStores] = useState<string[]>(["My Store"]);
  const [selectedBikes, setSelectedBikes] = useState<BikeOption[]>([]);
  const { toast } = useToast();

  // Form state
  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    occupation: "",
    notes: ""
  });

  const [preferences, setPreferences] = useState({
    brands: [] as string[],
    priceRange: [50000, 150000] as number[],
    fuelType: "",
    yearMin: "",
    ageMax: "",
    mileageMax: "",
    purpose: ""
  });

  // Sample bike data (in real app, this would come from your inventory API)
  const availableBikes: BikeOption[] = [
    {
      id: "1",
      brand: "Honda",
      model: "Activa 6G",
      price: 78000,
      year: 2023,
      mileage: "60 kmpl",
      fuelType: "Petrol",
      image: "/placeholder.svg",
      location: "Mumbai Central",
      rating: 4.5,
      store: "My Store"
    },
    {
      id: "2",
      brand: "TVS",
      model: "Jupiter",
      price: 72000,
      year: 2023,
      mileage: "62 kmpl",
      fuelType: "Petrol",
      image: "/placeholder.svg",
      location: "Andheri West",
      rating: 4.3,
      store: "My Store"
    },
    {
      id: "3",
      brand: "Bajaj",
      model: "Pulsar 150",
      price: 95000,
      year: 2022,
      mileage: "50 kmpl",
      fuelType: "Petrol",
      image: "/placeholder.svg",
      location: "Borivali East",
      rating: 4.2,
      store: "AutoHub Motors"
    },
    {
      id: "4",
      brand: "Hero",
      model: "Splendor Plus",
      price: 65000,
      year: 2023,
      mileage: "70 kmpl",
      fuelType: "Petrol",
      image: "/placeholder.svg",
      location: "Thane West",
      rating: 4.4,
      store: "Speed Wheels"
    },
    {
      id: "5",
      brand: "Royal Enfield",
      model: "Classic 350",
      price: 155000,
      year: 2022,
      mileage: "35 kmpl",
      fuelType: "Petrol",
      image: "/placeholder.svg",
      location: "Pune",
      rating: 4.6,
      store: "Royal Rides"
    },
    {
      id: "6",
      brand: "Honda",
      model: "CB Shine",
      price: 85000,
      year: 2023,
      mileage: "65 kmpl",
      fuelType: "Petrol",
      image: "/placeholder.svg",
      location: "Mumbai Central",
      rating: 4.3,
      store: "My Store"
    },
    {
      id: "7",
      brand: "Yamaha",
      model: "FZ-S",
      price: 110000,
      year: 2022,
      mileage: "45 kmpl",
      fuelType: "Petrol",
      image: "/placeholder.svg",
      location: "Andheri West",
      rating: 4.4,
      store: "AutoHub Motors"
    }
  ];

  const stores = ["My Store", "AutoHub Motors", "Speed Wheels", "Royal Rides"];

  const brands = ["Honda", "TVS", "Bajaj", "Hero", "Royal Enfield", "Yamaha", "Suzuki"];

  const filteredBikes = availableBikes.filter(bike => {
    const [priceMin, priceMax] = preferences.priceRange;
    const yearMin = preferences.yearMin ? parseInt(preferences.yearMin) : 0;
    
    return (
      (preferences.brands.length === 0 || preferences.brands.includes(bike.brand)) &&
      bike.price >= priceMin &&
      bike.price <= priceMax &&
      bike.year >= yearMin &&
      (!preferences.fuelType || bike.fuelType === preferences.fuelType) &&
      selectedStores.includes(bike.store)
    );
  });

  const handleBrandToggle = (brand: string) => {
    setPreferences(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const handleStoreToggle = (store: string) => {
    setSelectedStores(prev => 
      prev.includes(store)
        ? prev.filter(s => s !== store)
        : [...prev, store]
    );
  };

  const handleBikeSelect = (bike: BikeOption) => {
    setSelectedBikes(prev => 
      prev.find(b => b.id === bike.id)
        ? prev.filter(b => b.id !== bike.id)
        : [...prev, bike]
    );
  };

  const handleSubmit = () => {
    if (!personalDetails.name || !personalDetails.phone || selectedBikes.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in required fields and select at least one bike.",
        variant: "destructive",
      });
      return;
    }

    // In real app, save to database
    console.log("New Lead:", {
      personal: personalDetails,
      preferences,
      selectedBikes
    });

    toast({
      title: "Lead Added Successfully!",
      description: `${personalDetails.name} added with ${selectedBikes.length} bike preferences.`,
    });

    // Reset form
    setPersonalDetails({
      name: "",
      phone: "",
      email: "",
      location: "",
      occupation: "",
      notes: ""
    });
    setPreferences({
      brands: [],
      priceRange: [50000, 150000],
      fuelType: "",
      yearMin: "",
      ageMax: "",
      mileageMax: "",
      purpose: ""
    });
    setSelectedStores(["My Store"]);
    setSelectedBikes([]);
    setCurrentStep("personal");
    setOpen(false);
    onLeadAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Lead</DialogTitle>
        </DialogHeader>

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="preferences">Bike Preferences</TabsTrigger>
            <TabsTrigger value="selection">Bike Selection</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={personalDetails.name}
                      onChange={(e) => setPersonalDetails(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={personalDetails.phone}
                      onChange={(e) => setPersonalDetails(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalDetails.email}
                      onChange={(e) => setPersonalDetails(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={personalDetails.location}
                      onChange={(e) => setPersonalDetails(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Area"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={personalDetails.occupation}
                      onChange={(e) => setPersonalDetails(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder="Profession"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={personalDetails.notes}
                    onChange={(e) => setPersonalDetails(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional information about the lead..."
                    className="min-h-[80px]"
                  />
                </div>
                <Button 
                  onClick={() => setCurrentStep("preferences")}
                  className="w-full"
                  disabled={!personalDetails.name || !personalDetails.phone}
                >
                  Next: Bike Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Bike Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brand Selection */}
                <div className="space-y-3">
                  <Label>Preferred Brands</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={preferences.brands.includes(brand)}
                          onCheckedChange={() => handleBrandToggle(brand)}
                        />
                        <Label htmlFor={brand} className="text-sm">{brand}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-4">
                  <Label>Price Range: ₹{preferences.priceRange[0].toLocaleString()} - ₹{preferences.priceRange[1].toLocaleString()}</Label>
                  <Slider
                    value={preferences.priceRange}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, priceRange: value }))}
                    max={300000}
                    min={30000}
                    step={5000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹30,000</span>
                    <span>₹3,00,000</span>
                  </div>
                </div>

                {/* Other Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearMin">Min Year</Label>
                    <Input
                      id="yearMin"
                      value={preferences.yearMin}
                      onChange={(e) => setPreferences(prev => ({ ...prev, yearMin: e.target.value }))}
                      placeholder="2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ageMax">Max Age (years)</Label>
                    <Input
                      id="ageMax"
                      value={preferences.ageMax}
                      onChange={(e) => setPreferences(prev => ({ ...prev, ageMax: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileageMax">Max Mileage (km)</Label>
                    <Input
                      id="mileageMax"
                      value={preferences.mileageMax}
                      onChange={(e) => setPreferences(prev => ({ ...prev, mileageMax: e.target.value }))}
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Purchase</Label>
                  <Input
                    id="purpose"
                    value={preferences.purpose}
                    onChange={(e) => setPreferences(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="Daily commute, business, leisure..."
                  />
                </div>

                <Button 
                  onClick={() => setCurrentStep("selection")}
                  className="w-full"
                >
                  Search & Select Bikes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Select Bikes for Wishlist ({selectedBikes.length} selected)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Store Filter */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <Label className="text-base font-medium mb-3 block">Select Stores to Search From</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {stores.map((store) => (
                      <div key={store} className="flex items-center space-x-2">
                        <Checkbox
                          id={store}
                          checked={selectedStores.includes(store)}
                          onCheckedChange={() => handleStoreToggle(store)}
                        />
                        <Label htmlFor={store} className="text-sm">
                          {store}
                          {store === "My Store" && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              Your Store
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing bikes from {selectedStores.length} store(s) in Mumbai
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {filteredBikes.map((bike) => (
                    <Card 
                      key={bike.id} 
                      className={`cursor-pointer transition-all ${
                        selectedBikes.find(b => b.id === bike.id) 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleBikeSelect(bike)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{bike.brand} {bike.model}</h4>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">{bike.rating}/5</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              ₹{bike.price.toLocaleString()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {bike.year}
                            </div>
                            <div className="flex items-center gap-1">
                              <Fuel className="w-3 h-3" />
                              {bike.mileage}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {bike.location} • {bike.store}
                            </div>
                            <div className="flex items-center gap-1">
                              <Gauge className="w-3 h-3" />
                              {bike.fuelType}
                            </div>
                          </div>

                          {selectedBikes.find(b => b.id === bike.id) && (
                            <div className="flex items-center gap-1 text-primary text-sm font-medium">
                              <Heart className="w-4 h-4 fill-current" />
                              Added to wishlist
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredBikes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No bikes match your criteria. Try adjusting your preferences.
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep("preferences")}
                    className="flex-1"
                  >
                    Back to Preferences
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={selectedBikes.length === 0}
                  >
                    Add Lead ({selectedBikes.length} bikes)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddLead;
