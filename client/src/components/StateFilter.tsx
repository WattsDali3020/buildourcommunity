import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

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
  { id: "vacant_land", label: "Vacant Land" },
  { id: "historic_building", label: "Historic Building" },
  { id: "commercial", label: "Commercial" },
  { id: "downtown", label: "Downtown" },
];

interface StateFilterProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  search: string;
  state: string;
  propertyTypes: string[];
  priceRange: [number, number];
  minROI: number;
}

export function StateFilter({ onFilterChange }: StateFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    state: "all",
    propertyTypes: [],
    priceRange: [50, 1000],
    minROI: 5,
  });

  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const togglePropertyType = (typeId: string) => {
    const newTypes = filters.propertyTypes.includes(typeId)
      ? filters.propertyTypes.filter((t) => t !== typeId)
      : [...filters.propertyTypes, typeId];
    updateFilter("propertyTypes", newTypes);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: "",
      state: "all",
      propertyTypes: [],
      priceRange: [50, 1000],
      minROI: 5,
    };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={filters.state} onValueChange={(v) => updateFilter("state", v)}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-state">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
          data-testid="button-toggle-filters"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="p-4 rounded-md border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Advanced Filters</h4>
            <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>Property Type</Label>
              <div className="space-y-2">
                {PROPERTY_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <Checkbox
                      id={type.id}
                      checked={filters.propertyTypes.includes(type.id)}
                      onCheckedChange={() => togglePropertyType(type.id)}
                      data-testid={`checkbox-type-${type.id}`}
                    />
                    <Label htmlFor={type.id} className="text-sm font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Token Price Range</Label>
                <span className="text-sm text-muted-foreground">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(v) => updateFilter("priceRange", v as [number, number])}
                min={50}
                max={5000}
                step={50}
                data-testid="slider-price-range"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Minimum ROI</Label>
                <span className="text-sm text-muted-foreground">{filters.minROI}%+</span>
              </div>
              <Slider
                value={[filters.minROI]}
                onValueChange={([v]) => updateFilter("minROI", v)}
                min={0}
                max={20}
                step={1}
                data-testid="slider-min-roi"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button data-testid="button-apply-filters">Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  );
}
