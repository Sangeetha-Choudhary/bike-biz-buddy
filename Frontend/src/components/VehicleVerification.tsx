import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, FileText, CheckCircle, Clock, AlertCircle, Star, Upload, MapPin, Car, Target, TrendingUp, Plus, Wrench, Eye } from 'lucide-react';

interface InspectionVehicle {
  id: string;
  type: 'bike' | 'scooter';
  brand: string;
  model: string;
  year: number;
  price: number;
  location: string;
  status: 'inspection' | 'pending_approval' | 'approved' | 'rejected' | 'assigned';
  createdDate: string;
  inspectionDetails?: VehicleInspection;
  assignedStore?: string;
  finalPrice?: number;
  margin?: number;
}

interface InspectionPoint {
  id: string;
  name: string;
  status: 'good' | 'fair' | 'poor' | 'needs_repair';
  condition: string;
  images: string[];
  notes: string;
}

interface VehicleInspection {
  inspectionPoints: InspectionPoint[];
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  estimatedValue: number;
  repairCosts: number;
  recommendedPrice: number;
  inspectionDate: string;
  inspectedBy: string;
  images: string[];
  finalNotes: string;
}

interface ExpenseClaim {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'travel' | 'inspection' | 'documentation' | 'other';
  amount: number;
  description: string;
  receipts: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  submittedBy: string;
}

const VehicleVerification: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<InspectionVehicle[]>([]);
  const [selectedTab, setSelectedTab] = useState('inspection');
  const [selectedVehicle, setSelectedVehicle] = useState<InspectionVehicle | null>(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isExpenseClaimOpen, setIsExpenseClaimOpen] = useState(false);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([]);
  
  const [newVehicle, setNewVehicle] = useState({
    type: 'bike' as 'bike' | 'scooter',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    location: ''
  });

  const [inspectionData, setInspectionData] = useState<Partial<VehicleInspection>>({
    inspectionPoints: [],
    overallCondition: 'good',
    estimatedValue: 0,
    repairCosts: 0,
    recommendedPrice: 0,
    images: [],
    finalNotes: ''
  });

  const [newExpenseClaim, setNewExpenseClaim] = useState({
    vehicleId: '',
    vehicleName: '',
    type: 'travel' as const,
    amount: 0,
    description: '',
    receipts: [] as string[]
  });

  // 16 comprehensive inspection points
  const inspectionPoints = [
    { id: 'engine', name: 'Engine Condition', type: 'dropdown' },
    { id: 'brakes', name: 'Brake System', type: 'dropdown' },
    { id: 'tires', name: 'Tire Condition', type: 'dropdown' },
    { id: 'suspension', name: 'Suspension System', type: 'dropdown' },
    { id: 'electrical', name: 'Electrical System', type: 'dropdown' },
    { id: 'transmission', name: 'Transmission/Gearbox', type: 'dropdown' },
    { id: 'fuel_system', name: 'Fuel System', type: 'dropdown' },
    { id: 'exhaust', name: 'Exhaust System', type: 'dropdown' },
    { id: 'lights', name: 'Lights & Indicators', type: 'dropdown' },
    { id: 'body', name: 'Body & Frame', type: 'dropdown' },
    { id: 'seat', name: 'Seat & Comfort', type: 'dropdown' },
    { id: 'mirrors', name: 'Mirrors & Safety', type: 'dropdown' },
    { id: 'battery', name: 'Battery Condition', type: 'dropdown' },
    { id: 'chain', name: 'Chain & Sprocket', type: 'dropdown' },
    { id: 'instruments', name: 'Instrument Cluster', type: 'dropdown' },
    { id: 'overall', name: 'Overall Aesthetics', type: 'dropdown' }
  ];

  const conditionOptions = [
    { value: 'good', label: 'Good', color: 'text-green-600' },
    { value: 'fair', label: 'Fair', color: 'text-yellow-600' },
    { value: 'poor', label: 'Poor', color: 'text-orange-600' },
    { value: 'needs_repair', label: 'Needs Repair', color: 'text-red-600' }
  ];

  const brandOptions = {
    bike: ['Honda', 'Hero', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM'],
    scooter: ['Honda', 'TVS', 'Suzuki', 'Yamaha', 'Hero', 'Bajaj', 'Aprilia', 'Vespa']
  };

  useEffect(() => {
    loadVehicles();
    loadExpenseClaims();
    initializeInspectionPoints();
  }, []);

  const initializeInspectionPoints = () => {
    const initialPoints = inspectionPoints.map(point => ({
      id: point.id,
      name: point.name,
      status: 'good' as const,
      condition: '',
      images: [],
      notes: ''
    }));
    setInspectionData(prev => ({ ...prev, inspectionPoints: initialPoints }));
  };

  const loadVehicles = () => {
    const storedVehicles = localStorage.getItem('inspection_vehicles');
    if (storedVehicles) {
      const parsedVehicles = JSON.parse(storedVehicles);
      const userVehicles = parsedVehicles.filter((vehicle: InspectionVehicle) => 
        vehicle.status === 'inspection' || 
        (vehicle.inspectionDetails?.inspectedBy === user?.id)
      );
      setVehicles(userVehicles);
    }
  };

  const loadExpenseClaims = () => {
    const storedClaims = localStorage.getItem('expense_claims');
    if (storedClaims) {
      const parsedClaims = JSON.parse(storedClaims);
      const userClaims = parsedClaims.filter((claim: ExpenseClaim) => 
        claim.submittedBy === user?.id
      );
      setExpenseClaims(userClaims);
    }
  };

  const handleAddVehicle = () => {
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const vehicle: InspectionVehicle = {
      id: Date.now().toString(),
      ...newVehicle,
      status: 'inspection',
      createdDate: new Date().toISOString().split('T')[0]
    };

    const allVehicles = JSON.parse(localStorage.getItem('inspection_vehicles') || '[]');
    const updatedVehicles = [...allVehicles, vehicle];
    localStorage.setItem('inspection_vehicles', JSON.stringify(updatedVehicles));
    
    setVehicles(prev => [...prev, vehicle]);
    setNewVehicle({
      type: 'bike',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      location: ''
    });
    setIsAddVehicleOpen(false);

    toast({
      title: "Vehicle Added",
      description: `${vehicle.brand} ${vehicle.model} added for inspection.`,
    });
  };

  const handleInspectionPointUpdate = (pointId: string, field: string, value: any) => {
    setInspectionData(prev => ({
      ...prev,
      inspectionPoints: prev.inspectionPoints?.map(point => 
        point.id === pointId ? { ...point, [field]: value } : point
      ) || []
    }));
  };

  const calculateRecommendedPrice = () => {
    if (!selectedVehicle || !inspectionData.inspectionPoints) return 0;
    
    const goodPoints = inspectionData.inspectionPoints.filter(p => p.status === 'good').length;
    const fairPoints = inspectionData.inspectionPoints.filter(p => p.status === 'fair').length;
    const poorPoints = inspectionData.inspectionPoints.filter(p => p.status === 'poor').length;
    const repairPoints = inspectionData.inspectionPoints.filter(p => p.status === 'needs_repair').length;

    // Calculate depreciation based on condition
    let conditionMultiplier = 1.0;
    conditionMultiplier -= (fairPoints * 0.05); // 5% reduction per fair point
    conditionMultiplier -= (poorPoints * 0.10); // 10% reduction per poor point
    conditionMultiplier -= (repairPoints * 0.15); // 15% reduction per repair needed

    const basePrice = selectedVehicle.price;
    const estimatedValue = Math.max(basePrice * conditionMultiplier, basePrice * 0.3); // Minimum 30% of original
    const repairCosts = inspectionData.repairCosts || 0;
    const recommendedPrice = estimatedValue - repairCosts;

    return Math.max(recommendedPrice, 0);
  };

  const handleSubmitInspection = () => {
    if (!selectedVehicle || !inspectionData.inspectionPoints) {
      toast({
        title: "Incomplete Inspection",
        description: "Please complete all inspection points.",
        variant: "destructive",
      });
      return;
    }

    const recommendedPrice = calculateRecommendedPrice();
    
    const inspection: VehicleInspection = {
      ...inspectionData as VehicleInspection,
      recommendedPrice,
      estimatedValue: inspectionData.estimatedValue || recommendedPrice,
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectedBy: user?.id || ''
    };

    const allVehicles = JSON.parse(localStorage.getItem('inspection_vehicles') || '[]');
    const updatedVehicles = allVehicles.map((vehicle: InspectionVehicle) => 
      vehicle.id === selectedVehicle.id 
        ? { 
            ...vehicle, 
            status: 'pending_approval',
            inspectionDetails: inspection
          }
        : vehicle
    );
    
    localStorage.setItem('inspection_vehicles', JSON.stringify(updatedVehicles));
    loadVehicles();
    
    setIsInspectionOpen(false);
    setSelectedVehicle(null);
    initializeInspectionPoints();

    toast({
      title: "Inspection Completed",
      description: "Vehicle inspection submitted for approval.",
    });
  };

  const handleSubmitExpenseClaim = () => {
    const claim: ExpenseClaim = {
      id: Date.now().toString(),
      ...newExpenseClaim,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      submittedBy: user?.id || ''
    };

    const allClaims = JSON.parse(localStorage.getItem('expense_claims') || '[]');
    const updatedClaims = [...allClaims, claim];
    localStorage.setItem('expense_claims', JSON.stringify(updatedClaims));
    
    setExpenseClaims([...expenseClaims, claim]);
    setNewExpenseClaim({
      vehicleId: '',
      vehicleName: '',
      type: 'travel',
      amount: 0,
      description: '',
      receipts: []
    });
    setIsExpenseClaimOpen(false);

    toast({
      title: "Expense Claim Submitted",
      description: "Your expense claim has been submitted for approval.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inspection': return 'bg-blue-100 text-blue-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inspection': return <Wrench className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'assigned': return <Car className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingInspection = vehicles.filter(v => v.status === 'inspection');
  const completedInspection = vehicles.filter(v => v.status !== 'inspection');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Inspection</h1>
          <p className="text-gray-600">Inspect and evaluate vehicles for procurement</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vehicle for Inspection</DialogTitle>
                <DialogDescription>
                  Add a bike or scooter to start the inspection process
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Vehicle Type</Label>
                    <select
                      id="type"
                      value={newVehicle.type}
                      onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value as 'bike' | 'scooter'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <select
                      id="brand"
                      value={newVehicle.brand}
                      onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Brand</option>
                      {brandOptions[newVehicle.type].map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                      placeholder="Enter model name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newVehicle.year || new Date().getFullYear()}
                      onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value) || new Date().getFullYear()})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Asking Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newVehicle.price || 0}
                      onChange={(e) => setNewVehicle({...newVehicle, price: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newVehicle.location}
                      onChange={(e) => setNewVehicle({...newVehicle, location: e.target.value})}
                      placeholder="Vehicle location"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddVehicle}>Add Vehicle</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseClaimOpen} onOpenChange={setIsExpenseClaimOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Expense Claim
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Expense Claim</DialogTitle>
                <DialogDescription>
                  Submit a claim for inspection-related expenses
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="expense-vehicle">Vehicle</Label>
                  <select
                    id="expense-vehicle"
                    value={newExpenseClaim.vehicleId}
                    onChange={(e) => {
                      const vehicleId = e.target.value;
                      const vehicle = vehicles.find(v => v.id === vehicleId);
                      setNewExpenseClaim({
                        ...newExpenseClaim, 
                        vehicleId,
                        vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="expense-type">Expense Type</Label>
                  <select
                    id="expense-type"
                    value={newExpenseClaim.type}
                    onChange={(e) => setNewExpenseClaim({...newExpenseClaim, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="travel">Travel Expenses</option>
                    <option value="inspection">Inspection Costs</option>
                    <option value="documentation">Documentation Fees</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="expense-amount">Amount (₹)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    value={newExpenseClaim.amount || 0}
                    onChange={(e) => setNewExpenseClaim({...newExpenseClaim, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="expense-description">Description</Label>
                  <Textarea
                    id="expense-description"
                    value={newExpenseClaim.description}
                    onChange={(e) => setNewExpenseClaim({...newExpenseClaim, description: e.target.value})}
                    placeholder="Describe the expense..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsExpenseClaimOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitExpenseClaim}>Submit Claim</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              Under inspection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Inspection</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInspection.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting inspection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedInspection.length}</div>
            <p className="text-xs text-muted-foreground">
              Inspection done
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inspection">Pending Inspection</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="expenses">Expense Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="inspection" className="space-y-6">
          <div className="grid gap-4">
            {pendingInspection.map(vehicle => (
              <Card key={vehicle.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <Car className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-sm text-gray-600">{vehicle.year} • ₹{vehicle.price.toLocaleString()}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {vehicle.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(vehicle.status)} variant="secondary">
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1 capitalize">{vehicle.status.replace('_', ' ')}</span>
                      </Badge>
                      <Dialog open={isInspectionOpen && selectedVehicle?.id === vehicle.id} 
                              onOpenChange={(open) => {
                                setIsInspectionOpen(open);
                                if (!open) setSelectedVehicle(null);
                              }}>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedVehicle(vehicle)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Start Inspection
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Vehicle Inspection - {vehicle.brand} {vehicle.model}</DialogTitle>
                            <DialogDescription>
                              Complete comprehensive inspection of all vehicle components
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Inspection Points</h4>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                  {inspectionData.inspectionPoints?.map((point) => (
                                    <Card key={point.id} className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <Label className="font-medium">{point.name}</Label>
                                          <select
                                            value={point.status}
                                            onChange={(e) => handleInspectionPointUpdate(point.id, 'status', e.target.value)}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                                          >
                                            {conditionOptions.map(option => (
                                              <option key={option.value} value={option.value}>
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <Input
                                          placeholder="Condition details..."
                                          value={point.condition}
                                          onChange={(e) => handleInspectionPointUpdate(point.id, 'condition', e.target.value)}
                                        />
                                        <Textarea
                                          placeholder="Additional notes..."
                                          value={point.notes}
                                          onChange={(e) => handleInspectionPointUpdate(point.id, 'notes', e.target.value)}
                                          rows={2}
                                        />
                                        <Button variant="outline" size="sm" className="w-full">
                                          <Camera className="h-4 w-4 mr-2" />
                                          Add Photos
                                        </Button>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Valuation & Summary</h4>
                                
                                <div className="space-y-3">
                                  <div>
                                    <Label>Overall Condition</Label>
                                    <select
                                      value={inspectionData.overallCondition}
                                      onChange={(e) => setInspectionData({...inspectionData, overallCondition: e.target.value as any})}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                      <option value="excellent">Excellent</option>
                                      <option value="good">Good</option>
                                      <option value="fair">Fair</option>
                                      <option value="poor">Poor</option>
                                    </select>
                                  </div>

                                  <div>
                                    <Label>Estimated Value (₹)</Label>
                                    <Input
                                      type="number"
                                      value={inspectionData.estimatedValue || 0}
                                      onChange={(e) => setInspectionData({...inspectionData, estimatedValue: parseInt(e.target.value) || 0})}
                                    />
                                  </div>

                                  <div>
                                    <Label>Repair Costs (₹)</Label>
                                    <Input
                                      type="number"
                                      value={inspectionData.repairCosts || 0}
                                      onChange={(e) => setInspectionData({...inspectionData, repairCosts: parseInt(e.target.value) || 0})}
                                    />
                                  </div>

                                  <div className="p-4 bg-blue-50 rounded-lg">
                                    <h5 className="font-semibold text-blue-900">Recommended Price</h5>
                                    <div className="text-2xl font-bold text-blue-900">
                                      ₹{calculateRecommendedPrice().toLocaleString()}
                                    </div>
                                    <p className="text-sm text-blue-700">
                                      Based on condition assessment
                                    </p>
                                  </div>

                                  <div>
                                    <Label>Final Inspection Notes</Label>
                                    <Textarea
                                      value={inspectionData.finalNotes}
                                      onChange={(e) => setInspectionData({...inspectionData, finalNotes: e.target.value})}
                                      placeholder="Overall assessment and recommendations..."
                                      rows={4}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Vehicle Photos</Label>
                                    <Button variant="outline" className="w-full">
                                      <Camera className="h-4 w-4 mr-2" />
                                      Upload Vehicle Photos
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsInspectionOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmitInspection}>
                              Complete Inspection
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingInspection.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Inspections</h3>
                  <p className="text-gray-600">Add vehicles to start the inspection process.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-4">
            {completedInspection.map(vehicle => (
              <Card key={vehicle.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-sm text-gray-600">{vehicle.year} • ₹{vehicle.price.toLocaleString()}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {vehicle.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {vehicle.inspectionDetails && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ₹{vehicle.inspectionDetails.recommendedPrice.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">Recommended</p>
                        </div>
                      )}
                      <Badge className={getStatusColor(vehicle.status)} variant="secondary">
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1 capitalize">{vehicle.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                  {vehicle.inspectionDetails && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Inspected on {vehicle.inspectionDetails.inspectionDate} • 
                        Overall condition: <span className="capitalize">{vehicle.inspectionDetails.overallCondition}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {completedInspection.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Inspections</h3>
                  <p className="text-gray-600">Complete vehicle inspections to see them here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid gap-4">
            {expenseClaims.map(claim => (
              <Card key={claim.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{claim.vehicleName}</h3>
                        <p className="text-sm text-gray-600 capitalize">{claim.type.replace('_', ' ')} • ₹{claim.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{claim.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={
                        claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                        claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      } variant="secondary">
                        {claim.status === 'approved' && <CheckCircle className="h-4 w-4 mr-1" />}
                        {claim.status === 'rejected' && <AlertCircle className="h-4 w-4 mr-1" />}
                        {claim.status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                        <span className="capitalize">{claim.status}</span>
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Submitted: {claim.submittedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {expenseClaims.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expense Claims</h3>
                  <p className="text-gray-600">Submit expense claims for inspection-related costs.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleVerification;
