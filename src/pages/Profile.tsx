import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  ShoppingBag, 
  Star,
  Edit,
  Save,
  Camera,
  Loader2,
  Check
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getImageUrl, api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    joinDate: "",
    avatar: ""
  });
  const [originalData, setOriginalData] = useState(userData);

  const [orders, setOrders] = useState<any[]>([]);

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    memberSince: ""
  });

  // Auto-save effect
  useEffect(() => {
    if (!isEditing || autoSaving) return;

    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Check if data has changed
    const hasChanged = 
      userData.name !== originalData.name ||
      userData.phone !== originalData.phone ||
      userData.location !== originalData.location;

    if (!hasChanged) return;

    setAutoSaveStatus('saving');

    // Debounce auto-save (wait 2 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaving(true);
        if (updateUserProfile) {
          await updateUserProfile({
            name: userData.name,
            phone: userData.phone,
            address: {
              city: userData.location.split(',')[0]?.trim() || "",
              state: userData.location.split(',')[1]?.trim() || "",
              street: "",
              zipCode: "",
              country: "India"
            }
          });
        }
        setOriginalData(userData);
        setAutoSaveStatus('saved');
        
        // Reset status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('idle');
        toast.error('Failed to auto-save profile');
      } finally {
        setAutoSaving(false);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [userData, isEditing, originalData, updateUserProfile, autoSaving]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user data from context
      const newUserData = {
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        location: user?.address ? `${user.address.city}, ${user.address.state}` : "",
        bio: "Art enthusiast and collector of traditional crafts.",
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
        avatar: user?.avatar || ""
      };
      setUserData(newUserData);
      setOriginalData(newUserData);

      // Load orders and wishlist
      const [ordersData, wishlistData] = await Promise.all([
        api.getUserOrders().catch(() => ({ orders: [] })),
        api.getWishlist().catch(() => [])
      ]);

      setOrders(ordersData.orders || []);
      // Ensure wishlistData is an array
      const wishlistItems = Array.isArray(wishlistData)
        ? wishlistData
        : (wishlistData && Array.isArray((wishlistData as any).products)
           ? (wishlistData as any).products
           : []);
      setWishlist(wishlistItems);

      // Calculate stats
      const totalSpent = (ordersData.orders || []).reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      setStats({
        totalOrders: ordersData.orders?.length || 0,
        totalSpent,
        wishlistItems: wishlistItems.length || 0,
        memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ""
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          name: userData.name,
          phone: userData.phone,
          address: {
            city: userData.location.split(',')[0]?.trim() || "",
            state: userData.location.split(',')[1]?.trim() || "",
            street: "",
            zipCode: "",
            country: "India"
          }
        });
      }
      setOriginalData(userData);
      setIsEditing(false);
      setAutoSaveStatus('idle');
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered": return <Badge variant="default">Delivered</Badge>;
      case "Shipped": return <Badge variant="secondary">Shipped</Badge>;
      case "Processing": return <Badge variant="outline">Processing</Badge>;
      default: return <Badge variant="destructive">Pending</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
            <p className="text-muted-foreground">You need to be logged in to access your profile</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing && autoSaveStatus === 'saving' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    )}
                    {isEditing && autoSaveStatus === 'saved' && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        <span>Saved</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Done
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={userData.avatar ? getImageUrl(userData.avatar) : getImageUrl('/assets/user-avatar.jpg')} />
                        <AvatarFallback>{userData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0" aria-label="Change profile picture">
                          <Camera className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{userData.name}</h3>
                      <p className="text-sm text-muted-foreground">Customer since {userData.joinDate}</p>
                      <Badge variant="secondary" className="mt-1">Verified Customer</Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={userData.name}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={userData.email}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={userData.phone}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={userData.location}
                        disabled={!isEditing}
                        onChange={(e) => setUserData({...userData, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">About Me</Label>
                    <Textarea 
                      id="bio" 
                      value={userData.bio}
                      disabled={!isEditing}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-semibold">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Spent</span>
                      <span className="font-semibold">₹{stats.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Wishlist Items</span>
                      <span className="font-semibold">{stats.wishlistItems}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-semibold">{stats.memberSince}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{userData.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{userData.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined {userData.joinDate}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your recent orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                      <p className="text-muted-foreground">Start shopping to see your orders here</p>
                    </div>
                  ) : (
                    orders.map((order: any) => (
                      <div key={order.id || order._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground">#{(order.id || order._id)?.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">₹{(order.total || 0).toLocaleString()}</p>
                            {getStatusBadge(order.status)}
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8 col-span-full">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : wishlist.length === 0 ? (
                    <div className="text-center py-8 col-span-full">
                      <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                      <p className="text-muted-foreground">Save items you love for later</p>
                    </div>
                  ) : (
                    wishlist.map((item: any) => (
                      <Card key={item.productId?._id || item.id || item._id} className="overflow-hidden">
                        <div className="aspect-square bg-muted">
                          <img 
                            src={getImageUrl(item.productId?.images?.[0] || item.image || '/placeholder.svg')} 
                            alt={item.productId?.name || item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-foreground mb-1">{item.productId?.name || item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">by {item.productId?.artisan?.name || item.artisan?.name || 'Unknown Artisan'}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">₹{(item.productId?.price || item.price || 0).toLocaleString()}</span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button size="sm">
                                <ShoppingBag className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Order updates</span>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>New product alerts</span>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Marketing emails</span>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-foreground mb-4">Security</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-foreground mb-4">Danger Zone</h3>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;