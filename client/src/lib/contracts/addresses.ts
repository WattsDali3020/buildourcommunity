export const CONTRACT_ADDRESSES = {
  baseSepolia: {
    propertyToken: "0x0000000000000000000000000000000000000000",
    escrow: "0x0000000000000000000000000000000000000000",
    phaseManager: "0x0000000000000000000000000000000000000000",
    governance: "0x0000000000000000000000000000000000000000",
    treasury: "0x0000000000000000000000000000000000000000",
  },
  baseMainnet: {
    propertyToken: "0x0000000000000000000000000000000000000000",
    escrow: "0x0000000000000000000000000000000000000000",
    phaseManager: "0x0000000000000000000000000000000000000000",
    governance: "0x0000000000000000000000000000000000000000",
    treasury: "0x0000000000000000000000000000000000000000",
  },
} as const;

export type Network = keyof typeof CONTRACT_ADDRESSES;

export const getAddresses = (network: Network = "baseSepolia") => CONTRACT_ADDRESSES[network];

/** Default read targets until a Base deploy replaces the zeros. */
export const PROPERTY_TOKEN_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.propertyToken as `0x${string}`;
export const ESCROW_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.escrow as `0x${string}`;
export const GOVERNANCE_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.governance as `0x${string}`;
export const PHASE_MANAGER_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.phaseManager as `0x${string}`;
export const TREASURY_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.treasury as `0x${string}`;

export function isContractsDeployed(network: Network = "baseSepolia"): boolean {
  const a = CONTRACT_ADDRESSES[network];
  return Object.values(a).every((addr) => addr !== "0x0000000000000000000000000000000000000000");
}
