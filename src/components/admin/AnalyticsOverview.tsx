import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

export function AnalyticsOverview() {
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
    
    // Set up real-time polling every 60 seconds for analytics
    const interval = setInterval(() => {
      loadAnalyticsData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [salesResponse, categoryResponse, topProductsResponse] = await Promise.all([
        adminService.getSalesAnalytics(),
        adminService.getCategoryAnalytics(),
        adminService.getTopProducts()
      ]);

      // Process sales data
      if (salesResponse && salesResponse.data) {
        setSalesData(salesResponse.data);
      } else {
        // Fallback to mock data if API doesn't return data
        setSalesData([
          { month: 'Jan', sales: 45000, orders: 156 },
          { month: 'Feb', sales: 52000, orders: 189 },
          { month: 'Mar', sales: 48000, orders: 167 },
          { month: 'Apr', sales: 61000, orders: 203 },
          { month: 'May', sales: 55000, orders: 178 },
          { month: 'Jun', sales: 67000, orders: 234 },
        ]);
      }

      setCategoryData(categoryResponse);
      setTopProducts(topProductsResponse);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
      
      // Set fallback data
      setSalesData([
        { month: 'Jan', sales: 45000, orders: 156 },
        { month: 'Feb', sales: 52000, orders: 189 },
        { month: 'Mar', sales: 48000, orders: 167 },
        { month: 'Apr', sales: 61000, orders: 203 },
        { month: 'May', sales: 55000, orders: 178 },
        { month: 'Jun', sales: 67000, orders: 234 },
      ]);
      setCategoryData([
        { name: 'Pottery', value: 35, color: '#8884d8' },
        { name: 'Textiles', value: 28, color: '#82ca9d' },
        { name: 'Metal Crafts', value: 20, color: '#ffc658' },
        { name: 'Wood Work', value: 17, color: '#ff7300' },
      ]);
      setTopProducts([
        { name: 'Blue Pottery Tea Set', sales: 89 },
        { name: 'Kashmiri Shawl', sales: 76 },
        { name: 'Dhokra Elephant', sales: 64 },
        { name: 'Copper Bottle', sales: 58 },
        { name: 'Jute Bag', sales: 45 },
      ]);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Monthly sales and order volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Sales by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling items this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}