import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo } from "react";
import { Calculator, TrendingUp, DollarSign, Calendar } from "lucide-react";

export function ROICalculator() {
  const [investment, setInvestment] = useState(1000);
  const [years, setYears] = useState(10);
  const [annualYield, setAnnualYield] = useState(7);

  const projections = useMemo(() => {
    const futureValue = investment * Math.pow(1 + annualYield / 100, years);
    const totalReturn = futureValue - investment;
    const monthlyIncome = (investment * (annualYield / 100)) / 12;

    return {
      futureValue: futureValue.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      monthlyIncome: monthlyIncome.toFixed(2),
      percentGain: (((futureValue - investment) / investment) * 100).toFixed(1),
    };
  }, [investment, years, annualYield]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Investment Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investment">Initial Investment ($)</Label>
            <Input
              id="investment"
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              min={100}
              step={100}
              data-testid="input-investment"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Investment Period</Label>
              <span className="text-sm text-muted-foreground">{years} years</span>
            </div>
            <Slider
              value={[years]}
              onValueChange={([value]) => setYears(value)}
              min={1}
              max={50}
              step={1}
              data-testid="slider-years"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Est. Annual Yield</Label>
              <span className="text-sm text-muted-foreground">{annualYield}%</span>
            </div>
            <Slider
              value={[annualYield]}
              onValueChange={([value]) => setAnnualYield(value)}
              min={3}
              max={15}
              step={0.5}
              data-testid="slider-yield"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-md bg-muted/50 space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Future Value
            </div>
            <p className="text-xl font-semibold" data-testid="text-future-value">
              ${Number(projections.futureValue).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted/50 space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Total Return
            </div>
            <p className="text-xl font-semibold text-chart-3" data-testid="text-total-return">
              +${Number(projections.totalReturn).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted/50 space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Monthly Income
            </div>
            <p className="text-xl font-semibold" data-testid="text-monthly-income">
              ${projections.monthlyIncome}
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted/50 space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Total Gain
            </div>
            <p className="text-xl font-semibold text-chart-3" data-testid="text-percent-gain">
              +{projections.percentGain}%
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          *Projections are estimates based on historical performance and are not guaranteed. 
          Actual returns may vary based on property performance and market conditions.
        </p>
      </CardContent>
    </Card>
  );
}
