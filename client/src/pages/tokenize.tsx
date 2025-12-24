import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, DollarSign, Users, FileText, ArrowLeft, ArrowRight, CheckCircle2, Upload, Info, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PropertySubmission } from "@shared/schema";

const PROPERTY_TYPES = [
  { value: "vacant_land", label: "Vacant Land" },
  { value: "historic_building", label: "Historic Building" },
  { value: "commercial", label: "Commercial Property" },
  { value: "downtown", label: "Downtown Area" },
];

const PROPOSED_USES = [
  "Affordable Housing",
  "Mixed-Use Development",
  "Community Center",
  "Arts & Cultural Space",
  "Workforce Training Facility",
  "Healthcare Clinic",
  "Senior Living",
  "Childcare Center",
  "Urban Agriculture",
  "Small Business Incubator",
  "Public Market",
  "Green Space / Park",
  "Historic Preservation",
  "Transit-Oriented Development",
  "Other",
];

const COMMUNITY_BENEFITS = [
  { id: "jobs", label: "Local Job Creation" },
  { id: "housing", label: "Affordable Housing Units" },
  { id: "services", label: "Community Services" },
  { id: "environment", label: "Environmental Improvement" },
  { id: "historic", label: "Historic Preservation" },
  { id: "economic", label: "Economic Development" },
  { id: "health", label: "Health & Wellness" },
  { id: "education", label: "Education & Training" },
];

const steps = [
  { id: 1, title: "Property Details", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Financials", icon: DollarSign },
  { id: 4, title: "Community Impact", icon: Users },
  { id: 5, title: "Review & Submit", icon: FileText },
];

export default function Tokenize() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ name: string; objectPath: string; size: number; type: string }>>([]);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    propertyType: "",
    streetAddress: "",
    city: "",
    county: "",
    state: "",
    zipCode: "",
    parcelNumber: "",
    acreage: "",
    squareFootage: "",
    yearBuilt: "",
    currentUse: "",
    proposedUse: "",
    estimatedValue: "",
    fundingGoal: "",
    projectedROI: "",
    projectedJobs: "",
    projectedHousingUnits: "",
    communityBenefits: [] as string[],
    ownershipProof: false,
    termsAccepted: false,
  });

  const createSubmissionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/property-submissions", data);
      return response.json() as Promise<PropertySubmission>;
    },
    onSuccess: (data) => {
      setSubmissionId(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save submission",
        variant: "destructive",
      });
    },
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/property-submissions/${id}`, data);
      return response.json() as Promise<PropertySubmission>;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update submission",
        variant: "destructive",
      });
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/property-submissions/${id}/submit`, {});
      return response.json() as Promise<PropertySubmission>;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Property Submitted",
        description: "Your property has been submitted for community review. You'll receive updates via email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit property for review",
        variant: "destructive",
      });
    },
  });

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      communityBenefits: prev.communityBenefits.includes(benefit)
        ? prev.communityBenefits.filter((b) => b !== benefit)
        : [...prev.communityBenefits, benefit],
    }));
  };

  const prepareSubmissionData = () => ({
    name: formData.name,
    description: formData.description,
    propertyType: formData.propertyType,
    streetAddress: formData.streetAddress,
    city: formData.city,
    county: formData.county,
    state: formData.state,
    zipCode: formData.zipCode,
    estimatedValue: formData.estimatedValue,
    fundingGoal: formData.fundingGoal,
    expectedReturn: formData.projectedROI || null,
    communityBenefits: formData.communityBenefits.length > 0 ? formData.communityBenefits : null,
    ownershipConfirmed: formData.ownershipProof,
    termsAccepted: formData.termsAccepted,
  });

  const nextStep = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!formData.ownershipProof || !formData.termsAccepted) {
      toast({
        title: "Required Agreements",
        description: "Please confirm ownership and accept terms to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!submissionId) {
      const data = prepareSubmissionData();
      createSubmissionMutation.mutate(data, {
        onSuccess: (submission) => {
          submitForReviewMutation.mutate(submission.id);
        },
      });
    } else {
      const data = prepareSubmissionData();
      updateSubmissionMutation.mutate({ id: submissionId, data }, {
        onSuccess: () => {
          submitForReviewMutation.mutate(submissionId);
        },
      });
    }
  };

  const isLoading = createSubmissionMutation.isPending || updateSubmissionMutation.isPending || submitForReviewMutation.isPending;

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDocument(true);
    try {
      // Step 1: Request presigned URL from backend
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadURL, objectPath } = await response.json();

      // Step 2: Upload file directly to presigned URL
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Step 3: Register document with the submission if we have a submissionId
      if (submissionId) {
        const docResponse = await apiRequest("POST", `/api/property-submissions/${submissionId}/documents`, {
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          storageKey: objectPath,
          documentType: "supporting_document",
        });

        if (!docResponse.ok) {
          console.error("Failed to register document with submission");
        }
      }

      // Track uploaded document in local state
      setUploadedDocuments(prev => [...prev, {
        name: file.name,
        objectPath,
        size: file.size,
        type: file.type,
      }]);

      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploadingDocument(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Tokenize Your Property</h1>
              <p className="text-muted-foreground mt-2">
                Submit your property for community-led tokenization on the Base blockchain
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
                  >
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${
                        currentStep >= step.id
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          currentStep > step.id ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                {steps.map((step) => (
                  <span
                    key={step.id}
                    className={currentStep === step.id ? "text-foreground font-medium" : ""}
                  >
                    {step.title}
                  </span>
                ))}
              </div>
              <Progress value={progress} className="mt-4 h-2" />
            </div>

            {isSubmitted ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-chart-3/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-8 w-8 text-chart-3" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Property Submitted Successfully</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your property has been submitted for community review. Our team will evaluate your submission
                    and you'll receive updates via email about the next steps.
                  </p>
                  <div className="p-4 rounded-md bg-muted/50 max-w-md mx-auto mb-6 text-left">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">1.</span>
                        Our team reviews your submission for eligibility
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">2.</span>
                        If approved, the property goes to community voting
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">3.</span>
                        Community members vote on property and proposed uses
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">4.</span>
                        Token offering begins with county residents first
                      </li>
                    </ol>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Link href="/">
                      <Button variant="outline" data-testid="button-back-home-success">
                        Back to Home
                      </Button>
                    </Link>
                    <Link href="/community">
                      <Button data-testid="button-view-community">
                        View Community
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
              <CardHeader>
                <CardTitle>
                  Step {currentStep}: {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Tell us about your property"}
                  {currentStep === 2 && "Where is the property located?"}
                  {currentStep === 3 && "Financial details and funding goals"}
                  {currentStep === 4 && "How will this benefit the community?"}
                  {currentStep === 5 && "Review your submission before submitting"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Property Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Historic Downtown Mill Building"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        data-testid="input-property-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(v) => updateField("propertyType", v)}
                      >
                        <SelectTrigger data-testid="select-property-type">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Property Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the property, its history, current condition, and potential..."
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        className="min-h-[120px]"
                        data-testid="input-property-description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="acreage">Acreage</Label>
                        <Input
                          id="acreage"
                          type="number"
                          step="0.01"
                          placeholder="e.g., 2.5"
                          value={formData.acreage}
                          onChange={(e) => updateField("acreage", e.target.value)}
                          data-testid="input-acreage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="squareFootage">Square Footage</Label>
                        <Input
                          id="squareFootage"
                          type="number"
                          placeholder="e.g., 50000"
                          value={formData.squareFootage}
                          onChange={(e) => updateField("squareFootage", e.target.value)}
                          data-testid="input-square-footage"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearBuilt">Year Built (if applicable)</Label>
                        <Input
                          id="yearBuilt"
                          type="number"
                          placeholder="e.g., 1920"
                          value={formData.yearBuilt}
                          onChange={(e) => updateField("yearBuilt", e.target.value)}
                          data-testid="input-year-built"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currentUse">Current Use</Label>
                        <Input
                          id="currentUse"
                          placeholder="e.g., Vacant, Parking lot"
                          value={formData.currentUse}
                          onChange={(e) => updateField("currentUse", e.target.value)}
                          data-testid="input-current-use"
                        />
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input
                        id="streetAddress"
                        placeholder="123 Main Street"
                        value={formData.streetAddress}
                        onChange={(e) => updateField("streetAddress", e.target.value)}
                        data-testid="input-street-address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Canton"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          data-testid="input-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="county">County</Label>
                        <Input
                          id="county"
                          placeholder="Cherokee"
                          value={formData.county}
                          onChange={(e) => updateField("county", e.target.value)}
                          data-testid="input-county"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="Georgia"
                          value={formData.state}
                          onChange={(e) => updateField("state", e.target.value)}
                          data-testid="input-state"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          placeholder="30114"
                          value={formData.zipCode}
                          onChange={(e) => updateField("zipCode", e.target.value)}
                          data-testid="input-zip"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parcelNumber">Parcel Number (optional)</Label>
                      <Input
                        id="parcelNumber"
                        placeholder="Tax parcel ID from county records"
                        value={formData.parcelNumber}
                        onChange={(e) => updateField("parcelNumber", e.target.value)}
                        data-testid="input-parcel"
                      />
                    </div>

                    <div className="p-4 rounded-md bg-muted/50 flex gap-3">
                      <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        The county location determines which community gets first access to invest.
                        County residents invest at $12.50/token before state, national, and international phases.
                      </p>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Estimated Property Value ($)</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        placeholder="e.g., 2500000"
                        value={formData.estimatedValue}
                        onChange={(e) => updateField("estimatedValue", e.target.value)}
                        data-testid="input-estimated-value"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fundingGoal">Total Funding Goal ($)</Label>
                      <Input
                        id="fundingGoal"
                        type="number"
                        placeholder="e.g., 5000000"
                        value={formData.fundingGoal}
                        onChange={(e) => updateField("fundingGoal", e.target.value)}
                        data-testid="input-funding-goal"
                      />
                      <p className="text-xs text-muted-foreground">
                        Include acquisition, development, and operating costs
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proposedUse">Primary Proposed Use</Label>
                      <Select
                        value={formData.proposedUse}
                        onValueChange={(v) => updateField("proposedUse", v)}
                      >
                        <SelectTrigger data-testid="select-proposed-use">
                          <SelectValue placeholder="What should this property become?" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPOSED_USES.map((use) => (
                            <SelectItem key={use} value={use}>
                              {use}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Community members can propose and vote on alternative uses
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectedROI">Projected Annual ROI (%)</Label>
                        <Input
                          id="projectedROI"
                          type="number"
                          step="0.1"
                          placeholder="e.g., 8.5"
                          value={formData.projectedROI}
                          onChange={(e) => updateField("projectedROI", e.target.value)}
                          data-testid="input-projected-roi"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projectedJobs">Projected Jobs Created</Label>
                        <Input
                          id="projectedJobs"
                          type="number"
                          placeholder="e.g., 150"
                          value={formData.projectedJobs}
                          onChange={(e) => updateField("projectedJobs", e.target.value)}
                          data-testid="input-projected-jobs"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
                      <h4 className="font-medium mb-2">Investor Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        If 100% funding isn't reached within 1 year, investors can:
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-chart-3" />
                          Receive full refund plus 3% APR interest
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-chart-3" />
                          Transfer shares to another active project at equivalent value
                        </li>
                      </ul>
                    </div>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="space-y-4">
                      <Label>Community Benefits (select all that apply)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {COMMUNITY_BENEFITS.map((benefit) => (
                          <div
                            key={benefit.id}
                            className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                              formData.communityBenefits.includes(benefit.id)
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => toggleBenefit(benefit.id)}
                          >
                            <Checkbox
                              checked={formData.communityBenefits.includes(benefit.id)}
                              onCheckedChange={() => toggleBenefit(benefit.id)}
                              data-testid={`checkbox-benefit-${benefit.id}`}
                            />
                            <span className="text-sm font-medium">{benefit.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.proposedUse && formData.proposedUse.toLowerCase().includes("housing") && (
                      <div className="space-y-2">
                        <Label htmlFor="projectedHousingUnits">Projected Housing Units</Label>
                        <Input
                          id="projectedHousingUnits"
                          type="number"
                          placeholder="e.g., 75"
                          value={formData.projectedHousingUnits}
                          onChange={(e) => updateField("projectedHousingUnits", e.target.value)}
                          data-testid="input-housing-units"
                        />
                      </div>
                    )}

                    <div className="p-4 rounded-md bg-muted/50">
                      <h4 className="font-medium mb-2">Document Upload</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload property deeds, surveys, environmental reports, and other supporting documentation.
                      </p>
                      {!submissionId && (
                        <p className="text-sm text-muted-foreground mb-3 italic">
                          Complete the property details first and click "Next" to enable document uploads.
                        </p>
                      )}
                      {uploadedDocuments.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {uploadedDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{doc.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setUploadedDocuments(prev => prev.filter((_, i) => i !== index))}
                                data-testid={`button-remove-doc-${index}`}
                              >
                                <span className="sr-only">Remove</span>
                                <span aria-hidden>x</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-4 border border-dashed rounded-md">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <input
                          type="file"
                          onChange={handleDocumentUpload}
                          disabled={isUploadingDocument || !submissionId}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="input-document-upload"
                        />
                        {isUploadingDocument && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 5 && (
                  <>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Property Details</h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Name:</dt>
                              <dd className="font-medium">{formData.name || "-"}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Type:</dt>
                              <dd className="font-medium">
                                {PROPERTY_TYPES.find((t) => t.value === formData.propertyType)?.label || "-"}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Size:</dt>
                              <dd className="font-medium">
                                {formData.acreage ? `${formData.acreage} acres` : formData.squareFootage ? `${formData.squareFootage} sq ft` : "-"}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Location</h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Address:</dt>
                              <dd className="font-medium text-right">{formData.streetAddress || "-"}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">City:</dt>
                              <dd className="font-medium">{formData.city || "-"}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">County:</dt>
                              <dd className="font-medium">{formData.county || "-"}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Financials</h4>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Estimated Value:</dt>
                            <dd className="font-medium">
                              {formData.estimatedValue ? `$${Number(formData.estimatedValue).toLocaleString()}` : "-"}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Funding Goal:</dt>
                            <dd className="font-medium">
                              {formData.fundingGoal ? `$${Number(formData.fundingGoal).toLocaleString()}` : "-"}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Proposed Use:</dt>
                            <dd className="font-medium">{formData.proposedUse || "-"}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Projected ROI:</dt>
                            <dd className="font-medium">
                              {formData.projectedROI ? `${formData.projectedROI}%` : "-"}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {formData.communityBenefits.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Community Benefits</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.communityBenefits.map((id) => {
                              const benefit = COMMUNITY_BENEFITS.find((b) => b.id === id);
                              return benefit ? (
                                <Badge key={id} variant="secondary">
                                  {benefit.label}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4 space-y-4">
                        <div
                          className={`flex items-start gap-3 p-4 rounded-md border cursor-pointer ${
                            formData.ownershipProof ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => updateField("ownershipProof", !formData.ownershipProof)}
                        >
                          <Checkbox
                            checked={formData.ownershipProof}
                            onCheckedChange={(v) => updateField("ownershipProof", !!v)}
                            data-testid="checkbox-ownership"
                          />
                          <div>
                            <p className="font-medium">I confirm ownership or authorized representation</p>
                            <p className="text-sm text-muted-foreground">
                              I have legal authority to submit this property for tokenization
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex items-start gap-3 p-4 rounded-md border cursor-pointer ${
                            formData.termsAccepted ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => updateField("termsAccepted", !formData.termsAccepted)}
                        >
                          <Checkbox
                            checked={formData.termsAccepted}
                            onCheckedChange={(v) => updateField("termsAccepted", !!v)}
                            data-testid="checkbox-terms"
                          />
                          <div>
                            <p className="font-medium">I accept the platform terms and conditions</p>
                            <p className="text-sm text-muted-foreground">
                              Including community governance, tokenization process, and investor protections
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isLoading}
                    data-testid="button-prev-step"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 5 ? (
                    <Button onClick={nextStep} disabled={isLoading} data-testid="button-next-step">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-property">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Property
                          <CheckCircle2 className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
