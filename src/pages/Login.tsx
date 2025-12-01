import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2, Mail, Lock, AlertCircle, CheckCircle2, Wifi } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = email.endsWith("@iitrpr.ac.in");
  const showEmailHint = email.length > 0 && !email.includes("@iitrpr.ac.in");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail) {
      toast({
        title: "Invalid Email",
        description: "Only @iitrpr.ac.in emails are allowed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    toast({
      title: "Welcome back!",
      description: "Successfully logged in to CampusGrid.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px),
                         linear-gradient(90deg, hsl(var(--primary) / 0.2) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="relative">
                <Gamepad2 className="h-12 w-12 text-primary transition-all duration-300 group-hover:text-neon-purple-glow" />
                <div className="absolute inset-0 blur-lg bg-primary/40 opacity-50" />
              </div>
            </Link>
            <h1 className="font-display text-3xl font-bold mt-4 mb-2">
              Campus<span className="text-primary">Grid</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to access the game library
            </p>
          </div>

          {/* Walled Garden Notice */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/30 mb-6">
            <Wifi className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-sm font-medium text-accent">Campus Network Only</p>
              <p className="text-xs text-muted-foreground">
                Connect to IIT Ropar LAN for access
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="2021csb1034@iitrpr.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
                />
                {email.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidEmail ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {showEmailHint && (
                <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Only @iitrpr.ac.in emails allowed
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="neonPurple"
              size="lg"
              className="w-full"
              disabled={!isValidEmail || password.length < 1 || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <a href="#" className="text-primary hover:underline">
                Register with college email
              </a>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Having trouble? Contact{" "}
          <a href="#" className="text-primary hover:underline">
            IT Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
