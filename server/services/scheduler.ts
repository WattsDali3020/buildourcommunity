import { storage } from "../storage";

const VOTING_MULTIPLIERS: Record<string, number> = {
  county: 1.5,
  state: 1.25,
  national: 1.0,
  international: 0.75,
};

const PHASE_ORDER = ["county", "state", "national", "international"];

export async function checkFundingDeadlines(): Promise<void> {
  console.log("[Scheduler] Checking funding deadlines...");
  
  const properties = await storage.getProperties();
  const now = new Date();
  
  for (const property of properties) {
    if (property.status !== "live") continue;
    
    const offering = await storage.getOfferingByPropertyId(property.id);
    if (!offering) continue;
    
    if (offering.fundingDeadline && new Date(offering.fundingDeadline) < now) {
      const fundingRaised = parseFloat(offering.totalFundingRaised || "0");
      const minimumThreshold = parseFloat(offering.minimumFundingThreshold || "0");
      
      if (fundingRaised >= minimumThreshold) {
        console.log(`[Scheduler] Offering ${offering.id} met funding goal - marking as completed`);
      } else {
        console.log(`[Scheduler] Offering ${offering.id} failed to meet funding - triggering refunds`);
      }
    }
  }
}

export async function checkPhaseAdvancement(): Promise<void> {
  console.log("[Scheduler] Checking phase advancement...");
  
  const properties = await storage.getProperties();
  
  for (const property of properties) {
    if (property.status !== "live") continue;
    
    const offering = await storage.getOfferingByPropertyId(property.id);
    if (!offering || offering.status !== "active") continue;
    
    const phases = await storage.getOfferingPhases(offering.id);
    const activePhase = phases.find(p => p.isActive);
    
    if (!activePhase) continue;
    
    const tokensSold = activePhase.tokensSold || 0;
    const allocation = activePhase.tokenAllocation;
    
    if (tokensSold >= allocation) {
      const currentPhaseIndex = PHASE_ORDER.indexOf(activePhase.phase);
      const nextPhaseIndex = currentPhaseIndex + 1;
      
      if (nextPhaseIndex < PHASE_ORDER.length) {
        console.log(`[Scheduler] Phase ${activePhase.phase} sold out - advancing to ${PHASE_ORDER[nextPhaseIndex]}`);
      } else {
        console.log(`[Scheduler] All phases completed for offering ${offering.id}`);
      }
    }
  }
}

export async function updateProposalStatuses(): Promise<void> {
  console.log("[Scheduler] Updating proposal statuses...");
  
  const proposals = await storage.getProposals();
  const now = new Date();
  
  for (const proposal of proposals) {
    if (proposal.status !== "active") continue;
    
    if (proposal.endsAt && new Date(proposal.endsAt) < now) {
      const votesFor = proposal.votesFor || 0;
      const votesAgainst = proposal.votesAgainst || 0;
      const totalVotes = votesFor + votesAgainst;
      
      if (totalVotes >= proposal.quorumRequired && votesFor > votesAgainst) {
        console.log(`[Scheduler] Proposal ${proposal.id} passed`);
      } else {
        console.log(`[Scheduler] Proposal ${proposal.id} rejected`);
      }
    }
  }
}

let schedulerInterval: NodeJS.Timeout | null = null;

export function startScheduler(intervalMs: number = 60000): void {
  if (schedulerInterval) {
    console.log("[Scheduler] Already running");
    return;
  }
  
  console.log(`[Scheduler] Starting with ${intervalMs}ms interval`);
  
  schedulerInterval = setInterval(async () => {
    try {
      await checkFundingDeadlines();
      await checkPhaseAdvancement();
      await updateProposalStatuses();
    } catch (error) {
      console.error("[Scheduler] Error running scheduled tasks:", error);
    }
  }, intervalMs);
  
  checkFundingDeadlines().catch(console.error);
  checkPhaseAdvancement().catch(console.error);
  updateProposalStatuses().catch(console.error);
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[Scheduler] Stopped");
  }
}
