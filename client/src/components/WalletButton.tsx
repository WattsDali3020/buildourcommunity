import { useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const lastSyncedAddress = useRef<string | null>(null);

  const syncWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      return apiRequest("POST", "/api/user/wallet", { walletAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  useEffect(() => {
    if (isConnected && address && address !== lastSyncedAddress.current) {
      lastSyncedAddress.current = address;
      syncWalletMutation.mutate(address);
    }
  }, [isConnected, address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openExplorer = () => {
    if (address && chain) {
      const explorerUrl = chain.blockExplorers?.default?.url;
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, "_blank");
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button
            onClick={openConnectModal}
            variant="outline"
            data-testid="button-connect-wallet"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </ConnectButton.Custom>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-wallet-menu">
          <Wallet className="mr-2 h-4 w-4" />
          {formatAddress(address!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyAddress} data-testid="menu-copy-address">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openExplorer} data-testid="menu-view-explorer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="text-destructive"
          data-testid="menu-disconnect-wallet"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
