import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle, XCircle, Search } from "lucide-react";
import { useState } from "react";

const stateCompliance = [
  { state: "Georgia", status: "approved", securities: "Blue Sky Exemption", realEstate: "Active", blockchain: "HB 859 Favorable" },
  { state: "South Carolina", status: "approved", securities: "Reg D Compliant", realEstate: "Active", blockchain: "Pending" },
  { state: "North Carolina", status: "approved", securities: "Reg D Compliant", realEstate: "Active", blockchain: "Favorable" },
  { state: "Texas", status: "approved", securities: "State Exemption", realEstate: "Active", blockchain: "Favorable" },
  { state: "Florida", status: "approved", securities: "Reg D Compliant", realEstate: "Active", blockchain: "Favorable" },
  { state: "New York", status: "review", securities: "Martin Act", realEstate: "Active", blockchain: "BitLicense" },
  { state: "California", status: "approved", securities: "State Qualifier", realEstate: "Active", blockchain: "DFI Registered" },
  { state: "Wyoming", status: "approved", securities: "DAO LLC", realEstate: "Active", blockchain: "Most Favorable" },
  { state: "Colorado", status: "approved", securities: "Reg D Compliant", realEstate: "Active", blockchain: "Sandbox" },
  { state: "Arizona", status: "approved", securities: "Reg D Compliant", realEstate: "Active", blockchain: "Sandbox" },
];

const statusConfig = {
  approved: { icon: CheckCircle, color: "text-chart-3", badge: "bg-chart-3 text-white" },
  review: { icon: AlertCircle, color: "text-chart-4", badge: "bg-chart-4 text-white" },
  restricted: { icon: XCircle, color: "text-destructive", badge: "bg-destructive text-white" },
};

export function StateComplianceTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStates = stateCompliance.filter((item) =>
    item.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>State Compliance Matrix</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-states"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm">State</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Securities</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Real Estate</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Blockchain</th>
              </tr>
            </thead>
            <tbody>
              {filteredStates.map((item) => {
                const config = statusConfig[item.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                return (
                  <tr
                    key={item.state}
                    className="border-b last:border-0"
                    data-testid={`row-state-${item.state.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <td className="py-3 px-4 font-medium">{item.state}</td>
                    <td className="py-3 px-4">
                      <Badge className={config.badge}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.securities}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.realEstate}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.blockchain}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
