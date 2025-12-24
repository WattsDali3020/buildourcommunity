import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
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
import Whitepaper from "@/pages/whitepaper";
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
      <Route path="/whitepaper" component={Whitepaper} />
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
            <Toaster />
            <Router />
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
