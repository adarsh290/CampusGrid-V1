import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Game } from "@/data/games";
import { CreditCard, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TokenRedemptionProps {
  game: Game;
}

export function TokenRedemption({ game }: TokenRedemptionProps) {
  const [token, setToken] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (token.length !== 10) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid 10-character transaction token.",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRedeeming(false);

    toast({
      title: "Success!",
      description: `${game.title} has been added to your library.`,
    });
    setToken("");
  };

  return (
    <div className="space-y-6">
      {/* Price Card */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Price</p>
            <p className="text-4xl font-display font-black text-gradient-purple">
              {game.price === 0 ? "FREE" : `₹${game.price}`}
            </p>
          </div>
          <div className="p-4 rounded-full bg-primary/20">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
        </div>

        {game.price > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Pay via UPI to receive your unique token</span>
          </div>
        )}
      </div>

      {/* Token Input */}
      {game.price > 0 ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Transaction Token</label>
            <Input
              placeholder="Enter your 10-character token"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase().slice(0, 10))}
              className="font-mono text-lg tracking-wider bg-secondary/50 border-border/50 focus:border-primary/50"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Pay via UPI, then enter the token from your receipt
            </p>
          </div>

          <Button
            variant="neonPurple"
            size="lg"
            className="w-full animate-glow"
            onClick={handleRedeem}
            disabled={token.length !== 10 || isRedeeming}
          >
            {isRedeeming ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Redeeming...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Redeem & Add to Library
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button variant="neonGreen" size="lg" className="w-full animate-glow">
          <CheckCircle2 className="h-5 w-5" />
          Add to Library - FREE
        </Button>
      )}

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          How to Purchase
        </h4>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
            <span>Pay ₹{game.price} via UPI to the campus payment portal</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
            <span>Receive your unique 10-character transaction token</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
            <span>Enter the token above to unlock your game</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
