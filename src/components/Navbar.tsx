import { Search, Gamepad2, Wallet, Library, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Gamepad2 className="h-8 w-8 text-primary transition-all duration-300 group-hover:text-neon-purple-glow" />
            <div className="absolute inset-0 blur-lg bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider text-foreground hidden sm:block">
            Campus<span className="text-primary">Grid</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for games..."
              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Wallet */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
            <Wallet className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">₹500</span>
          </div>

          {/* Library */}
          <Link to="/library">
            <Button
              variant={location.pathname === "/library" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
            </Button>
          </Link>

          {/* Profile */}
          <Link to="/login">
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="h-4 w-4 text-foreground" />
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
