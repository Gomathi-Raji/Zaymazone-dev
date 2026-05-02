import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Save } from "lucide-react";

interface SellerProfile {
  _id: string;
  businessName: string;
  description: string;
  avatar?: string;
  bannerImage?: string;
  isActive: boolean;
  totalProducts: number;
  totalSales: number;
}

export function SellerProfile() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    avatar: "",
    bannerImage: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const getToken = () => {
    return localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('firebase_id_token');
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('/api/seller/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      setProfile(data.profile);
      setFormData({
        businessName: data.profile.businessName || "",
        description: data.profile.description || "",
        avatar: data.profile.avatar || "",
        bannerImage: data.profile.bannerImage || ""
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.businessName) {
      toast({
        title: "Validation Error",
        description: "Business name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      const response = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile Management</h2>
        <p className="text-muted-foreground">Update your artisan profile information</p>
      </div>

      {/* Profile Status */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="mt-2" variant={profile.isActive ? "default" : "secondary"}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold mt-2">{profile.totalProducts}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold mt-2">₹{profile.totalSales.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your business information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name *</label>
            <Input
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="Enter your business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Business Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell customers about your business"
              className="min-h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Profile Avatar</label>
            <ImageUpload
              images={formData.avatar ? [formData.avatar] : []}
              onImagesChange={(images) => setFormData({ ...formData, avatar: images[0] || "" })}
              maxImages={1}
              singleMode
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banner Image</label>
            <ImageUpload
              images={formData.bannerImage ? [formData.bannerImage] : []}
              onImagesChange={(images) => setFormData({ ...formData, bannerImage: images[0] || "" })}
              maxImages={1}
              singleMode
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Avatar/Banner Preview */}
      {(formData.avatar || formData.bannerImage) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.avatar && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Avatar</p>
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </div>
            )}
            {formData.bannerImage && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Banner</p>
                <img
                  src={formData.bannerImage}
                  alt="Banner"
                  className="w-full h-32 rounded-lg object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
