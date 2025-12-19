import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { useTheme } from "@/components/ThemeProvider";
import "@rainbow-me/rainbowkit/styles.css";

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { theme } = useTheme();

  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        theme={theme === "dark" ? darkTheme() : lightTheme()}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
