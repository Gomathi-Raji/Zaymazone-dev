import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin, 
  CreditCard,
  Eye,
  RefreshCw,
  Loader2,
  Calendar,
  IndianRupee
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, getImageUrl } from "@/lib/api";
import type { Order } from "@/lib/api";

export default function Orders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to view your orders",
        variant: "destructive"
      });
      navigate('/sign-in');
    }
  }, [isAuthenticated, navigate, toast]);

  const fetchOrders = async (page = 1) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await api.getUserOrders({ page, limit: pagination.limit });
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading orders",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'packed':
        return <Package className="w-4 h-4 text-orange-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'out_for_delivery':
        return <MapPin className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'returned':
        return <RefreshCw className="w-4 h-4 text-yellow-500" />;
      case 'refunded':
        return <IndianRupee className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'packed':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return !['delivered', 'cancelled', 'returned', 'refunded'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    if (activeTab === 'cancelled') return ['cancelled', 'returned', 'refunded'].includes(order.status);
    return true;
  });

  const handleViewOrder = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.cancelOrder(orderId);
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully"
      });
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error cancelling order",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>

          {/* Order Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No orders found</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      {activeTab === 'all' 
                        ? "You haven't placed any orders yet"
                        : `No ${activeTab} orders found`
                      }
                    </p>
                    <Button onClick={() => navigate('/products')}>
                      Start Shopping
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id || order._id}>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              Order #{order.orderNumber}
                              {getStatusIcon(order.status)}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {order.items.length} item{order.items.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">
                              ₹{order.total.toLocaleString()}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {/* Order Items */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex gap-3">
                              <img 
                                src={getImageUrl(item.image || "/placeholder.svg")} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                <p className="text-sm font-medium">₹{item.price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex items-center justify-center bg-muted rounded-md">
                              <span className="text-sm text-muted-foreground">
                                +{order.items.length - 3} more
                              </span>
                            </div>
                          )}
                        </div>

                        <Separator className="my-4" />

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-muted-foreground mb-1">Payment Method</div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4" />
                              {order.paymentMethod.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-muted-foreground mb-1">Shipping Address</div>
                            <div className="flex items-start gap-1">
                              <MapPin className="w-4 h-4 mt-0.5" />
                              <div>
                                {order.shippingAddress.fullName}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state}
                              </div>
                            </div>
                          </div>
                          {order.trackingNumber && (
                            <div>
                              <div className="font-medium text-muted-foreground mb-1">Tracking</div>
                              <div className="flex items-center gap-1">
                                <Truck className="w-4 h-4" />
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                  {order.trackingNumber}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewOrder(order.id || order._id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          
                          {['placed', 'confirmed'].includes(order.status) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancelOrder(order.id || order._id)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Order
                            </Button>
                          )}

                          {order.status === 'delivered' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/review/${order.id || order._id}`)}
                            >
                              Write Review
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}