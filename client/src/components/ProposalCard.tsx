import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ThumbsUp, ThumbsDown, Users } from "lucide-react";
import { useState } from "react";

export type ProposalStatus = "active" | "passed" | "rejected" | "pending";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  propertyName: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  deadline: Date;
  proposer: string;
}

const statusColors: Record<ProposalStatus, string> = {
  active: "bg-chart-1 text-white",
  passed: "bg-chart-3 text-white",
  rejected: "bg-destructive text-white",
  pending: "bg-chart-4 text-white",
};

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const [userVote, setUserVote] = useState<"for" | "against" | null>(null);
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercent = totalVotes > 0 ? Math.round((proposal.votesFor / totalVotes) * 100) : 0;
  const againstPercent = totalVotes > 0 ? Math.round((proposal.votesAgainst / totalVotes) * 100) : 0;

  const timeLeft = () => {
    const now = new Date();
    const diff = proposal.deadline.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left`;
  };

  const handleVote = (vote: "for" | "against") => {
    setUserVote(vote);
    console.log(`Voted ${vote} on proposal ${proposal.id}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={statusColors[proposal.status]}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
              <Badge variant="outline">{proposal.propertyName}</Badge>
            </div>
            <h3 className="font-semibold text-lg" data-testid={`text-proposal-title-${proposal.id}`}>
              {proposal.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeLeft()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1 text-chart-3">
              <ThumbsUp className="h-3.5 w-3.5" />
              For: {forPercent}%
            </span>
            <span className="flex items-center gap-1 text-destructive">
              Against: {againstPercent}%
              <ThumbsDown className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-chart-3 transition-all"
              style={{ width: `${forPercent}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-destructive transition-all"
              style={{ width: `${againstPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {proposal.totalVoters} voters
            </span>
            <span>{totalVotes.toLocaleString()} votes cast</span>
          </div>
        </div>

        {proposal.status === "active" && (
          <div className="flex gap-2">
            <Button
              variant={userVote === "for" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleVote("for")}
              data-testid={`button-vote-for-${proposal.id}`}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Vote For
            </Button>
            <Button
              variant={userVote === "against" ? "destructive" : "outline"}
              className="flex-1"
              onClick={() => handleVote("against")}
              data-testid={`button-vote-against-${proposal.id}`}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Vote Against
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
