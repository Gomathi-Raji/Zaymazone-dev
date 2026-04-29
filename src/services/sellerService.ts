import { buildBackendApiUrl, getBackendAuthToken } from '@/lib/backendApi';

const getToken = () => {
  return getBackendAuthToken();
};

const headers = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export const sellerService = {
  // Stats
  getStats: async () => {
    const response = await fetch(buildBackendApiUrl('/api/seller/stats'), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Products
  getProducts: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const response = await fetch(buildBackendApiUrl(`/api/seller/products?${query}`), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  getProduct: async (id: string) => {
    const response = await fetch(buildBackendApiUrl(`/api/seller/products/${id}`), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  createProduct: async (data: any) => {
    const response = await fetch(buildBackendApiUrl('/api/seller/products'), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  updateProduct: async (id: string, data: any) => {
    const response = await fetch(buildBackendApiUrl(`/api/seller/products/${id}`), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  deleteProduct: async (id: string) => {
    const response = await fetch(buildBackendApiUrl(`/api/seller/products/${id}`), {
      method: 'DELETE',
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  // Orders
  getOrders: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const response = await fetch(buildBackendApiUrl(`/api/seller/orders?${query}`), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  getOrder: async (id: string) => {
    const response = await fetch(buildBackendApiUrl(`/api/seller/orders/${id}`), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await fetch(buildBackendApiUrl(`/api/seller/orders/${id}/status`), {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update order status');
    return response.json();
  },

  // Profile
  getProfile: async () => {
    const response = await fetch(buildBackendApiUrl('/api/seller/profile'), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch(buildBackendApiUrl('/api/seller/profile'), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // Analytics
  getSalesAnalytics: async (period: string = '30days') => {
    const response = await fetch(buildBackendApiUrl(`/api/seller/analytics/sales?period=${period}`), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch sales analytics');
    return response.json();
  },

  getProductAnalytics: async () => {
    const response = await fetch(buildBackendApiUrl('/api/seller/analytics/products'), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch product analytics');
    return response.json();
  },

  getRevenueAnalytics: async () => {
    const response = await fetch(buildBackendApiUrl('/api/seller/analytics/revenue'), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch revenue analytics');
    return response.json();
  },

  getOrderStatusAnalytics: async () => {
    const response = await fetch(buildBackendApiUrl('/api/seller/analytics/orders-status'), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch order status analytics');
    return response.json();
  },

  getCustomerAnalytics: async () => {
    const response = await fetch(buildBackendApiUrl('/api/seller/analytics/customers'), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch customer analytics');
    return response.json();
  },

  getCategoryAnalytics: async () => {
    const response = await fetch(buildBackendApiUrl('/api/seller/analytics/categories'), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch category analytics');
    return response.json();
  },

  getAlerts: async () => {
    const response = await fetch(buildBackendApiUrl('/api/seller/alerts'), {
      headers: headers()
    });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  }
};
