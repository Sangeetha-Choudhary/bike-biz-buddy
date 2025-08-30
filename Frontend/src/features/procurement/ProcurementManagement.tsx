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
import { Plus, Car, Users, Target, TrendingUp, MapPin, Camera, FileText, CheckCircle, Clock, AlertCircle, Eye, IndianRupee } from 'lucide-react';

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
  marginPercentage?: number;
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

interface ProcurementTarget {
  id: string;
  city: string;
  month: string;
  targetVehicles: number;
  achievedVehicles: number;
  targetValue: number;
  achievedValue: number;
}

const ProcurementManagement: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<InspectionVehicle[]>([]);
  const [procurementTargets, setProcurementTargets] = useState<ProcurementTarget[]>([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<InspectionVehicle | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    storeId: '',
    storeName: '',
    finalPrice: 0,
    marginPercentage: 20,
    margin: 0
  });

  const stores = [
    { id: '1', name: 'Mumbai Central Store', city: 'Mumbai' },
    { id: '4', name: 'Wakad Store', city: 'Pune' },
    { id: '5', name: 'Baner Store', city: 'Pune' },
    { id: '6', name: 'Kharadi Store', city: 'Pune' },
  ];

  const procurementExecutives = [
    { id: '12', name: 'Prashant Jadhav', city: 'Pune' },
    { id: '13', name: 'Sneha Bhosale', city: 'Pune' },
    { id: '14', name: 'Arjun Iyer', city: 'Mumbai' },
  ];

  useEffect(() => {
    loadVehicles();
    loadProcurementTargets();
  }, []);

  const loadVehicles = () => {
    const storedVehicles = localStorage.getItem('inspection_vehicles');
    if (storedVehicles) {
      const parsedVehicles = JSON.parse(storedVehicles);
      // Filter by city for procurement admin
      const filteredVehicles = user?.role === 'procurement_admin' 
        ? parsedVehicles.filter((vehicle: InspectionVehicle) => {
            // Show vehicles from their managed city
            const vehicleStore = stores.find(store => store.id === vehicle.assignedStore);
            return !vehicle.assignedStore || vehicleStore?.city === user.managedCity;
          })
        : parsedVehicles;
      setVehicles(filteredVehicles);
    }
  };

  const loadProcurementTargets = () => {
    const storedTargets = localStorage.getItem('procurement_targets');
    if (storedTargets) {
      setProcurementTargets(JSON.parse(storedTargets));
    } else {
      const sampleTargets: ProcurementTarget[] = [
        {
          id: '1',
          city: user?.managedCity || 'Pune',
          month: 'January 2024',
          targetVehicles: 50,
          achievedVehicles: vehicles.filter(v => v.status === 'assigned').length,
          targetValue: 3500000,
          achievedValue: vehicles.filter(v => v.status === 'assigned').reduce((sum, v) => sum + (v.finalPrice || 0), 0)
        }
      ];
      setProcurementTargets(sampleTargets);
      localStorage.setItem('procurement_targets', JSON.stringify(sampleTargets));
    }
  };

  const handleApproveVehicle = (approve: boolean) => {
    if (!selectedVehicle) return;

    const newStatus = approve ? 'approved' : 'rejected';
    const allVehicles = JSON.parse(localStorage.getItem('inspection_vehicles') || '[]');
    const updatedVehicles = allVehicles.map((vehicle: InspectionVehicle) => 
      vehicle.id === selectedVehicle.id 
        ? { ...vehicle, status: newStatus }
        : vehicle
    );
    
    localStorage.setItem('inspection_vehicles', JSON.stringify(updatedVehicles));
    loadVehicles();
    setIsApprovalOpen(false);
    setSelectedVehicle(null);

    toast({
      title: approve ? "Vehicle Approved" : "Vehicle Rejected",
      description: `${selectedVehicle.brand} ${selectedVehicle.model} has been ${approve ? 'approved' : 'rejected'}.`,
    });
  };

  const calculateFinalPrice = (recommendedPrice: number, marginPercentage: number) => {
    const margin = (recommendedPrice * marginPercentage) / 100;
    return recommendedPrice + margin;
  };

  const handleAssignToStore = () => {
    if (!selectedVehicle || !assignmentData.storeId) {
      toast({
        title: "Missing Information",
        description: "Please select a store and set pricing.",
        variant: "destructive",
      });
      return;
    }

    const store = stores.find(s => s.id === assignmentData.storeId);
    const finalPrice = calculateFinalPrice(
      selectedVehicle.inspectionDetails?.recommendedPrice || 0, 
      assignmentData.marginPercentage
    );
    const margin = finalPrice - (selectedVehicle.inspectionDetails?.recommendedPrice || 0);

    const allVehicles = JSON.parse(localStorage.getItem('inspection_vehicles') || '[]');
    const updatedVehicles = allVehicles.map((vehicle: InspectionVehicle) => 
      vehicle.id === selectedVehicle.id 
        ? { 
            ...vehicle, 
            status: 'assigned',
            assignedStore: assignmentData.storeId,
            finalPrice,
            margin,
            marginPercentage: assignmentData.marginPercentage
          }
        : vehicle
    );
    
    localStorage.setItem('inspection_vehicles', JSON.stringify(updatedVehicles));
    loadVehicles();
    setIsAssignVehicleOpen(false);
    setSelectedVehicle(null);
    setAssignmentData({
      storeId: '',
      storeName: '',
      finalPrice: 0,
      marginPercentage: 20,
      margin: 0
    });

    toast({
      title: "Vehicle Assigned",
      description: `${selectedVehicle.brand} ${selectedVehicle.model} assigned to ${store?.name} at ₹${finalPrice.toLocaleString()}.`,
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
      case 'inspection': return <Target className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'assigned': return <Car className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const cityVehicles = vehicles.filter(vehicle => {
    if (user?.role === 'procurement_admin') {
      const vehicleStore = stores.find(store => store.id === vehicle.assignedStore);
      return !vehicle.assignedStore || vehicleStore?.city === user.managedCity;
    }
    return true;
  });

  const cityStores = stores.filter(store => store.city === user?.managedCity);
  const pendingApproval = cityVehicles.filter(v => v.status === 'pending_approval');
  const approvedVehicles = cityVehicles.filter(v => v.status === 'approved');
  const assignedVehicles = cityVehicles.filter(v => v.status === 'assigned');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-600">Manage vehicle approvals and store assignments for {user?.managedCity}</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cityVehicles.length}</div>
                <p className="text-xs text-muted-foreground">
                  In {user?.managedCity}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApproval.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedVehicles.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for assignment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedVehicles.length}</div>
                <p className="text-xs text-muted-foreground">
                  To stores
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Targets</CardTitle>
                <CardDescription>Procurement performance for {user?.managedCity}</CardDescription>
              </CardHeader>
              <CardContent>
                {procurementTargets.map(target => (
                  <div key={target.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{target.month}</span>
                      <span className="text-sm text-gray-600">{target.city}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Vehicles: {assignedVehicles.length}/{target.targetVehicles}</span>
                        <span>{Math.round((assignedVehicles.length / target.targetVehicles) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(assignedVehicles.length / target.targetVehicles) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Value: ₹{(assignedVehicles.reduce((sum, v) => sum + (v.finalPrice || 0), 0) / 100000).toFixed(1)}L/₹{(target.targetValue / 100000).toFixed(1)}L</span>
                        <span>{Math.round((assignedVehicles.reduce((sum, v) => sum + (v.finalPrice || 0), 0) / target.targetValue) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(assignedVehicles.reduce((sum, v) => sum + (v.finalPrice || 0), 0) / target.targetValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Distribution</CardTitle>
                <CardDescription>Vehicle assignment across stores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cityStores.map(store => {
                    const storeVehicles = assignedVehicles.filter(v => v.assignedStore === store.id);
                    return (
                      <div key={store.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{storeVehicles.length}</p>
                          <p className="text-sm text-gray-600">vehicles</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Pending Approvals</h3>
              <p className="text-muted-foreground">Review inspected vehicles for approval</p>
            </div>
            <Badge variant="secondary">{pendingApproval.length} pending</Badge>
          </div>

          <div className="grid gap-4">
            {pendingApproval.map(vehicle => (
              <Card key={vehicle.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-sm text-gray-600">{vehicle.year} • ₹{vehicle.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{vehicle.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {vehicle.inspectionDetails && (
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            ₹{vehicle.inspectionDetails.recommendedPrice.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">Recommended</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {vehicle.inspectionDetails.overallCondition} condition
                          </p>
                        </div>
                      )}
                      <Dialog open={isApprovalOpen && selectedVehicle?.id === vehicle.id} 
                              onOpenChange={(open) => {
                                setIsApprovalOpen(open);
                                if (!open) setSelectedVehicle(null);
                              }}>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedVehicle(vehicle)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Vehicle Inspection Review</DialogTitle>
                            <DialogDescription>
                              Review inspection details for {vehicle.brand} {vehicle.model}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {vehicle.inspectionDetails && (
                            <div className="grid gap-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Vehicle Information</h4>
                                  <div className="space-y-2">
                                    <p><strong>Type:</strong> {vehicle.type}</p>
                                    <p><strong>Brand:</strong> {vehicle.brand}</p>
                                    <p><strong>Model:</strong> {vehicle.model}</p>
                                    <p><strong>Year:</strong> {vehicle.year}</p>
                                    <p><strong>Location:</strong> {vehicle.location}</p>
                                    <p><strong>Asking Price:</strong> ₹{vehicle.price.toLocaleString()}</p>
                                  </div>
                                  
                                  <h4 className="font-semibold">Inspection Summary</h4>
                                  <div className="space-y-2">
                                    <p><strong>Overall Condition:</strong> <span className="capitalize">{vehicle.inspectionDetails.overallCondition}</span></p>
                                    <p><strong>Estimated Value:</strong> ₹{vehicle.inspectionDetails.estimatedValue.toLocaleString()}</p>
                                    <p><strong>Repair Costs:</strong> ₹{vehicle.inspectionDetails.repairCosts.toLocaleString()}</p>
                                    <p><strong>Recommended Price:</strong> ₹{vehicle.inspectionDetails.recommendedPrice.toLocaleString()}</p>
                                    <p><strong>Inspected By:</strong> {procurementExecutives.find(e => e.id === vehicle.inspectionDetails?.inspectedBy)?.name}</p>
                                    <p><strong>Inspection Date:</strong> {vehicle.inspectionDetails.inspectionDate}</p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h4 className="font-semibold">Inspection Points</h4>
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {vehicle.inspectionDetails.inspectionPoints.map(point => (
                                      <div key={point.id} className="flex items-center justify-between p-2 border rounded">
                                        <span className="text-sm">{point.name}</span>
                                        <Badge variant={
                                          point.status === 'good' ? 'default' :
                                          point.status === 'fair' ? 'secondary' :
                                          point.status === 'poor' ? 'destructive' : 'destructive'
                                        }>
                                          {point.status}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {vehicle.inspectionDetails.finalNotes && (
                                    <div>
                                      <h5 className="font-medium">Final Notes</h5>
                                      <p className="text-sm text-gray-600">{vehicle.inspectionDetails.finalNotes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="destructive" onClick={() => handleApproveVehicle(false)}>
                              Reject
                            </Button>
                            <Button onClick={() => handleApproveVehicle(true)}>
                              Approve
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingApproval.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
                  <p className="text-gray-600">All inspected vehicles have been reviewed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Approved Vehicles</h3>
              <p className="text-muted-foreground">Ready for store assignment</p>
            </div>
            <Badge variant="secondary">{approvedVehicles.length} approved</Badge>
          </div>

          <div className="grid gap-4">
            {approvedVehicles.map(vehicle => (
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
                        <p className="text-sm text-gray-500">{vehicle.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {vehicle.inspectionDetails && (
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            ₹{vehicle.inspectionDetails.recommendedPrice.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">Base Price</p>
                        </div>
                      )}
                      <Dialog open={isAssignVehicleOpen && selectedVehicle?.id === vehicle.id} 
                              onOpenChange={(open) => {
                                setIsAssignVehicleOpen(open);
                                if (!open) setSelectedVehicle(null);
                              }}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            setSelectedVehicle(vehicle);
                            setAssignmentData({
                              ...assignmentData,
                              finalPrice: calculateFinalPrice(vehicle.inspectionDetails?.recommendedPrice || 0, 20),
                              margin: (vehicle.inspectionDetails?.recommendedPrice || 0) * 0.2
                            });
                          }}>
                            <MapPin className="h-4 w-4 mr-2" />
                            Assign to Store
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Vehicle to Store</DialogTitle>
                            <DialogDescription>
                              Set pricing with margin and assign {vehicle.brand} {vehicle.model} to a store
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label>Select Store</Label>
                              <select
                                value={assignmentData.storeId}
                                onChange={(e) => {
                                  const store = cityStores.find(s => s.id === e.target.value);
                                  setAssignmentData({
                                    ...assignmentData,
                                    storeId: e.target.value,
                                    storeName: store?.name || ''
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Store</option>
                                {cityStores.map(store => (
                                  <option key={store.id} value={store.id}>{store.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Base Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={vehicle.inspectionDetails?.recommendedPrice || 0}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Margin (%)</Label>
                                <Input
                                  type="number"
                                  value={assignmentData.marginPercentage}
                                  onChange={(e) => {
                                    const marginPercentage = parseFloat(e.target.value);
                                    const basePrice = vehicle.inspectionDetails?.recommendedPrice || 0;
                                    const finalPrice = calculateFinalPrice(basePrice, marginPercentage);
                                    const margin = finalPrice - basePrice;
                                    
                                    setAssignmentData({
                                      ...assignmentData,
                                      marginPercentage,
                                      finalPrice,
                                      margin
                                    });
                                  }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Margin Amount (₹)</Label>
                                <Input
                                  type="number"
                                  value={Math.round(assignmentData.margin)}
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Final Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={Math.round(assignmentData.finalPrice)}
                                  disabled
                                  className="bg-gray-50 font-semibold"
                                />
                              </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Store Selling Price:</span>
                                <span className="text-2xl font-bold text-blue-900">
                                  ₹{Math.round(assignmentData.finalPrice).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-blue-700 mt-1">
                                Includes {assignmentData.marginPercentage}% margin (₹{Math.round(assignmentData.margin).toLocaleString()})
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsAssignVehicleOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAssignToStore}>
                              Assign Vehicle
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {approvedVehicles.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Vehicles</h3>
                  <p className="text-gray-600">Approve inspected vehicles to assign them to stores.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cityStores.map(store => {
              const storeVehicles = assignedVehicles.filter(v => v.assignedStore === store.id);
              const totalValue = storeVehicles.reduce((sum, v) => sum + (v.finalPrice || 0), 0);
              
              return (
                <Card key={store.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      {store.name}
                    </CardTitle>
                    <CardDescription>
                      {storeVehicles.length} vehicles • ₹{totalValue.toLocaleString()} total value
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {storeVehicles.map(vehicle => (
                        <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-sm text-gray-600">
                              Base: ₹{vehicle.inspectionDetails?.recommendedPrice.toLocaleString()} + 
                              {vehicle.marginPercentage}% margin
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">₹{vehicle.finalPrice?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">+₹{vehicle.margin?.toLocaleString()} margin</p>
                          </div>
                        </div>
                      ))}
                      {storeVehicles.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No vehicles assigned yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Margin Analysis</CardTitle>
                <CardDescription>Profit margins on assigned vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedVehicles.map(vehicle => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-sm text-gray-600">{vehicle.marginPercentage}% margin</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">₹{vehicle.margin?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">profit</p>
                      </div>
                    </div>
                  ))}
                  {assignedVehicles.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No margin data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Vehicle status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['inspection', 'pending_approval', 'approved', 'assigned', 'rejected'].map(status => {
                    const count = cityVehicles.filter(v => v.status === status).length;
                    const percentage = cityVehicles.length > 0 ? (count / cityVehicles.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <span className="ml-2 capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcurementManagement;
