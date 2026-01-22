export const CONTRACT_ADDRESSES = {
  "base-sepolia": {
    propertyToken: "",
    escrow: "",
    governance: "",
    phaseManager: "",
    treasury: "",
  },
  "base-mainnet": {
    propertyToken: "",
    escrow: "",
    governance: "",
    phaseManager: "",
    treasury: "",
  },
} as const;

export const CHAIN_IDS = {
  baseSepolia: 84532,
  baseMainnet: 8453,
} as const;

export type NetworkName = keyof typeof CONTRACT_ADDRESSES;

export function getContractAddresses(chainId: number) {
  if (chainId === CHAIN_IDS.baseSepolia) {
    return CONTRACT_ADDRESSES["base-sepolia"];
  }
  if (chainId === CHAIN_IDS.baseMainnet) {
    return CONTRACT_ADDRESSES["base-mainnet"];
  }
  return null;
}

export function isContractsDeployed(chainId: number): boolean {
  const addresses = getContractAddresses(chainId);
  if (!addresses) return false;
  return Object.values(addresses).every((addr) => addr !== "");
}
