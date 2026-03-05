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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, FileText, Users, CheckCircle, XCircle, Eye, RefreshCw, AlertTriangle, DollarSign, Briefcase, UserCheck, ChevronDown, ChevronRight, Search, Star, MapPin } from "lucide-react";
import type { Property, PropertyNomination, PropertySubmission, TokenPurchase, ProfessionalProfile, TokenOffering, ProjectProfessionalMatch } from "@shared/schema";

interface ReconciliationPurchase extends TokenPurchase {
  propertyName: string;
  tokenSymbol: string;
  userEmail: string;
  userName: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const [selectedNomination, setSelectedNomination] = useState<PropertyNomination | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [expandedOffering, setExpandedOffering] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteOfferingId, setInviteOfferingId] = useState<string>("");
  const [inviteRole, setInviteRole] = useState("all");
  const [inviteCounty, setInviteCounty] = useState("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: nominations = [], isLoading: nominationsLoading } = useQuery<PropertyNomination[]>({
    queryKey: ["/api/nominations"],
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery<PropertySubmission[]>({
    queryKey: ["/api/submissions"],
  });

  const { data: stuckPurchases = [], isLoading: stuckLoading } = useQuery<ReconciliationPurchase[]>({
    queryKey: ["/api/admin/reconciliation/stuck"],
    refetchInterval: 30000,
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

  const retryPurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      return apiRequest("POST", `/api/admin/reconciliation/${purchaseId}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reconciliation/stuck"] });
      toast({ title: "Retry initiated", description: "Purchase has been marked for retry." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to retry purchase", variant: "destructive" });
    },
  });

  const refundPurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      return apiRequest("POST", `/api/admin/reconciliation/${purchaseId}/refund`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reconciliation/stuck"] });
      toast({ title: "Refund initiated", description: "Refund has been initiated for the failed purchase." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to initiate refund", variant: "destructive" });
    },
  });

  const { data: pendingProfessionals = [], isLoading: professionalsLoading } = useQuery<ProfessionalProfile[]>({
    queryKey: ["/api/admin/professionals/pending"],
  });

  const verifyProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/professionals/${id}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals/pending"] });
      toast({ title: "Professional approved", description: "The professional has been verified and can now be matched to projects." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve professional", variant: "destructive" });
    },
  });

  const rejectProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/professionals/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals/pending"] });
      toast({ title: "Professional rejected" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject professional", variant: "destructive" });
    },
  });

  const suspendProfessionalMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/professionals/${id}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/professionals/pending"] });
      toast({ title: "Professional suspended" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to suspend professional", variant: "destructive" });
    },
  });

  const { data: offerings = [], isLoading: offeringsLoading } = useQuery<TokenOffering[]>({
    queryKey: ["/api/offerings"],
  });

  const activeOfferings = offerings.filter(o => o.status === "active");

  const { data: offeringMatches = {} } = useQuery<Record<string, ProjectProfessionalMatch[]>>({
    queryKey: ["/api/offerings/matches", activeOfferings.map(o => o.id)],
    queryFn: async () => {
      const result: Record<string, ProjectProfessionalMatch[]> = {};
      await Promise.all(
        activeOfferings.map(async (o) => {
          const res = await fetch(`/api/offerings/${o.id}/professionals`);
          if (res.ok) result[o.id] = await res.json();
          else result[o.id] = [];
        })
      );
      return result;
    },
    enabled: activeOfferings.length > 0,
  });

  const searchParams = new URLSearchParams();
  if (inviteRole !== "all") searchParams.set("role", inviteRole);
  if (inviteCounty.trim()) searchParams.set("county", inviteCounty.trim());
  const searchQuery = searchParams.toString();

  const { data: searchedProfessionals = [] } = useQuery<ProfessionalProfile[]>({
    queryKey: ["/api/professionals", searchQuery],
    queryFn: async () => {
      const url = searchQuery ? `/api/professionals?${searchQuery}` : "/api/professionals";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to search professionals");
      return res.json();
    },
    enabled: inviteModalOpen,
  });

  const verifiedProfessionals = searchedProfessionals.filter(p => p.isLicenseVerified);

  const inviteProfessionalMutation = useMutation({
    mutationFn: async ({ offeringId, professionalId, roleNeeded }: { offeringId: string; professionalId: string; roleNeeded: string }) => {
      return apiRequest("POST", `/api/offerings/${offeringId}/professionals/invite`, { professionalId, roleNeeded });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offerings/matches"] });
      toast({ title: "Professional invited", description: "The professional has been invited to the project." });
      setInviteModalOpen(false);
      setSelectedProfessionalId("");
      setInviteRole("all");
      setInviteCounty("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to invite professional", variant: "destructive" });
    },
  });

  const selectProfessionalMutation = useMutation({
    mutationFn: async ({ offeringId, matchId }: { offeringId: string; matchId: string }) => {
      return apiRequest("POST", `/api/offerings/${offeringId}/professionals/select`, { matchId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offerings/matches"] });
      toast({ title: "Professional selected", description: "The professional has been selected for this project." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to select professional", variant: "destructive" });
    },
  });

  const ROLES = [
    { value: "contractor", label: "Contractor" },
    { value: "realtor", label: "Realtor" },
    { value: "attorney", label: "Attorney" },
    { value: "engineer", label: "Engineer" },
    { value: "architect", label: "Architect" },
    { value: "lender", label: "Lender" },
    { value: "inspector", label: "Inspector" },
    { value: "appraiser", label: "Appraiser" },
  ];

  const getRoleLabel = (role: string) => ROLES.find(r => r.value === role)?.label || role;

  const getMatchStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      invited: "outline",
      interested: "secondary",
      proposed: "secondary",
      selected: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

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

  const getReconciliationBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending_payment: "outline",
      payment_received: "secondary",
      minting: "secondary",
      confirmed: "default",
      failed_mint: "destructive",
      refund_initiated: "destructive",
    };
    return <Badge variant={variants[status] || "outline"} data-testid={`badge-reconciliation-${status}`}>{status.replace(/_/g, " ")}</Badge>;
  };

  const formatTimeSince = (date: string | Date | null) => {
    if (!date) return "Unknown";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-admin-title">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage properties, nominations, submissions, and payment reconciliation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stuck Purchases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-stuck-count">
                {stuckPurchases.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="nominations" className="w-full">
          <TabsList className="flex-wrap">
            <TabsTrigger value="nominations" data-testid="tab-nominations">Nominations</TabsTrigger>
            <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
            <TabsTrigger value="submissions" data-testid="tab-submissions">Submissions</TabsTrigger>
            <TabsTrigger value="reconciliation" data-testid="tab-reconciliation">
              Reconciliation
              {stuckPurchases.length > 0 && (
                <Badge variant="destructive" className="ml-2">{stuckPurchases.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="professionals" data-testid="tab-professionals">
              Professionals
              {pendingProfessionals.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingProfessionals.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="matching" data-testid="tab-matching">Project Matching</TabsTrigger>
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
                          <TableCell>{getStatusBadge(submission.status || "draft")}</TableCell>
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

          <TabsContent value="reconciliation" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>Payment Reconciliation</CardTitle>
                  <CardDescription>Purchases stuck in pending state for more than 10 minutes</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/reconciliation/stuck"] })}
                  data-testid="button-refresh-reconciliation"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {stuckLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading stuck purchases...</div>
                ) : stuckPurchases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-stuck">
                    No stuck purchases found. All payments are reconciled.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reconciliation</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stuckPurchases.map((purchase) => (
                        <TableRow key={purchase.id} data-testid={`row-stuck-purchase-${purchase.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium" data-testid={`text-user-${purchase.id}`}>{purchase.userName}</div>
                              <div className="text-sm text-muted-foreground">{purchase.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-property-${purchase.id}`}>{purchase.propertyName}</TableCell>
                          <TableCell data-testid={`text-tokens-${purchase.id}`}>
                            {purchase.tokenCount} {purchase.tokenSymbol}
                          </TableCell>
                          <TableCell data-testid={`text-amount-${purchase.id}`}>
                            ${Number(purchase.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{getStatusBadge(purchase.status || "pending")}</TableCell>
                          <TableCell>{getReconciliationBadge(purchase.reconciliationStatus || "pending_payment")}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatTimeSince(purchase.purchasedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {(purchase.reconciliationStatus === "failed_mint" || purchase.reconciliationStatus === "minting") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => retryPurchaseMutation.mutate(purchase.id)}
                                  disabled={retryPurchaseMutation.isPending}
                                  data-testid={`button-retry-${purchase.id}`}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              {purchase.reconciliationStatus === "failed_mint" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => refundPurchaseMutation.mutate(purchase.id)}
                                  disabled={refundPurchaseMutation.isPending}
                                  data-testid={`button-refund-${purchase.id}`}
                                >
                                  <DollarSign className="h-4 w-4 text-destructive" />
                                </Button>
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

          <TabsContent value="professionals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Professional Applications</CardTitle>
                <CardDescription>Review and verify professional license applications</CardDescription>
              </CardHeader>
              <CardContent>
                {professionalsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading pending applications...</div>
                ) : pendingProfessionals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-pending-professionals">
                    No pending professional applications
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company / Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Service Areas</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProfessionals.map((prof) => (
                        <TableRow key={prof.id} data-testid={`row-professional-${prof.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium" data-testid={`text-prof-name-${prof.id}`}>{prof.companyName || "—"}</div>
                              {prof.bio && <div className="text-sm text-muted-foreground line-clamp-1">{prof.bio}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" data-testid={`badge-prof-role-${prof.id}`}>{getRoleLabel(prof.licenseType || "")}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-0.5">
                              {prof.licenseNumber && <div>#{prof.licenseNumber}</div>}
                              {prof.licenseState && <div className="text-muted-foreground">{prof.licenseState}</div>}
                              {prof.licenseExpiry && (
                                <div className="text-muted-foreground">
                                  Exp: {new Date(prof.licenseExpiry).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(prof.serviceCounties || []).slice(0, 3).map((county) => (
                                <Badge key={county} variant="outline" className="text-xs py-0">
                                  {county}
                                </Badge>
                              ))}
                              {(prof.serviceCounties || []).length > 3 && (
                                <Badge variant="outline" className="text-xs py-0">
                                  +{(prof.serviceCounties || []).length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {prof.createdAt ? formatTimeSince(prof.createdAt) : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => verifyProfessionalMutation.mutate(prof.id)}
                                disabled={verifyProfessionalMutation.isPending}
                                title="Approve"
                                data-testid={`button-approve-professional-${prof.id}`}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => rejectProfessionalMutation.mutate(prof.id)}
                                disabled={rejectProfessionalMutation.isPending}
                                title="Reject"
                                data-testid={`button-reject-professional-${prof.id}`}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => suspendProfessionalMutation.mutate(prof.id)}
                                disabled={suspendProfessionalMutation.isPending}
                                title="Suspend"
                                data-testid={`button-suspend-professional-${prof.id}`}
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              </Button>
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

          <TabsContent value="matching" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Professional Matching</CardTitle>
                <CardDescription>Manage professional assignments for active offerings</CardDescription>
              </CardHeader>
              <CardContent>
                {offeringsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading offerings...</div>
                ) : activeOfferings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-active-offerings">
                    No active offerings to match professionals to
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeOfferings.map((offering) => {
                      const matches = offeringMatches[offering.id] || [];
                      const isExpanded = expandedOffering === offering.id;
                      const property = properties.find(p => p.id === offering.propertyId);
                      const matchedRoles = [...new Set(matches.map(m => m.roleNeeded))];
                      const allRoles = ROLES.map(r => r.value);
                      const missingRoles = allRoles.filter(r => !matchedRoles.includes(r));

                      return (
                        <Card key={offering.id} data-testid={`card-offering-${offering.id}`}>
                          <CardContent className="p-4">
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => setExpandedOffering(isExpanded ? null : offering.id)}
                              data-testid={`toggle-offering-${offering.id}`}
                            >
                              <div className="flex items-center gap-3">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <div>
                                  <div className="font-medium" data-testid={`text-offering-name-${offering.id}`}>
                                    {property?.name || offering.tokenName}
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-3">
                                    <span>Phase: {offering.currentPhase}</span>
                                    <span>{matches.length} professional{matches.length !== 1 ? "s" : ""} matched</span>
                                    {missingRoles.length > 0 && (
                                      <span className="text-yellow-600">{missingRoles.length} role{missingRoles.length !== 1 ? "s" : ""} needed</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInviteOfferingId(offering.id);
                                  setInviteModalOpen(true);
                                }}
                                data-testid={`button-invite-${offering.id}`}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Invite Professional
                              </Button>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 border-t pt-4">
                                {matches.length === 0 ? (
                                  <div className="text-center py-4 text-muted-foreground text-sm">
                                    No professionals matched yet
                                  </div>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Professional</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Proposed Amount</TableHead>
                                        <TableHead>Invited</TableHead>
                                        <TableHead>Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {matches.map((match) => (
                                        <TableRow key={match.id} data-testid={`row-match-${match.id}`}>
                                          <TableCell className="font-medium" data-testid={`text-match-prof-${match.id}`}>
                                            {match.professionalId}
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline">{getRoleLabel(match.roleNeeded)}</Badge>
                                          </TableCell>
                                          <TableCell data-testid={`badge-match-status-${match.id}`}>
                                            {getMatchStatusBadge(match.status || "invited")}
                                          </TableCell>
                                          <TableCell>
                                            {match.proposedAmount ? `$${Number(match.proposedAmount).toLocaleString()}` : "—"}
                                          </TableCell>
                                          <TableCell className="text-muted-foreground text-sm">
                                            {match.invitedAt ? formatTimeSince(match.invitedAt) : "—"}
                                          </TableCell>
                                          <TableCell>
                                            {match.status === "proposed" && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => selectProfessionalMutation.mutate({ offeringId: offering.id, matchId: match.id })}
                                                disabled={selectProfessionalMutation.isPending}
                                                data-testid={`button-select-match-${match.id}`}
                                              >
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                                Select
                                              </Button>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}

                                {missingRoles.length > 0 && (
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="text-sm text-muted-foreground mb-2">Roles still needed:</div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {missingRoles.map((role) => (
                                        <Badge key={role} variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                                          {getRoleLabel(role)}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite Professional</DialogTitle>
              <DialogDescription>Search for verified professionals to invite to this project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger data-testid="select-invite-role">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by County</label>
                <Input
                  placeholder="e.g., Cherokee"
                  value={inviteCounty}
                  onChange={(e) => setInviteCounty(e.target.value)}
                  data-testid="input-invite-county"
                />
              </div>
              <div className="border rounded-md max-h-[250px] overflow-y-auto">
                {verifiedProfessionals.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No verified professionals match these filters
                  </div>
                ) : (
                  verifiedProfessionals.map((prof) => (
                    <div
                      key={prof.id}
                      className={`flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 ${selectedProfessionalId === prof.id ? "bg-primary/5 border-primary" : ""}`}
                      onClick={() => setSelectedProfessionalId(prof.id)}
                      data-testid={`invite-option-${prof.id}`}
                    >
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {prof.companyName || "Professional"}
                          <CheckCircle className="h-3.5 w-3.5 text-chart-3" />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className="text-xs py-0">{getRoleLabel(prof.licenseType || "")}</Badge>
                          {prof.reputationScore != null && (
                            <span className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {prof.reputationScore}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedProfessionalId === prof.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
              <Button
                disabled={!selectedProfessionalId || inviteProfessionalMutation.isPending}
                onClick={() => {
                  if (selectedProfessionalId && inviteOfferingId) {
                    const prof = verifiedProfessionals.find(p => p.id === selectedProfessionalId);
                    inviteProfessionalMutation.mutate({
                      offeringId: inviteOfferingId,
                      professionalId: selectedProfessionalId,
                      roleNeeded: prof?.licenseType || "contractor",
                    });
                  }
                }}
                data-testid="button-confirm-invite"
              >
                Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
