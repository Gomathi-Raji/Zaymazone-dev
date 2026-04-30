import { Router } from 'express'
import { z } from 'zod'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Artisan from '../models/Artisan.js'
import User from '../models/User.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { authenticateToken } from '../middleware/firebase-auth.js'

const router = Router()

// ============= SELLER DASHBOARD STATS =============
router.get('/stats', authenticateToken, async (req, res) => {
	try {
		// Find artisan by userId
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const artisanId = artisan._id

		// Get statistics
		const [
			totalProducts,
			activeProducts,
			totalOrders,
			completedOrders,
			totalRevenue,
			totalRating,
			reviewCount
		] = await Promise.all([
			Product.countDocuments({ artisanId, isActive: true }),
			Product.countDocuments({ artisanId, isActive: true, inStock: true }),
			Order.countDocuments({ 'items.productArtisan': artisanId }),
			Order.countDocuments({ 'items.productArtisan': artisanId, status: 'delivered' }),
			Order.aggregate([
				{ $match: { 'items.productArtisan': artisanId, status: 'delivered' } },
				{ $group: { _id: null, total: { $sum: '$totalAmount' } } }
			]),
			Product.aggregate([
				{ $match: { artisanId } },
				{ $group: { _id: null, avgRating: { $avg: '$rating' } } }
			]),
			Product.aggregate([
				{ $match: { artisanId } },
				{ $group: { _id: null, totalReviews: { $sum: '$reviewCount' } } }
			])
		])

		const revenue = totalRevenue[0]?.total || 0
		const avgRating = totalRating[0]?.avgRating || 0
		const reviews = reviewCount[0]?.totalReviews || 0

		res.json({
			stats: {
				totalProducts,
				activeProducts,
				totalOrders,
				completedOrders,
				totalRevenue: revenue,
				averageRating: avgRating,
				totalReviews: reviews,
				artisanId: artisanId.toString()
			}
		})
	} catch (error) {
		console.error('Seller stats error:', error)
		res.status(500).json({ error: 'Failed to fetch seller statistics' })
	}
})

// ============= PRODUCTS MANAGEMENT =============
// Get seller's products
router.get('/products', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const search = req.query.search || ''
		const status = req.query.status || 'all'

		let query = { artisanId: artisan._id }

		// Filter by status
		if (status === 'active') {
			query.isActive = true
		} else if (status === 'inactive') {
			query.isActive = false
		}

		// Search functionality
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			]
		}

		const skip = (page - 1) * limit
		const [products, total] = await Promise.all([
			Product.find(query)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Product.countDocuments(query)
		])

		res.json({
			products,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get seller products error:', error)
		res.status(500).json({ error: 'Failed to fetch products' })
	}
})

// Create product
router.post('/products', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const {
			name,
			description,
			price,
			originalPrice,
			images,
			category,
			subcategory,
			materials,
			colors,
			tags,
			stockCount,
			dimensions,
			weight,
			shippingTime,
			isHandmade,
			featured
		} = req.body

		// Validation
		if (!name || !price || !category) {
			return res.status(400).json({
				error: 'Missing required fields: name, price, category'
			})
		}

		const product = new Product({
			name,
			description,
			price: parseFloat(price),
			originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
			images: Array.isArray(images) ? images : [],
			artisanId: artisan._id,
			category,
			subcategory,
			materials,
			colors,
			tags,
			stock: parseInt(req.body.stock || stockCount) || 0,
			inStock: parseInt(req.body.stock || stockCount) > 0,
			dimensions,
			weight,
			shippingTime,
			isHandmade: isHandmade !== false,
			isFeatured: req.body.isFeatured === true,
			isActive: false, // Artisan products start as inactive
			approvalStatus: 'pending', // Require admin approval
			videos: req.body.videos || []
		})

		await product.save()

		// Update artisan product count
		artisan.totalProducts = (artisan.totalProducts || 0) + 1
		await artisan.save()

		res.status(201).json({
			message: 'Product created successfully',
			product
		})
	} catch (error) {
		console.error('Create product error:', error)
		res.status(500).json({ error: 'Failed to create product' })
	}
})

// Get single product
router.get('/products/:id', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const product = await Product.findOne({
			_id: req.params.id,
			artisanId: artisan._id
		})

		if (!product) {
			return res.status(404).json({ error: 'Product not found' })
		}

		res.json(product)
	} catch (error) {
		console.error('Get product error:', error)
		res.status(500).json({ error: 'Failed to fetch product' })
	}
})

// Update product
router.put('/products/:id', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const product = await Product.findOneAndUpdate(
			{ _id: req.params.id, artisanId: artisan._id },
			{
				...req.body,
				updatedAt: new Date()
			},
			{ new: true }
		)

		if (!product) {
			return res.status(404).json({ error: 'Product not found' })
		}

		res.json({
			message: 'Product updated successfully',
			product
		})
	} catch (error) {
		console.error('Update product error:', error)
		res.status(500).json({ error: 'Failed to update product' })
	}
})

// Delete/deactivate product
router.delete('/products/:id', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const product = await Product.findOneAndUpdate(
			{ _id: req.params.id, artisanId: artisan._id },
			{ isActive: false },
			{ new: true }
		)

		if (!product) {
			return res.status(404).json({ error: 'Product not found' })
		}

		res.json({ message: 'Product deleted successfully' })
	} catch (error) {
		console.error('Delete product error:', error)
		res.status(500).json({ error: 'Failed to delete product' })
	}
})

// ============= ORDERS MANAGEMENT =============
// Get seller's orders
router.get('/orders', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const status = req.query.status || 'all'

		let query = { 'items.productArtisan': artisan._id }

		if (status !== 'all') {
			query.status = status
		}

		const skip = (page - 1) * limit
		const [orders, total] = await Promise.all([
			Order.find(query)
				.populate('userId', 'name email phone')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			Order.countDocuments(query)
		])

		res.json({
			orders,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get seller orders error:', error)
		res.status(500).json({ error: 'Failed to fetch orders' })
	}
})

// Get single order
router.get('/orders/:id', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const order = await Order.findOne({
			_id: req.params.id,
			'items.productArtisan': artisan._id
		}).populate('userId', 'name email phone address')

		if (!order) {
			return res.status(404).json({ error: 'Order not found' })
		}

		res.json(order)
	} catch (error) {
		console.error('Get order error:', error)
		res.status(500).json({ error: 'Failed to fetch order' })
	}
})

// Update order status
router.patch('/orders/:id/status', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const { status } = req.body

		const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ error: 'Invalid status' })
		}

		const order = await Order.findOneAndUpdate(
			{ _id: req.params.id, 'items.productArtisan': artisan._id },
			{ status, updatedAt: new Date() },
			{ new: true }
		)

		if (!order) {
			return res.status(404).json({ error: 'Order not found' })
		}

		res.json({
			message: 'Order status updated successfully',
			order
		})
	} catch (error) {
		console.error('Update order status error:', error)
		res.status(500).json({ error: 'Failed to update order status' })
	}
})

// ============= PROFILE MANAGEMENT =============
const formatSellerProfile = (artisan) => ({
	_id: artisan._id,
	name: artisan.name,
	businessName: artisan.businessInfo?.businessName || artisan.name,
	description: artisan.bio || '',
	bio: artisan.bio || '',
	avatar: artisan.avatar || '',
	bannerImage: artisan.coverImage || '',
	coverImage: artisan.coverImage || '',
	location: artisan.location,
	specialties: artisan.specialties,
	experience: artisan.experience,
	socials: artisan.socials,
	verification: artisan.verification,
	businessInfo: artisan.businessInfo,
	totalProducts: artisan.totalProducts || 0,
	totalSales: artisan.totalSales || 0,
	rating: artisan.rating || 0,
	totalRatings: artisan.totalRatings || 0,
	isActive: artisan.isActive,
	joinedDate: artisan.createdAt
})

// Get seller profile
router.get('/profile', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		res.json({
			profile: formatSellerProfile(artisan)
		})
	} catch (error) {
		console.error('Get profile error:', error)
		res.status(500).json({ error: 'Failed to fetch profile' })
	}
})

// Update seller profile
router.put('/profile', authenticateToken, async (req, res) => {
	try {
		const {
			name,
			businessName,
			bio,
			description,
			avatar,
			coverImage,
			bannerImage,
			location,
			specialties,
			experience,
			socials
		} = req.body

		const updates = { updatedAt: new Date() }

		if (name !== undefined) {
			updates.name = name
		}

		if (businessName !== undefined) {
			updates['businessInfo.businessName'] = businessName
		}

		if (bio !== undefined || description !== undefined) {
			updates.bio = description !== undefined ? description : bio
		}

		if (avatar !== undefined) {
			updates.avatar = avatar
		}

		if (coverImage !== undefined || bannerImage !== undefined) {
			updates.coverImage = bannerImage !== undefined ? bannerImage : coverImage
		}

		if (location !== undefined) {
			updates.location = location
		}

		if (specialties !== undefined) {
			updates.specialties = specialties
		}

		if (experience !== undefined) {
			updates.experience = experience
		}

		if (socials !== undefined) {
			updates.socials = socials
		}

		const artisan = await Artisan.findOneAndUpdate(
			{ userId: req.user._id },
			updates,
			{ new: true }
		)

		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		res.json({
			message: 'Profile updated successfully',
			profile: formatSellerProfile(artisan)
		})
	} catch (error) {
		console.error('Update profile error:', error)
		res.status(500).json({ error: 'Failed to update profile' })
	}
})

// ============= ANALYTICS =============
// Get sales analytics with period support
router.get('/analytics/sales', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const period = req.query.period || '30days'
		let dateRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

		if (period === '7days') {
			dateRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
		} else if (period === '90days') {
			dateRange = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
		} else if (period === 'all') {
			dateRange = new Date(0)
		}

		const salesData = await Order.aggregate([
			{
				$match: {
					'items.productArtisan': artisan._id,
					createdAt: { $gte: dateRange }
				}
			},
			{
				$group: {
					_id: {
						$dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
					},
					sales: { $sum: 1 },
					revenue: { $sum: '$totalAmount' },
					orders: { $sum: 1 }
				}
			},
			{ $sort: { _id: 1 } }
		])

		res.json({ 
			data: salesData,
			period,
			dateRange: dateRange.toISOString()
		})
	} catch (error) {
		console.error('Sales analytics error:', error)
		res.status(500).json({ error: 'Failed to fetch analytics' })
	}
})

// Get product performance
router.get('/analytics/products', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const products = await Product.find({ artisanId: artisan._id })
			.select('name price rating reviewCount viewCount salesCount')
			.sort({ salesCount: -1 })
			.limit(10)

		res.json({ products })
	} catch (error) {
		console.error('Product analytics error:', error)
		res.status(500).json({ error: 'Failed to fetch product analytics' })
	}
})

// ============= ADVANCED ANALYTICS =============
// Get revenue summary
router.get('/analytics/revenue', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const [totalRevenue, monthlyRevenue, pendingRevenue] = await Promise.all([
			Order.aggregate([
				{ $match: { 'items.productArtisan': artisan._id, status: 'delivered' } },
				{ $group: { _id: null, total: { $sum: '$totalAmount' } } }
			]),
			Order.aggregate([
				{
					$match: {
						'items.productArtisan': artisan._id,
						status: 'delivered',
						createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
					}
				},
				{ $group: { _id: null, total: { $sum: '$totalAmount' } } }
			]),
			Order.aggregate([
				{ $match: { 'items.productArtisan': artisan._id, status: { $in: ['pending', 'processing'] } } },
				{ $group: { _id: null, total: { $sum: '$totalAmount' } } }
			])
		])

		res.json({
			totalRevenue: totalRevenue[0]?.total || 0,
			monthlyRevenue: monthlyRevenue[0]?.total || 0,
			pendingRevenue: pendingRevenue[0]?.total || 0
		})
	} catch (error) {
		console.error('Revenue analytics error:', error)
		res.status(500).json({ error: 'Failed to fetch revenue analytics' })
	}
})

// Get order status breakdown
router.get('/analytics/orders-status', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const statusBreakdown = await Order.aggregate([
			{ $match: { 'items.productArtisan': artisan._id } },
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
					totalAmount: { $sum: '$totalAmount' }
				}
			}
		])

		res.json({ statusBreakdown })
	} catch (error) {
		console.error('Order status analytics error:', error)
		res.status(500).json({ error: 'Failed to fetch order status analytics' })
	}
})

// Get customer insights
router.get('/analytics/customers', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const [totalCustomers, repeatCustomers, topCustomers] = await Promise.all([
			Order.aggregate([
				{ $match: { 'items.productArtisan': artisan._id } },
				{ $group: { _id: '$userId', count: { $sum: 1 } } },
				{ $count: 'total' }
			]),
			Order.aggregate([
				{ $match: { 'items.productArtisan': artisan._id } },
				{ $group: { _id: '$userId', orderCount: { $sum: 1 } } },
				{ $match: { orderCount: { $gt: 1 } } },
				{ $count: 'total' }
			]),
			Order.aggregate([
				{ $match: { 'items.productArtisan': artisan._id } },
				{ $group: { _id: '$userId', totalSpent: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
				{ $sort: { totalSpent: -1 } },
				{ $limit: 5 },
				{
					$lookup: {
						from: 'users',
						localField: '_id',
						foreignField: '_id',
						as: 'userInfo'
					}
				}
			])
		])

		res.json({
			totalCustomers: totalCustomers[0]?.total || 0,
			repeatCustomers: repeatCustomers[0]?.total || 0,
			topCustomers: topCustomers
		})
	} catch (error) {
		console.error('Customer analytics error:', error)
		res.status(500).json({ error: 'Failed to fetch customer analytics' })
	}
})

// Get category performance
router.get('/analytics/categories', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const categoryPerformance = await Product.aggregate([
			{ $match: { artisanId: artisan._id } },
			{
				$group: {
					_id: '$category',
					productCount: { $sum: 1 },
					avgRating: { $avg: '$rating' },
					totalReviews: { $sum: '$reviewCount' }
				}
			},
			{ $sort: { productCount: -1 } }
		])

		res.json({ categories: categoryPerformance })
	} catch (error) {
		console.error('Category analytics error:', error)
		res.status(500).json({ error: 'Failed to fetch category analytics' })
	}
})

// Get real-time notifications/alerts
router.get('/alerts', authenticateToken, async (req, res) => {
	try {
		const artisan = await Artisan.findOne({ userId: req.user._id })
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		// Low stock products
		const lowStockProducts = await Product.find({
			artisanId: artisan._id,
			$expr: { $lte: ['$stockCount', 5] }
		}).select('name stockCount').limit(5)

		// Pending orders
		const pendingOrders = await Order.countDocuments({
			'items.productArtisan': artisan._id,
			status: 'pending'
		})

		// New reviews
		const recentReviews = await Product.aggregate([
			{ $match: { artisanId: artisan._id } },
			{ $sort: { 'reviews.createdAt': -1 } },
			{ $limit: 3 }
		])

		res.json({
			alerts: {
				lowStockProducts,
				pendingOrdersCount: pendingOrders,
		recentReviewCount: recentReviews.length,
		hasAlerts: lowStockProducts.length > 0 || pendingOrders > 0
	}
})
} catch (error) {
	console.error('Alerts error:', error)
	res.status(500).json({ error: 'Failed to fetch alerts' })
}
})

// ============= SELLER ONBOARDING ENDPOINTS =============

// Submit onboarding application
router.post('/onboarding', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id

		// Check if artisan already exists
		const existingArtisan = await Artisan.findOne({ userId })
		if (existingArtisan) {
			return res.status(400).json({ error: 'Artisan profile already exists' })
		}

		// Validate required fields
		const { 
			name, 
			bio, 
			location, 
			businessInfo, 
			productInfo, 
			logistics, 
			documents, 
			payment 
		} = req.body

		if (!name || !location?.city || !location?.state || !businessInfo?.businessName) {
			return res.status(400).json({ error: 'Missing required fields' })
		}

		// Create new artisan profile
		const artisan = new Artisan({
			userId,
			name,
			bio,
			location,
			businessInfo,
			productInfo,
			logistics,
			documents,
			payment,
			approvalStatus: 'pending',
			isActive: false // Will be activated after approval
		})

		await artisan.save()

		res.status(201).json({
			message: 'Onboarding application submitted successfully',
			artisan: {
				_id: artisan._id,
				name: artisan.name,
				approvalStatus: artisan.approvalStatus,
				submittedAt: artisan.createdAt
			}
		})
	} catch (error) {
		console.error('Onboarding error:', error)
		res.status(500).json({ error: 'Failed to submit application' })
	}
})

// Get onboarding status
router.get('/onboarding/status', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id
		const artisan = await Artisan.findOne({ userId }).select('approvalStatus approvedAt rejectionReason approvalNotes createdAt')

		if (!artisan) {
			return res.json({ 
				status: 'not_submitted',
				message: 'No application found'
			})
		}

		res.json({
			status: artisan.approvalStatus,
			submittedAt: artisan.createdAt,
			approvedAt: artisan.approvedAt,
			rejectionReason: artisan.rejectionReason,
			approvalNotes: artisan.approvalNotes
		})
	} catch (error) {
		console.error('Status check error:', error)
		res.status(500).json({ error: 'Failed to check status' })
	}
})

// Update onboarding application (if still pending)
router.put('/onboarding', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id
		const artisan = await Artisan.findOne({ userId })

		if (!artisan) {
			return res.status(404).json({ error: 'Application not found' })
		}

		if (artisan.approvalStatus !== 'pending') {
			return res.status(400).json({ error: 'Cannot update approved/rejected application' })
		}

		// Update fields
		const updates = req.body
		Object.assign(artisan, updates)
		await artisan.save()

		res.json({
			message: 'Application updated successfully',
			artisan: {
				_id: artisan._id,
				name: artisan.name,
				approvalStatus: artisan.approvalStatus,
				updatedAt: artisan.updatedAt
			}
		})
	} catch (error) {
		console.error('Update error:', error)
		res.status(500).json({ error: 'Failed to update application' })
	}
})

// ============= BLOG MANAGEMENT ENDPOINTS =============

// Get seller's blog posts
router.get('/blogs', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id
		const artisan = await Artisan.findOne({ userId })
		
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const skip = (page - 1) * limit
		const status = req.query.status // draft, published, pending

		const filter = { author: artisan._id }
		if (status && ['draft', 'published', 'pending'].includes(status)) {
			filter.status = status
		}

		const [blogs, total] = await Promise.all([
			BlogPost.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('author', 'name avatar')
				.lean(),
			BlogPost.countDocuments(filter)
		])

		res.json({
			blogs,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get blogs error:', error)
		res.status(500).json({ error: 'Failed to fetch blogs' })
	}
})

// Create new blog post
router.post('/blogs', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id
		const artisan = await Artisan.findOne({ userId })
		
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const { title, content, excerpt, tags, featuredImage, status } = req.body

		if (!title || !content) {
			return res.status(400).json({ error: 'Title and content are required' })
		}

		const blog = new BlogPost({
			title,
			content,
			excerpt,
			tags: tags || [],
			featuredImage,
			author: artisan._id,
			status: status || 'draft'
		})

		await blog.save()
		await blog.populate('author', 'name avatar')

		res.status(201).json({
			message: 'Blog post created successfully',
			blog
		})
	} catch (error) {
		console.error('Create blog error:', error)
		res.status(500).json({ error: 'Failed to create blog post' })
	}
})

// Update blog post
router.put('/blogs/:id', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id
		const artisan = await Artisan.findOne({ userId })
		
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const blog = await BlogPost.findOne({ _id: req.params.id, author: artisan._id })
		if (!blog) {
			return res.status(404).json({ error: 'Blog post not found' })
		}

		const updates = req.body
		Object.assign(blog, updates)
		await blog.save()
		await blog.populate('author', 'name avatar')

		res.json({
			message: 'Blog post updated successfully',
			blog
		})
	} catch (error) {
		console.error('Update blog error:', error)
		res.status(500).json({ error: 'Failed to update blog post' })
	}
})

// Delete blog post
router.delete('/blogs/:id', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id
		const artisan = await Artisan.findOne({ userId })
		
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const blog = await BlogPost.findOneAndDelete({ _id: req.params.id, author: artisan._id })
		if (!blog) {
			return res.status(404).json({ error: 'Blog post not found' })
		}

		res.json({ message: 'Blog post deleted successfully' })
	} catch (error) {
		console.error('Delete blog error:', error)
		res.status(500).json({ error: 'Failed to delete blog post' })
	}
})

// ============= CATEGORY MANAGEMENT ENDPOINTS =============

// Get categories for seller
router.get('/categories', authenticateToken, async (req, res) => {
	try {
		const categories = await Category.find({ isActive: true })
			.sort({ name: 1 })
			.lean()

		res.json({ categories })
	} catch (error) {
		console.error('Get categories error:', error)
		res.status(500).json({ error: 'Failed to fetch categories' })
	}
})

// Suggest new category
router.post('/categories/suggest', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id
		const artisan = await Artisan.findOne({ userId })
		
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		const { name, description, parentCategory } = req.body

		if (!name) {
			return res.status(400).json({ error: 'Category name is required' })
		}

		// Check if category already exists
		const existingCategory = await Category.findOne({ 
			name: { $regex: new RegExp(`^${name}$`, 'i') } 
		})

		if (existingCategory) {
			return res.status(400).json({ error: 'Category already exists' })
		}

		const category = new Category({
			name,
			description,
			parentCategory,
			suggestedBy: artisan._id,
			isActive: false, // Will be activated by admin
			isApproved: false
		})

		await category.save()
		await category.populate('suggestedBy', 'name')

		res.status(201).json({
			message: 'Category suggestion submitted successfully',
			category
		})
	} catch (error) {
		console.error('Suggest category error:', error)
		res.status(500).json({ error: 'Failed to suggest category' })
	}
})

export default router