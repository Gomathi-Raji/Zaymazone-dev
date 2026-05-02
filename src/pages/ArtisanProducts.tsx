import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';
import { VideoManager } from '@/components/VideoManager';
import { useToast } from '@/hooks/use-toast';
import { useSellerProducts } from '@/hooks/useSeller';
import { sellerService } from '@/services/sellerService';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Search, RefreshCw } from 'lucide-react';

const ArtisanProducts = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    subcategory: '',
    materials: '',
    dimensions: '',
    weight: '',
    colors: '',
    tags: '',
    shippingTime: '',
    isHandmade: true,
    images: [],
    videos: []
  });
  const { toast } = useToast();
  const { products, pagination, loading, error } = useSellerProducts(page);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({ title: 'Validation Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        materials: formData.materials ? formData.materials.split(',').map(m => m.trim()).filter(m => m) : [],
        dimensions: formData.dimensions || undefined,
        weight: formData.weight || undefined,
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        isHandmade: formData.isHandmade,
        shippingTime: formData.shippingTime || undefined,
        images: formData.images,
        videos: formData.videos
      };
      if (editingId) {
        await sellerService.updateProduct(editingId, productData);
        toast({ title: 'Success', description: 'Product updated successfully' });
      } else {
        await sellerService.createProduct(productData);
        toast({ title: 'Success', description: 'Product created and sent for approval' });
      }
      setIsModalOpen(false);
      resetForm();
      setPage(1);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      stock: product.stock.toString(),
      category: product.category,
      subcategory: product.subcategory || '',
      materials: product.materials?.join(', ') || '',
      dimensions: product.dimensions || '',
      weight: product.weight || '',
      colors: product.colors?.join(', ') || '',
      tags: product.tags?.join(', ') || '',
      shippingTime: product.shippingTime || '',
      isHandmade: product.isHandmade !== false,
      images: product.images,
      videos: product.videos || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product?')) return;
    try {
      await sellerService.deleteProduct(productId);
      toast({ title: 'Success', description: 'Product deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      stock: '',
      category: '',
      subcategory: '',
      materials: '',
      dimensions: '',
      weight: '',
      colors: '',
      tags: '',
      shippingTime: '',
      isHandmade: true,
      images: [],
      videos: []
    });
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Product Management</h2>
            <p className="text-muted-foreground">Manage your craft products</p>
          </div>
          
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-destructive">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 flex items-center gap-2 border rounded px-3">
                  <Search className="w-4 h-4" />
                  <Input 
                    placeholder="Search..." 
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                    className="border-0" 
                  />
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetForm()} className="gap-2 bg-orange-600 hover:bg-orange-700">
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit' : 'Add'} Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">

                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Name *</Label>
                          <Input 
                            placeholder="Product name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Category *</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pottery">Pottery</SelectItem>
                              <SelectItem value="textiles">Textiles</SelectItem>
                              <SelectItem value="jewelry">Jewelry</SelectItem>
                              <SelectItem value="woodwork">Woodwork</SelectItem>
                              <SelectItem value="metalwork">Metalwork</SelectItem>
                              <SelectItem value="paintings">Paintings</SelectItem>
                              <SelectItem value="crafts">Crafts</SelectItem>
                              <SelectItem value="toys">Toys</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <Textarea 
                          placeholder="Product description" 
                          value={formData.description} 
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                          rows={3} 
                        />
                      </div>

                      {/* Product Details */}
                      <h3 className="text-lg font-semibold border-b pb-2">Product Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Subcategory</Label>
                          <Input 
                            placeholder="e.g., Vases, Tableware" 
                            value={formData.subcategory} 
                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} 
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Materials</Label>
                          <Input 
                            placeholder="e.g., Clay, Cotton, Wood (comma separated)" 
                            value={formData.materials} 
                            onChange={(e) => setFormData({ ...formData, materials: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Colors</Label>
                          <Input 
                            placeholder="e.g., Red, Blue, Green (comma separated)" 
                            value={formData.colors} 
                            onChange={(e) => setFormData({ ...formData, colors: e.target.value })} 
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Tags</Label>
                          <Input 
                            placeholder="e.g., handmade, traditional, eco-friendly (comma separated)" 
                            value={formData.tags} 
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })} 
                          />
                        </div>
                      </div>
                      
                      {/* Pricing & Inventory */}
                      <h3 className="text-lg font-semibold border-b pb-2">Pricing & Inventory</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Price *</Label>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            step="0.01" 
                            value={formData.price} 
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Original Price</Label>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            step="0.01" 
                            value={formData.originalPrice} 
                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} 
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Stock *</Label>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            value={formData.stock} 
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                          />
                        </div>
                      </div>

                      {/* Physical Properties */}
                      <h3 className="text-lg font-semibold border-b pb-2">Physical Properties</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Dimensions</Label>
                          <Input 
                            placeholder="e.g., 10x5x8 inches" 
                            value={formData.dimensions} 
                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} 
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Weight</Label>
                          <Input 
                            placeholder="e.g., 2.5 kg" 
                            value={formData.weight} 
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Shipping Time</Label>
                        <Input 
                          placeholder="e.g., 3-5 business days" 
                          value={formData.shippingTime} 
                          onChange={(e) => setFormData({ ...formData, shippingTime: e.target.value })} 
                        />
                      </div>

                      {/* Settings */}
                      <h3 className="text-lg font-semibold border-b pb-2">Settings</h3>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isHandmade"
                            checked={formData.isHandmade}
                            onChange={(e) => setFormData({ ...formData, isHandmade: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="isHandmade">Handmade</Label>
                        </div>
                      </div>
                      
                      {/* Product Images */}
                      <h3 className="text-lg font-semibold border-b pb-2">Product Images</h3>
                      <div>
                        <ImageUpload
                          images={formData.images}
                          onImagesChange={(images) => setFormData({ ...formData, images })}
                          maxImages={5}
                          category="products"
                        />
                      </div>

                      {/* Product Videos */}
                      <h3 className="text-lg font-semibold border-b pb-2">Product Videos</h3>
                      <div>
                        <VideoManager
                          videos={formData.videos}
                          onChange={(videos) => setFormData({ ...formData, videos })}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Products ({pagination?.total || 0})</CardTitle>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No products found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{formatPrice(p.price)}</TableCell>
                        <TableCell>
                          <Badge>{p.stock}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.approvalStatus === 'approved' ? 'default' : 'secondary'}>
                            {p.approvalStatus || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive" 
                              onClick={() => handleDelete(p._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtisanProducts;