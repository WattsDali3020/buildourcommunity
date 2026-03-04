import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ShieldCheck, FileCheck, AlertTriangle, LogIn } from "lucide-react";
import type { User } from "@shared/schema";

interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  actionLabel?: string;
  actionHref?: string;
}

interface InvestorOnboardingGateProps {
  user?: User | null;
  children: React.ReactNode;
}

function getOnboardingSteps(user: User | null | undefined): OnboardingStep[] {
  const isAuthenticated = !!user;
  const kycSubmitted = isAuthenticated && (user.kycStatus === "submitted" || user.kycStatus === "verified");
  const kycApproved = isAuthenticated && user.kycStatus === "verified";
  const riskAcknowledged = isAuthenticated && !!user.riskDisclosureAcknowledgedAt;

  return [
    {
      id: "auth",
      label: "Create Account",
      description: "Sign in to access the investment platform",
      completed: isAuthenticated,
      actionLabel: "Sign In",
      actionHref: "/dashboard",
    },
    {
      id: "kyc-submit",
      label: "Submit KYC Verification",
      description: "Provide your identity information for verification",
      completed: kycSubmitted,
      actionLabel: "Go to Dashboard",
      actionHref: "/dashboard",
    },
    {
      id: "kyc-approved",
      label: "KYC Approved",
      description: user?.kycStatus === "submitted"
        ? "Your verification is under review (1-2 business days)"
        : "Identity verification must be approved before investing",
      completed: kycApproved,
    },
    {
      id: "risk-disclosure",
      label: "Acknowledge Risk Disclosure",
      description: "Review and acknowledge the investment risk factors",
      completed: riskAcknowledged,
      actionLabel: "Review Risks",
      actionHref: "/risk-disclosure",
    },
  ];
}

export function InvestorOnboardingGate({ user, children }: InvestorOnboardingGateProps) {
  const steps = getOnboardingSteps(user);
  const allComplete = steps.every((s) => s.completed);

  if (allComplete) {
    return <>{children}</>;
  }

  const currentStepIndex = steps.findIndex((s) => !s.completed);
  const currentStep = steps[currentStepIndex];

  return (
    <div className="space-y-4" data-testid="investor-onboarding-gate">
      <div className="flex items-start gap-2 p-3 bg-chart-4/10 rounded-md">
        <AlertTriangle className="h-5 w-5 text-chart-4 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Complete Onboarding to Invest</p>
          <p className="text-muted-foreground">
            You must complete all verification steps before purchasing tokens.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isPast = step.completed;
          const isFuture = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-md border ${
                isCurrent
                  ? "bg-primary/5 border-primary/20"
                  : isPast
                  ? "bg-muted/20 border-border"
                  : "bg-muted/10 border-border opacity-60"
              }`}
              data-testid={`onboarding-step-${step.id}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isPast ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : isCurrent ? (
                  <Circle className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${isPast ? "text-muted-foreground" : ""}`}>
                    {index + 1}. {step.label}
                  </p>
                  {isPast && (
                    <Badge variant="outline" className="text-xs">
                      Complete
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      Action Required
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                {isCurrent && step.actionLabel && step.actionHref && (
                  <Link href={step.actionHref}>
                    <Button variant="outline" size="sm" className="mt-2" data-testid={`button-onboarding-${step.id}`}>
                      {step.actionLabel}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
