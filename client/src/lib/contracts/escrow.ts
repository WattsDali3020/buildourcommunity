export const EscrowABI = [
  {
    type: "function",
    name: "getEscrowStatus",
    stateMutability: "view",
    inputs: [{ name: "propertyId", type: "uint256" }],
    outputs: [
      { name: "totalRaised", type: "uint256" },
      { name: "fundingTarget", type: "uint256" },
      { name: "projectBudget", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "isComplete", type: "bool" },
      { name: "founderFeePaid", type: "bool" },
      { name: "percentFunded", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getQuarterlyState",
    stateMutability: "view",
    inputs: [{ name: "propertyId", type: "uint256" }],
    outputs: [
      { name: "lastDistributedAt", type: "uint256" },
      { name: "pendingIncome", type: "uint256" },
      { name: "nextDistributionAt", type: "uint256" },
    ],
  },
] as const;
