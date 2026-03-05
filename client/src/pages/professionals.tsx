import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Star, CheckCircle2, Briefcase, MapPin, Award, X } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { ProfessionalProfile } from "@shared/schema";

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

export default function Professionals() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [countyFilter, setCountyFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const queryParams = new URLSearchParams();
  if (roleFilter !== "all") queryParams.set("role", roleFilter);
  if (countyFilter.trim()) queryParams.set("county", countyFilter.trim());
  if (specialtyFilter.trim()) queryParams.set("specialty", specialtyFilter.trim());
  const queryString = queryParams.toString();

  const { data: professionals = [], isLoading } = useQuery<(ProfessionalProfile & { endorsementCount?: number })[]>({
    queryKey: ["/api/professionals", queryString],
    queryFn: async () => {
      const url = queryString ? `/api/professionals?${queryString}` : "/api/professionals";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch professionals");
      return res.json();
    },
  });

  const hasFilters = roleFilter !== "all" || countyFilter.trim() !== "" || specialtyFilter.trim() !== "";

  const clearFilters = () => {
    setRoleFilter("all");
    setCountyFilter("");
    setSpecialtyFilter("");
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find((r) => r.value === role)?.label || role;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Professional Directory</h1>
              <p className="text-muted-foreground">
                Verified professionals ready to work on community revitalization projects
              </p>
            </div>
            <Link href="/professionals/apply">
              <Button data-testid="button-join-professional">
                <Briefcase className="h-4 w-4 mr-2" />
                Join as a Professional
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Filters</h3>
                    {hasFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs" data-testid="button-clear-filters">
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Role</label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger data-testid="select-role-filter">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">County</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., Cherokee"
                        value={countyFilter}
                        onChange={(e) => setCountyFilter(e.target.value)}
                        className="pl-9"
                        data-testid="input-county-filter"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Specialty</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., HVAC, Zoning"
                        value={specialtyFilter}
                        onChange={(e) => setSpecialtyFilter(e.target.value)}
                        className="pl-9"
                        data-testid="input-specialty-filter"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    {professionals.length} professional{professionals.length !== 1 ? "s" : ""} found
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="text-center py-16" data-testid="text-loading">
                  <p className="text-muted-foreground text-lg">Loading professionals...</p>
                </div>
              ) : professionals.length === 0 ? (
                <div className="text-center py-16 rounded-lg border border-dashed" data-testid="text-empty-state">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No verified professionals in this area yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Know someone who should be here? Share the platform with them.
                  </p>
                  <Link href="/professionals/apply">
                    <Button data-testid="button-apply-empty">Join as a Professional</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {professionals.map((prof) => (
                    <Link key={prof.id} href={`/professionals/${prof.id}`}>
                      <Card className="cursor-pointer hover-elevate h-full" data-testid={`card-professional-${prof.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm line-clamp-1" data-testid={`text-name-${prof.id}`}>
                                  {prof.companyName || "Professional"}
                                </h3>
                                {prof.isLicenseVerified && (
                                  <CheckCircle2 className="h-4 w-4 text-chart-3 shrink-0" data-testid={`icon-verified-${prof.id}`} />
                                )}
                              </div>
                              {prof.companyName && prof.bio && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{prof.bio}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0" data-testid={`badge-role-${prof.id}`}>
                              {getRoleLabel(prof.licenseType || "")}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1" data-testid={`text-reputation-${prof.id}`}>
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                              {prof.reputationScore || 0}
                            </span>
                            <span className="flex items-center gap-1" data-testid={`text-endorsements-${prof.id}`}>
                              <Award className="h-3.5 w-3.5" />
                              {prof.totalEndorsements || 0} endorsements
                            </span>
                            <span className="flex items-center gap-1" data-testid={`text-projects-${prof.id}`}>
                              <Briefcase className="h-3.5 w-3.5" />
                              {prof.completedProjects || 0} projects
                            </span>
                          </div>

                          {prof.serviceCounties && prof.serviceCounties.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {prof.serviceCounties.slice(0, 3).map((county) => (
                                <Badge key={county} variant="outline" className="text-xs py-0" data-testid={`badge-county-${prof.id}-${county}`}>
                                  <MapPin className="h-3 w-3 mr-0.5" />
                                  {county}
                                </Badge>
                              ))}
                              {prof.serviceCounties.length > 3 && (
                                <Badge variant="outline" className="text-xs py-0">
                                  +{prof.serviceCounties.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {prof.specialties && prof.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {prof.specialties.slice(0, 3).map((specialty) => (
                                <Badge key={specialty} variant="secondary" className="text-xs py-0" data-testid={`badge-specialty-${prof.id}-${specialty}`}>
                                  {specialty}
                                </Badge>
                              ))}
                              {prof.specialties.length > 3 && (
                                <Badge variant="secondary" className="text-xs py-0">
                                  +{prof.specialties.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}