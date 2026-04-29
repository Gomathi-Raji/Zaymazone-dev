import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Store,
  Package,
  Truck,
  CreditCard,
  Edit,
  Save,
  X,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Building,
  Hash,
  IdCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface ArtisanProfile {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  profilePic: string;
  shopName: string;
  sellerType: 'gst' | 'non-gst';
  village: string;
  district: string;
  state: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  productCategories: string[];
  productDescription: string;
  materials: string;
  priceRange: { min: number; max: number };
  stockQuantity: number;
  productPhotos: string[];
  shippingDetails: {
    pickupAddress?: {
      sameAsMain?: boolean;
      address?: string;
      street?: string;
      city?: string;
    };
    dispatchTime: string;
    packagingType: string;
  };
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId: string;
  paymentFrequency: string;
  bio: string;
  experience: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  stats: {
    totalProducts: number;
    totalSales: number;
    averageRating: number;
    totalReviews: number;
  };
  pendingChanges?: {
    hasChanges: boolean;
    changedAt?: string;
    changedFields: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const ArtisanProfileView = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Editable fields only
  const [editData, setEditData] = useState({
    profilePic: '',
    mobileNumber: '',
    email: '',
    shippingDetails: {
      pickupAddress: { sameAsMain: true, address: '' },
      dispatchTime: '',
      packagingType: ''
    }
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/artisans/profile', {
        method: 'GET',
        auth: true
      }) as ArtisanProfile;
      
      setProfile(response);
      
      // Initialize editable fields
      setEditData({
        profilePic: response.profilePic || '',
        mobileNumber: response.mobileNumber || '',
        email: response.email || '',
        shippingDetails: response.shippingDetails || {
          pickupAddress: { sameAsMain: true, address: '' },
          dispatchTime: '',
          packagingType: ''
        }
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      loadProfile();
      return;
    }

    setLoading(false);
  }, [user, loadProfile]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await apiRequest('/api/artisans/profile', {
        method: 'PUT',
        body: editData,
        auth: true
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">Profile Not Found</p>
            <p className="text-muted-foreground">Please complete your artisan registration first.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recent Changes Info - Visible to admin in dashboard */}
        {profile.pendingChanges?.hasChanges && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Profile Updated Successfully
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  Your changes have been saved. Admin will be notified of the updates.
                </p>
                {profile.pendingChanges.changedAt && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Last updated: {new Date(profile.pendingChanges.changedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={editing ? editData.profilePic : profile.profilePic} alt={profile.fullName} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  onClick={() => {
                    // In a real app, this would open a file picker
                    const url = prompt('Enter profile picture URL:');
                    if (url) setEditData({ ...editData, profilePic: url });
                  }}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{profile.fullName}</h1>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-muted-foreground">{profile.shopName}</p>
                {getStatusBadge(profile.approvalStatus)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.village}, {profile.district}, {profile.state} - {profile.pincode}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  // Reset edit data
                  setEditData({
                    profilePic: profile.profilePic || '',
                    mobileNumber: profile.mobileNumber || '',
                    email: profile.email || '',
                    shippingDetails: profile.shippingDetails || {
                      pickupAddress: { sameAsMain: true, address: '' },
                      dispatchTime: '',
                      packagingType: ''
                    }
                  });
                }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{profile.stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">₹{profile.stats.totalSales.toLocaleString()}</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{profile.stats.averageRating.toFixed(1)}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reviews</p>
                  <p className="text-2xl font-bold">{profile.stats.totalReviews}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="business">Business Details</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="banking">Banking</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">Full Name</Label>
                    <p className="text-base font-medium">{profile.fullName}</p>
                    <Badge variant="outline" className="mt-1">Non-Editable</Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">Email Address</Label>
                    {editing ? (
                      <Input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <p className="text-base">{profile.email}</p>
                      </div>
                    )}
                    <Badge variant="secondary" className="mt-1">Editable</Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">Mobile Number</Label>
                    {editing ? (
                      <Input
                        type="tel"
                        value={editData.mobileNumber}
                        onChange={(e) => setEditData({ ...editData, mobileNumber: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        <p className="text-base">{profile.mobileNumber}</p>
                      </div>
                    )}
                    <Badge variant="secondary" className="mt-1">Editable</Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Address Details</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Village/Town</p>
                      <p className="text-base font-medium">{profile.village || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">District</p>
                      <p className="text-base font-medium">{profile.district || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="text-base font-medium">{profile.state || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pincode</p>
                      <p className="text-base font-medium">{profile.pincode || 'Not specified'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2">Non-Editable</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Details Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="w-5 h-5 mr-2" />
                  Business Information
                </CardTitle>
                <CardDescription>Your shop and business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Shop Name</Label>
                    <div className="flex items-center mt-1">
                      <Store className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="text-base font-medium">{profile.shopName}</p>
                    </div>
                    <Badge variant="outline" className="mt-1">Non-Editable</Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Seller Type</Label>
                    <div className="mt-1">
                      <Badge variant={profile.sellerType === 'gst' ? 'default' : 'secondary'}>
                        {profile.sellerType === 'gst' ? 'GST Registered' : 'Non-GST Seller'}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="mt-1">Non-Editable</Badge>
                  </div>
                </div>

                <Separator />

                {profile.sellerType === 'gst' ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      GST Registered Seller Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-1 block">GST Number</Label>
                        <div className="flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className="text-base font-mono">{profile.gstNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-1 block">PAN Number</Label>
                        <div className="flex items-center">
                          <IdCard className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className="text-base font-mono">{profile.panNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">Document images are not displayed for security reasons</p>
                    <Badge variant="outline" className="mt-2">Non-Editable</Badge>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Non-GST Seller Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-1 block">Aadhaar Number</Label>
                        <div className="flex items-center">
                          <IdCard className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className="text-base font-mono">{profile.aadhaarNumber || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-1 block">PAN Number</Label>
                        <div className="flex items-center">
                          <IdCard className="w-4 h-4 mr-2 text-muted-foreground" />
                          <p className="text-base font-mono">{profile.panNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">Document images are not displayed for security reasons</p>
                    <Badge variant="outline" className="mt-2">Non-Editable</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Product Details
                </CardTitle>
                <CardDescription>Your product categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Product Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.productCategories && profile.productCategories.length > 0 ? (
                      profile.productCategories.map((category, index) => (
                        <Badge key={index} variant="default">{category}</Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No categories specified</p>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-2">Non-Editable</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping & Delivery Details
                </CardTitle>
                <CardDescription>Manage your shipping preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="sameAsMain" className="text-sm font-medium text-muted-foreground mb-2 block">Pickup Address</Label>
                  {editing ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sameAsMain"
                          aria-label="Same as main address"
                          checked={editData.shippingDetails.pickupAddress.sameAsMain}
                          onChange={(e) => setEditData({
                            ...editData,
                            shippingDetails: {
                              ...editData.shippingDetails,
                              pickupAddress: {
                                ...editData.shippingDetails.pickupAddress,
                                sameAsMain: e.target.checked
                              }
                            }
                          })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="sameAsMain" className="cursor-pointer">Same as main address</Label>
                      </div>
                      {!editData.shippingDetails.pickupAddress.sameAsMain && (
                        <Textarea
                          value={editData.shippingDetails.pickupAddress.address}
                          onChange={(e) => setEditData({
                            ...editData,
                            shippingDetails: {
                              ...editData.shippingDetails,
                              pickupAddress: {
                                ...editData.shippingDetails.pickupAddress,
                                address: e.target.value
                              }
                            }
                          })}
                          placeholder="Enter pickup address"
                          rows={3}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-base">
                      {profile.shippingDetails.pickupAddress?.sameAsMain 
                        ? 'Same as main address' 
                        : profile.shippingDetails.pickupAddress?.address || 'Not specified'}
                    </p>
                  )}
                  <Badge variant="secondary" className="mt-2">Editable</Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Dispatch Time</Label>
                  {editing ? (
                    <Input
                      value={editData.shippingDetails.dispatchTime}
                      onChange={(e) => setEditData({
                        ...editData,
                        shippingDetails: {
                          ...editData.shippingDetails,
                          dispatchTime: e.target.value
                        }
                      })}
                      placeholder="e.g., 2-3 business days"
                    />
                  ) : (
                    <p className="text-base">{profile.shippingDetails.dispatchTime || 'Not specified'}</p>
                  )}
                  <Badge variant="secondary" className="mt-2">Editable</Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Packaging Type</Label>
                  {editing ? (
                    <Input
                      value={editData.shippingDetails.packagingType}
                      onChange={(e) => setEditData({
                        ...editData,
                        shippingDetails: {
                          ...editData.shippingDetails,
                          packagingType: e.target.value
                        }
                      })}
                      placeholder="e.g., Eco-friendly packaging"
                    />
                  ) : (
                    <p className="text-base">{profile.shippingDetails.packagingType || 'Not specified'}</p>
                  )}
                  <Badge variant="secondary" className="mt-2">Editable</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Banking Details
                </CardTitle>
                <CardDescription>Your payment and banking information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">Bank Name</Label>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="text-base">{profile.bankDetails.bankName || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">Account Number</Label>
                    <p className="text-base font-mono">
                      {profile.bankDetails.accountNumber 
                        ? `****${profile.bankDetails.accountNumber.slice(-4)}` 
                        : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">IFSC Code</Label>
                    <p className="text-base font-mono">{profile.bankDetails.ifscCode || 'Not provided'}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-1 block">UPI ID</Label>
                    <p className="text-base">{profile.upiId || 'Not provided'}</p>
                  </div>
                </div>

                <Badge variant="outline">All bank details are Non-Editable</Badge>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-1 block">Payment Frequency</Label>
                  <p className="text-base">{profile.paymentFrequency || 'Not specified'}</p>
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

export default ArtisanProfileView;
