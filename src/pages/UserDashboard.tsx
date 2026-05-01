import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { api, getImageUrl } from "@/lib/api";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Edit2, 
  Eye,
  ShoppingBag,
  Calendar,
  Loader2,
  Check
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  _id: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      images: string[];
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
}

export default function UserDashboard() {
  const { user, updateUser, updateUserProfile, signOut } = useAuth();
  const { cart } = useCart();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India"
    }
  });
  const [originalProfileData, setOriginalProfileData] = useState(profileData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
    // start polling for orders every 30s
    const interval = setInterval(() => {
      if (user) loadUserData();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (selectedOrder) {
      const pollPaymentStatus = async () => {
        try {
          const result = await api.getPaymentStatus(selectedOrder._id);
          if (result.success) {
            setOrderPaymentStatus(result.payment.paymentStatus);
          }
        } catch (err) {
          console.error('Failed to poll payment status', err);
        }
      };
      pollPaymentStatus();
      const interval = setInterval(pollPaymentStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedOrder]);

  // keep local profileData in sync when user changes
  useEffect(() => {
    if (user) {
      const newProfileData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India"
        }
      };
      setProfileData(newProfileData);
      setOriginalProfileData(newProfileData);
    }
  }, [user]);

  // Auto-save effect for profile changes
  useEffect(() => {
    if (!editingProfile || autoSaving) return;

    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Check if data has changed
    const hasChanged = 
      profileData.name !== originalProfileData.name ||
      profileData.phone !== originalProfileData.phone ||
      profileData.address.street !== originalProfileData.address.street ||
      profileData.address.city !== originalProfileData.address.city ||
      profileData.address.state !== originalProfileData.address.state;

    if (!hasChanged) return;

    setAutoSaveStatus('saving');

    // Debounce auto-save (wait 2 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaving(true);
        if (updateUserProfile) {
          await updateUserProfile({
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address
          });
        }
        setOriginalProfileData(profileData);
        setAutoSaveStatus('saved');
        
        // Reset status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('idle');
        toast({
          title: 'Failed to auto-save profile',
          description: 'Please try saving manually',
          variant: 'destructive'
        });
      } finally {
        setAutoSaving(false);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [profileData, editingProfile, originalProfileData, updateUserProfile, autoSaving, toast]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load orders and wishlist
      const [ordersData, wishlistData] = await Promise.all([
        api.getUserOrders(),
        api.getWishlist().catch(() => []) // Wishlist might not exist
      ]);
      
      // Transform API orders to match local Order interface
      const transformedOrders: Order[] = (ordersData.orders || []).map((order: any) => ({
        _id: order.id,
        items: order.items.map((item: any) => ({
          product: {
            _id: item.productId,
            name: item.name,
            images: [item.image],
            price: item.price
          },
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: order.total,
        status: order.status,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus
      }));
      
      setOrders(transformedOrders);
      setWishlist(wishlistData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your account information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const uploadResult: any = await api.uploadImage(avatarFile);
        avatarUrl = uploadResult.url || uploadResult.data?.url || uploadResult.imageUrl || uploadResult["url"];
      }

      const payload: any = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
      };
      if (avatarUrl) payload.avatar = avatarUrl;

      // call AuthContext's updateUserProfile which persists to backend and updates context
      if (updateUserProfile) {
        await updateUserProfile(payload);
      } else {
        // fallback: update local user
        updateUser(profileData as any);
      }

      setAvatarFile(null);
      setEditingProfile(false);
      toast({ title: 'Profile updated', description: 'Your profile has been successfully updated' });
    } catch (err: any) {
      console.error('Profile update failed', err);
      toast({ title: 'Error updating profile', description: err?.message || 'Failed to update your profile', variant: 'destructive' });
    }
  };

  // removed dynamic helper; using updateUserProfile from AuthContext instead

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", text: "Pending" },
      confirmed: { variant: "default", text: "Confirmed" },
      shipped: { variant: "default", text: "Shipped" },
      delivered: { variant: "default", text: "Delivered" },
      cancelled: { variant: "destructive", text: "Cancelled" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.cancelOrder(orderId);
      toast({ title: 'Order cancelled', description: 'Your order was cancelled' });
      await loadUserData();
    } catch (err: any) {
      toast({ title: 'Cancel failed', description: err.message || 'Failed to cancel order', variant: 'destructive' });
    }
  };

  const handlePayNow = async (orderId: string) => {
    try {
      const result = await api.createPaymentOrder({ orderId });
      if (result.success && result.paymentOrder.paymentUrl) {
        window.location.href = result.paymentOrder.paymentUrl;
      } else {
        toast({ title: 'Payment failed', description: 'Could not create payment order', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to initiate payment', variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <p className="text-muted-foreground">You need to be logged in to access your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Manage your account, orders, and preferences
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cart Items</p>
                    <p className="text-2xl font-bold">{cart?.items.length || 0}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Wishlist Items</p>
                    <p className="text-2xl font-bold">{wishlist.length}</p>
                  </div>
                  <Heart className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full lg:w-auto grid-cols-3">
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                      <Button asChild>
                        <a href="/products">Browse Products</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium">Order #{order._id.slice(-8)}</p>
                              <p className="text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <p className="text-lg font-bold mt-1">₹{order.totalAmount.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.product._id} className="flex items-center gap-3">
                                <img 
                                  src={getImageUrl(item.product.images[0] || "/placeholder.svg")} 
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.product.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                              Payment: {order.paymentMethod.toUpperCase()}
                            </p>
                            <div className="flex items-center gap-2">
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              {order.paymentStatus === 'pending' && (
                                <Button size="sm" onClick={() => handlePayNow(order._id)}>
                                  Pay Now
                                </Button>
                              )}
                              {order.status !== 'cancelled' && (
                                <Button size="sm" variant="destructive" onClick={() => handleCancelOrder(order._id)}>
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Information
                    </div>
                    <div className="flex items-center gap-2">
                      {editingProfile && autoSaveStatus === 'saving' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      )}
                      {editingProfile && autoSaveStatus === 'saved' && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Check className="w-4 h-4" />
                          <span>Saved</span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProfile(!editingProfile)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        {editingProfile ? "Done" : "Edit"}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingProfile ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          />
                        </div>
                          <div>
                            <Label htmlFor="avatar">Profile Picture</Label>
                            <input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)}
                              className="block"
                              aria-label="Upload profile picture"
                            />
                            {avatarFile && (
                              <img src={URL.createObjectURL(avatarFile)} alt="preview" className="w-24 h-24 object-cover rounded mt-2" />
                            )}
                          </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                              id="street"
                              value={profileData.address.street}
                              onChange={(e) => setProfileData({
                                ...profileData, 
                                address: {...profileData.address, street: e.target.value}
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={profileData.address.city}
                              onChange={(e) => setProfileData({
                                ...profileData, 
                                address: {...profileData.address, city: e.target.value}
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={profileData.address.state}
                              onChange={(e) => setProfileData({
                                ...profileData, 
                                address: {...profileData.address, state: e.target.value}
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button type="submit">Save Changes</Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium">{profileData.phone || "Not provided"}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="text-sm text-muted-foreground">Address</p>
                              <p className="font-medium">
                                {profileData.address.street || "No address provided"}
                              </p>
                              {profileData.address.city && (
                                <p className="text-sm text-muted-foreground">
                                  {profileData.address.city}, {profileData.address.state}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button variant="destructive" onClick={signOut}>
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    My Wishlist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                      <p className="text-muted-foreground mb-4">Save items you love for later</p>
                      <Button asChild>
                        <a href="/products">Explore Products</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <img 
                            src={getImageUrl(item.image)} 
                            alt={item.name}
                            className="w-full h-48 object-cover rounded mb-3"
                          />
                          <h3 className="font-medium mb-2">{item.name}</h3>
                          <p className="text-lg font-bold text-primary mb-3">₹{item.price.toLocaleString()}</p>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">Add to Cart</Button>
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View detailed information about your order including items, status, and payment information.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Payment Status:</strong> {orderPaymentStatus || 'Loading...'}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Total:</strong> ₹{selectedOrder.totalAmount.toLocaleString()}</p>
                <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium">Items:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-3">
                      <img 
                        src={getImageUrl(item.product.images[0] || "/placeholder.svg")} 
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}