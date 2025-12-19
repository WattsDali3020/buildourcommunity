import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, FileText, Users, CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import type { Property, PropertyNomination, PropertySubmission } from "@shared/schema";

export default function AdminPanel() {
  const { toast } = useToast();
  const [selectedNomination, setSelectedNomination] = useState<PropertyNomination | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: nominations = [], isLoading: nominationsLoading } = useQuery<PropertyNomination[]>({
    queryKey: ["/api/nominations"],
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery<PropertySubmission[]>({
    queryKey: ["/api/submissions"],
  });

  const approveNominationMutation = useMutation({
    mutationFn: async (nominationId: string) => {
      return apiRequest("POST", `/api/nominations/${nominationId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nominations"] });
      toast({ title: "Nomination approved", description: "The property has been approved for tokenization." });
      setSelectedNomination(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve nomination", variant: "destructive" });
    },
  });

  const rejectNominationMutation = useMutation({
    mutationFn: async ({ nominationId, notes }: { nominationId: string; notes: string }) => {
      return apiRequest("POST", `/api/nominations/${nominationId}/reject`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nominations"] });
      toast({ title: "Nomination rejected" });
      setSelectedNomination(null);
      setReviewNotes("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject nomination", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: "secondary",
      under_review: "default",
      approved: "default",
      rejected: "destructive",
      in_voting: "secondary",
      selected: "default",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage properties, nominations, and submissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-property-count">{properties.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Nominations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-nomination-count">
                {nominations.filter(n => n.status === "submitted" || n.status === "under_review").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="nominations" className="w-full">
          <TabsList>
            <TabsTrigger value="nominations" data-testid="tab-nominations">Nominations</TabsTrigger>
            <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
            <TabsTrigger value="submissions" data-testid="tab-submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="nominations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Nominations</CardTitle>
                <CardDescription>Review and manage community property nominations</CardDescription>
              </CardHeader>
              <CardContent>
                {nominationsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading nominations...</div>
                ) : nominations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No nominations yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Owner Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nominations.map((nomination) => (
                        <TableRow key={nomination.id} data-testid={`row-nomination-${nomination.id}`}>
                          <TableCell className="font-medium">
                            {nomination.propertyAddress}, {nomination.city}
                          </TableCell>
                          <TableCell>{nomination.county}</TableCell>
                          <TableCell>{getStatusBadge(nomination.status || "submitted")}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{nomination.ownerResponseStatus || "pending"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedNomination(nomination)}
                                data-testid={`button-view-nomination-${nomination.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {nomination.status !== "approved" && nomination.status !== "rejected" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => approveNominationMutation.mutate(nomination.id)}
                                    disabled={approveNominationMutation.isPending}
                                    data-testid={`button-approve-nomination-${nomination.id}`}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedNomination(nomination);
                                    }}
                                    data-testid={`button-reject-nomination-${nomination.id}`}
                                  >
                                    <XCircle className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>All registered properties on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading properties...</div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No properties yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Funding Goal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id} data-testid={`row-property-${property.id}`}>
                          <TableCell className="font-medium">{property.name}</TableCell>
                          <TableCell>{property.streetAddress}, {property.city}</TableCell>
                          <TableCell>{property.propertyType}</TableCell>
                          <TableCell>{getStatusBadge(property.status || "draft")}</TableCell>
                          <TableCell>${Number(property.fundingGoal).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Submissions</CardTitle>
                <CardDescription>Owner-submitted properties awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No submissions yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id} data-testid={`row-submission-${submission.id}`}>
                          <TableCell className="font-medium">{submission.name}</TableCell>
                          <TableCell>{submission.streetAddress}, {submission.city}</TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                          <TableCell>
                            {submission.submittedAt
                              ? new Date(submission.submittedAt).toLocaleDateString()
                              : "Not submitted"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedNomination} onOpenChange={() => setSelectedNomination(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nomination Details</DialogTitle>
              <DialogDescription>
                Review the property nomination details
              </DialogDescription>
            </DialogHeader>
            {selectedNomination && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedNomination.propertyAddress}, {selectedNomination.city}, {selectedNomination.state} {selectedNomination.zipCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">County</label>
                  <p className="text-sm text-muted-foreground">{selectedNomination.county}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Why This Property</label>
                  <p className="text-sm text-muted-foreground">{selectedNomination.whyThisProperty}</p>
                </div>
                {selectedNomination.detectedOwnerName && (
                  <div>
                    <label className="text-sm font-medium">Detected Owner</label>
                    <p className="text-sm text-muted-foreground">{selectedNomination.detectedOwnerName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Review Notes</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedNomination(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedNomination &&
                  rejectNominationMutation.mutate({
                    nominationId: selectedNomination.id,
                    notes: reviewNotes,
                  })
                }
                disabled={rejectNominationMutation.isPending}
              >
                Reject
              </Button>
              <Button
                onClick={() => selectedNomination && approveNominationMutation.mutate(selectedNomination.id)}
                disabled={approveNominationMutation.isPending}
              >
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
