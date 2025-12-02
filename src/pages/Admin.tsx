import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Server, Wallet, IndianRupee } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";

interface Game {
  _id: string;
  title: string;
  description: string;
  price: number;
  genre: string;
  coverImage: string;
  localFilePath?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [fundAmounts, setFundAmounts] = useState<{ [key: string]: string }>({});

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    genre: "",
    description: "",
    coverImage: "",
    localFilePath: "",
  });

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

    // Optional: Check if user is admin
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
        // If parsing fails, continue anyway (token check is primary)
      }
    }

    // Fetch games and users
    fetchGames();
    fetchUsers();
  }, [navigate]);

  const fetchGames = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoadingGames(true);
    try {
      const response = await fetch("http://localhost:5000/api/games", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

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
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

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

  const handleAddFunds = async (userId: string) => {
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
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/funds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add funds");
      }

      toast({
        title: "Success",
        description: `Added ₹${amount} to user's wallet`,
      });

      // Clear the input
      setFundAmounts({ ...fundAmounts, [userId]: "" });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add funds",
        variant: "destructive",
      });
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
      const response = await fetch("http://localhost:5000/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          price: parseFloat(formData.price),
          genre: formData.genre,
          description: formData.description,
          coverImage: formData.coverImage,
          localFilePath: formData.localFilePath,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create game");
      }

      toast({
        title: "Success",
        description: "Game added successfully!",
      });

      // Clear form
      setFormData({
        title: "",
        price: "",
        genre: "",
        description: "",
        coverImage: "",
        localFilePath: "",
      });
      setShowAddForm(false);

      // Refresh game list
      fetchGames();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create game",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/games/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete game");
      }

      toast({
        title: "Success",
        description: "Game deleted successfully!",
      });

      // Refresh game list
      fetchGames();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete game",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-100">Store Inventory</h1>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-[0_0_20px_hsl(263,70%,66%/0.4)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Game
          </Button>
        </div>

        {/* Add Game Form */}
        {showAddForm && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Add New Game</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Title
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-black/50 border-white/10 focus:border-purple-500 text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-black/50 border-white/10 focus:border-purple-500 text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Genre
                  </label>
                  <Input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="bg-black/50 border-white/10 focus:border-purple-500 text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Cover Image URL
                  </label>
                  <Input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="bg-black/50 border-white/10 focus:border-purple-500 text-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none text-gray-100 resize-none"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Server Path (e.g., D:/Games/file.zip)
                </label>
                <Input
                  type="text"
                  value={formData.localFilePath}
                  onChange={(e) => setFormData({ ...formData, localFilePath: e.target.value })}
                  className="bg-black/50 border-white/10 focus:border-purple-500 text-gray-100"
                  placeholder="D:/CampusGames/cyberpunk.zip"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Game"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      title: "",
                      price: "",
                      genre: "",
                      description: "",
                      coverImage: "",
                      localFilePath: "",
                    });
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-0"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Game List */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
          {isLoadingGames ? (
            <div className="p-8 text-center text-gray-400">
              <div className="inline-block h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4">Loading games...</p>
            </div>
          ) : games.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No games found. Add your first game to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-100">
                      Cover
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-100">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-100">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-100">
                      File Path
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr
                      key={game._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="w-16 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/128x192?text=No+Image";
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-100 font-medium">{game.title}</div>
                        <div className="text-gray-400 text-sm mt-1">{game.genre}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-100">₹{game.price}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-400 text-sm font-mono max-w-md truncate">
                          {game.localFilePath || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => handleDelete(game._id)}
                          className="bg-red-600 hover:bg-red-700 text-white border-0"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Management Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            User Management
          </h2>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
            {isLoadingUsers ? (
              <div className="p-8 text-center text-gray-400">
                <div className="inline-block h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-100">
                        Username
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-100">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-100">
                        Current Balance
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-100">
                        Add Funds
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-gray-100 font-medium">{user.username}</div>
                          <div className="text-gray-400 text-xs mt-1">{user.role}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{user.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-100 font-medium">
                            <IndianRupee className="h-4 w-4" />
                            {user.walletBalance.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Amount"
                              value={fundAmounts[user.id] || ""}
                              onChange={(e) =>
                                setFundAmounts({ ...fundAmounts, [user.id]: e.target.value })
                              }
                              className="w-32 bg-black/50 border-white/10 focus:border-purple-500 text-gray-100"
                            />
                            <Button
                              onClick={() => handleAddFunds(user.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                              size="sm"
                            >
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

