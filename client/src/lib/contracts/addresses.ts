const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Real deployed contract addresses can be supplied via Vite env vars
// (e.g. VITE_ESCROW_ADDRESS) so they can be filled in at deploy time without
// a code change. Falls back to the zero-address placeholder until contracts
// are deployed to the target network.
const env = (key: string): string =>
  (import.meta.env?.[key] as string | undefined)?.trim() || ZERO_ADDRESS;

export const CONTRACT_ADDRESSES = {
  baseSepolia: {
    propertyToken: env("VITE_PROPERTY_TOKEN_ADDRESS"),
    escrow: env("VITE_ESCROW_ADDRESS"),
    phaseManager: env("VITE_PHASE_MANAGER_ADDRESS"),
    governance: env("VITE_GOVERNANCE_ADDRESS"),
    treasury: env("VITE_TREASURY_ADDRESS"),
  },
  baseMainnet: {
    propertyToken: env("VITE_MAINNET_PROPERTY_TOKEN_ADDRESS"),
    escrow: env("VITE_MAINNET_ESCROW_ADDRESS"),
    phaseManager: env("VITE_MAINNET_PHASE_MANAGER_ADDRESS"),
    governance: env("VITE_MAINNET_GOVERNANCE_ADDRESS"),
    treasury: env("VITE_MAINNET_TREASURY_ADDRESS"),
  },
} as const;

export type Network = keyof typeof CONTRACT_ADDRESSES;

export const getAddresses = (network: Network = "baseSepolia") => CONTRACT_ADDRESSES[network];

export const ESCROW_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.escrow as `0x${string}`;
export const GOVERNANCE_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.governance as `0x${string}`;
