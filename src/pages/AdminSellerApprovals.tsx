import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { DocumentPreview } from '@/components/admin/DocumentPreview';
import { 
  Plus, 
  Eye, 
  Check, 
  X, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  User,
  Building2,
  Phone,
  Truck,
  FileText,
  ZoomIn
} from 'lucide-react';

interface SellerApplication {
  _id: string;
  name: string;
  bio?: string;
  experience?: number;
  businessInfo: {
    businessName: string;
    sellerType: string;
    gstNumber?: string;
    panNumber?: string;
    contact: {
      email: string;
      phone: string;
      address?: {
        village?: string;
        district?: string;
        state?: string;
        pincode?: string;
      };
    };
  };
  location: {
    city: string;
    state: string;
    country?: string;
  };
  specialties: string[];
  productInfo?: {
    description: string;
    materials: string[];
    priceRange: {
      min: number;
      max: number;
    };
    photos: string[];
  };
  documents?: {
    gstCertificate?: string;
    aadhaarProof?: string;
    craftVideo?: string;
  };
  logistics?: {
    pickupAddress?: {
      sameAsMain?: boolean;
      address?: string;
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    dispatchTime?: string;
    packagingType?: string;
  };
  payment?: {
    upiId?: string;
    paymentFrequency?: string;
    bankDetails?: {
      accountNumber?: string;
      ifscCode?: string;
      accountHolderName?: string;
      bankName?: string;
    };
  };
  avatar?: string;
  verification?: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  userId: {
    name: string;
    email: string;
  };
}

interface ApprovalModalData {
  type: 'approve' | 'reject';
  application: SellerApplication | null;
  notes: string;
  rejectionReason: string;
}

interface Pagination {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function AdminSellerApprovals() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [previewDocument, setPreviewDocument] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [documentVerification, setDocumentVerification] = useState({
    profilePhoto: false,
    gstCertificate: false,
    aadhaarProof: false,
    craftVideo: false,
    productPhotos: false,
    bankDetails: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [modalData, setModalData] = useState<ApprovalModalData>({
    type: 'approve',
    application: null,
    notes: '',
    rejectionReason: ''
  });

  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/sellers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.sellers);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load seller applications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleViewDetails = (application: SellerApplication) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleApprove = (application: SellerApplication) => {
    setModalData({
      type: 'approve',
      application,
      notes: '',
      rejectionReason: ''
    });
    setIsModalOpen(true);
  };

  const handleReject = (application: SellerApplication) => {
    setModalData({
      type: 'reject',
      application,
      notes: '',
      rejectionReason: ''
    });
    setIsModalOpen(true);
  };

  const submitApprovalAction = async () => {
    if (!modalData.application) return;

    if (modalData.type === 'reject' && !modalData.rejectionReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Rejection reason is required',
        variant: 'destructive'
      });
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const endpoint = modalData.type === 'approve' ? 'approve' : 'reject';
      
      const body = modalData.type === 'approve' 
        ? { 
            approvalNotes: modalData.notes,
            documentVerification: documentVerification
          }
        : { rejectionReason: modalData.rejectionReason, approvalNotes: modalData.notes };

      const response = await fetch(`/api/admin/sellers/${modalData.application._id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Application ${modalData.type === 'approve' ? 'approved' : 'rejected'} successfully`
        });
        setIsModalOpen(false);
        fetchApplications();
        resetModalData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${modalData.type} application`);
      }
    } catch (error) {
      console.error('Approval action error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${modalData.type} application`,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const resetModalData = () => {
    setModalData({
      type: 'approve',
      application: null,
      notes: '',
      rejectionReason: ''
    });
    setSelectedApplication(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Seller Applications</h2>
          <p className="text-muted-foreground">Review and approve seller onboarding applications</p>
        </div>
        <Button variant="outline" onClick={fetchApplications} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Applications ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No applications found
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller Details</TableHead>
                  <TableHead>Business Info</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.name}</p>
                        <p className="text-sm text-muted-foreground">{application.userId.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.businessInfo.businessName}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.businessInfo.sellerType?.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {application.businessInfo.contact.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm">
                          {application.location.city}, {application.location.state}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {application.specialties.slice(0, 2).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {application.specialties.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(application.approvalStatus)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(application.approvalStatus)}
                          {application.approvalStatus.charAt(0).toUpperCase() + application.approvalStatus.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(application)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {application.approvalStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(application)}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-600"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(application)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details & Actions Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedApplication && !modalData.application
                ? 'Application Details'
                : modalData.type === 'approve'
                ? 'Approve Application'
                : 'Reject Application'
              }
            </DialogTitle>
            <DialogDescription>
              {selectedApplication && !modalData.application
                ? 'View complete seller application details'
                : modalData.type === 'approve'
                ? 'Review and approve this seller application'
                : 'Provide a reason for rejecting this application'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Application Details View */}
          {selectedApplication && !modalData.application && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedApplication.name}</p>
                    <p><strong>Email:</strong> {selectedApplication.userId.email}</p>
                    <p><strong>Bio:</strong> {selectedApplication.bio || 'N/A'}</p>
                    <p><strong>Experience:</strong> {selectedApplication.experience || 0} years</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Business Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Business Name:</strong> {selectedApplication.businessInfo.businessName}</p>
                    <p><strong>Seller Type:</strong> {selectedApplication.businessInfo.sellerType?.toUpperCase()}</p>
                    {selectedApplication.businessInfo.gstNumber && (
                      <p><strong>GST Number:</strong> {selectedApplication.businessInfo.gstNumber}</p>
                    )}
                    {selectedApplication.businessInfo.panNumber && (
                      <p><strong>PAN Number:</strong> {selectedApplication.businessInfo.panNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 text-sm">
                    <p><strong>Phone:</strong> {selectedApplication.businessInfo.contact.phone}</p>
                    <p><strong>Business Email:</strong> {selectedApplication.businessInfo.contact.email}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong></p>
                    <p className="ml-2">
                      {selectedApplication.businessInfo.contact.address?.village || 'N/A'}<br />
                      {selectedApplication.businessInfo.contact.address?.district && `${selectedApplication.businessInfo.contact.address.district}, `}
                      {selectedApplication.businessInfo.contact.address?.state}<br />
                      {selectedApplication.businessInfo.contact.address?.pincode && `PIN: ${selectedApplication.businessInfo.contact.address.pincode}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location & Specialties
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 text-sm">
                    <p><strong>City:</strong> {selectedApplication.location.city}</p>
                    <p><strong>State:</strong> {selectedApplication.location.state}</p>
                    <p><strong>Country:</strong> {selectedApplication.location.country || 'India'}</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2 text-sm">Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics Information */}
              {selectedApplication.logistics && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Logistics Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Pickup Address Same as Main:</strong> {selectedApplication.logistics.pickupAddress?.sameAsMain ? 'Yes' : 'No'}</p>
                    {!selectedApplication.logistics.pickupAddress?.sameAsMain && selectedApplication.logistics.pickupAddress?.address && (
                      <p><strong>Pickup Address:</strong> {selectedApplication.logistics.pickupAddress.address}</p>
                    )}
                    <p><strong>Dispatch Time:</strong> {selectedApplication.logistics.dispatchTime || 'N/A'}</p>
                    <p><strong>Packaging Type:</strong> {selectedApplication.logistics.packagingType || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Product Information */}
              {selectedApplication.productInfo && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Product Information</h3>
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={documentVerification.productPhotos}
                        onChange={(e) => setDocumentVerification({
                          ...documentVerification,
                          productPhotos: e.target.checked
                        })}
                        className="form-checkbox"
                      />
                      <span className={documentVerification.productPhotos ? "text-green-600 font-medium" : "text-gray-600"}>
                        {documentVerification.productPhotos ? "✓ Photos Verified" : "Photos Not Verified"}
                      </span>
                    </label>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Description:</strong> {selectedApplication.productInfo.description}</p>
                    <p><strong>Price Range:</strong> ₹{selectedApplication.productInfo.priceRange.min} - ₹{selectedApplication.productInfo.priceRange.max}</p>
                    {selectedApplication.productInfo.materials && selectedApplication.productInfo.materials.length > 0 && (
                      <div>
                        <strong>Materials:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedApplication.productInfo.materials.map((material, index) => (
                            <Badge key={index} variant="secondary">{material}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedApplication.productInfo.photos && selectedApplication.productInfo.photos.length > 0 && (
                      <div>
                        <strong>Product Photos:</strong>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {selectedApplication.productInfo.photos.map((photo, index) => (
                            <div 
                              key={index}
                              className="relative group cursor-pointer"
                              onClick={() => setPreviewDocument({ url: photo, type: 'image' })}
                            >
                              <img 
                                src={photo} 
                                alt={`Product ${index + 1}`} 
                                className="w-full h-32 object-cover rounded border hover:opacity-80 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center rounded">
                                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedApplication.documents && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Submitted Documents</h3>
                  <div className="space-y-4">
                    {selectedApplication.documents.gstCertificate && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm">GST Certificate:</strong>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={documentVerification.gstCertificate}
                                onChange={(e) => setDocumentVerification({
                                  ...documentVerification,
                                  gstCertificate: e.target.checked
                                })}
                                className="form-checkbox"
                              />
                              <span className={documentVerification.gstCertificate ? "text-green-600 font-medium" : "text-gray-600"}>
                                {documentVerification.gstCertificate ? "✓ Verified" : "Not Verified"}
                              </span>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewDocument({ url: selectedApplication.documents.gstCertificate!, type: 'image' })}
                              className="flex items-center gap-1"
                            >
                              <ZoomIn className="w-4 h-4" />
                              Preview
                            </Button>
                            <a 
                              href={selectedApplication.documents?.gstCertificate} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" />
                              Open Full Size
                            </a>
                          </div>
                        </div>
                        {selectedApplication.documents.gstCertificate.startsWith('data:image') ? (
                          <img 
                            src={selectedApplication.documents.gstCertificate} 
                            alt="GST Certificate" 
                            className="w-full max-h-64 object-contain rounded border bg-white"
                          />
                        ) : (
                          <iframe 
                            src={selectedApplication.documents.gstCertificate} 
                            className="w-full h-64 rounded border bg-white"
                            title="GST Certificate"
                          />
                        )}
                      </div>
                    )}
                    {selectedApplication.documents.aadhaarProof && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm">Aadhaar Proof:</strong>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={documentVerification.aadhaarProof}
                                onChange={(e) => setDocumentVerification({
                                  ...documentVerification,
                                  aadhaarProof: e.target.checked
                                })}
                                className="form-checkbox"
                              />
                              <span className={documentVerification.aadhaarProof ? "text-green-600 font-medium" : "text-gray-600"}>
                                {documentVerification.aadhaarProof ? "✓ Verified" : "Not Verified"}
                              </span>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewDocument({ url: selectedApplication.documents.aadhaarProof!, type: 'image' })}
                              className="flex items-center gap-1"
                            >
                              <ZoomIn className="w-4 h-4" />
                              Preview
                            </Button>
                            <a 
                              href={selectedApplication.documents?.aadhaarProof} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" />
                              Open Full Size
                            </a>
                          </div>
                        </div>
                        {selectedApplication.documents.aadhaarProof.startsWith('data:image') ? (
                          <img 
                            src={selectedApplication.documents.aadhaarProof} 
                            alt="Aadhaar Proof" 
                            className="w-full max-h-64 object-contain rounded border bg-white"
                          />
                        ) : (
                          <iframe 
                            src={selectedApplication.documents.aadhaarProof} 
                            className="w-full h-64 rounded border bg-white"
                            title="Aadhaar Proof"
                          />
                        )}
                      </div>
                    )}
                    {selectedApplication.documents.craftVideo && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm">Craft Video:</strong>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={documentVerification.craftVideo}
                                onChange={(e) => setDocumentVerification({
                                  ...documentVerification,
                                  craftVideo: e.target.checked
                                })}
                                className="form-checkbox"
                              />
                              <span className={documentVerification.craftVideo ? "text-green-600 font-medium" : "text-gray-600"}>
                                {documentVerification.craftVideo ? "✓ Verified" : "Not Verified"}
                              </span>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewDocument({ url: selectedApplication.documents.craftVideo!, type: 'video' })}
                              className="flex items-center gap-1"
                            >
                              <ZoomIn className="w-4 h-4" />
                              Preview
                            </Button>
                            <a 
                              href={selectedApplication.documents?.craftVideo} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" />
                              Open Full Size
                            </a>
                          </div>
                        </div>
                        <video 
                          src={selectedApplication.documents.craftVideo} 
                          controls 
                          className="w-full max-h-64 rounded border bg-black"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    {selectedApplication.avatar && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm">Profile Photo:</strong>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={documentVerification.profilePhoto}
                                onChange={(e) => setDocumentVerification({
                                  ...documentVerification,
                                  profilePhoto: e.target.checked
                                })}
                                className="form-checkbox"
                              />
                              <span className={documentVerification.profilePhoto ? "text-green-600 font-medium" : "text-gray-600"}>
                                {documentVerification.profilePhoto ? "✓ Verified" : "Not Verified"}
                              </span>
                            </label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewDocument({ url: selectedApplication.avatar!, type: 'image' })}
                            className="flex items-center gap-1"
                          >
                            <ZoomIn className="w-4 h-4" />
                            Preview
                          </Button>
                        </div>
                        <img 
                          src={selectedApplication.avatar} 
                          alt="Profile" 
                          className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Logistics Information */}
              {selectedApplication.logistics && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Logistics & Shipping</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Pickup Address:</strong>
                      <p className="ml-4 mt-1">
                        {selectedApplication.logistics.pickupAddress?.street}<br />
                        {selectedApplication.logistics.pickupAddress?.city}, {selectedApplication.logistics.pickupAddress?.state}<br />
                        PIN: {selectedApplication.logistics.pickupAddress?.pincode}
                      </p>
                    </div>
                    <p><strong>Dispatch Time:</strong> {selectedApplication.logistics.dispatchTime}</p>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {selectedApplication.payment && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Payment Details
                    </h3>
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={documentVerification.bankDetails}
                        onChange={(e) => setDocumentVerification({
                          ...documentVerification,
                          bankDetails: e.target.checked
                        })}
                        className="form-checkbox"
                      />
                      <span className={documentVerification.bankDetails ? "text-green-600 font-medium" : "text-gray-600"}>
                        {documentVerification.bankDetails ? "✓ Bank Details Verified" : "Not Verified"}
                      </span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 text-sm">
                      {selectedApplication.payment.upiId && (
                        <p><strong>UPI ID:</strong> {selectedApplication.payment.upiId}</p>
                      )}
                      {selectedApplication.payment.paymentFrequency && (
                        <p><strong>Payment Frequency:</strong> {selectedApplication.payment.paymentFrequency}</p>
                      )}
                    </div>
                    {selectedApplication.payment.bankDetails && (
                      <div className="space-y-2 text-sm">
                        <strong>Bank Account Details:</strong>
                        <div className="ml-2 mt-1 space-y-1">
                          {selectedApplication.payment.bankDetails.accountHolderName && (
                            <p>Account Holder: {selectedApplication.payment.bankDetails.accountHolderName}</p>
                          )}
                          {selectedApplication.payment.bankDetails.accountNumber && (
                            <p>Account Number: {selectedApplication.payment.bankDetails.accountNumber}</p>
                          )}
                          {selectedApplication.payment.bankDetails.ifscCode && (
                            <p>IFSC Code: {selectedApplication.payment.bankDetails.ifscCode}</p>
                          )}
                          {selectedApplication.payment.bankDetails.bankName && (
                            <p>Bank Name: {selectedApplication.payment.bankDetails.bankName}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Status */}
              {selectedApplication.verification && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Verification Status</h3>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {selectedApplication.verification.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Email {selectedApplication.verification.emailVerified ? 'Verified' : 'Not Verified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedApplication.verification.phoneVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>Phone {selectedApplication.verification.phoneVerified ? 'Verified' : 'Not Verified'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setSelectedApplication(null);
                    handleApprove(selectedApplication);
                  }}
                  disabled={selectedApplication.approvalStatus !== 'pending'}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedApplication(null);
                    handleReject(selectedApplication);
                  }}
                  disabled={selectedApplication.approvalStatus !== 'pending'}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Approval/Rejection Form */}
          {modalData.application && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You are about to {modalData.type} the application from{' '}
                  <strong>{modalData.application.name}</strong> for{' '}
                  <strong>{modalData.application.businessInfo.businessName}</strong>.
                </AlertDescription>
              </Alert>

              {modalData.type === 'reject' && (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    value={modalData.rejectionReason}
                    onChange={(e) => setModalData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                    placeholder="Please provide a clear reason for rejection..."
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={modalData.notes}
                  onChange={(e) => setModalData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes for the seller..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetModalData();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitApprovalAction}
                  disabled={actionLoading}
                  variant={modalData.type === 'approve' ? 'default' : 'destructive'}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {modalData.type === 'approve' ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                      {modalData.type === 'approve' ? 'Approve' : 'Reject'} Application
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          url={previewDocument.url}
          type={previewDocument.type}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}