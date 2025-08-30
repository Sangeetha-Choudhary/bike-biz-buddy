import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  TrendingUp,
  Users,
  Package,
  Calendar,
  MapPin,
  Phone,
  Star,
  IndianRupee,
  Clock,
  Target,
  Award,
  Bell,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Plus,
  RefreshCw,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  MessageCircle,
  Video,
  UserPlus,
  Activity,
  Zap,
  TrendingDown,
  User,
  Trash2
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
  lastContact?: string;
  nextAction?: string;
  priority?: 'high' | 'medium' | 'low';
}

// interface Notification {
//   id: number;
//   type: 'follow_up' | 'test_ride' | 'payment' | 'delivery' | 'inquiry';
//   title: string;
//   message: string;
//   time: string;
//   urgent: boolean;
//   leadId?: number;
// }

interface Task {
  id: number;
  title: string;
  description: string;
  dueTime: string;
  priority: 'high' | 'medium' | 'low';
  type: 'follow_up' | 'call' | 'meeting' | 'document' | 'delivery';
  leadName?: string;
  completed: boolean;
}

const Dashboard = () => {
  // Define default tasks first
  const todaysTasks: Task[] = [
    {
      id: 1,
      title: "Call Rajesh Kumar",
      description: "Discuss Honda Activa pricing and financing options",
      dueTime: "2:00 PM",
      priority: "high",
      type: "call",
      leadName: "Rajesh Kumar",
      completed: false
    },
    {
      id: 2,
      title: "Test Ride Setup",
      description: "Prepare TVS Jupiter for Priya's test ride",
      dueTime: "4:00 PM",
      priority: "medium",
      type: "meeting",
      leadName: "Priya Sharma",
      completed: false
    },
    {
      id: 3,
      title: "Document Preparation",
      description: "Prepare loan documents for Sunita Devi",
      dueTime: "5:30 PM",
      priority: "medium",
      type: "document",
      leadName: "Sunita Devi",
      completed: true
    },
    {
      id: 4,
      title: "Follow up",
      description: "Send quotation to Anil Mehta",
      dueTime: "Tomorrow 10 AM",
      priority: "low",
      type: "follow_up",
      leadName: "Anil Mehta",
      completed: false
    }
  ];

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  // const [refreshing, setRefreshing] = useState(false);
  const [quickActionData, setQuickActionData] = useState({
    leadName: "",
    phone: "",
    notes: "",
    followUpDate: "",
    followUpTime: ""
  });
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    dueTime: "",
    priority: "medium" as 'high' | 'medium' | 'low',
    type: "follow_up" as 'follow_up' | 'call' | 'meeting' | 'document' | 'delivery',
    leadName: ""
  });
  const [tasks, setTasks] = useState<Task[]>(todaysTasks);
  const [leadFilterOpen, setLeadFilterOpen] = useState(false);
  const [leadFilter, setLeadFilter] = useState({
    status: "",
    priority: "",
    timeframe: ""
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const statsData = [
    {
      title: "Total Leads",
      value: "248",
      change: "+12%",
      changeValue: "+28",
      icon: Users,
      color: "info",
      trend: "up",
      target: "280",
      progress: 88
    },
    {
      title: "Test Rides",
      value: "89",
      change: "+8%",
      changeValue: "+7",
      icon: Calendar,
      color: "warning",
      trend: "up",
      target: "100",
      progress: 89
    },
    {
      title: "Sales This Month",
      value: "42",
      change: "+23%",
      changeValue: "+8",
      icon: TrendingUp,
      color: "success",
      trend: "up",
      target: "50",
      progress: 84
    },
    {
      title: "Revenue",
      value: "₹36.7L",
      change: "+15%",
      changeValue: "+₹4.8L",
      icon: IndianRupee,
      color: "primary",
      trend: "up",
      target: "₹45L",
      progress: 82
    }
  ];

  const recentLeads: Lead[] = [
    {
      id: 1,
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      location: "Mumbai Central",
      interest: "Honda Activa 6G",
      budget: "₹80,000",
      status: "hot",
      rating: 4.5,
      lastContact: "Today",
      nextAction: "Send quotation",
      priority: "high"
    },
    {
      id: 2,
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      location: "Andheri West",
      interest: "TVS Jupiter",
      budget: "₹75,000",
      status: "warm",
      rating: 4.2,
      lastContact: "Yesterday",
      nextAction: "Schedule test ride",
      priority: "medium"
    },
    {
      id: 3,
      name: "Anil Mehta",
      phone: "+91 76543 21098",
      location: "Borivali East",
      interest: "Bajaj Pulsar 150",
      budget: "₹95,000",
      status: "cold",
      rating: 3.8,
      lastContact: "3 days ago",
      nextAction: "Follow up call",
      priority: "medium"
    }
  ];

  // const notifications: Notification[] = [
  //   {
  //     id: 1,
  //     type: "follow_up",
  //     title: "Follow-up Due",
  //     message: "Call Rajesh Kumar about Honda Activa pricing",
  //     time: "2:00 PM",
  //     urgent: true,
  //     leadId: 1
  //   },
  //   {
  //     id: 2,
  //     type: "test_ride",
  //     title: "Test Ride Scheduled",
  //     message: "Priya Sharma - TVS Jupiter at 4:30 PM",
  //     time: "4:30 PM",
  //     urgent: false,
  //     leadId: 2
  //   },
  //   {
  //     id: 3,
  //     type: "inquiry",
  //     title: "New Lead",
  //     message: "Website inquiry for Royal Enfield Classic 350",
  //     time: "1 hour ago",
  //     urgent: false
  //   },
  //   {
  //     id: 4,
  //     type: "payment",
  //     title: "Payment Reminder",
  //     message: "Follow up with Deepak Singh for pending payment",
  //     time: "Tomorrow",
  //     urgent: true
  //   }
  // ];

  const getStatusBadge = (status: string) => {
    const variants = {
      hot: "bg-red-100 text-red-800 border-red-200",
      warm: "bg-orange-100 text-orange-800 border-orange-200",
      cold: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return variants[status as keyof typeof variants] || variants.cold;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "text-red-500",
      medium: "text-yellow-500",
      low: "text-blue-500"
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  // const getNotificationIcon = (type: string) => {
  //   const icons = {
  //     follow_up: Phone,
  //     test_ride: Calendar,
  //     payment: IndianRupee,
  //     delivery: Package,
  //     inquiry: UserPlus
  //   };
  //   return icons[type as keyof typeof icons] || Bell;
  // };

  // const handleRefreshData = async () => {
  //   setRefreshing(true);
  //   // Simulate API call
  //   await new Promise(resolve => setTimeout(resolve, 2000));
  //   setRefreshing(false);
  //   toast({
  //     title: "Data Refreshed",
  //     description: "Dashboard data has been updated with latest information.",
  //   });
  // };

  const handleCallLead = (lead: Lead) => {
    toast({
      title: "Calling Customer",
      description: `Calling ${lead.name} at ${lead.phone}`,
    });
    // In real app, integrate with dialer
  };

  const handleWhatsAppLead = (lead: Lead) => {
    toast({
      title: "WhatsApp Message",
      description: `Opening WhatsApp chat with ${lead.name}`,
    });
    // In real app, open WhatsApp with pre-filled message
  };

  const handleMatchBike = (lead: Lead) => {
    toast({
      title: "Match Engine",
      description: `Finding perfect bikes for ${lead.name}`,
    });
    // In real app, navigate to match engine with pre-selected lead
  };

  const handleCompleteTask = (taskId: number) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));

    const task = tasks.find(t => t.id === taskId);
    toast({
      title: task?.completed ? "Task Reopened" : "Task Completed",
      description: task?.completed ? "Task has been marked as pending." : "Task has been marked as completed.",
    });
  };

  const handleAddTask = () => {
    if (!taskFormData.title || !taskFormData.dueTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in task title and due time.",
        variant: "destructive",
      });
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: taskFormData.title,
      description: taskFormData.description,
      dueTime: taskFormData.dueTime,
      priority: taskFormData.priority,
      type: taskFormData.type,
      leadName: taskFormData.leadName || undefined,
      completed: false
    };

    setTasks(prev => [newTask, ...prev]);
    setAddTaskOpen(false);
    setTaskFormData({
      title: "",
      description: "",
      dueTime: "",
      priority: "medium",
      type: "follow_up",
      leadName: ""
    });

    toast({
      title: "Task Added",
      description: `Task "${newTask.title}" has been added.`,
    });
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Task has been removed.",
    });
  };

  const handleQuickAction = () => {
    if (!quickActionData.leadName || !quickActionData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in the lead name and phone number.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Quick Action Completed",
      description: `${selectedAction} completed for ${quickActionData.leadName}`,
    });

    setQuickActionOpen(false);
    setQuickActionData({
      leadName: "",
      phone: "",
      notes: "",
      followUpDate: "",
      followUpTime: ""
    });
  };

  // const handleNotificationAction = (notification: Notification) => {
  //   if (notification.leadId) {
  //     const lead = recentLeads.find(l => l.id === notification.leadId);
  //     if (lead) {
  //       if (notification.type === 'follow_up') {
  //         handleCallLead(lead);
  //       } else if (notification.type === 'test_ride') {
  //         toast({
  //           title: "Test Ride",
  //           description: `Managing test ride for ${lead.name}`,
  //         });
  //       }
  //     }
  //   }
    
  //   toast({
  //     title: "Notification Handled",
  //     description: notification.message,
  //   });
  // };

  const AddTaskDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={addTaskOpen} onOpenChange={setAddTaskOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add New Task</DrawerTitle>
              <DrawerDescription>
                Create a new task for your team
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Task Title *</Label>
                  <Input
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Time *</Label>
                    <Input
                      value={taskFormData.dueTime}
                      onChange={(e) => setTaskFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                      placeholder="Tomorrow 10 AM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={taskFormData.priority} onValueChange={(value: any) => setTaskFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={taskFormData.type} onValueChange={(value: any) => setTaskFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Name</Label>
                    <Input
                      value={taskFormData.leadName}
                      onChange={(e) => setTaskFormData(prev => ({ ...prev, leadName: e.target.value }))}
                      placeholder="Customer name"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAddTaskOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddTask} className="flex-1">
                  Add Task
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title *</Label>
                <Input
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Time *</Label>
                  <Input
                    value={taskFormData.dueTime}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                    placeholder="Tomorrow 10 AM"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={taskFormData.priority} onValueChange={(value: any) => setTaskFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={taskFormData.type} onValueChange={(value: any) => setTaskFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lead Name</Label>
                  <Input
                    value={taskFormData.leadName}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, leadName: e.target.value }))}
                    placeholder="Customer name"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAddTaskOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddTask} className="flex-1">
                  Add Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  const QuickActionDialog = () => (
    <>
      {isMobile ? (
        <Drawer open={quickActionOpen} onOpenChange={setQuickActionOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Quick Action</DrawerTitle>
              <DrawerDescription>
                Quickly perform common actions
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Make Call</SelectItem>
                      <SelectItem value="follow_up">Schedule Follow-up</SelectItem>
                      <SelectItem value="test_ride">Schedule Test Ride</SelectItem>
                      <SelectItem value="quote">Send Quotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lead Name</Label>
                    <Input
                      value={quickActionData.leadName}
                      onChange={(e) => setQuickActionData(prev => ({ ...prev, leadName: e.target.value }))}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={quickActionData.phone}
                      onChange={(e) => setQuickActionData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
                
                {selectedAction === 'follow_up' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Follow-up Date</Label>
                      <Input
                        type="date"
                        value={quickActionData.followUpDate}
                        onChange={(e) => setQuickActionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Follow-up Time</Label>
                      <Input
                        type="time"
                        value={quickActionData.followUpTime}
                        onChange={(e) => setQuickActionData(prev => ({ ...prev, followUpTime: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={quickActionData.notes}
                    onChange={(e) => setQuickActionData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setQuickActionOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleQuickAction} className="flex-1">
                  Complete Action
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={quickActionOpen} onOpenChange={setQuickActionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Action</DialogTitle>
              <DialogDescription>
                Quickly perform common actions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Make Call</SelectItem>
                    <SelectItem value="follow_up">Schedule Follow-up</SelectItem>
                    <SelectItem value="test_ride">Schedule Test Ride</SelectItem>
                    <SelectItem value="quote">Send Quotation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lead Name</Label>
                  <Input
                    value={quickActionData.leadName}
                    onChange={(e) => setQuickActionData(prev => ({ ...prev, leadName: e.target.value }))}
                    placeholder="Customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={quickActionData.phone}
                    onChange={(e) => setQuickActionData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              
              {selectedAction === 'follow_up' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={quickActionData.followUpDate}
                      onChange={(e) => setQuickActionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Follow-up Time</Label>
                    <Input
                      type="time"
                      value={quickActionData.followUpTime}
                      onChange={(e) => setQuickActionData(prev => ({ ...prev, followUpTime: e.target.value }))}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={quickActionData.notes}
                  onChange={(e) => setQuickActionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setQuickActionOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleQuickAction} className="flex-1">
                  Complete Action
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  // const NotificationsDialog = () => (
  //   <>
  //     {isMobile ? (
  //       <Drawer open={notificationsOpen} onOpenChange={setNotificationsOpen}>
  //         <DrawerContent>
  //           <DrawerHeader>
  //             <DrawerTitle>Notifications</DrawerTitle>
  //             <DrawerDescription>
  //               Recent updates and reminders
  //             </DrawerDescription>
  //           </DrawerHeader>
  //           <div className="px-4">
  //             <ScrollArea className="max-h-[60vh]">
  //               <div className="space-y-3">
  //                 {notifications.map((notification) => {
  //                   const Icon = getNotificationIcon(notification.type);
  //                   return (
  //                     <Card 
  //                       key={notification.id} 
  //                       className={`cursor-pointer transition-all ${notification.urgent ? 'border-red-200 bg-red-50' : ''}`}
  //                       onClick={() => handleNotificationAction(notification)}
  //                     >
  //                       <CardContent className="p-4">
  //                         <div className="flex items-start gap-3">
  //                           <div className={`p-2 rounded-lg ${notification.urgent ? 'bg-red-100' : 'bg-muted'}`}>
  //                             <Icon className={`w-4 h-4 ${notification.urgent ? 'text-red-600' : 'text-muted-foreground'}`} />
  //                           </div>
  //                           <div className="flex-1">
  //                             <div className="flex items-center justify-between">
  //                               <h4 className="font-semibold text-sm">{notification.title}</h4>
  //                               <span className="text-xs text-muted-foreground">{notification.time}</span>
  //                             </div>
  //                             <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
  //                           </div>
  //                         </div>
  //                       </CardContent>
  //                     </Card>
  //                   );
  //                 })}
  //               </div>
  //             </ScrollArea>
  //           </div>
  //         </DrawerContent>
  //       </Drawer>
  //     ) : (
  //       <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
  //         <DialogContent className="max-w-2xl">
  //           <DialogHeader>
  //             <DialogTitle>Notifications</DialogTitle>
  //             <DialogDescription>
  //               Recent updates and reminders
  //             </DialogDescription>
  //           </DialogHeader>
  //           <ScrollArea className="max-h-[60vh]">
  //             <div className="space-y-3">
  //               {notifications.map((notification) => {
  //                 const Icon = getNotificationIcon(notification.type);
  //                 return (
  //                   <Card 
  //                     key={notification.id} 
  //                     className={`cursor-pointer transition-all ${notification.urgent ? 'border-red-200 bg-red-50' : ''}`}
  //                     onClick={() => handleNotificationAction(notification)}
  //                   >
  //                     <CardContent className="p-4">
  //                       <div className="flex items-start gap-3">
  //                         <div className={`p-2 rounded-lg ${notification.urgent ? 'bg-red-100' : 'bg-muted'}`}>
  //                           <Icon className={`w-4 h-4 ${notification.urgent ? 'text-red-600' : 'text-muted-foreground'}`} />
  //                         </div>
  //                         <div className="flex-1">
  //                           <div className="flex items-center justify-between">
  //                             <h4 className="font-semibold text-sm">{notification.title}</h4>
  //                             <span className="text-xs text-muted-foreground">{notification.time}</span>
  //                           </div>
  //                           <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
  //                         </div>
  //                       </div>
  //                     </CardContent>
  //                   </Card>
  //                 );
  //               })}
  //             </div>
  //           </ScrollArea>
  //         </DialogContent>
  //       </Dialog>
  //     )}
  //   </>
  // );

  return (
    <div className="min-h-screen bg-background p-3 lg:p-4 pb-20 lg:pb-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm lg:text-base text-muted-foreground hidden lg:block">Welcome back! Here's your business overview</p>
        </div>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => setNotificationsOpen(true)}
            className="relative flex-1 lg:flex-none"
          >
            <Bell className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">Notifications</span>
            {notifications.filter(n => n.urgent).length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-0">
                {notifications.filter(n => n.urgent).length}
              </Badge>
            )}
          </Button> */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={refreshing}
            className="flex-1 lg:flex-none"
          >
            <RefreshCw className={`w-4 h-4 lg:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">{refreshing ? 'Updating...' : 'Refresh'}</span>
          </Button> */}
          <Button
            size="sm"
            onClick={() => setQuickActionOpen(true)}
            className="flex-1 lg:flex-none"
          >
            <Zap className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">Quick Action</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          return (
            <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3 lg:p-4">
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 lg:p-2 rounded-lg bg-${stat.color}/10`}>
                      <Icon className={`w-4 h-4 lg:w-5 lg:h-5 text-${stat.color}`} />
                    </div>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-destructive" />
                    )}
                  </div>

                  <div>
                    <p className="text-lg lg:text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs lg:text-sm text-muted-foreground">{stat.title}</p>
                  </div>

                  <div className="space-y-1 lg:space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={`${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground hidden lg:inline">
                        Target: {stat.target}
                      </span>
                    </div>
                    <Progress value={stat.progress} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Tasks */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Tasks ({tasks.filter(t => !t.completed).length} pending)
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddTaskOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        task.completed 
                          ? 'bg-success border-success text-white' 
                          : 'border-muted-foreground hover:border-success'
                      }`}
                    >
                      {task.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      {task.leadName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {task.leadName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{task.dueTime}</p>
                      <Badge variant="secondary" className="text-xs">
                        {task.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lead Filter Panel */}
      {leadFilterOpen && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Filter Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={leadFilter.status} onValueChange={(value) => setLeadFilter(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={leadFilter.priority} onValueChange={(value) => setLeadFilter(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select value={leadFilter.timeframe} onValueChange={(value) => setLeadFilter(prev => ({ ...prev, timeframe: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setLeadFilter({ status: "", priority: "", timeframe: "" })}>
                Clear Filters
              </Button>
              <Button onClick={() => setLeadFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Leads */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Leads
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeadFilterOpen(!leadFilterOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to leads page
                  toast({
                    title: "Navigation",
                    description: "Opening all leads view...",
                  });
                }}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{lead.name}</h4>
                      <Badge className={getStatusBadge(lead.status)}>
                        {lead.status.toUpperCase()}
                      </Badge>
                      {lead.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          High Priority
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
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
                        {lead.budget}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{lead.rating}/5</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last contact: {lead.lastContact}
                      </div>
                    </div>
                    {lead.nextAction && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <strong>Next action:</strong> {lead.nextAction}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
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
                      Message
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleMatchBike(lead)}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Match
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                setSelectedAction("call");
                setQuickActionOpen(true);
              }}
            >
              <Phone className="w-6 h-6 mb-2" />
              <span className="text-sm">Make Call</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                setSelectedAction("follow_up");
                setQuickActionOpen(true);
              }}
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">Schedule Follow-up</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => {
                const testRides = JSON.parse(localStorage.getItem('bikebiz_test_rides') || '[]');
                if (testRides.length > 0) {
                  toast({
                    title: "Test Rides",
                    description: `You have ${testRides.length} test ride(s) scheduled.`,
                  });
                } else {
                  toast({
                    title: "No Test Rides",
                    description: "No test rides scheduled yet.",
                  });
                }
              }}
            >
              <Activity className="w-6 h-6 mb-2" />
              <span className="text-sm">Test Rides</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                setSelectedAction("quote");
                setQuickActionOpen(true);
              }}
            >
              <Download className="w-6 h-6 mb-2" />
              <span className="text-sm">Send Quote</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTaskDialog />
      <QuickActionDialog />
      {/* <NotificationsDialog /> */}
    </div>
  );
};

export default Dashboard;
