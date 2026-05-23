import { Search, Gamepad2, Wallet, Library, LogOut, Shield, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

// Bug 24 fixed: inline SVG data URI — no external dependency for fallback images
const FALLBACK_IMAGE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='64' viewBox='0 0 48 64'%3E%3Crect width='48' height='64' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-size='8'%3ENo Image%3C/text%3E%3C/svg%3E";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  coverImage: string;
  price: number;
  developer?: string;
}

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Bugs 11 & 12 fixed: use AuthContext as the single source of truth for auth state.
  // No more manual localStorage reads or duplicate state management.
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Bug 12 fixed: logout now clears AuthContext state via the logout() function
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = (gameId: string) => {
    navigate(`/explore/${gameId}`);
    setSearchQuery("");
    setShowResults(false);
    setSearchResults([]);
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
        <div className="flex-1 max-w-md hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
            )}
            <Input
              placeholder="Search for games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
            />

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No games found
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((game) => (
                      <button
                        key={game._id}
                        onClick={() => handleResultClick(game._id)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <img
                          src={game.coverImage || FALLBACK_IMAGE_URI}
                          alt={game.name}
                          className="w-12 h-16 object-cover rounded"
                          onError={(e) => {
                            // Bug 24 fixed: use local data URI, no external request
                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE_URI;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">{game.name}</div>
                          {game.developer && (
                            <div className="text-sm text-muted-foreground truncate">{game.developer}</div>
                          )}
                          <div className="text-sm font-medium text-primary">₹{game.price}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">

          {isAuthenticated ? (
            /* --- STATE A: LOGGED IN --- */
            <>
              {/* Wallet — reads directly from AuthContext user */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                <Wallet className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  {user?.walletBalance?.toFixed(2) ?? "0.00"}
                </span>
              </div>

              {/* Admin Link — only show to admin users */}
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden lg:inline">Admin</span>
                  </Button>
                </Link>
              )}

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