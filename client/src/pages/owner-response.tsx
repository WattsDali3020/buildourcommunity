import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, Users, Heart, CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CommunityVote {
  desiredUse: string;
  nominationId: string;
  userId: string;
}

interface OwnerResponseData {
  nomination: {
    propertyAddress: string;
    city: string;
    county: string;
    state: string;
    description: string;
  };
  communityVotes: CommunityVote[];
  tokenExpiresAt: string;
}

export default function OwnerResponse() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("");

  const { data, isLoading, error } = useQuery<OwnerResponseData>({
    queryKey: ["/api/owner-response", token],
    enabled: !!token,
  });

  const respondMutation = useMutation({
    mutationFn: async (interested: boolean) => {
      const response = await fetch(`/api/owner-response/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interested,
          contactEmail,
          contactPhone,
          message,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit response");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Response Submitted",
        description: "Thank you for your response. We will be in touch shortly.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Group and count votes by desired use
  const votesByUse = data?.communityVotes.reduce((acc, vote) => {
    acc[vote.desiredUse] = (acc[vote.desiredUse] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const sortedUses = Object.entries(votesByUse).sort((a, b) => b[1] - a[1]);
  const totalVotes = Object.values(votesByUse).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading property information...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Invalid or Expired Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This link is no longer valid. It may have expired or already been used.
                Please contact RevitaHub if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const expiresAt = new Date(data.tokenExpiresAt);
  const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8 text-center">
            <Badge className="mb-4">Community Interest</Badge>
            <h1 className="text-3xl font-semibold mb-2">Your Property Has Community Interest</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Local community members are interested in revitalizing your property. 
              Learn more about this opportunity below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{data.nomination.propertyAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.nomination.city}, {data.nomination.county} County, {data.nomination.state}
                  </p>
                </div>
                {data.nomination.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Community Description:</p>
                    <p className="text-sm">{data.nomination.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Response Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Days Remaining</span>
                      <span className="font-medium">{daysRemaining} days</span>
                    </div>
                    <Progress value={100 - (daysRemaining / 30) * 100} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This link expires on {expiresAt.toLocaleDateString()}. Please respond before then.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Vision
              </CardTitle>
              <CardDescription>
                Here is what community members would like to see at your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedUses.length > 0 ? (
                <div className="space-y-4">
                  {sortedUses.map(([use, count]) => (
                    <div key={use} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium capitalize">{use.replace(/_/g, " ")}</span>
                          <span>{count} vote{count !== 1 ? "s" : ""}</span>
                        </div>
                        <Progress value={(count / totalVotes) * 100} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No community votes yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                How This Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="font-semibold text-primary">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Fair Market Value</h3>
                  <p className="text-sm text-muted-foreground">
                    Your property is appraised at fair market value. You receive a competitive offer.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="font-semibold text-primary">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Community Funding</h3>
                  <p className="text-sm text-muted-foreground">
                    The community pools resources through fractional ownership tokens starting at $12.50.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="font-semibold text-primary">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Revitalization</h3>
                  <p className="text-sm text-muted-foreground">
                    The property is developed according to community vision, creating local jobs and value.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
              <CardDescription>
                Let us know if you are interested in learning more about this opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    data-testid="input-owner-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    data-testid="input-owner-phone"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Any questions or comments..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  data-testid="textarea-owner-message"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button
                onClick={() => respondMutation.mutate(true)}
                disabled={respondMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-interested"
              >
                <CheckCircle className="h-4 w-4" />
                I am Interested
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => respondMutation.mutate(false)}
                disabled={respondMutation.isPending}
                data-testid="button-not-interested"
              >
                Not Interested
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
