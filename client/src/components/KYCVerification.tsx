import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, Upload } from "lucide-react";
import type { User } from "@shared/schema";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

interface KYCVerificationProps {
  user?: User | null;
}

export function KYCVerification({ user }: KYCVerificationProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    county: user?.county || "",
    state: user?.state || "",
    country: user?.country || "USA",
  });

  const submitKYCMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/user/kyc", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "KYC Submitted",
        description: "Your verification request has been submitted for review.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit KYC verification",
        variant: "destructive",
      });
    },
  });

  const getStatusDisplay = () => {
    const status = user?.kycStatus || "pending";
    switch (status) {
      case "verified":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          badge: <Badge variant="default" className="bg-green-600">Verified</Badge>,
          message: "Your identity has been verified. You can now purchase tokens.",
        };
      case "submitted":
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          badge: <Badge variant="secondary">Under Review</Badge>,
          message: "Your verification is being reviewed. This usually takes 1-2 business days.",
        };
      case "rejected":
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          badge: <Badge variant="destructive">Rejected</Badge>,
          message: "Your verification was rejected. Please contact support for assistance.",
        };
      default:
        return {
          icon: <ShieldCheck className="h-5 w-5 text-muted-foreground" />,
          badge: <Badge variant="outline">Not Verified</Badge>,
          message: "Please complete verification to purchase tokens.",
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {statusDisplay.icon}
            <div>
              <CardTitle className="text-lg">Identity Verification</CardTitle>
              <CardDescription>Required to purchase tokens</CardDescription>
            </div>
          </div>
          {statusDisplay.badge}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{statusDisplay.message}</p>

        {user?.kycStatus !== "verified" && user?.kycStatus !== "submitted" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitKYCMutation.mutate(formData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  data-testid="input-kyc-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  data-testid="input-kyc-lastname"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  placeholder="e.g., Cherokee"
                  required
                  data-testid="input-kyc-county"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger data-testid="select-kyc-state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitKYCMutation.isPending}
              data-testid="button-submit-kyc"
            >
              {submitKYCMutation.isPending ? "Submitting..." : "Submit Verification"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
