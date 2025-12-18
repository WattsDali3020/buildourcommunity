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
import { Building2, MapPin, DollarSign, Users, FileText, ArrowLeft, ArrowRight, CheckCircle2, Upload, Info } from "lucide-react";
import { Link } from "wouter";

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

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (!formData.ownershipProof || !formData.termsAccepted) {
      toast({
        title: "Required Agreements",
        description: "Please confirm ownership and accept terms to continue.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Property Submitted",
      description: "Your property has been submitted for community review. You'll receive updates via email.",
    });
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
                        If minimum funding (60% of goal) isn't reached within 1 year, investors can:
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
                      <h4 className="font-medium mb-2">Document Upload (Coming Soon)</h4>
                      <div className="flex items-center gap-3 p-4 border border-dashed rounded-md text-muted-foreground">
                        <Upload className="h-5 w-5" />
                        <span className="text-sm">
                          Property deeds, surveys, environmental reports, and other documentation
                        </span>
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
                    disabled={currentStep === 1}
                    data-testid="button-prev-step"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 5 ? (
                    <Button onClick={nextStep} data-testid="button-next-step">
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} data-testid="button-submit-property">
                      Submit Property
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
