import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  Calendar,
  IndianRupee,
  Target,
  Clock,
  Award,
  BarChart3,
  Download,
  FileText
} from "lucide-react";

const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState("month");
  const { toast } = useToast();
  const kpiData = [
    {
      title: "Conversion Rate",
      value: "18.5%",
      change: "+2.3%",
      trend: "up",
      icon: Target,
      color: "success"
    },
    {
      title: "Avg. Deal Value",
      value: "₹87,500",
      change: "+₹5,200",
      trend: "up",
      icon: IndianRupee,
      color: "primary"
    },
    {
      title: "Lead Response Time",
      value: "24 min",
      change: "-8 min",
      trend: "up",
      icon: Clock,
      color: "info"
    },
    {
      title: "Customer Satisfaction",
      value: "4.2/5",
      change: "+0.3",
      trend: "up",
      icon: Award,
      color: "warning"
    }
  ];

  const monthlyStats = [
    { month: "Dec", leads: 180, sales: 32, revenue: 2800000 },
    { month: "Jan", leads: 248, sales: 42, revenue: 3675000 },
    { month: "Feb", leads: 195, sales: 38, revenue: 3325000 },
    { month: "Current", leads: 156, sales: 28, revenue: 2450000 }
  ];

  const topPerformers = [
    { name: "Amit Kumar", role: "Sales Executive", deals: 12, revenue: 1050000 },
    { name: "Priya Singh", role: "Senior Sales", deals: 10, revenue: 925000 },
    { name: "Ravi Patel", role: "Sales Executive", deals: 8, revenue: 720000 }
  ];

  const funnelData = [
    { stage: "Total Leads", count: 248, percentage: 100, color: "bg-blue-500" },
    { stage: "Qualified", count: 186, percentage: 75, color: "bg-green-500" },
    { stage: "Test Rides", count: 124, percentage: 50, color: "bg-yellow-500" },
    { stage: "Negotiations", count: 68, percentage: 27, color: "bg-orange-500" },
    { stage: "Sales", count: 42, percentage: 17, color: "bg-red-500" }
  ];

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your analytics data is being exported...",
    });
  };

  const handleExportLeads = () => {
    toast({
      title: "Leads Report",
      description: "Leads report is being generated...",
    });
  };

  const handleExportSales = () => {
    toast({
      title: "Sales Report",
      description: "Sales report is being generated...",
    });
  };

  const handleExportTestRides = () => {
    toast({
      title: "Test Rides Report", 
      description: "Test rides report is being generated...",
    });
  };

  const handleExportInventory = () => {
    toast({
      title: "Inventory Report",
      description: "Inventory report is being generated...",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setTimeFilter(timeFilter === "month" ? "year" : "month")}
          >
            {timeFilter === "month" ? "This Month" : "This Year"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>Export</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend === "up";
          return (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${kpi.color}/10`}>
                    <Icon className={`w-5 h-5 text-${kpi.color}`} />
                  </div>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className={`text-xs mt-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {kpi.change} from last month
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Performance */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="font-medium text-foreground">{stat.month}</div>
                <div className="grid grid-cols-3 gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-info">{stat.leads}</div>
                    <div className="text-muted-foreground">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-success">{stat.sales}</div>
                    <div className="text-muted-foreground">Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">₹{(stat.revenue / 100000).toFixed(1)}L</div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales Funnel */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Sales Funnel - This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelData.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                  <span className="text-sm text-muted-foreground">{stage.count} ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stage.color}`}
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Top Performers - This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{performer.name}</div>
                    <div className="text-sm text-muted-foreground">{performer.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground">{performer.deals} deals</div>
                  <div className="text-sm text-primary">₹{(performer.revenue / 100000).toFixed(1)}L</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={handleExportLeads}
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-sm">Lead Analysis</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={handleExportSales}
            >
              <TrendingUp className="w-5 h-5 mb-1" />
              <span className="text-sm">Monthly Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={handleExportTestRides}
            >
              <Calendar className="w-5 h-5 mb-1" />
              <span className="text-sm">Test Rides</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={handleExportInventory}
            >
              <Package className="w-5 h-5 mb-1" />
              <span className="text-sm">Inventory Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;