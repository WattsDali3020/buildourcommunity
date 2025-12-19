import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, Key, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PrivateAccessGateProps {
  offeringId: string;
  propertyName?: string;
  onAccessGranted: (accessType: "accessCode" | "inviteCode", inviteDetails?: any) => void;
}

export function PrivateAccessGate({ offeringId, propertyName, onAccessGranted }: PrivateAccessGateProps) {
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async (type: "accessCode" | "inviteCode") => {
    const code = type === "accessCode" ? accessCode : inviteCode;
    if (!code.trim()) {
      toast({
        title: "Code Required",
        description: `Please enter your ${type === "accessCode" ? "access" : "invite"} code.`,
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiRequest("POST", "/api/private-offerings/validate-access", {
        offeringId,
        [type]: code.trim().toUpperCase(),
      });

      const result = await response.json();

      if (result.valid) {
        toast({
          title: "Access Granted",
          description: "You now have access to this private offering.",
        });
        onAccessGranted(type, result.invite);
      } else {
        toast({
          title: "Invalid Code",
          description: "The code you entered is not valid or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Could not validate your code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Private Offering</CardTitle>
          <CardDescription>
            {propertyName ? (
              <>This property ({propertyName}) is a private offering. You need an access code or invitation to view it.</>
            ) : (
              <>This is a private offering. You need an access code or invitation to view it.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="accessCode" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Access Code
            </Label>
            <div className="flex gap-2">
              <Input
                id="accessCode"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleValidate("accessCode")}
                data-testid="input-private-access-code"
              />
              <Button 
                onClick={() => handleValidate("accessCode")} 
                disabled={isValidating}
                data-testid="button-validate-access-code"
              >
                {isValidating ? "..." : <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="inviteCode" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invite Code
            </Label>
            <div className="flex gap-2">
              <Input
                id="inviteCode"
                placeholder="Enter invite code from email"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleValidate("inviteCode")}
                data-testid="input-private-invite-code"
              />
              <Button 
                onClick={() => handleValidate("inviteCode")} 
                disabled={isValidating}
                data-testid="button-validate-invite-code"
              >
                {isValidating ? "..." : <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-md bg-muted/50 border">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Don't have a code?</p>
                <p>
                  Contact the property owner to request an invitation. Private offerings 
                  are limited to invited investors only.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
