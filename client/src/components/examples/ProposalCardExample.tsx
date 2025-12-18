import { ProposalCard } from "../ProposalCard";

export default function ProposalCardExample() {
  const proposal = {
    id: "prop-1",
    title: "Add EV Charging Stations to Wellness Village",
    description: "Proposal to allocate $150,000 from the community treasury to install 8 Level 2 EV charging stations.",
    propertyName: "Etowah Wellness Village",
    status: "active" as const,
    votesFor: 45000,
    votesAgainst: 12000,
    totalVoters: 234,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    proposer: "0x1234...5678",
  };

  return <ProposalCard proposal={proposal} />;
}
