import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";

const waitlistFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["investor", "property_owner", "community_member", "other"], {
    required_error: "Please select your interest",
  }),
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      email: "",
      role: "investor",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: WaitlistFormValues) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error("This email is already on the waitlist");
        }
        throw new Error(errorData.error || "Failed to join waitlist");
      }
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: Error) => {
      if (error.message.includes("already on the waitlist")) {
        toast({
          title: "Already registered",
          description: "This email is already on our waitlist. We'll be in touch soon!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to join waitlist. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: WaitlistFormValues) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    setSubmitted(false);
    form.reset();
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      data-testid="input-waitlist-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I'm interested as a...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="investor" id="investor" data-testid="radio-investor" />
                        <label htmlFor="investor" className="text-sm font-normal cursor-pointer">Investor</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="property_owner" id="property_owner" data-testid="radio-property-owner" />
                        <label htmlFor="property_owner" className="text-sm font-normal cursor-pointer">Property Owner</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="community_member" id="community_member" data-testid="radio-community-member" />
                        <label htmlFor="community_member" className="text-sm font-normal cursor-pointer">Community Member</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="other" id="other" data-testid="radio-other" />
                        <label htmlFor="other" className="text-sm font-normal cursor-pointer">Other</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
