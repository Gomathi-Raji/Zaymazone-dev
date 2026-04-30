import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { adminService } from '@/services/adminService'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from 'lucide-react'

interface OrderItem {
  product?: {
    _id?: string
    name?: string
    price?: number
    images?: string[]
  }
  quantity: number
  subtotal?: number
}

interface AdminOrder {
  _id: string
  orderNumber?: string
  items: OrderItem[]
  totalAmount: number
  status: string
  paymentStatus?: string
  paymentMethod?: string
  createdAt: string
  updatedAt?: string
  user?: {
    name?: string
    email?: string
    phone?: string
  }
  shippingAddress?: {
    name?: string
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
const BULK_STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
}

export function OrderManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<(typeof BULK_STATUS_OPTIONS)[number] | ''>('')
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { toast } = useToast()

  const loadOrders = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const data = await adminService.getOrders({
        page,
        limit: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm.trim() || undefined,
      })

      setOrders(data.orders || [])
      setPagination(data.pagination || { page, limit: pageSize, total: 0, pages: 0 })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      })
      setOrders([])
        setPagination({ page, limit: pageSize, total: 0, pages: 0 })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
    }, [page, pageSize, searchTerm, statusFilter, toast])

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      void loadOrders()
    }, 300)

    return () => window.clearTimeout(debounceTimer)
  }, [loadOrders])

  useEffect(() => {
    if (selectedOrder) {
      setSelectedStatus(selectedOrder.status)
    }
  }, [selectedOrder])

  const currentOrderIds = useMemo(() => orders.map((order) => order._id), [orders])

  const selectedVisibleCount = useMemo(
    () => currentOrderIds.filter((orderId) => selectedOrderIds.includes(orderId)).length,
    [currentOrderIds, selectedOrderIds]
  )

  const allVisibleSelected = orders.length > 0 && selectedVisibleCount === orders.length
  const hasPartialVisibleSelection = selectedVisibleCount > 0 && selectedVisibleCount < orders.length
  const bulkCheckboxState = allVisibleSelected ? true : hasPartialVisibleSelection ? 'indeterminate' : false

  const statusCounts = useMemo(() => {
    return orders.reduce((counts, order) => {
      const key = (order.status || 'pending').toLowerCase()
      counts[key] = (counts[key] || 0) + 1
      return counts
    }, { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 } as Record<string, number>)
  }, [orders])

  const summary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const totalOrders = pagination.total || orders.length
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      pageRevenue: totalRevenue,
      pageOrders: orders.length,
    }
  }, [orders, pagination.total])

  const getStatusVariant = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return 'default'
      case 'shipped': return 'secondary'
      case 'processing': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return <CheckCircle className="h-3 w-3" />
      case 'shipped': return <Truck className="h-3 w-3" />
      case 'processing': return <Package className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getNextStatus = (status: string) => NEXT_STATUS[(status || '').toLowerCase()] || null

  const clearBulkSelection = () => {
    setSelectedOrderIds([])
    setBulkStatus('')
  }

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((previous) => {
      if (checked) {
        return previous.includes(orderId) ? previous : [...previous, orderId]
      }

      return previous.filter((selectedId) => selectedId !== orderId)
    })
  }

  const handleVisibleSelection = (checked: boolean) => {
    setSelectedOrderIds((previous) => {
      const selection = new Set(previous)

      currentOrderIds.forEach((orderId) => {
        if (checked) {
          selection.add(orderId)
        } else {
          selection.delete(orderId)
        }
      })

      return Array.from(selection)
    })
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrderIds.length === 0) {
      return
    }

    setBulkUpdating(true)
    try {
      const results = await Promise.allSettled(
        selectedOrderIds.map((orderId) => adminService.updateOrderStatus(orderId, bulkStatus))
      )

      const successful = results.filter((result) => result.status === 'fulfilled').length
      const failed = results.length - successful

      if (successful > 0) {
        toast({
          title: failed > 0 ? 'Partial bulk update' : 'Bulk update successful',
          description: failed > 0
            ? `Updated ${successful} orders and ${failed} failed.`
            : `Updated ${successful} orders to ${bulkStatus}.`,
          variant: failed > 0 ? 'destructive' : 'default',
        })

        clearBulkSelection()
        await loadOrders('refresh')
      } else {
        toast({
          title: 'Bulk update failed',
          description: `Failed to update ${failed} orders.`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error performing bulk status update:', error)
      toast({
        title: 'Error',
        description: 'Failed to update selected orders',
        variant: 'destructive',
      })
    } finally {
      setBulkUpdating(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!newStatus) return

    setUpdatingOrderId(orderId)
    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus)

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      })

      setOrders(prev => prev.map(order => (
        order._id === orderId
          ? { ...order, status: response.order?.status || newStatus, updatedAt: response.order?.updatedAt || new Date().toISOString() }
          : order
      )))

      setSelectedOrder(prev => prev && prev._id === orderId
        ? { ...prev, status: response.order?.status || newStatus, updatedAt: response.order?.updatedAt || new Date().toISOString() }
        : prev
      )

      await loadOrders('refresh')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleRefresh = () => {
    void loadOrders('refresh')
  }

  const handleSearchChange = (value: string) => {
    setPage(1)
    setSearchTerm(value)
    clearBulkSelection()
  }

  const handleStatusFilterChange = (value: string) => {
    setPage(1)
    setStatusFilter(value as (typeof STATUS_OPTIONS)[number])
    clearBulkSelection()
  }

  const handlePageSizeChange = (value: string) => {
    setPage(1)
    setPageSize(Number(value) || 10)
    clearBulkSelection()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
          <p className="text-muted-foreground mt-1">Track orders, update fulfillment, and keep the store synced</p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-muted-foreground">
              Last synced: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing || loading}>
            {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {refreshing ? 'Syncing...' : 'Refresh'}
          </Button>
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Orders', value: summary.totalOrders, icon: Package, color: 'text-blue-600' },
          { label: 'Revenue', value: `₹${summary.totalRevenue.toLocaleString()}`, icon: Truck, color: 'text-green-600' },
          { label: 'Average Order Value', value: `₹${summary.averageOrderValue.toLocaleString()}`, icon: ArrowRight, color: 'text-purple-600' },
          { label: 'Delivered', value: statusCounts.delivered, icon: CheckCircle, color: 'text-emerald-600' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="border-dashed">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter orders across the marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_140px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search by order number or customer"
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setPage(1)
                setSearchTerm('')
                setStatusFilter('all')
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                {pagination.total} total orders • {orders.length} shown on this page
              </CardDescription>
            </div>
            {refreshing && (
              <Badge variant="secondary" className="gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Syncing
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedOrderIds.length > 0 && (
            <div className="mb-4 rounded-lg border bg-muted/40 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium">{selectedOrderIds.length} orders selected</p>
                  <p className="text-sm text-muted-foreground">
                    Bulk update the selected orders without leaving the live order screen.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as (typeof BULK_STATUS_OPTIONS)[number])}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Choose status" />
                    </SelectTrigger>
                    <SelectContent>
                      {BULK_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => void handleBulkStatusUpdate()}
                    disabled={!bulkStatus || bulkUpdating}
                  >
                    {bulkUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Apply to selected
                  </Button>

                  <Button variant="outline" onClick={clearBulkSelection} disabled={bulkUpdating}>
                    Clear selection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or check back when customers place new orders.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={bulkCheckboxState}
                        onCheckedChange={(checked) => handleVisibleSelection(checked === true)}
                        aria-label="Select visible orders"
                      />
                    </TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const nextStatus = getNextStatus(order.status)
                    const isSelected = selectedOrderIds.includes(order._id)
                    return (
                      <TableRow key={order._id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleOrderSelection(order._id, checked === true)}
                            aria-label={`Select order ${order.orderNumber || order._id.slice(-8)}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">#{order.orderNumber || order._id.slice(-8)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{order.user?.name || 'Unknown customer'}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email || 'No email'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.items?.length || 0} item(s)</TableCell>
                        <TableCell>₹{(order.totalAmount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)} className="gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {nextStatus && (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={updatingOrderId === order._id}
                                onClick={() => void handleStatusUpdate(order._id, nextStatus)}
                              >
                                {updatingOrderId === order._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>Move to {nextStatus}</>
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">Rows per page</p>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p className="font-medium">{selectedOrder.paymentStatus || 'Paid'}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Customer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.user?.name || 'Unknown'}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.user?.phone || 'N/A'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Shipping</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.shippingAddress?.name || selectedOrder.user?.name || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Address:</span> {selectedOrder.shippingAddress?.street || 'N/A'}</p>
                    <p><span className="text-muted-foreground">City:</span> {selectedOrder.shippingAddress?.city || 'N/A'}</p>
                    <p><span className="text-muted-foreground">State:</span> {selectedOrder.shippingAddress?.state || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{item.product?.name || 'Product'}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(item.subtotal || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Fulfillment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => void handleStatusUpdate(selectedOrder._id, selectedStatus)}
                      disabled={updatingOrderId === selectedOrder._id || selectedStatus === selectedOrder.status}
                    >
                      {updatingOrderId === selectedOrder._id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Save Status
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getNextStatus(selectedOrder.status) && (
                      <Button
                        variant="secondary"
                        onClick={() => void handleStatusUpdate(selectedOrder._id, getNextStatus(selectedOrder.status) as string)}
                      >
                        Move to {getNextStatus(selectedOrder.status)}
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
