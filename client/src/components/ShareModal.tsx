import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { SiX, SiInstagram, SiYoutube } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type: "property" | "nomination";
  children?: React.ReactNode;
}

export function ShareModal({ title, description, url, image, type, children }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = type === "nomination" 
    ? `I just nominated "${title}" for community revitalization on RevitaHub! Help bring this property back to life.`
    : `Check out "${title}" on RevitaHub - a community-owned revitalization project. Invest starting at $12.50!`;

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast({ title: "Copy failed", description: "Please copy the link manually", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share link copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Copy failed", description: "Please copy the link manually", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  const shareToX = () => {
    const text = encodeURIComponent(shareText);
    const link = encodeURIComponent(shareUrl);
    const hashtags = encodeURIComponent("RevitaHub,CommunityOwnership,RealEstate,Base");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}&hashtags=${hashtags}`, "_blank");
  };

  const shareToInstagram = () => {
    toast({
      title: "Share to Instagram",
      description: "Copy the link and share it in your Instagram story or bio. Instagram doesn't support direct link sharing.",
    });
    handleCopy();
  };

  const shareToYoutube = () => {
    toast({
      title: "Share on YouTube",
      description: "Use this link in your video description or community post to share this property with your audience.",
    });
    handleCopy();
  };

  const shareOnBase = () => {
    toast({
      title: "Share on Base",
      description: "Once you own tokens, you can share your investment on-chain. Connect your wallet to get started.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" data-testid="button-share">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {type === "nomination" ? "Nomination" : "Property"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Help spread the word about community revitalization!
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={shareToX}
              data-testid="button-share-x"
            >
              <SiX className="h-4 w-4" />
              Share on X
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={shareToInstagram}
              data-testid="button-share-instagram"
            >
              <SiInstagram className="h-4 w-4" />
              Instagram
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={shareToYoutube}
              data-testid="button-share-youtube"
            >
              <SiYoutube className="h-4 w-4" />
              YouTube
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-[#0052FF]/10 border-[#0052FF]/20 text-[#0052FF] dark:bg-[#0052FF]/20 dark:text-[#4D8EFF]"
              onClick={shareOnBase}
              data-testid="button-share-base"
            >
              <div className="h-4 w-4 rounded-full bg-[#0052FF] flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">B</span>
              </div>
              Base Network
            </Button>
          </div>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              variant="default"
              className="w-full flex items-center gap-2"
              onClick={handleNativeShare}
              data-testid="button-share-native"
            >
              <Share2 className="h-4 w-4" />
              Share via Device
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 text-sm"
              data-testid="input-share-url"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              data-testid="button-copy-link"
            >
              {copied ? <Check className="h-4 w-4 text-chart-3" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Pro tip:</p>
            <p>Share your {type === "nomination" ? "nomination" : "investment"} to earn referral rewards when others invest through your link!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
