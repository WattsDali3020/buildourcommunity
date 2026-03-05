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
import {
  HardHat, Home, Scale, Cog, Compass, Landmark, Search, ClipboardCheck,
  ArrowLeft, ArrowRight, CheckCircle2, Shield, MapPin, Briefcase, FileText, Loader2, X, Plus
} from "lucide-react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const ROLES = [
  { value: "contractor", label: "Contractor", icon: HardHat, description: "General or specialty contractor for construction and renovation" },
  { value: "realtor", label: "Realtor", icon: Home, description: "Licensed real estate agent or broker" },
  { value: "attorney", label: "Attorney", icon: Scale, description: "Real estate, corporate, or securities attorney" },
  { value: "engineer", label: "Engineer", icon: Cog, description: "Civil, structural, or environmental engineer" },
  { value: "architect", label: "Architect", icon: Compass, description: "Licensed architect for design and planning" },
  { value: "lender", label: "Lender", icon: Landmark, description: "Mortgage broker, CDFI, or private lender" },
  { value: "inspector", label: "Inspector", icon: Search, description: "Property or building inspector" },
  { value: "appraiser", label: "Appraiser", icon: ClipboardCheck, description: "Licensed property appraiser" },
];

const LICENSE_REQUIRED_ROLES = ["realtor", "attorney", "engineer", "architect"];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const GEORGIA_COUNTIES = [
  "Appling", "Atkinson", "Bacon", "Baker", "Baldwin", "Banks", "Barrow", "Bartow",
  "Ben Hill", "Berrien", "Bibb", "Bleckley", "Brantley", "Brooks", "Bryan", "Bulloch",
  "Burke", "Butts", "Calhoun", "Camden", "Candler", "Carroll", "Catoosa", "Charlton",
  "Chatham", "Chattahoochee", "Chattooga", "Cherokee", "Clarke", "Clay", "Clayton",
  "Clinch", "Cobb", "Coffee", "Colquitt", "Columbia", "Cook", "Coweta", "Crawford",
  "Crisp", "Dade", "Dawson", "Decatur", "DeKalb", "Dodge", "Dooly", "Dougherty",
  "Douglas", "Early", "Echols", "Effingham", "Elbert", "Emanuel", "Evans", "Fannin",
  "Fayette", "Floyd", "Forsyth", "Franklin", "Fulton", "Gilmer", "Glascock", "Glynn",
  "Gordon", "Grady", "Greene", "Gwinnett", "Habersham", "Hall", "Hancock", "Haralson",
  "Harris", "Hart", "Heard", "Henry", "Houston", "Irwin", "Jackson", "Jasper",
  "Jeff Davis", "Jefferson", "Jenkins", "Johnson", "Jones", "Lamar", "Lanier", "Laurens",
  "Lee", "Liberty", "Lincoln", "Long", "Lowndes", "Lumpkin", "Macon", "Madison",
  "Marion", "McDuffie", "McIntosh", "Meriwether", "Miller", "Mitchell", "Monroe",
  "Montgomery", "Morgan", "Murray", "Muscogee", "Newton", "Oconee", "Oglethorpe",
  "Paulding", "Peach", "Pickens", "Pierce", "Pike", "Polk", "Pulaski", "Putnam",
  "Quitman", "Rabun", "Randolph", "Richmond", "Rockdale", "Schley", "Screven",
  "Seminole", "Spalding", "Stephens", "Stewart", "Sumter", "Talbot", "Taliaferro",
  "Tattnall", "Taylor", "Telfair", "Terrell", "Thomas", "Tift", "Toombs", "Towns",
  "Treutlen", "Troup", "Turner", "Twiggs", "Union", "Upson", "Walker", "Walton",
  "Ware", "Warren", "Washington", "Wayne", "Webster", "Wheeler", "White", "Whitfield",
  "Wilcox", "Wilkes", "Wilkinson", "Worth"
];

const PROJECT_TYPES = [
  { id: "dirt_track", label: "Dirt Track / Land Clearing" },
  { id: "grocery", label: "Grocery / Food Market" },
  { id: "clinic", label: "Clinic / Healthcare" },
  { id: "housing", label: "Housing Development" },
  { id: "historic_building", label: "Historic Building Renovation" },
  { id: "commercial", label: "Commercial Property" },
];

const steps = [
  { id: 1, title: "Role Selection", icon: Briefcase },
  { id: 2, title: "License Info", icon: Shield },
  { id: 3, title: "Insurance & Bonding", icon: FileText },
  { id: 4, title: "Service Areas", icon: MapPin },
  { id: 5, title: "Specialties & Bio", icon: Cog },
  { id: 6, title: "Review & Submit", icon: CheckCircle2 },
];

export default function ProfessionalApply() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [formData, setFormData] = useState({
    role: "",
    licenseNumber: "",
    licenseState: "",
    licenseType: "",
    licenseExpiry: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiry: "",
    bondingAmount: "",
    isBonded: false,
    serviceCounties: [] as string[],
    serviceStates: [] as string[],
    statewide: false,
    projectTypes: [] as string[],
    specialties: [] as string[],
    companyName: "",
    website: "",
    bio: "",
    phoneNumber: "",
    yearsExperience: "",
    portfolioUrls: [] as string[],
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/professionals/apply", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Your professional application is under review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCounty = (county: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceCounties: prev.serviceCounties.includes(county)
        ? prev.serviceCounties.filter((c) => c !== county)
        : [...prev.serviceCounties, county],
    }));
  };

  const toggleProjectType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter((t) => t !== type)
        : [...prev.projectTypes, type],
    }));
  };

  const addSpecialty = () => {
    const trimmed = newSpecialty.trim();
    if (trimmed && !formData.specialties.includes(trimmed)) {
      updateField("specialties", [...formData.specialties, trimmed]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    updateField("specialties", formData.specialties.filter((s) => s !== specialty));
  };

  const addPortfolioUrl = () => {
    const trimmed = newPortfolioUrl.trim();
    if (trimmed && !formData.portfolioUrls.includes(trimmed)) {
      updateField("portfolioUrls", [...formData.portfolioUrls, trimmed]);
      setNewPortfolioUrl("");
    }
  };

  const removePortfolioUrl = (url: string) => {
    updateField("portfolioUrls", formData.portfolioUrls.filter((u) => u !== url));
  };

  const isLicenseRequired = LICENSE_REQUIRED_ROLES.includes(formData.role);

  const nextStep = () => {
    if (currentStep === 1 && !formData.role) {
      toast({ title: "Select a Role", description: "Please select your professional role to continue.", variant: "destructive" });
      return;
    }
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    const payload: any = {
      licenseNumber: formData.licenseNumber || null,
      licenseState: formData.licenseState || null,
      licenseType: formData.licenseType || null,
      licenseExpiry: formData.licenseExpiry ? new Date(formData.licenseExpiry).toISOString() : null,
      insuranceProvider: formData.insuranceProvider || null,
      insurancePolicyNumber: formData.insurancePolicyNumber || null,
      insuranceExpiry: formData.insuranceExpiry ? new Date(formData.insuranceExpiry).toISOString() : null,
      bondingAmount: formData.bondingAmount || null,
      isBonded: formData.isBonded,
      serviceCounties: formData.statewide ? GEORGIA_COUNTIES : formData.serviceCounties,
      serviceStates: formData.serviceStates.length > 0 ? formData.serviceStates : ["Georgia"],
      specialties: formData.specialties,
      companyName: formData.companyName || null,
      website: formData.website || null,
      bio: formData.bio || null,
      phoneNumber: formData.phoneNumber || null,
      yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
      isAvailable: true,
    };
    applyMutation.mutate(payload);
  };

  const progress = (currentStep / 6) * 100;
  const selectedRole = ROLES.find((r) => r.value === formData.role);

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
              <h1 className="text-3xl font-bold" data-testid="text-page-title">Apply as a Professional</h1>
              <p className="text-muted-foreground mt-2">
                Join the RevitaHub professional network to work on community-driven property revitalization projects
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
                      data-testid={`step-indicator-${step.id}`}
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
                  <h2 className="text-2xl font-bold mb-2" data-testid="text-success-title">Application Submitted</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your application is under review. We'll notify you once verified.
                  </p>
                  <div className="p-4 rounded-md bg-muted/50 max-w-md mx-auto mb-6 text-left">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">1.</span>
                        Our team reviews your credentials and license information
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">2.</span>
                        Once verified, your profile becomes visible to project teams
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">3.</span>
                        You'll receive invitations to bid on matching projects
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">4.</span>
                        Build your reputation through completed projects and endorsements
                      </li>
                    </ol>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Link href="/">
                      <Button variant="outline" data-testid="button-back-home-success">
                        Back to Home
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button data-testid="button-view-dashboard">
                        View Dashboard
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
                    {currentStep === 1 && "Select your professional role"}
                    {currentStep === 2 && "Enter your license and certification details"}
                    {currentStep === 3 && "Insurance and bonding information"}
                    {currentStep === 4 && "Where do you provide services?"}
                    {currentStep === 5 && "Tell us about your experience and specialties"}
                    {currentStep === 6 && "Review your application before submitting"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentStep === 1 && (
                    <div className="grid grid-cols-2 gap-4">
                      {ROLES.map((role) => {
                        const Icon = role.icon;
                        const isSelected = formData.role === role.value;
                        return (
                          <div
                            key={role.value}
                            className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                            onClick={() => updateField("role", role.value)}
                            data-testid={`card-role-${role.value}`}
                          >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{role.label}</p>
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <>
                      {!isLicenseRequired && (
                        <div className="p-4 rounded-md bg-muted/50 flex gap-3">
                          <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            License information is optional for {selectedRole?.label || "this role"}, but providing it increases your verification priority.
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">
                          License Number {isLicenseRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id="licenseNumber"
                          placeholder="e.g., GA-12345"
                          value={formData.licenseNumber}
                          onChange={(e) => updateField("licenseNumber", e.target.value)}
                          data-testid="input-license-number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licenseState">
                          Issuing State {isLicenseRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Select
                          value={formData.licenseState}
                          onValueChange={(v) => updateField("licenseState", v)}
                        >
                          <SelectTrigger data-testid="select-license-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licenseType">
                          License Type {isLicenseRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id="licenseType"
                          placeholder="e.g., General Contractor, Real Estate Broker"
                          value={formData.licenseType}
                          onChange={(e) => updateField("licenseType", e.target.value)}
                          data-testid="input-license-type"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licenseExpiry">
                          Expiration Date {isLicenseRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id="licenseExpiry"
                          type="date"
                          value={formData.licenseExpiry}
                          onChange={(e) => updateField("licenseExpiry", e.target.value)}
                          data-testid="input-license-expiry"
                        />
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                        <Input
                          id="insuranceProvider"
                          placeholder="e.g., State Farm, Liberty Mutual"
                          value={formData.insuranceProvider}
                          onChange={(e) => updateField("insuranceProvider", e.target.value)}
                          data-testid="input-insurance-provider"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                        <Input
                          id="insurancePolicyNumber"
                          placeholder="e.g., POL-123456"
                          value={formData.insurancePolicyNumber}
                          onChange={(e) => updateField("insurancePolicyNumber", e.target.value)}
                          data-testid="input-insurance-policy"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="insuranceExpiry">Insurance Expiration Date</Label>
                        <Input
                          id="insuranceExpiry"
                          type="date"
                          value={formData.insuranceExpiry}
                          onChange={(e) => updateField("insuranceExpiry", e.target.value)}
                          data-testid="input-insurance-expiry"
                        />
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bondingAmount">Bonding Amount ($)</Label>
                          <Input
                            id="bondingAmount"
                            type="number"
                            placeholder="e.g., 500000"
                            value={formData.bondingAmount}
                            onChange={(e) => updateField("bondingAmount", e.target.value)}
                            data-testid="input-bonding-amount"
                          />
                        </div>

                        <div
                          className="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50"
                          onClick={() => updateField("isBonded", !formData.isBonded)}
                        >
                          <Checkbox
                            checked={formData.isBonded}
                            onCheckedChange={(checked) => updateField("isBonded", !!checked)}
                            data-testid="checkbox-is-bonded"
                          />
                          <span className="text-sm font-medium">I am bonded</span>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      <div className="space-y-4">
                        <div
                          className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                            formData.statewide ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => updateField("statewide", !formData.statewide)}
                        >
                          <Checkbox
                            checked={formData.statewide}
                            onCheckedChange={(checked) => updateField("statewide", !!checked)}
                            data-testid="checkbox-statewide"
                          />
                          <span className="text-sm font-medium">Statewide — I serve all Georgia counties</span>
                        </div>

                        {!formData.statewide && (
                          <>
                            <Label>Select Georgia Counties</Label>
                            {formData.serviceCounties.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {formData.serviceCounties.map((county) => (
                                  <Badge
                                    key={county}
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => toggleCounty(county)}
                                    data-testid={`badge-county-${county}`}
                                  >
                                    {county} <X className="h-3 w-3 ml-1" />
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                              {GEORGIA_COUNTIES.map((county) => (
                                <div
                                  key={county}
                                  className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-colors ${
                                    formData.serviceCounties.includes(county)
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "hover:bg-muted/50"
                                  }`}
                                  onClick={() => toggleCounty(county)}
                                  data-testid={`county-option-${county}`}
                                >
                                  <Checkbox
                                    checked={formData.serviceCounties.includes(county)}
                                    className="h-3.5 w-3.5"
                                  />
                                  {county}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <Label>Project Types</Label>
                        <div className="flex flex-wrap gap-3">
                          {PROJECT_TYPES.map((type) => (
                            <div
                              key={type.id}
                              className={`px-4 py-2 rounded-full border cursor-pointer text-sm transition-colors ${
                                formData.projectTypes.includes(type.id)
                                  ? "border-primary bg-primary/10 text-primary font-medium"
                                  : "border-border hover:border-primary/50"
                              }`}
                              onClick={() => toggleProjectType(type.id)}
                              data-testid={`tag-project-type-${type.id}`}
                            >
                              {type.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 5 && (
                    <>
                      <div className="space-y-2">
                        <Label>Specialties</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., HVAC, Historic Renovation, Zoning Law"
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialty(); } }}
                            data-testid="input-specialty"
                          />
                          <Button type="button" variant="outline" size="icon" onClick={addSpecialty} data-testid="button-add-specialty">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.specialties.map((s) => (
                              <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => removeSpecialty(s)} data-testid={`badge-specialty-${s}`}>
                                {s} <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            placeholder="e.g., Acme Construction LLC"
                            value={formData.companyName}
                            onChange={(e) => updateField("companyName", e.target.value)}
                            data-testid="input-company-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience">Years of Experience</Label>
                          <Input
                            id="yearsExperience"
                            type="number"
                            placeholder="e.g., 15"
                            value={formData.yearsExperience}
                            onChange={(e) => updateField("yearsExperience", e.target.value)}
                            data-testid="input-years-experience"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website URL</Label>
                        <Input
                          id="website"
                          placeholder="https://yourcompany.com"
                          value={formData.website}
                          onChange={(e) => updateField("website", e.target.value)}
                          data-testid="input-website"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          placeholder="(770) 555-1234"
                          value={formData.phoneNumber}
                          onChange={(e) => updateField("phoneNumber", e.target.value)}
                          data-testid="input-phone"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about your experience, past projects, and what drives you to work on community revitalization..."
                          value={formData.bio}
                          onChange={(e) => updateField("bio", e.target.value)}
                          className="min-h-[120px]"
                          data-testid="input-bio"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Portfolio URLs</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://portfolio.example.com/project"
                            value={newPortfolioUrl}
                            onChange={(e) => setNewPortfolioUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPortfolioUrl(); } }}
                            data-testid="input-portfolio-url"
                          />
                          <Button type="button" variant="outline" size="icon" onClick={addPortfolioUrl} data-testid="button-add-portfolio">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.portfolioUrls.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {formData.portfolioUrls.map((url) => (
                              <div key={url} className="flex items-center justify-between p-2 bg-muted/50 rounded border text-sm">
                                <span className="truncate">{url}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removePortfolioUrl(url)} data-testid={`button-remove-portfolio`}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {currentStep === 6 && (
                    <>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Role & License</h4>
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Role:</dt>
                                <dd className="font-medium">{selectedRole?.label || "-"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">License #:</dt>
                                <dd className="font-medium">{formData.licenseNumber || "-"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">State:</dt>
                                <dd className="font-medium">{formData.licenseState || "-"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Type:</dt>
                                <dd className="font-medium">{formData.licenseType || "-"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Expires:</dt>
                                <dd className="font-medium">{formData.licenseExpiry || "-"}</dd>
                              </div>
                            </dl>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Insurance & Bonding</h4>
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Provider:</dt>
                                <dd className="font-medium">{formData.insuranceProvider || "-"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Policy:</dt>
                                <dd className="font-medium">{formData.insurancePolicyNumber || "-"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Expires:</dt>
                                <dd className="font-medium">{formData.insuranceExpiry || "-"}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Bonded:</dt>
                                <dd className="font-medium">{formData.isBonded ? "Yes" : "No"}</dd>
                              </div>
                              {formData.bondingAmount && (
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Bond Amount:</dt>
                                  <dd className="font-medium">${Number(formData.bondingAmount).toLocaleString()}</dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Service Areas</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.statewide ? (
                              <Badge data-testid="badge-statewide">All Georgia Counties</Badge>
                            ) : formData.serviceCounties.length > 0 ? (
                              formData.serviceCounties.map((c) => (
                                <Badge key={c} variant="secondary" data-testid={`badge-review-county-${c}`}>{c}</Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">No counties selected</span>
                            )}
                          </div>
                          {formData.projectTypes.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground mb-2">Project Types:</p>
                              <div className="flex flex-wrap gap-2">
                                {formData.projectTypes.map((t) => {
                                  const pt = PROJECT_TYPES.find((p) => p.id === t);
                                  return <Badge key={t} variant="outline" data-testid={`badge-review-type-${t}`}>{pt?.label || t}</Badge>;
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Professional Details</h4>
                          <dl className="space-y-2 text-sm">
                            {formData.companyName && (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Company:</dt>
                                <dd className="font-medium">{formData.companyName}</dd>
                              </div>
                            )}
                            {formData.yearsExperience && (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Experience:</dt>
                                <dd className="font-medium">{formData.yearsExperience} years</dd>
                              </div>
                            )}
                            {formData.website && (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Website:</dt>
                                <dd className="font-medium truncate max-w-[200px]">{formData.website}</dd>
                              </div>
                            )}
                            {formData.phoneNumber && (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Phone:</dt>
                                <dd className="font-medium">{formData.phoneNumber}</dd>
                              </div>
                            )}
                          </dl>
                          {formData.specialties.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground mb-2">Specialties:</p>
                              <div className="flex flex-wrap gap-2">
                                {formData.specialties.map((s) => (
                                  <Badge key={s} variant="secondary" data-testid={`badge-review-specialty-${s}`}>{s}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {formData.bio && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground mb-1">Bio:</p>
                              <p className="text-sm bg-muted/50 p-3 rounded-md">{formData.bio}</p>
                            </div>
                          )}
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

                    {currentStep < 6 ? (
                      <Button onClick={nextStep} data-testid="button-next-step">
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={applyMutation.isPending}
                        data-testid="button-submit-application"
                      >
                        {applyMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Submit Application
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