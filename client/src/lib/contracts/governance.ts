export const GovernanceABI = [
  {
    type: "function",
    name: "getImpactReport",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      { name: "exists", type: "bool" },
      { name: "impactScore", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
] as const;
