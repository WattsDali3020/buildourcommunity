import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, MapPin, Mail, DollarSign, Building2, Gavel, Info } from "lucide-react";
import { insertServiceBidSchema, type ServiceBid } from "@shared/schema";

const SERVICE_TYPES = [
  "Title Work",
  "Loan Structuring",
  "Property Assessment",
  "Foreclosure Services",
  "Property Management",
  "Legal Services",
];

const formSchema = insertServiceBidSchema.extend({
  serviceType: z.string().min(1, "Service type is required"),
  zipCode: z.string().min(5, "Valid zip code required"),
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Valid email required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  bidAmount: z.string().min(1, "Bid amount is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ServicesPage() {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: "",
      zipCode: "",
      companyName: "",
      contactEmail: "",
      description: "",
      bidAmount: "",
    },
  });

  const { data: bids, isLoading } = useQuery<ServiceBid[]>({
    queryKey: ["/api/service-bids"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/service-bids", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bids"] });
      toast({ title: "Bid submitted", description: "Your service bid has been submitted for review." });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit bid.", variant: "destructive" });
    },
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate(values);
  }

  function statusVariant(status: string | null) {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-12 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold" data-testid="text-services-title">
                Service Provider Bids
              </h1>
              <p className="text-muted-foreground mt-1">
                Realtors, brokers, tax assessors, foreclosure firms, and lenders can submit service bids for community-owned properties.
              </p>
            </div>

            <Card className="p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground" data-testid="text-governance-note">
                  Winners selected by community governance vote. Payments disbursed from Treasury.sol.
                </p>
              </div>

              <h2 className="text-xl font-semibold mb-4" data-testid="text-submit-bid-heading">
                Submit a Service Bid
              </h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-service-type">
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SERVICE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Area (Zip Code)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. 30114"
                            data-testid="input-zip-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Your company name"
                            data-testid="input-company-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="contact@company.com"
                            data-testid="input-contact-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your services and qualifications..."
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bidAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bid Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            data-testid="input-bid-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-bid"
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      {createMutation.isPending ? "Submitting..." : "Submit Bid"}
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>

            <h2 className="text-xl font-semibold mb-4" data-testid="text-existing-bids-heading">
              Submitted Bids
            </h2>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-8 w-20" />
                  </Card>
                ))}
              </div>
            ) : !bids || bids.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground" data-testid="text-no-bids">
                  No service bids yet. Be the first to submit one!
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bids.map((bid) => (
                  <Card key={bid.id} className="p-4 flex flex-col gap-3" data-testid={`card-bid-${bid.id}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h3 className="font-semibold text-base leading-tight" data-testid={`text-bid-service-${bid.id}`}>
                          {bid.serviceType}
                        </h3>
                      </div>
                      <Badge variant={statusVariant(bid.status)} data-testid={`badge-status-${bid.id}`}>
                        {bid.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium" data-testid={`text-bid-company-${bid.id}`}>
                        {bid.companyName}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-bid-description-${bid.id}`}>
                      {bid.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span data-testid={`text-bid-zip-${bid.id}`}>{bid.zipCode}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span data-testid={`text-bid-email-${bid.id}`}>{bid.contactEmail}</span>
                      </span>
                    </div>

                    <div className="mt-auto pt-2 flex items-center gap-1 text-sm font-semibold">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span data-testid={`text-bid-amount-${bid.id}`}>
                        {Number(bid.bidAmount).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
