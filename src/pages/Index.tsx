import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Inventory from "@/components/Inventory";
import Leads from "@/components/Leads";
import MatchEngine from "@/components/MatchEngine";
import Analytics from "@/components/Analytics";
import BottomNavigation from "@/components/BottomNavigation";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  console.log("Index component rendering, activeTab:", activeTab);

  const renderContent = () => {
    console.log("Rendering content for tab:", activeTab);
    switch (activeTab) {
      case "dashboard":
        console.log("Rendering Dashboard component");
        return <Dashboard />;
      case "inventory":
        return <Inventory />;
      case "leads":
        return <Leads />;
      case "match":
        return <MatchEngine />;
      case "analytics":
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold text-foreground mb-4">Mobile CRM App</h1>
      <p className="text-muted-foreground mb-4">Current tab: {activeTab}</p>
      {renderContent()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
