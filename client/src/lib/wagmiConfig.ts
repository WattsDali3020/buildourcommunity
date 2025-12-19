import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "revitahub-demo";

export const wagmiConfig = getDefaultConfig({
  appName: "RevitaHub",
  projectId,
  chains: [base, baseSepolia],
  ssr: false,
});

export const supportedChains = [base, baseSepolia];
