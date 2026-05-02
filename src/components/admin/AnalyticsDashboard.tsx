import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/services/adminService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Users,
  FileText,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  blogStats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    avgEngagement: number;
  };
  commentStats: {
    total: {
      pending: number;
      approved: number;
      rejected: number;
      spam: number;
    };
    recent: Array<{
      date: string;
      approved: number;
      pending: number;
      rejected: number;
    }>;
    topPosts: Array<{
      title: string;
      commentCount: number;
      category: string;
    }>;
  };
  categoryStats: Array<{
    name: string;
    postCount: number;
    views: number;
    engagement: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    posts: number;
    views: number;
    comments: number;
    likes: number;
  }>;
  topPerformingPosts: Array<{
    title: string;
    views: number;
    likes: number;
    comments: number;
    category: string;
    publishedAt: string;
  }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [blogPosts, commentStats, categories] = await Promise.all([
        adminService.getBlogPosts({ limit: 100 }),
        adminService.getCommentStats(),
        adminService.getCategories({ limit: 100 })
      ]);

      // Process the data
      const processedData = processAnalyticsData(blogPosts, commentStats, categories);
      setAnalyticsData(processedData);
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (
    blogData: any, 
    commentData: any, 
    categoryData: any
  ): AnalyticsData => {
    const posts = blogData.posts || [];
    
    // Calculate blog statistics
    const totalViews = posts.reduce((sum: number, post: any) => sum + (post.views || 0), 0);
    const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0);
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.comments || 0), 0);
    const totalShares = posts.reduce((sum: number, post: any) => sum + (post.shares || 0), 0);
    
    // Generate time series data (mock data for demo)
    const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        posts: Math.floor(Math.random() * 5) + 1,
        views: Math.floor(Math.random() * 500) + 100,
        comments: Math.floor(Math.random() * 20) + 5,
        likes: Math.floor(Math.random() * 50) + 10,
      };
    });

    // Process category statistics
    const categoryStats = (categoryData.categories || []).map((cat: any) => ({
      name: cat.name,
      postCount: posts.filter((p: any) => p.category === cat.name).length,
      views: posts
        .filter((p: any) => p.category === cat.name)
        .reduce((sum: number, p: any) => sum + (p.views || 0), 0),
      engagement: posts
        .filter((p: any) => p.category === cat.name)
        .reduce((sum: number, p: any) => sum + (p.likes || 0) + (p.comments || 0), 0),
    }));

    // Top performing posts
    const topPerformingPosts = posts
      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map((post: any) => ({
        title: post.title,
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post.comments || 0,
        category: post.category,
        publishedAt: post.publishedAt || post.createdAt,
      }));

    return {
      blogStats: {
        totalPosts: posts.length,
        publishedPosts: posts.filter((p: any) => p.status === 'published').length,
        draftPosts: posts.filter((p: any) => p.status === 'draft').length,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagement: posts.length > 0 ? Math.round((totalLikes + totalComments) / posts.length) : 0,
      },
      commentStats: commentData.stats || {
        total: { pending: 0, approved: 0, rejected: 0, spam: 0 },
        recent: [],
        topPosts: [],
      },
      categoryStats,
      timeSeriesData,
      topPerformingPosts,
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    toast({
      title: "Analytics Refreshed",
      description: "Analytics data has been updated successfully.",
    });
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8">
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into blog performance and engagement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.blogStats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.blogStats.publishedPosts} published, {analyticsData.blogStats.draftPosts} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.blogStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.blogStats.totalLikes + analyticsData.blogStats.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.blogStats.totalLikes} likes, {analyticsData.blogStats.totalComments} comments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.blogStats.avgEngagement}</div>
            <p className="text-xs text-muted-foreground">
              per post
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Views, likes, and comments trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="likes" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="comments" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Posts and engagement by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="postCount" fill="#8884d8" />
                <Bar dataKey="engagement" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comment Moderation Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comment Moderation</CardTitle>
            <CardDescription>Status distribution of comments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Pending: {analyticsData.commentStats.total.pending}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Approved: {analyticsData.commentStats.total.approved}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Rejected: {analyticsData.commentStats.total.rejected}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Spam: {analyticsData.commentStats.total.spam}</span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pending', value: analyticsData.commentStats.total.pending },
                      { name: 'Approved', value: analyticsData.commentStats.total.approved },
                      { name: 'Rejected', value: analyticsData.commentStats.total.rejected },
                      { name: 'Spam', value: analyticsData.commentStats.total.spam },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {[
                      { name: 'Pending', value: analyticsData.commentStats.total.pending },
                      { name: 'Approved', value: analyticsData.commentStats.total.approved },
                      { name: 'Rejected', value: analyticsData.commentStats.total.rejected },
                      { name: 'Spam', value: analyticsData.commentStats.total.spam },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Posts with highest engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topPerformingPosts.slice(0, 5).map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Content Distribution</CardTitle>
          <CardDescription>View count and engagement by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData.categoryStats} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#8884d8" />
              <Bar dataKey="engagement" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}