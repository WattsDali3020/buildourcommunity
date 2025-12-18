import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, MapPin, FileText, DollarSign, Users, 
  ChevronRight, ChevronLeft, Check, Upload, AlertCircle,
  Info
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

const PROPERTY_TYPES = [
  { value: "vacant_land", label: "Vacant Land" },
  { value: "historic_building", label: "Historic Building" },
  { value: "commercial", label: "Commercial Property" },
  { value: "downtown", label: "Downtown District" },
];

const steps = [
  { id: 1, title: "Property Details", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Financials", icon: DollarSign },
  { id: 4, title: "Community Impact", icon: Users },
  { id: 5, title: "Documents", icon: FileText },
  { id: 6, title: "Review", icon: Check },
];

interface FormData {
  name: string;
  description: string;
  propertyType: string;
  currentUse: string;
  proposedUse: string;
  streetAddress: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
  parcelNumber: string;
  acreage: string;
  squareFootage: string;
  yearBuilt: string;
  estimatedValue: string;
  fundingGoal: string;
  projectedROI: string;
  communityBenefits: string[];
  projectedJobs: string;
  projectedHousingUnits: string;
  ownershipProof: boolean;
  legalCompliance: boolean;
  communityEngagement: boolean;
}

export default function Submit() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    propertyType: "",
    currentUse: "",
    proposedUse: "",
    streetAddress: "",
    city: "",
    county: "",
    state: "",
    zipCode: "",
    parcelNumber: "",
    acreage: "",
    squareFootage: "",
    yearBuilt: "",
    estimatedValue: "",
    fundingGoal: "",
    projectedROI: "",
    communityBenefits: [],
    projectedJobs: "",
    projectedHousingUnits: "",
    ownershipProof: false,
    legalCompliance: false,
    communityEngagement: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
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

  const handleSubmit = () => {
    toast({
      title: "Property Submitted",
      description: "Your property has been submitted for review. We'll be in touch within 5-7 business days.",
    });
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const communityBenefitOptions = [
    "Affordable Housing",
    "Local Job Creation",
    "Small Business Incubator",
    "Community Center",
    "Green Space / Parks",
    "Youth Programs",
    "Senior Services",
    "Arts & Culture",
    "Healthcare Access",
    "Education Facilities",
    "Sustainable Energy",
    "Public Transit Access",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Submit Your Property</h1>
            <p className="text-muted-foreground">
              Tokenize your property and let the community invest in revitalization
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep > step.id
                        ? "bg-chart-3 text-white"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden sm:block w-12 lg:w-24 h-0.5 mx-2 ${
                        currentStep > step.id ? "bg-chart-3" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 6) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of 6: {steps[currentStep - 1].title}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {currentStep === 1 && "Tell us about your property and what you envision for it"}
                {currentStep === 2 && "Provide the exact location details"}
                {currentStep === 3 && "Share the financial details and funding goals"}
                {currentStep === 4 && "Describe the community benefits this project will create"}
                {currentStep === 5 && "Upload required documents for verification"}
                {currentStep === 6 && "Review your submission before sending"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Property Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Historic Canton Mill Building"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      data-testid="input-property-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={formData.propertyType} onValueChange={(v) => updateField("propertyType", v)}>
                      <SelectTrigger data-testid="select-property-type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Property Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the property, its history, and current condition..."
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      rows={4}
                      data-testid="textarea-description"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentUse">Current Use</Label>
                      <Input
                        id="currentUse"
                        placeholder="e.g., Vacant, Storage, etc."
                        value={formData.currentUse}
                        onChange={(e) => updateField("currentUse", e.target.value)}
                        data-testid="input-current-use"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proposedUse">Proposed Use After Revitalization</Label>
                      <Input
                        id="proposedUse"
                        placeholder="e.g., Mixed-use with housing and retail"
                        value={formData.proposedUse}
                        onChange={(e) => updateField("proposedUse", e.target.value)}
                        data-testid="input-proposed-use"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={formData.state} onValueChange={(v) => updateField("state", v)}>
                        <SelectTrigger data-testid="select-state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="30114"
                        value={formData.zipCode}
                        onChange={(e) => updateField("zipCode", e.target.value)}
                        data-testid="input-zip-code"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parcelNumber">Parcel Number (Optional)</Label>
                      <Input
                        id="parcelNumber"
                        placeholder="123-456-789"
                        value={formData.parcelNumber}
                        onChange={(e) => updateField("parcelNumber", e.target.value)}
                        data-testid="input-parcel-number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acreage">Acreage</Label>
                      <Input
                        id="acreage"
                        type="number"
                        step="0.01"
                        placeholder="2.5"
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
                        placeholder="15000"
                        value={formData.squareFootage}
                        onChange={(e) => updateField("squareFootage", e.target.value)}
                        data-testid="input-square-footage"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearBuilt">Year Built (if applicable)</Label>
                    <Input
                      id="yearBuilt"
                      type="number"
                      placeholder="1920"
                      value={formData.yearBuilt}
                      onChange={(e) => updateField("yearBuilt", e.target.value)}
                      data-testid="input-year-built"
                    />
                  </div>

                  <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
                    <div className="flex gap-2">
                      <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Why County Matters</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          The county you specify determines who can invest first. In Phase 1, only residents 
                          of {formData.county || "this"} County will be able to purchase tokens at the base 
                          price of $12.50 each (max 100 tokens per person).
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">Estimated Property Value ($)</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        placeholder="2000000"
                        value={formData.estimatedValue}
                        onChange={(e) => updateField("estimatedValue", e.target.value)}
                        data-testid="input-estimated-value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fundingGoal">Funding Goal ($)</Label>
                      <Input
                        id="fundingGoal"
                        type="number"
                        placeholder="5000000"
                        value={formData.fundingGoal}
                        onChange={(e) => updateField("fundingGoal", e.target.value)}
                        data-testid="input-funding-goal"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectedROI">Projected Annual ROI (%)</Label>
                    <Input
                      id="projectedROI"
                      type="number"
                      step="0.1"
                      placeholder="8.5"
                      value={formData.projectedROI}
                      onChange={(e) => updateField("projectedROI", e.target.value)}
                      data-testid="input-projected-roi"
                    />
                  </div>

                  <div className="p-4 rounded-md bg-muted/50 space-y-4">
                    <h4 className="font-medium">Token Offering Preview</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on your funding goal, here's how tokens will be distributed:
                    </p>
                    {formData.fundingGoal && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 rounded-md bg-background">
                          <p className="text-xs text-muted-foreground">Phase 1: County</p>
                          <p className="font-semibold">$12.50/token</p>
                          <p className="text-xs">Max 100/person</p>
                        </div>
                        <div className="p-3 rounded-md bg-background">
                          <p className="text-xs text-muted-foreground">Phase 2: State</p>
                          <p className="font-semibold">$18.75/token</p>
                          <p className="text-xs">Max 250/person</p>
                        </div>
                        <div className="p-3 rounded-md bg-background">
                          <p className="text-xs text-muted-foreground">Phase 3: National</p>
                          <p className="font-semibold">$28.13/token</p>
                          <p className="text-xs">Max 500/person</p>
                        </div>
                        <div className="p-3 rounded-md bg-background">
                          <p className="text-xs text-muted-foreground">Phase 4: International</p>
                          <p className="font-semibold">$37.50/token</p>
                          <p className="text-xs">Max 1000/person</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label>Community Benefits (select all that apply)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {communityBenefitOptions.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2">
                          <Checkbox
                            id={benefit}
                            checked={formData.communityBenefits.includes(benefit)}
                            onCheckedChange={() => toggleBenefit(benefit)}
                            data-testid={`checkbox-benefit-${benefit.toLowerCase().replace(/\s/g, "-")}`}
                          />
                          <Label htmlFor={benefit} className="text-sm font-normal cursor-pointer">
                            {benefit}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectedJobs">Projected Jobs Created</Label>
                      <Input
                        id="projectedJobs"
                        type="number"
                        placeholder="50"
                        value={formData.projectedJobs}
                        onChange={(e) => updateField("projectedJobs", e.target.value)}
                        data-testid="input-projected-jobs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectedHousingUnits">Projected Housing Units</Label>
                      <Input
                        id="projectedHousingUnits"
                        type="number"
                        placeholder="24"
                        value={formData.projectedHousingUnits}
                        onChange={(e) => updateField("projectedHousingUnits", e.target.value)}
                        data-testid="input-projected-housing"
                      />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 5 && (
                <>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-md p-8 text-center">
                      <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium mb-1">Upload Property Documents</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Deed, title, survey, photos, appraisals
                      </p>
                      <Button variant="outline" data-testid="button-upload-documents">
                        Select Files
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="ownershipProof"
                          checked={formData.ownershipProof}
                          onCheckedChange={(checked) => updateField("ownershipProof", !!checked)}
                          data-testid="checkbox-ownership-proof"
                        />
                        <div>
                          <Label htmlFor="ownershipProof" className="cursor-pointer">
                            Proof of Ownership
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            I can provide documentation proving I own or have rights to this property
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="legalCompliance"
                          checked={formData.legalCompliance}
                          onCheckedChange={(checked) => updateField("legalCompliance", !!checked)}
                          data-testid="checkbox-legal-compliance"
                        />
                        <div>
                          <Label htmlFor="legalCompliance" className="cursor-pointer">
                            Legal Compliance Agreement
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            I agree to comply with all applicable securities, real estate, and blockchain regulations
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="communityEngagement"
                          checked={formData.communityEngagement}
                          onCheckedChange={(checked) => updateField("communityEngagement", !!checked)}
                          data-testid="checkbox-community-engagement"
                        />
                        <div>
                          <Label htmlFor="communityEngagement" className="cursor-pointer">
                            Community Engagement Commitment
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            I commit to engaging with local community stakeholders throughout the project
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 6 && (
                <>
                  <div className="space-y-6">
                    <div className="p-4 rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Property Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{formData.name || "Not provided"}</span>
                        <span className="text-muted-foreground">Type:</span>
                        <span>{formData.propertyType || "Not provided"}</span>
                        <span className="text-muted-foreground">Proposed Use:</span>
                        <span>{formData.proposedUse || "Not provided"}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Location</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Address:</span>
                        <span>{formData.streetAddress || "Not provided"}</span>
                        <span className="text-muted-foreground">City:</span>
                        <span>{formData.city || "Not provided"}</span>
                        <span className="text-muted-foreground">County:</span>
                        <span className="font-medium">{formData.county || "Not provided"}</span>
                        <span className="text-muted-foreground">State:</span>
                        <span>{formData.state || "Not provided"}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Financials</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Estimated Value:</span>
                        <span>${Number(formData.estimatedValue || 0).toLocaleString()}</span>
                        <span className="text-muted-foreground">Funding Goal:</span>
                        <span>${Number(formData.fundingGoal || 0).toLocaleString()}</span>
                        <span className="text-muted-foreground">Projected ROI:</span>
                        <span>{formData.projectedROI || "0"}%</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-muted/50">
                      <h4 className="font-medium mb-3">Community Impact</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.communityBenefits.map((benefit) => (
                          <Badge key={benefit} variant="outline">{benefit}</Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Projected Jobs:</span>
                        <span>{formData.projectedJobs || "0"}</span>
                        <span className="text-muted-foreground">Housing Units:</span>
                        <span>{formData.projectedHousingUnits || "0"}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
                      <h4 className="font-medium mb-2">5-Phase Community-First Offering</h4>
                      <p className="text-sm text-muted-foreground">
                        Upon approval, your property will go through our 5-phase token offering, 
                        starting with {formData.county || "your"} County residents at $12.50/token 
                        before opening to broader audiences at higher prices.
                      </p>
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
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                {currentStep < 6 ? (
                  <Button onClick={nextStep} data-testid="button-next-step">
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} data-testid="button-submit-property">
                    Submit for Review
                    <Check className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
