import { Search, Gamepad2, Wallet, Library, User, LogOut, Shield, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { User as UserType } from "@/types";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Check login state and fetch user profile on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    if (token) {
      fetchUserProfile();
    } else {
      setCurrentUser(null);
    }
  }, [location]); // Re-check whenever URL changes

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        // Update localStorage with latest user data
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate("/login");
  };

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

        {/* Search Bar - Always visible */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for games..."
              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          
          {isAuthenticated ? (
            /* --- STATE A: LOGGED IN --- */
            <>
              {/* Wallet */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                <Wallet className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  {currentUser?.walletBalance?.toFixed(2) || "0.00"}
                </span>
              </div>

              {/* Admin Link (Visible to all logged in users, backend protects access) */}
              <Link to="/admin">
                 <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden lg:inline">Admin</span>
                 </Button>
              </Link>

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

              {/* Logout Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                 <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            /* --- STATE B: LOGGED OUT --- */
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}