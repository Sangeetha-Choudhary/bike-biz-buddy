import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Users,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  LogIn,
  Truck,
  CheckSquare
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to BikeBiz CRM!",
      });
    } else {
      setError("Invalid email or password");
    }
  };

  const demoAccounts = [
    {
      role: "Global Admin",
      email: "admin@bikebiz.com",
      password: "admin123",
      description: "Complete system access across all stores, user management, and system configuration",
      icon: Shield,
      color: "bg-red-500",
      permissions: ["All Permissions", "Multi-Store Access", "User Management", "System Settings", "Global Analytics"]
    },
    {
      role: "Wakad Store Admin",
      email: "admin@wakad.com",
      password: "admin123",
      description: "Complete store management for Wakad Store in Pune including team management",
      icon: Users,
      color: "bg-orange-500",
      permissions: ["Store Management", "Team Management", "Store Analytics", "Full Store Access", "User Creation"]
    },
    {
      role: "Pune Procurement Admin",
      email: "procurement@pune.com",
      password: "proc123",
      description: "City-wide procurement management for Pune - vehicle acquisition and assignment",
      icon: Truck,
      color: "bg-purple-500",
      permissions: ["Procurement Management", "Vehicle Acquisition", "City Inventory", "Team Management", "Vendor Relations"]
    },
    {
      role: "Wakad Sales Executive",
      email: "executive@wakad.com",
      password: "exec123",
      description: "Lead generation and sales for Wakad Store in Pune",
      icon: TrendingUp,
      color: "bg-amber-500",
      permissions: ["Lead Management", "Match Engine", "Sales Creation", "Test Rides", "Customer Communication"]
    },
    {
      role: "Pune Procurement Executive",
      email: "exec1@pune-procurement.com",
      password: "exec123",
      description: "Vehicle verification and hunting for Pune procurement team",
      icon: CheckSquare,
      color: "bg-teal-500",
      permissions: ["Vehicle Verification", "Photo Documentation", "Score Assessment", "Expense Claims", "Field Operations"]
    }
  ];

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">BikeBiz CRM</CardTitle>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
            
            <div className="text-center text-sm text-muted-foreground">
              Demo accounts available →
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-2">Multi-Level Role Hierarchy</h2>
            <p className="text-muted-foreground text-lg">
              Global Admin → Store Admin → Sales Executive hierarchy with store-specific access
            </p>
          </div>

          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="accounts">Demo Accounts</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts" className="space-y-4">
              {demoAccounts.map((account, index) => {
                const Icon = account.icon;
                return (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary"
                    onClick={() => quickLogin(account.email, account.password)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${account.color} rounded-lg flex items-center justify-center text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{account.role}</h3>
                            <Badge variant="outline">{account.email}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{account.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {account.permissions.map((permission, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold">Role-Based Security</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Different access levels ensure users only see what they need
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold">User Management</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Admins can manage users, roles, and permissions
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold">Analytics Control</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Different analytics views based on user permissions
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold">Data Protection</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sensitive data is protected based on user clearance
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
