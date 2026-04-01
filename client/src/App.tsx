import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AtlantaProperties from "@/pages/AtlantaProperties";
import DallasProperties from "@/pages/DallasProperties";
import PropertyDetail from "@/pages/PropertyDetail";
import About from "@/pages/About";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPropertyEditor from "@/pages/AdminPropertyEditor";
import AdminAnalytics from "@/pages/AdminAnalytics";
import HeroSettings from "@/pages/HeroSettings";
import ApartmentFinder from "@/pages/ApartmentFinder";
import AdminApartmentFinder from "@/pages/AdminApartmentFinder";
import AdminBulkPhotoUpload from "@/pages/AdminBulkPhotoUpload";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/atlanta" component={AtlantaProperties} />
      <Route path="/dallas" component={DallasProperties} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/about" component={About} />
      <Route path="/apartment-finder" component={ApartmentFinder} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/hero" component={HeroSettings} />
      <Route path="/admin/apartment-finder" component={AdminApartmentFinder} />
      <Route path="/admin/bulk-photos" component={AdminBulkPhotoUpload} />
      <Route path="/admin/property/:id" component={AdminPropertyEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
