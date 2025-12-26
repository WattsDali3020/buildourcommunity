import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("investor");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({ email, role });
  };

  const handleClose = () => {
    setSubmitted(false);
    setEmail("");
    setRole("investor");
    onOpenChange(false);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl mb-2">You're on the list!</DialogTitle>
            <DialogDescription className="text-base">
              We'll notify you about new iterations, pilots, and launches. Follow us on X for real-time updates.
            </DialogDescription>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" asChild>
                <a href="https://x.com/RevitaHub" target="_blank" rel="noopener noreferrer" data-testid="link-follow-x">
                  Follow @RevitaHub
                </a>
              </Button>
              <Button onClick={handleClose} data-testid="button-close-waitlist-success">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the RevitaHub Waitlist</DialogTitle>
          <DialogDescription>
            Get notified about new iterations, pilot launches, and early access opportunities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-waitlist-email"
            />
          </div>
          
          <div className="space-y-3">
            <Label>I'm interested as a...</Label>
            <RadioGroup value={role} onValueChange={setRole} className="space-y-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="investor" id="investor" data-testid="radio-investor" />
                <Label htmlFor="investor" className="font-normal cursor-pointer">Investor</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="property_owner" id="property_owner" data-testid="radio-property-owner" />
                <Label htmlFor="property_owner" className="font-normal cursor-pointer">Property Owner</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="community_member" id="community_member" data-testid="radio-community-member" />
                <Label htmlFor="community_member" className="font-normal cursor-pointer">Community Member</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="other" id="other" data-testid="radio-other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={mutation.isPending}
            data-testid="button-submit-waitlist"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Waitlist"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
