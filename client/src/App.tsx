import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { BetaBanner } from "@/components/BetaBanner";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import Governance from "@/pages/governance";
import Community from "@/pages/community";
import Learn from "@/pages/learn";
import Dashboard from "@/pages/dashboard";
import About from "@/pages/about";
import Submit from "@/pages/submit";
import Tokenize from "@/pages/tokenize";
import Nominate from "@/pages/nominate";
import OwnerResponse from "@/pages/owner-response";
import AdminPanel from "@/pages/admin";
import Litepaper from "@/pages/litepaper";
import TokenizationProcess from "@/pages/tokenization-process";
import FAQ from "@/pages/faq";
import AIInsights from "@/pages/ai-insights";
import BusinessLayer from "@/pages/business-layer";
import Grants from "@/pages/grants";
import DemandDashboard from "@/pages/demand-dashboard";
import FounderDashboard from "@/pages/founder-dashboard";
import Wishlist from "@/pages/wishlist";
import Treasury from "@/pages/treasury";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/governance" component={Governance} />
      <Route path="/community" component={Community} />
      <Route path="/nominate" component={Nominate} />
      <Route path="/learn" component={Learn} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/about" component={About} />
      <Route path="/submit" component={Submit} />
      <Route path="/tokenize" component={Tokenize} />
      <Route path="/owner-response/:token" component={OwnerResponse} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/litepaper" component={Litepaper} />
      <Route path="/how-it-works" component={TokenizationProcess} />
      <Route path="/faq" component={FAQ} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/business" component={BusinessLayer} />
      <Route path="/grants" component={Grants} />
      <Route path="/demand" component={DemandDashboard} />
      <Route path="/founder" component={FounderDashboard} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/treasury" component={Treasury} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <TooltipProvider>
            <BetaBanner />
            <Toaster />
            <Router />
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
