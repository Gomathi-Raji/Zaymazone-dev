import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';
import { AdminSidebar, type AdminSection } from '@/components/admin/AdminSidebar';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Filter,
  MoreVertical,
  Calendar,
  DollarSign,
  Loader2,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';

interface AdminStats {
  totalProducts: number;
  activeArtisans: number;
  todayOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingApprovals: {
    products: number;
    artisans: number;
    blogs: number;
  };
  monthlyGrowth: {
    products: number;
    artisans: number;
    orders: number;
    revenue: number;
  };
}

interface PendingApproval {
  _id: string;
  type: 'product' | 'artisan' | 'blog';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface RecentActivity {
  _id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    activeArtisans: 0,
    todayOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingApprovals: { products: 0, artisans: 0, blogs: 0 },
    monthlyGrowth: { products: 0, artisans: 0, orders: 0, revenue: 0 }
  });
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      // Load all dashboard data in parallel
      const [statsData, approvalsData, activitiesData] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingApprovals(),
        adminService.getRecentActivities()
      ]);

      setStats(statsData.stats);
      setPendingApprovals(approvalsData.approvals || []);
      setRecentActivities(activitiesData.activities || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleApproval = async (id: string, type: string, action: 'approve' | 'reject') => {
    try {
      await adminService.handleApproval(id, type, action);
      toast({
        title: 'Success',
        description: `${type} ${action}d successfully`,
      });
      loadDashboardData(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} ${type}`,
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
      growth: stats.monthlyGrowth.products,
      description: 'Active products in marketplace'
    },
    {
      title: 'Active Artisans',
      value: stats.activeArtisans.toLocaleString(),
      icon: Users,
      color: 'bg-green-500',
      growth: stats.monthlyGrowth.artisans,
      description: 'Verified sellers on platform'
    },
    {
      title: 'Orders Today',
      value: stats.todayOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-purple-500',
      growth: stats.monthlyGrowth.orders,
      description: 'Orders placed today'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-orange-500',
      growth: stats.monthlyGrowth.revenue,
      description: 'Total platform revenue'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Section: Overview ─────────────────────────────────────────────────
  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of marketplace operations and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadDashboardData(false)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const GrowthIcon = getGrowthIcon(stat.growth);
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center space-x-1">
                      <GrowthIcon className={`w-3 h-3 ${getGrowthColor(stat.growth)}`} />
                      <span className={`text-xs font-medium ${getGrowthColor(stat.growth)}`}>
                        {stat.growth >= 0 ? '+' : ''}{stat.growth}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent to-gray-200" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert Summary */}
      {(stats.pendingApprovals.products > 0 || stats.pendingApprovals.artisans > 0 || stats.pendingApprovals.blogs > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-800">Pending Approvals</p>
                <p className="text-sm text-orange-700">
                  {stats.pendingApprovals.products} products, {stats.pendingApprovals.artisans} artisans, 
                  and {stats.pendingApprovals.blogs} blog posts awaiting review
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveSection('approvals')}>
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Artisans
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  View All Orders
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Review Approvals
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {recentActivities.slice(0, 10).map((activity) => (
                    <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          by {activity.user} • {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No recent activities
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Items requiring admin review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((approval) => (
                    <TableRow key={approval._id}>
                      <TableCell>
                        <Badge variant="outline">
                          {approval.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {approval.title}
                      </TableCell>
                      <TableCell>{approval.submittedBy}</TableCell>
                      <TableCell>{formatDate(approval.submittedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproval(approval._id, approval.type, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(approval._id, approval.type, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingApprovals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No pending approvals
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Activities</CardTitle>
                <CardDescription>Comprehensive activity log for the platform</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.user} • {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant={
                      activity.type === 'success' ? 'default' :
                      activity.type === 'warning' ? 'secondary' :
                      activity.type === 'error' ? 'destructive' : 'outline'
                    }>
                      {activity.type}
                    </Badge>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No activities found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gradient-subtle flex flex-col lg:flex-row">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <AdminSidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
          pendingApprovals={stats.pendingApprovals.products + stats.pendingApprovals.artisans}
          activeArtisans={stats.activeArtisans}
          totalUsers={stats.totalUsers}
        />

        {/* ── Main pane ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-screen overflow-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/60 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">{activeSection === 'dashboard' ? 'Admin Dashboard' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => loadDashboardData(false)}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Section content */}
          <main
            id="admin-main-content"
            className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6"
            tabIndex={-1}
          >
            {activeSection === 'dashboard' && <OverviewSection />}
          </main>
        </div>
      </div>
    </>
  );
}