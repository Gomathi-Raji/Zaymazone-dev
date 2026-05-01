const normalizeApiBaseUrl = (value: string | undefined, fallback: string) => {
  if (!value) return fallback

  let url = value
  if (url.includes(',')) {
    const urls = url.split(',').map(item => item.trim()).filter(Boolean)
    url = urls.find(item => item.startsWith('http')) || urls[0]
  }

  const cleaned = url.replace(/\s+/g, '')
  
  // Check if this is localhost and we're in production
  const isLocalhostUrl = cleaned.includes('localhost') || cleaned.includes('127.0.0.1')
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const isProduction = !currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')
  
  if (isLocalhostUrl && isProduction) {
    console.warn('Localhost URL in production, using fallback:', fallback)
    return fallback
  }
  
  if (cleaned.endsWith('/api')) return cleaned
  if (cleaned.endsWith('/api/')) return cleaned.slice(0, -1)
  return `${cleaned.replace(/\/$/, '')}/api`
}

const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL,
  (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) 
    ? 'https://zaymazone-dev-backend.onrender.com/api' 
    : 'http://localhost:4000/api'
)

const ANALYTICS_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff']

const formatAnalyticsDate = (value: string) => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

class AdminService {
  private token: string | null = null
  private refreshToken: string | null = null

  private getAuthHeaders() {
    const token = localStorage.getItem('admin_token') || this.token
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // Make authenticated API call
  private async apiCall(endpoint: string, method: string = 'GET', body: any = null): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`
    const options: RequestInit = {
      method,
      headers: this.getAuthHeaders()
    }
    if (body) options.body = JSON.stringify(body)

    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || `API Error: ${response.status}`)
    }

    return data
  }

  // Authentication
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }
      
      const data = await response.json()
      
      if (data.success && data.accessToken) {
        // Store authentication data
        this.token = data.accessToken
        this.refreshToken = data.refreshToken
        localStorage.setItem('admin_token', data.accessToken)
        localStorage.setItem('admin_refresh_token', data.refreshToken)
        localStorage.setItem('admin_user', JSON.stringify(data.user))
        
        return {
          success: true,
          token: data.accessToken,
          user: data.user
        }
      }
      
      throw new Error('Invalid response from server')
    } catch (error) {
      console.error('Admin login error:', error)
      throw error
    }
  }

  logout() {
    this.token = null
    this.refreshToken = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_refresh_token')
    localStorage.removeItem('admin_user')
  }

  isAuthenticated() {
    return !!localStorage.getItem('admin_token')
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('admin_user')
    return userStr ? JSON.parse(userStr) : null
  }

  // Statistics (computed from real backend data)
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch admin statistics: ${response.status}`)
    }

    return response.json()
  }

  // Approval Management - OLD DUPLICATES REMOVED - see enhanced methods at end of file
  // Using new methods with pagination and better parameters below

  // User Management
  async getUsers(params?: { page?: number; limit?: number; search?: string; status?: string; role?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.role) searchParams.append('role', params.role)

    const response = await fetch(`${API_BASE_URL}/admin/users?${searchParams}`, {
      headers: this.getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  }

  async updateUserStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    })
    if (!response.ok) throw new Error('Failed to update user status')
    return response.json()
  }

  async updateUserRole(id: string, role: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role })
    })
    if (!response.ok) throw new Error('Failed to update user role')
    return response.json()
  }

  async updateUser(id: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    })
    if (!response.ok) throw new Error('Failed to update user')
    return response.json()
  }

  async createUser(userData: { name: string; email: string; password: string; role?: string; phone?: string; address?: any }) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    })
    if (!response.ok) throw new Error('Failed to create user')
    return response.json()
  }

  async deleteUser(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete user')
    return response.json()
  }

  // Orders Management
  async getOrders(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status) searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)

    const response = await fetch(`${API_BASE_URL}/admin/orders?${searchParams}`, {
      headers: this.getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch orders')
    return response.json()
  }

  async updateOrderStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    })
    if (!response.ok) throw new Error('Failed to update order status')
    return response.json()
  }

  // Analytics
  async getSalesAnalytics(period = '30days') {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/sales?period=${period}`, {
      headers: this.getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch sales analytics')
    return response.json()
  }

  async getCategoryAnalytics() {
    const analytics = await this.getSalesAnalytics()

    return (analytics.categoryData || []).map((entry: any, index: number) => ({
      ...entry,
      color: ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]
    }))
  }

  async getTopProducts(limit = 5) {
    const analytics = await this.getSalesAnalytics()

    return (analytics.topProducts || []).slice(0, limit)
  }

  // Activities and Notifications
  async getActivities(limit = 50) {
    try {
      // Try to get real activities from backend
      const response = await fetch(`${API_BASE_URL}/admin/activities?limit=${limit}`, {
        headers: this.getAuthHeaders()
      })
      
      if (response.ok) {
        return response.json()
      }
      
      // Fallback: Generate activities from recent data
      const [productsRes, artisansRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products?limit=10`),
        fetch(`${API_BASE_URL}/artisans?limit=10`)
      ])
      
      const activities = []
      
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        const products = productsData.products || []
        products.slice(0, 5).forEach(product => {
          activities.push({
            id: `product_${product._id}`,
            type: 'product',
            action: 'Product added',
            details: `${product.name} was added to the marketplace`,
            timestamp: product.createdAt || new Date().toISOString(),
            user: product.artisan?.name || 'System',
            icon: 'Package',
            color: 'text-blue-600'
          })
        })
      }
      
      if (artisansRes.ok) {
        const artisansData = await artisansRes.json()
        const artisans = artisansData.artisans || []
        artisans.slice(0, 3).forEach(artisan => {
          activities.push({
            id: `artisan_${artisan._id}`,
            type: 'user',
            action: 'Artisan registered',
            details: `${artisan.name} joined as an artisan`,
            timestamp: artisan.createdAt || new Date().toISOString(),
            user: 'System',
            icon: 'User',
            color: 'text-green-600'
          })
        })
      }
      
      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      return { activities: activities.slice(0, limit) }
    } catch (error) {
      console.error('Error fetching activities:', error)
      return { activities: [] }
    }
  }

  async getNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: this.getAuthHeaders()
      })
      
      if (response.ok) {
        return response.json()
      }
      
      // Fallback: Generate notifications from pending approvals
      const [pendingProducts, pendingArtisans] = await Promise.all([
        this.getPendingProducts(),
        this.getPendingArtisans()
      ])
      
      const notifications = []
      
      if (pendingProducts.products?.length > 0) {
        notifications.push({
          id: 'pending_products',
          type: 'alert',
          title: 'Pending Product Approvals',
          message: `${pendingProducts.products.length} products waiting for approval`,
          severity: 'medium',
          timestamp: new Date().toISOString()
        })
      }
      
      if (pendingArtisans.artisans?.length > 0) {
        notifications.push({
          id: 'pending_artisans',
          type: 'alert',
          title: 'Pending Artisan Approvals',
          message: `${pendingArtisans.artisans.length} artisans waiting for verification`,
          severity: 'high',
          timestamp: new Date().toISOString()
        })
      }
      
      return { notifications }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return { notifications: [] }
    }
  }

  // Products Management
  async getProducts(params?: { page?: number; limit?: number; search?: string; status?: string; category?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)

    const response = await fetch(`${API_BASE_URL}/admin/products?${searchParams}`, {
      headers: this.getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
  }

  async createProduct(data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create product')
    return response.json()
  }

  async updateProduct(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update product')
    return response.json()
  }

  async deleteProduct(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete product')
    return response.json()
  }

  // Artisans Management
  async getArtisans(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)

    const response = await fetch(`${API_BASE_URL}/admin/artisans?${searchParams}`, {
      headers: this.getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch artisans')
    return response.json()
  }

  async createArtisan(data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/artisans`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create artisan')
    return response.json()
  }

  async updateArtisan(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/artisans/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update artisan')
    return response.json()
  }

  async deleteArtisan(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/artisans/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete artisan')
    return response.json()
  }

  // Blog Management
  async getBlogPosts(params?: { 
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: string
    featured?: boolean
    author?: string
  }) {
    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.category) searchParams.append('category', params.category)
      if (params?.status) searchParams.append('status', params.status)
      if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString())
      if (params?.author) searchParams.append('author', params.author)

      const response = await fetch(`${API_BASE_URL}/admin/blog-posts?${searchParams}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      throw error
    }
  }

  async createBlogPost(postData: {
    title: string
    excerpt: string
    content: string
    featuredImage: string
    images?: string[]
    author: {
      name: string
      bio?: string
      avatar?: string
      role?: string
    }
    category: string
    tags: string[]
    status: 'draft' | 'published'
    featured: boolean
    readTime: string
    seoTitle?: string
    seoDescription?: string
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blog-posts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create blog post')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating blog post:', error)
      throw error
    }
  }

  async updateBlogPost(id: string, postData: Partial<{
    title: string
    excerpt: string
    content: string
    featuredImage: string
    images: string[]
    author: {
      name: string
      bio?: string
      avatar?: string
      role?: string
    }
    category: string
    tags: string[]
    status: 'draft' | 'published'
    featured: boolean
    readTime: string
    seoTitle?: string
    seoDescription?: string
  }>) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blog-posts/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update blog post')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating blog post:', error)
      throw error
    }
  }

  async deleteBlogPost(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blog-posts/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete blog post')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting blog post:', error)
      throw error
    }
  }

  async getBlogPost(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blog-posts/${id}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch blog post')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching blog post:', error)
      throw error
    }
  }

  // Reports and Analytics
  async getSalesReport(period = '30days') {
    const response = await fetch(`${API_BASE_URL}/admin/reports/sales?period=${period}`, {
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sales report: ${response.status}`)
    }

    const data = await response.json()

    return {
      totalRevenue: data.totalRevenue || 0,
      totalOrders: data.totalOrders || 0,
      averageOrderValue: data.averageOrderValue || 0,
      topProducts: data.topProducts || [],
      monthlyData: (data.salesData || []).map((entry: any) => ({
        month: formatAnalyticsDate(entry.date),
        revenue: entry.revenue || 0,
        orders: entry.orders || 0
      })),
      categoryData: data.categoryData || [],
      salesData: data.salesData || []
    }
  }

  async getArtisanReport() {
    const [artisansData, productsData] = await Promise.all([
      this.getArtisans({ page: 1, limit: 1000, status: 'all' }),
      this.getProducts({ page: 1, limit: 1000, status: 'all' })
    ])

    const artisans = artisansData.artisans || []
    const products = productsData.products || []
    const artisanLookup = new Map<string, any>()

    artisans.forEach((artisan: any) => {
      artisanLookup.set(String(artisan._id), artisan)
    })

    const statsByArtisan = new Map<string, {
      products: number
      revenue: number
      ratingTotal: number
      ratingCount: number
    }>()

    products.forEach((product: any) => {
      const rawArtisanId = product.artisanId
      const artisanId = typeof rawArtisanId === 'object'
        ? String(rawArtisanId?._id || rawArtisanId?.id || '')
        : String(rawArtisanId || '')

      if (!artisanId) {
        return
      }

      const bucket = statsByArtisan.get(artisanId) || {
        products: 0,
        revenue: 0,
        ratingTotal: 0,
        ratingCount: 0
      }

      bucket.products += 1
      bucket.revenue += (Number(product.salesCount) || 0) * (Number(product.price) || 0)

      if (typeof product.rating === 'number' && product.rating > 0) {
        bucket.ratingTotal += product.rating
        bucket.ratingCount += 1
      }

      statsByArtisan.set(artisanId, bucket)
    })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const topArtisans = Array.from(statsByArtisan.entries())
      .map(([artisanId, stats]) => {
        const artisan = artisanLookup.get(artisanId)

        return {
          name: artisan?.name || 'Unknown Artisan',
          products: stats.products,
          revenue: stats.revenue,
          rating: stats.ratingCount > 0 ? Number((stats.ratingTotal / stats.ratingCount).toFixed(1)) : 0
        }
      })
      .sort((a, b) => b.revenue - a.revenue || b.products - a.products)
      .slice(0, 3)

    return {
      totalArtisans: artisans.length,
      activeArtisans: artisans.filter((artisan: any) => artisan.isActive).length,
      verifiedArtisans: artisans.filter((artisan: any) => artisan.verification?.isVerified).length,
      newArtisans: artisans.filter((artisan: any) => {
        const createdAt = new Date(artisan.createdAt)
        return !Number.isNaN(createdAt.getTime()) && createdAt >= thirtyDaysAgo
      }).length,
      topArtisans
    }
  }

  async getInvoices(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status) searchParams.append('status', params.status)

    const response = await fetch(`${API_BASE_URL}/admin/invoices?${searchParams}`, {
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.status}`)
    }

    return response.json()
  }

  // Categories Management
  async getCategories(params?: { page?: number; limit?: number; search?: string; featured?: boolean }) {
    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString())

      const response = await fetch(`${API_BASE_URL}/admin/categories?${searchParams}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  async createCategory(categoryData: {
    name: string
    description: string
    image: string
    icon: string
    subcategories: string[]
    featured: boolean
    displayOrder?: number
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  async updateCategory(id: string, categoryData: Partial<{
    name: string
    description: string
    image: string
    icon: string
    subcategories: string[]
    featured: boolean
    displayOrder: number
  }>) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update category')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  async deleteCategory(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  // =============
  // Comments
  // =============

  // Get comments for moderation
  async getComments(params?: {
    status?: string;
    postId?: string;
    limit?: number;
    skip?: number;
    search?: string;
  }): Promise<{
    comments: any[];
    totalCount: number;
    counts: {
      pending: number;
      approved: number;
      rejected: number;
      spam: number;
    };
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.postId) searchParams.append('postId', params.postId);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/admin/comments?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }

    return response.json();
  }

  // Get single comment
  async getComment(id: string): Promise<{ comment: any }> {
    const response = await fetch(`${API_BASE_URL}/admin/comments/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comment: ${response.status}`);
    }

    return response.json();
  }

  // Moderate comment
  async moderateComment(id: string, data: {
    status: 'approved' | 'rejected' | 'spam';
    reason?: string;
  }): Promise<{ message: string; comment: any }> {
    const response = await fetch(`${API_BASE_URL}/admin/comments/${id}/moderate`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to moderate comment: ${response.status}`);
    }

    return response.json();
  }

  // Bulk moderate comments
  async bulkModerateComments(data: {
    commentIds: string[];
    status: 'approved' | 'rejected' | 'spam';
    reason?: string;
  }): Promise<{ message: string; modifiedCount: number }> {
    const response = await fetch(`${API_BASE_URL}/admin/comments/bulk-moderate`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk moderate comments: ${response.status}`);
    }

    return response.json();
  }

  // Delete comment
  async deleteComment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/comments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.status}`);
    }
  }

  // Get comment statistics
  async getCommentStats(): Promise<{
    stats: {
      total: {
        pending: number;
        approved: number;
        rejected: number;
        spam: number;
      };
      recent: any[];
      topPosts: any[];
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/comments/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comment statistics: ${response.status}`);
    }

    return response.json();
  }

  // ========== ARTISAN APPROVALS ==========

  async getPendingArtisans(page: number = 1, limit: number = 10) {
    return this.apiCall(`/admin/artisans?status=pending&page=${page}&limit=${limit}`);
  }

  async getArtisanDetails(artisanId: string) {
    return this.apiCall(`/admin/artisans/${artisanId}`);
  }

  async approveArtisan(artisanId: string, approvalNotes: string = '') {
    return this.apiCall(`/admin/sellers/${artisanId}/approve`, 'POST', { approvalNotes });
  }

  async rejectArtisan(artisanId: string, rejectionReason: string) {
    return this.apiCall(`/admin/sellers/${artisanId}/reject`, 'POST', { rejectionReason });
  }

  // ========== PRODUCT APPROVALS ==========

  async getPendingProducts(page: number = 1, limit: number = 10) {
    return this.apiCall(`/admin/approvals/products?page=${page}&limit=${limit}`);
  }

  async approveProduct(productId: string, approvalNotes: string = '') {
    return this.apiCall(`/admin/approvals/products/${productId}/approve`, 'POST', { approvalNotes });
  }

  async rejectProduct(productId: string, rejectionReason: string) {
    return this.apiCall(`/admin/approvals/products/${productId}/reject`, 'POST', { rejectionReason });
  }

  // ========== BLOG APPROVALS ==========

  async getPendingBlogs(page: number = 1, limit: number = 10) {
    return this.apiCall(`/admin/blog-posts?page=${page}&limit=${limit}&status=pending`);
  }

  async approveBlog(blogId: string, approvalNotes: string = '') {
    return this.apiCall(`/admin/blog-posts/${blogId}/approve`, 'PATCH', { approvalNotes });
  }

  async rejectBlog(blogId: string, rejectionReason: string) {
    return this.apiCall(`/admin/blog-posts/${blogId}/reject`, 'PATCH', { rejectionReason });
  }

  // ========== USER APPROVALS ==========

  async getPendingUsers(page: number = 1, limit: number = 10) {
    try {
      // Use the correct admin endpoint for pending/pending approvals
      return await this.apiCall(`/admin/approvals/users?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      return { users: [], total: 0 };
    }
  }

  // ========== DASHBOARD STATS ==========

  async getDashboardStats() {
    try {
      const [pendingArtisans, pendingProducts, pendingBlogs] = await Promise.all([
        this.apiCall('/admin/artisans?status=pending&limit=1'),
        this.apiCall('/admin/approvals/products?limit=1'),
        this.apiCall('/admin/blog-posts?status=pending&limit=1')
      ]);

      return {
        pendingArtisans: pendingArtisans?.pagination?.total || 0,
        pendingProducts: pendingProducts?.pagination?.total || 0,
        pendingBlogs: pendingBlogs?.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        pendingArtisans: 0,
        pendingProducts: 0,
        pendingBlogs: 0
      };
    }
  }


  // Dashboard specific methods
  async getPendingApprovals() {
    try {
      const [artisansResponse, productsResponse, blogsResponse] = await Promise.all([
        this.apiCall('/admin/artisans?status=pending'),
        this.apiCall('/admin/approvals/products'),  
        this.apiCall('/admin/blog-posts?status=pending')
      ]);

      const approvals = [
        ...(artisansResponse.artisans || []).map((item: any) => ({
          _id: item._id,
          type: 'artisan',
          title: item.name || item.businessInfo?.businessName || 'Artisan Application',
          description: item.specialties?.join(', ') || 'New artisan application',
          submittedBy: item.name || 'Unknown',
          submittedAt: item.createdAt || new Date().toISOString(),
          status: item.approvalStatus || 'pending'
        })),
        ...(productsResponse.products || []).map((item: any) => ({
          _id: item._id,
          type: 'product',
          title: item.name || 'Product',
          description: item.description || 'New product submission',
          submittedBy: item.artisanId?.name || 'Unknown Artisan',
          submittedAt: item.createdAt || new Date().toISOString(),
          status: item.approvalStatus || 'pending'
        })),
        ...(blogsResponse.posts || []).map((item: any) => ({
          _id: item._id,
          type: 'blog',
          title: item.title || 'Blog Post',
          description: item.excerpt || 'New blog post submission',
          submittedBy: item.author?.name || 'Unknown Author',
          submittedAt: item.createdAt || new Date().toISOString(),
          status: item.status || 'pending'
        }))
      ];

      return { approvals };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return { approvals: [] };
    }
  }

  async getRecentActivities() {
    try {
      // Mock activity data - in real implementation, this would come from an audit log
      const activities = [
        {
          _id: '1',
          action: 'New artisan application submitted',
          user: 'Rajesh Kumar',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
          type: 'info'
        },
        {
          _id: '2', 
          action: 'Product "Handwoven Saree" approved',
          user: 'Admin User',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          type: 'success'
        },
        {
          _id: '3',
          action: 'Order #ORD-2024-001 completed',
          user: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          type: 'success'
        },
        {
          _id: '4',
          action: 'Payment gateway sync warning',
          user: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          type: 'warning'
        },
        {
          _id: '5',
          action: 'Blog post "Traditional Crafts" published',
          user: 'Content Team',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
          type: 'success'
        }
      ];

      return { activities };
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return { activities: [] };
    }
  }

  async handleApproval(id: string, type: string, action: 'approve' | 'reject') {
    try {
      let endpoint = '';
      
      switch (type) {
        case 'artisan':
          endpoint = `/admin/approvals/artisans/${id}/${action}`;
          break;
        case 'product':
          endpoint = `/admin/approvals/products/${id}/${action}`;
          break;
        case 'blog':
          endpoint = `/admin/blog-posts/${id}/${action}`;
          break;
        default:
          throw new Error(`Unknown approval type: ${type}`);
      }

      return await this.apiCall(endpoint, 'POST');
    } catch (error) {
      console.error(`Error ${action}ing ${type}:`, error);
      throw error;
    }
  }

}

export const adminService = new AdminService()