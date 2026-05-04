import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductManagement } from "@/components/dashboard/ProductManagement";
import { ArtisanManagement } from "@/components/dashboard/ArtisanManagement";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { BlogManagement } from "@/components/admin/BlogManagement";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { ApprovalManagement } from "@/components/admin/ApprovalManagement";
import { ReportsAndInvoices } from "@/components/admin/ReportsAndInvoices";
import { PaymentsManagement } from "@/components/admin/PaymentsManagement";
import { AuthManagement } from "@/components/admin/AuthManagement";
import { AlertsAndAnnouncements } from "@/components/admin/AlertsAndAnnouncements";
import { CustomerSupport } from "@/components/admin/CustomerSupport";
import { SellerAlerts } from "@/components/admin/SellerAlerts";
import { ActivitiesAndNotifications } from "@/components/admin/ActivitiesAndNotifications";
import AdminMobileBottomNav from "@/components/admin/AdminMobileBottomNav";
import AdminUpiVerification from "@/components/admin/AdminUpiVerification";
import { AdminSettlementManagement } from "@/components/admin/AdminSettlementManagement";
import { AdminInvoiceView } from "@/components/admin/AdminInvoiceView";
import { AdminLogin } from "@/components/AdminLogin";
import { PageContentManagement } from "@/components/admin/PageContentManagement";
import { CategoriesManagement } from "@/components/admin/CategoriesManagement";
import { AuditLogManagement } from "@/components/admin/AuditLogManagement";
import { EmailTemplateManagement } from "@/components/admin/EmailTemplateManagement";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Package,
  ShoppingCart,
  UserCheck,
  FileText,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileBarChart,
  CreditCard,
  Shield,
  Bell,
  HeadphonesIcon,
  AlertCircle,
  Activity,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Wallet,
  Receipt,
  Mail
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeArtisans: 0,
    todayOrders: 0,
    totalUsers: 150,
    totalRevenue: 245000,
    averageOrderValue: 2800,
    pendingApprovals: { products: 0, artisans: 0 }
  });
  const [loading, setLoading] = useState(false); // Don't show loading initially
  const { toast } = useToast();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Only load stats when authenticated
      loadStats();
      // Set up real-time polling every 30 seconds
      const interval = setInterval(() => {
        loadStats();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkAuthentication = () => {
    setCheckingAuth(true);
    const authenticated = adminService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setCheckingAuth(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const loadStats = async () => {
    // Don't set loading to true to avoid blocking the UI
    try {
      const response = await adminService.getStats();
      setStats(response.stats);
    } catch (error) {
      console.warn('Failed to load admin statistics:', error);
      // Keep default stats on error
    } finally {
      // Don't set loading to false since we don't show loading initially
    }
  };

  const statsCards = [
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      trend: "+12%",
      color: "text-blue-600"
    },
    {
      label: "Active Artisans",
      value: stats.activeArtisans.toString(),
      icon: Users,
      trend: "+8%",
      color: "text-green-600"
    },
    {
      label: "Orders Today",
      value: stats.todayOrders.toString(),
      icon: ShoppingCart,
      trend: "+15%",
      color: "text-purple-600"
    },
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: UserCheck,
      trend: "+5%",
      color: "text-orange-600"
    },
  ];

  const alerts = [
    {
      type: "warning",
      message: `${stats.pendingApprovals.products} products pending approval`,
      severity: "medium"
    },
    {
      type: "info",
      message: `${stats.pendingApprovals.artisans} artisan applications pending`,
      severity: "low"
    },
    {
      type: "error",
      message: "Payment gateway maintenance scheduled",
      severity: "high"
    },
  ];

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "approvals", label: "Approvals", icon: CheckCircle },
    { id: "products", label: "Products", icon: Package },
    { id: "artisans", label: "Artisans", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "users", label: "Users", icon: UserCheck },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "page-content", label: "Page Content", icon: FileText },
    { id: "categories", label: "Categories", icon: Package },
    { id: "audit-logs", label: "Audit Logs", icon: Activity },
    { id: "email-templates", label: "Email Templates", icon: Mail },
    { id: "reports", label: "Reports", icon: FileBarChart },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "upi-verification", label: "UPI Verification", icon: CheckCircle },
    { id: "settlements", label: "Settlements", icon: Wallet },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "auth", label: "Auth Management", icon: Shield },
    { id: "alerts", label: "Alerts & Announcements", icon: Bell },
    { id: "support", label: "Customer Support", icon: HeadphonesIcon },
    { id: "seller-alerts", label: "Seller Alerts", icon: AlertCircle },
    { id: "activities", label: "Activities", icon: Activity },
  ];

  const mobileGroups = [
    {
      title: "Dashboard",
      items: ["overview", "approvals", "products", "orders"],
    },
    {
      title: "Management",
      items: ["artisans", "users", "blog", "page-content", "categories", "audit-logs", "email-templates"],
    },
    {
      title: "Operations",
      items: ["reports", "payments", "upi-verification", "settlements", "invoices", "auth", "alerts", "support", "seller-alerts", "activities"],
    },
  ];

  const renderSidebarButton = (item: typeof sidebarItems[number], closeMobile = false) => (
    <Button
      key={item.id}
      variant={activeTab === item.id ? "default" : "ghost"}
      className={`w-full h-11 rounded-xl border border-transparent hover:border-border/60 hover:bg-primary/5 transition-all ${sidebarCompact ? "justify-center px-2 gap-0" : "justify-start gap-2.5 px-4"}`}
      aria-label={item.label}
      title={item.label}
      onClick={() => {
        setActiveTab(item.id);
        if (closeMobile) setMobileNavOpen(false);
      }}
    >
      <item.icon className={`w-4 h-4 shrink-0 ${sidebarCompact ? "" : "mr-2"}`} />
      <span className={`truncate ${sidebarCompact ? "hidden" : "block"}`}>{item.label}</span>
    </Button>
  );

  // Temporarily remove loading check for immediate access
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
  //         <p>Loading admin panel...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex flex-col lg:flex-row">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.1),transparent_28%),radial-gradient(circle_at_top_right,hsl(var(--accent)/0.08),transparent_24%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)/0.95))] dark:bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_28%),radial-gradient(circle_at_top_right,hsl(var(--accent)/0.08),transparent_24%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)/0.96))]" />
      <div className="lg:hidden sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Admin Panel</p>
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">Dashboard</h1>
            <p className="text-[11px] text-muted-foreground truncate">Manage data and operations</p>
          </div>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-[92vw] max-w-[420px] h-[100dvh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-l border-border/60 shadow-2xl">
          <SheetHeader className="px-4 py-4 border-b border-border/60 bg-card/50 sticky top-0 z-10 backdrop-blur-xl">
            <SheetTitle>Admin Panel</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-3 overflow-y-auto h-[calc(100dvh-72px)]">
            <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Quick status</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Marketplace operations</p>
                  <p className="text-xs text-muted-foreground">Manage approvals, sales, users, and reports</p>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1">
                  {stats.pendingApprovals.products + stats.pendingApprovals.artisans} pending
                </Badge>
              </div>
            </div>

            {mobileGroups.map((group) => (
              <div key={group.title} className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-3 shadow-sm space-y-2">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.title}
                </p>
                <div className="space-y-1.5">
                  {sidebarItems
                    .filter((item) => group.items.includes(item.id))
                    .map((item) => renderSidebarButton(item, true))}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" onClick={handleLogout} className="justify-center gap-2 h-11 px-4 rounded-xl">
                <Settings className="w-4 h-4" />
                Logout
              </Button>
              <Button variant="ghost" onClick={() => setMobileNavOpen(false)} className="justify-center h-11 px-4 rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sidebar (left side on large screens) */}
      <aside className={`hidden lg:flex ${sidebarCompact ? "w-20" : "w-64"} bg-card border-r border-border min-h-screen sticky top-0 shrink-0 animate-slide-in-left`}>
        <div className={`p-6 w-full bg-card/80 backdrop-blur-xl ${sidebarCompact ? "px-3" : ""}`}>
          <div className={`mb-6 rounded-2xl border border-border/60 bg-background/60 ${sidebarCompact ? "px-3 py-3" : "px-4 py-3"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className={`min-w-0 ${sidebarCompact ? "hidden" : "block"}`}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin Panel</p>
                <h2 className="text-xl font-bold text-foreground">Marketplace Control</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCompact((value) => !value)}
                aria-label={sidebarCompact ? "Expand sidebar" : "Collapse sidebar"}
                title={sidebarCompact ? "Expand sidebar" : "Collapse sidebar"}
                className="h-8 w-8 p-0 shrink-0"
              >
                {sidebarCompact ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map((item) => renderSidebarButton(item))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative z-10 flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your marketplace data and operations</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Settings className="w-4 h-4" />
            Logout
          </Button>
        </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {statsCards.map((stat) => (
                  <Card key={stat.label} className="border-border/70 bg-card/85 backdrop-blur-xl shadow-sm dark:bg-card/75 dark:border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground">
                            {loading ? "..." : stat.value}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-500">{stat.trend}</span>
                          </div>
                        </div>
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <AnalyticsOverview />
                </div>

                <Card className="border-border/70 bg-card/85 backdrop-blur-xl shadow-sm dark:bg-card/75 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Alerts & Notifications
                    </CardTitle>
                    <CardDescription>Items requiring your attention</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {alerts.map((alert, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-2 h-2 rounded-full mt-2 ${alert.severity === 'high' ? 'bg-red-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{alert.message}</p>
                          <Badge variant={
                            alert.severity === 'high' ? 'destructive' :
                              alert.severity === 'medium' ? 'secondary' : 'outline'
                          } className="mt-1">
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "approvals" && <ApprovalManagement />}
          {activeTab === "products" && <ProductManagement />}
          {activeTab === "artisans" && <ArtisanManagement />}
          {activeTab === "orders" && <OrderManagement />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "blog" && <BlogManagement />}
          {activeTab === "page-content" && <PageContentManagement />}
          {activeTab === "categories" && <CategoriesManagement />}
          {activeTab === "audit-logs" && <AuditLogManagement />}
          {activeTab === "email-templates" && <EmailTemplateManagement />}
          {activeTab === "reports" && <ReportsAndInvoices />}
          {activeTab === "payments" && <PaymentsManagement />}
          {activeTab === "upi-verification" && <AdminUpiVerification />}
          {activeTab === "settlements" && <AdminSettlementManagement />}
          {activeTab === "invoices" && <AdminInvoiceView />}
          {activeTab === "auth" && <AuthManagement />}
          {activeTab === "alerts" && <AlertsAndAnnouncements />}
          {activeTab === "support" && <CustomerSupport />}
          {activeTab === "seller-alerts" && <SellerAlerts />}
          {activeTab === "activities" && <ActivitiesAndNotifications />}
      </div>

      <AdminMobileBottomNav
        activeTab={activeTab as "overview" | "approvals" | "products" | "orders"}
        onNavigate={(tab) => setActiveTab(tab)}
        onMenuOpen={() => setMobileNavOpen(true)}
        pendingApprovals={(stats.pendingApprovals.products ?? 0) + (stats.pendingApprovals.artisans ?? 0)}
      />
    </div>
  );
}