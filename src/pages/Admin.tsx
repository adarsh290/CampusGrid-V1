import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, Trash2, Save, Server, IndianRupee, Edit, 
  DollarSign, Users, Database, Menu, X,
  TrendingUp, Package, Wallet as WalletIcon, Search
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";
import { cn } from "@/lib/utils";

interface Game {
  _id: string;
  title: string;
  description: string;
  developer?: string;
  price: number;
  genre: string;
  coverImage: string;
  screenshots?: string[];
  systemRequirements?: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  localFilePath?: string;
}

interface Transaction {
  userName: string;
  gameName: string;
  price: number;
  date: string;
}

interface RevenueData {
  totalRevenue: number;
  totalGamesSold: number;
  recentTransactions: Transaction[];
}

interface AuditLog {
  _id: string;
  type: 'PURCHASE' | 'TOP_UP';
  adminName?: string;
  targetUser: string;
  gamePurchased?: string;
  amount: number;
  createdAt: string;
}

type ActiveSection = "financials" | "community" | "catalog";

const Admin = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("catalog");
  
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    totalGamesSold: 0,
    recentTransactions: [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);
  const [isLoadingPurchaseLogs, setIsLoadingPurchaseLogs] = useState(true);
  const [isLoadingTopUpLogs, setIsLoadingTopUpLogs] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [fundAmounts, setFundAmounts] = useState<{ [key: string]: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [purchaseLogs, setPurchaseLogs] = useState<AuditLog[]>([]);
  const [topUpLogs, setTopUpLogs] = useState<AuditLog[]>([]);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    genre: "",
    description: "",
    developer: "",
    coverImage: "",
    localFilePath: "",
    screenshots: [] as string[],
    systemRequirements: {
      os: "",
      processor: "",
      memory: "",
      graphics: "",
      storage: "",
    },
  });
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  // Admin protection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to access the admin panel.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "admin") {
          toast({
            title: "Access Denied",
            description: "Admin privileges required.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
      } catch (e) {
        // If parsing fails, continue anyway
      }
    }

    fetchGames();
    fetchUsers();
    fetchRevenue();
    fetchPurchaseLogs();
    fetchTopUpLogs();
  }, [navigate]);

  const fetchGames = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingGames(true);
    try {
      const response = await fetch("/api/games", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      setGames(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load games",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGames(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchRevenue = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingRevenue(true);
    try {
      const response = await fetch("/api/admin/revenue", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch revenue data");
      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load revenue data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  const fetchPurchaseLogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingPurchaseLogs(true);
    try {
      const response = await fetch("/api/admin/logs?type=PURCHASE", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch purchase logs");
      const data = await response.json();
      setPurchaseLogs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load purchase logs",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPurchaseLogs(false);
    }
  };

  const fetchTopUpLogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingTopUpLogs(true);
    try {
      const response = await fetch("/api/admin/logs?type=TOP_UP", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch top-up logs");
      const data = await response.json();
      setTopUpLogs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load top-up logs",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTopUpLogs(false);
    }
  };

  const handleTopUp = async (userId: string) => {
    const amount = fundAmounts[userId];
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("/api/admin/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, amount: parseFloat(amount) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add funds");
      }

      toast({
        title: "Success",
        description: `Added ₹${amount} to user's wallet`,
      });

      setFundAmounts({ ...fundAmounts, [userId]: "" });
      fetchUsers();
      fetchTopUpLogs(); // Refresh top-up logs after adding funds
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add funds",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      price: game.price.toString(),
      genre: game.genre,
      description: game.description,
      developer: game.developer || "",
      coverImage: game.coverImage,
      localFilePath: game.localFilePath || "",
      screenshots: game.screenshots || [],
      systemRequirements: game.systemRequirements || {
        os: "",
        processor: "",
        memory: "",
        graphics: "",
        storage: "",
      },
    });
    setActiveSection("catalog");
    setShowForm(true); // Show form when editing
  };

  const handleScreenshotUpload = async (): Promise<string[]> => {
    if (screenshotFiles.length === 0) {
      return formData.screenshots || [];
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return formData.screenshots || [];
    }

    const formDataUpload = new FormData();
    screenshotFiles.forEach((file) => {
      formDataUpload.append("screenshots", file);
    });

    try {
      const response = await fetch("/api/upload/screenshots", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (!response.ok) throw new Error("Failed to upload screenshots");
      const data = await response.json();
      const existingScreenshots = formData.screenshots || [];
      return [...existingScreenshots, ...data.files];
    } catch (error) {
      toast({
        title: "Upload Warning",
        description: "Failed to upload screenshots. Game will be saved without new screenshots.",
        variant: "default",
      });
      return formData.screenshots || [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      const uploadedScreenshots = await handleScreenshotUpload();

      const url = editingGame ? `/api/games/${editingGame._id}` : "/api/games";
      const method = editingGame ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          price: parseFloat(formData.price),
          genre: formData.genre,
          description: formData.description,
          developer: formData.developer || undefined,
          coverImage: formData.coverImage,
          localFilePath: formData.localFilePath,
          screenshots: uploadedScreenshots.length > 0 ? uploadedScreenshots : undefined,
          systemRequirements: Object.values(formData.systemRequirements).some(val => val && val.trim() !== '') 
            ? formData.systemRequirements 
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingGame ? "update" : "create"} game`);
      }

      toast({
        title: "Success",
        description: `Game ${editingGame ? "updated" : "added"} successfully!`,
      });

      // Clear form and close it
      setFormData({
        title: "",
        price: "",
        genre: "",
        description: "",
        developer: "",
        coverImage: "",
        localFilePath: "",
        screenshots: [],
        systemRequirements: { os: "", processor: "", memory: "", graphics: "", storage: "" },
      });
      setScreenshotFiles([]);
      setEditingGame(null);
      setShowForm(false); // Close form after successful creation
      fetchGames();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${editingGame ? "update" : "create"} game`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete game");
      }

      toast({
        title: "Success",
        description: "Game deleted successfully!",
      });

      fetchGames();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete game",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
              setFormData({
                title: "",
                price: "",
                genre: "",
                description: "",
      developer: "",
                coverImage: "",
                localFilePath: "",
      screenshots: [],
      systemRequirements: { os: "", processor: "", memory: "", graphics: "", storage: "" },
    });
    setScreenshotFiles([]);
    setEditingGame(null);
    setShowForm(false);
  };

  const sidebarItems = [
    { id: "financials" as ActiveSection, icon: DollarSign, label: "Financials" },
    { id: "community" as ActiveSection, icon: Users, label: "Community" },
    { id: "catalog" as ActiveSection, icon: Database, label: "Catalog" },
  ];

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Fixed Collapsible Sidebar */}
      <div
        className={cn(
          "h-screen fixed left-0 top-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!sidebarCollapsed && <h2 className="text-xl font-bold text-slate-100">Admin Portal</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-slate-100"
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  activeSection === item.id
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content - Scrollable */}
      <div 
        className={cn(
          "flex-1 overflow-y-auto",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="container mx-auto p-6">
          {/* Financials Section */}
          {activeSection === "financials" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-slate-100">Financials</h1>
              
              {/* Revenue Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Total Platform Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      ₹{isLoadingRevenue ? "..." : revenueData.totalRevenue.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Total Games Sold
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-400">
                      {isLoadingRevenue ? "..." : revenueData.totalGamesSold}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Purchase Logs */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100">Purchase Logs</CardTitle>
                  <CardDescription className="text-slate-400">Complete history of game purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPurchaseLogs ? (
                    <div className="text-center py-8 text-slate-400">Loading...</div>
                  ) : purchaseLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No purchase logs yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Game Purchased</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseLogs.map((log) => (
                            <tr key={log._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-3 px-4 text-slate-100">{log.targetUser}</td>
                              <td className="py-3 px-4 text-slate-300">{log.gamePurchased || 'N/A'}</td>
                              <td className="py-3 px-4 text-green-400 font-medium">₹{log.amount}</td>
                              <td className="py-3 px-4 text-slate-400">
                                {new Date(log.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Community Section */}
          {activeSection === "community" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-slate-100">Community</h1>
              
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100">User Management</CardTitle>
                  <CardDescription className="text-slate-400">Manage users and add funds to wallets</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="text-center py-8 text-slate-400">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No users found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Wallet Balance</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Games Owned</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-3 px-4 text-slate-100">{user.username}</td>
                              <td className="py-3 px-4 text-slate-300">{user.email}</td>
                              <td className="py-3 px-4 text-slate-100">
                                <div className="flex items-center gap-1">
                                  <IndianRupee className="h-4 w-4" />
                                  {user.walletBalance.toFixed(2)}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-300">
                                {Array.isArray(user.library) ? user.library.length : 0}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    value={fundAmounts[user.id] || ""}
                                    onChange={(e) =>
                                      setFundAmounts({ ...fundAmounts, [user.id]: e.target.value })
                                    }
                                    className="w-32 bg-slate-800 border-slate-700 text-slate-100"
                                  />
                                  <Button
                                    onClick={() => handleTopUp(user.id)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    size="sm"
                                  >
                                    <WalletIcon className="h-4 w-4 mr-1" />
                                    Add Funds
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top-Up Logs */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100">Top-Up Logs</CardTitle>
                  <CardDescription className="text-slate-400">Complete history of wallet top-ups</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTopUpLogs ? (
                    <div className="text-center py-8 text-slate-400">Loading...</div>
                  ) : topUpLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No top-up logs yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Admin Name</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Target User</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount Added</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topUpLogs.map((log) => (
                            <tr key={log._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-3 px-4 text-slate-100">{log.adminName || 'Unknown'}</td>
                              <td className="py-3 px-4 text-slate-300">{log.targetUser}</td>
                              <td className="py-3 px-4 text-blue-400 font-medium">₹{log.amount}</td>
                              <td className="py-3 px-4 text-slate-400">
                                {new Date(log.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Catalog Section */}
          {activeSection === "catalog" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-100">Catalog</h1>
                <Button
                  onClick={() => {
                    if (showForm && editingGame) {
                      resetForm();
                    } else {
                      setShowForm(!showForm);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
                  {showForm && !editingGame ? "Cancel" : "Add New Game"}
          </Button>
        </div>

              {/* Collapsible Add New Game Form */}
              {showForm && (
                <Card className="bg-slate-900 border-slate-800 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-slate-100">
              {editingGame ? "Edit Game" : "Add New Game"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {editingGame ? "Update game details" : "Create a new game entry"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                    required
                  />
                </div>
                <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Price *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                    required
                  />
                </div>
                <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Genre *</label>
                  <Input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                    required
                  />
                </div>
                <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image URL *</label>
                  <Input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Developer</label>
                      <Input
                        type="text"
                        value={formData.developer}
                        onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 resize-none"
                  rows={4}
                  required
                />
              </div>

              <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Screenshots (Multiple Files) <span className="text-slate-500 text-xs">(Optional)</span>
                      </label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setScreenshotFiles(files);
                        }}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                      {formData.screenshots.length > 0 && (
                        <div className="mt-2 text-sm text-slate-400">
                          Existing screenshots: {formData.screenshots.length}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        System Requirements <span className="text-slate-500 text-xs">(Optional)</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">OS</label>
                          <Input
                            type="text"
                            value={formData.systemRequirements.os}
                            onChange={(e) => setFormData({
                              ...formData,
                              systemRequirements: { ...formData.systemRequirements, os: e.target.value }
                            })}
                            className="bg-slate-800 border-slate-700 text-slate-100"
                            placeholder="Windows 10 64-bit"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Processor</label>
                          <Input
                            type="text"
                            value={formData.systemRequirements.processor}
                            onChange={(e) => setFormData({
                              ...formData,
                              systemRequirements: { ...formData.systemRequirements, processor: e.target.value }
                            })}
                            className="bg-slate-800 border-slate-700 text-slate-100"
                            placeholder="Intel i5-8400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Memory</label>
                          <Input
                            type="text"
                            value={formData.systemRequirements.memory}
                            onChange={(e) => setFormData({
                              ...formData,
                              systemRequirements: { ...formData.systemRequirements, memory: e.target.value }
                            })}
                            className="bg-slate-800 border-slate-700 text-slate-100"
                            placeholder="8 GB RAM"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Graphics</label>
                          <Input
                            type="text"
                            value={formData.systemRequirements.graphics}
                            onChange={(e) => setFormData({
                              ...formData,
                              systemRequirements: { ...formData.systemRequirements, graphics: e.target.value }
                            })}
                            className="bg-slate-800 border-slate-700 text-slate-100"
                            placeholder="NVIDIA GTX 1060"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-500 mb-1">Storage</label>
                          <Input
                            type="text"
                            value={formData.systemRequirements.storage}
                            onChange={(e) => setFormData({
                              ...formData,
                              systemRequirements: { ...formData.systemRequirements, storage: e.target.value }
                            })}
                            className="bg-slate-800 border-slate-700 text-slate-100"
                            placeholder="50 GB available space"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                        Server Path (e.g., D:/Games/file.zip) *
                </label>
                <Input
                  type="text"
                  value={formData.localFilePath}
                  onChange={(e) => setFormData({ ...formData, localFilePath: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                  placeholder="/storage/cyberpunk.zip"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Saving..." : editingGame ? "Update Game" : "Save Game"}
                </Button>
                      {editingGame && (
                <Button
                  type="button"
                          onClick={resetForm}
                          variant="outline"
                          className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          Cancel Edit
                </Button>
                      )}
              </div>
            </form>
                </CardContent>
              </Card>
              )}

              {/* Current Inventory */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-slate-100">Current Inventory</CardTitle>
                      <CardDescription className="text-slate-400">Manage your game catalog</CardDescription>
            </div>
                    <div className="w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Search games..."
                          value={catalogSearchQuery}
                          onChange={(e) => setCatalogSearchQuery(e.target.value)}
                          className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                        />
            </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
          {isLoadingGames ? (
                    <div className="text-center py-8 text-slate-400">Loading games...</div>
          ) : games.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No games found. Add your first game above.</div>
          ) : (() => {
            // Filter games based on search query
            const filteredGames = games.filter((game) => {
              if (!catalogSearchQuery.trim()) return true;
              const query = catalogSearchQuery.toLowerCase();
              return (
                game.title.toLowerCase().includes(query) ||
                game.genre.toLowerCase().includes(query) ||
                (game.developer && game.developer.toLowerCase().includes(query))
              );
            });

            return filteredGames.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No games found matching your search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Cover</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Title</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Price</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">File Path</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredGames.map((game) => (
                            <tr key={game._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-3 px-4">
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="w-16 h-24 object-cover rounded-lg"
                          onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/128x192?text=No+Image";
                          }}
                        />
                      </td>
                              <td className="py-3 px-4">
                                <div className="text-slate-100 font-medium">{game.title}</div>
                                <div className="text-slate-400 text-sm mt-1">{game.genre}</div>
                      </td>
                              <td className="py-3 px-4 text-slate-100">₹{game.price}</td>
                              <td className="py-3 px-4">
                                <div className="text-slate-400 text-sm font-mono max-w-md truncate">
                          {game.localFilePath || "N/A"}
                        </div>
                      </td>
                              <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(game)}
                                    className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                                    <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(game._id)}
                                    className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                                    <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            );
          })()}
                </CardContent>
              </Card>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
