import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SellerProductManagement } from "@/components/seller/SellerProductManagement";
import { SellerOrderManagement } from "@/components/seller/SellerOrderManagement";
import { SellerAnalytics } from "@/components/seller/SellerAnalytics";
import { SellerProfile } from "@/components/seller/SellerProfile";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  ShoppingCart,
  BarChart3,
  User,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock
} from "lucide-react";

interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      if (!refreshing) setRefreshing(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('firebase_id_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/seller/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      setStats(data.stats);
      setLastUpdated(new Date());
      
      if (loading) {
        toast({
          title: "Success",
          description: "Dashboard loaded successfully",
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      if (!loading) {
        toast({
          title: "Error",
          description: "Failed to refresh dashboard statistics",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    // Initial load
    loadStats();

    // Set up interval to refresh every 30 seconds if autoRefresh is enabled
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadStats();
      }, 30000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, loading, refreshing]);

  const statsCards = [
    { 
      label: "Total Products", 
      value: stats.totalProducts.toLocaleString(), 
      icon: Package, 
      color: "text-blue-600" 
    },
    { 
      label: "Active Products", 
      value: stats.activeProducts.toString(), 
      icon: TrendingUp, 
      color: "text-green-600" 
    },
    { 
      label: "Total Orders", 
      value: stats.totalOrders.toString(), 
      icon: ShoppingCart, 
      color: "text-purple-600" 
    },
    { 
      label: "Completed Orders", 
      value: stats.completedOrders.toString(), 
      icon: BarChart3, 
      color: "text-orange-600" 
    },
    { 
      label: "Total Revenue", 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-green-700" 
    },
    { 
      label: "Average Rating", 
      value: stats.averageRating.toFixed(1), 
      icon: Star, 
      color: "text-yellow-600" 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading seller dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Refresh Controls */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your products, orders, and business</p>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={loadStats}
                disabled={refreshing}
                variant="outline"
                className="w-fit"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Now
                  </>
                )}
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className="w-fit text-xs"
              >
                {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => setActiveTab('products')} variant="default">
                        Add New Product
                      </Button>
                      <Button onClick={() => setActiveTab('orders')} variant="outline">
                        View Orders
                      </Button>
                      <Button onClick={() => setActiveTab('profile')} variant="outline">
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent sales and activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <SellerProductManagement />
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <SellerOrderManagement />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <SellerAnalytics />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <SellerProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}