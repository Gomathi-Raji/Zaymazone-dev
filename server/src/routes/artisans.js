import { Router } from 'express'
import { z } from 'zod'
import Artisan from '../models/Artisan.js'
import { authenticateToken } from '../middleware/firebase-auth.js'

const router = Router()

const upsertSchema = z.object({
	name: z.string().min(1).max(200),
	bio: z.string().max(4000).optional().default(''),
	location: z.string().max(200).optional().default(''),
	socials: z.record(z.string(), z.string().url()).optional().default({}),
})

// Artisan profile schema for updates - only editable fields
const artisanProfileUpdateSchema = z.object({
	profilePic: z.string().optional(),
	mobileNumber: z.string().optional(),
	email: z.string().email().optional(),
	shippingDetails: z.object({
		pickupAddress: z.object({
			sameAsMain: z.boolean(),
			address: z.string().optional()
		}).optional(),
		dispatchTime: z.string().optional(),
		packagingType: z.string().optional()
	}).optional()
}).partial()

router.get('/', async (_req, res) => {
	const items = await Artisan.find({ 
		isActive: true, 
		'verification.isVerified': true 
	}).limit(200).lean()
	return res.json(items)
})

// Public stats endpoint for about page and marketing
router.get('/stats/impact', async (_req, res) => {
	try {
		const [
			totalArtisans,
			uniqueStates,
			totalProducts,
			avgRating,
			totalRevenue
		] = await Promise.all([
			Artisan.countDocuments({ 
				approvalStatus: 'approved', 
				isActive: true 
			}),
			Artisan.distinct('location.state', { 
				approvalStatus: 'approved', 
				isActive: true 
			}).then(states => states.length),
			Artisan.aggregate([
				{ $match: { approvalStatus: 'approved', isActive: true } },
				{ $group: { _id: null, total: { $sum: '$totalProducts' } } }
			]).then(result => result[0]?.total || 0),
			Artisan.aggregate([
				{ $match: { approvalStatus: 'approved', isActive: true } },
				{ $group: { _id: null, avg: { $avg: '$rating' } } }
			]).then(result => (result[0]?.avg || 0).toFixed(1)),
			Artisan.aggregate([
				{ $match: { approvalStatus: 'approved', isActive: true } },
				{ $group: { _id: null, total: { $sum: '$totalSales' } } }
			]).then(result => result[0]?.total || 0)
		])

		res.json({
			artisansSupported: Math.max(1, totalArtisans),
			statesReached: Math.max(1, uniqueStates),
			productsListed: Math.max(1, totalProducts),
			averageRating: Math.max(0, parseFloat(avgRating) || 0),
			totalRevenue: totalRevenue
		})
	} catch (error) {
		console.error('Error fetching impact stats:', error)
		res.json({
			artisansSupported: 0,
			statesReached: 0,
			productsListed: 0,
			averageRating: 0,
			totalRevenue: 0
		})
	}
})

// Artisan profile routes (must come before /:id route)
// Get current user's artisan profile
router.get('/profile', authenticateToken, async (req, res) => {
	try {
		// Find artisan by email from authenticated user
		const artisan = await Artisan.findOne({ 
			email: req.user.email,
			approvalStatus: 'approved' 
		}).lean()
		
		if (!artisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		// Transform to match frontend interface with all registration details
		const profile = {
			_id: artisan._id.toString(),
			fullName: artisan.name,
			email: artisan.email,
			mobileNumber: artisan.businessInfo?.contact?.phone || '',
			profilePic: artisan.avatar || '',
			shopName: artisan.businessInfo?.businessName || '',
			sellerType: artisan.businessInfo?.sellerType || 'non-gst',
			village: artisan.businessInfo?.contact?.address?.village || '',
			district: artisan.businessInfo?.contact?.address?.district || '',
			state: artisan.businessInfo?.contact?.address?.state || artisan.location?.state || '',
			pincode: artisan.businessInfo?.contact?.address?.pincode || '',
			gstNumber: artisan.businessInfo?.gstNumber || '',
			panNumber: artisan.businessInfo?.panNumber || '',
			aadhaarNumber: artisan.verification?.documentNumber || '',
			productCategories: artisan.specialties || [],
			productDescription: artisan.productInfo?.description || '',
			materials: artisan.productInfo?.materials || '',
			priceRange: artisan.productInfo?.priceRange || { min: 0, max: 0 },
			stockQuantity: artisan.productInfo?.stockQuantity || 0,
			productPhotos: artisan.productInfo?.photos || [],
			shippingDetails: {
				pickupAddress: artisan.logistics?.pickupAddress || { sameAsMain: true, address: '' },
				dispatchTime: artisan.logistics?.dispatchTime || '',
				packagingType: artisan.logistics?.packagingType || ''
			},
			bankDetails: {
				accountNumber: artisan.verification?.bankDetails?.accountNumber || '',
				ifscCode: artisan.verification?.bankDetails?.ifscCode || '',
				bankName: artisan.verification?.bankDetails?.bankName || ''
			},
			upiId: artisan.payment?.upiId || '',
			paymentFrequency: artisan.payment?.paymentFrequency || '',
			bio: artisan.bio || '',
			experience: artisan.experience || 0,
			approvalStatus: artisan.approvalStatus || 'pending',
			isActive: artisan.isActive,
			stats: {
				totalProducts: artisan.totalProducts || 0,
				totalSales: artisan.totalSales || 0,
				averageRating: artisan.rating || 0,
				totalReviews: artisan.totalRatings || 0
			},
			pendingChanges: artisan.pendingChanges || {
				hasChanges: false,
				changedFields: []
			},
			createdAt: artisan.createdAt?.toISOString() || artisan.joinedDate?.toISOString(),
			updatedAt: artisan.updatedAt?.toISOString() || artisan.joinedDate?.toISOString()
		}

		res.json(profile)
	} catch (error) {
		console.error('Error fetching artisan profile:', error)
		res.status(500).json({ error: 'Failed to fetch artisan profile' })
	}
})

// Update current user's artisan profile - only editable fields
router.put('/profile', authenticateToken, async (req, res) => {
	try {
		const parsed = artisanProfileUpdateSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({ error: parsed.error.errors[0]?.message })
		}

		const updateData = parsed.data

		// Build update object for only editable fields
		const dbUpdate = {}
		const changedFields = []
		const pendingChangesData = {}
		
		if (updateData.profilePic !== undefined) {
			dbUpdate.avatar = updateData.profilePic
			changedFields.push('profilePic')
			pendingChangesData.profilePic = updateData.profilePic
		}
		
		if (updateData.email !== undefined) {
			dbUpdate.email = updateData.email
			changedFields.push('email')
			pendingChangesData.email = updateData.email
		}
		
		if (updateData.mobileNumber !== undefined) {
			dbUpdate['businessInfo.contact.phone'] = updateData.mobileNumber
			changedFields.push('mobileNumber')
			pendingChangesData.mobileNumber = updateData.mobileNumber
		}
		
		if (updateData.shippingDetails) {
			if (updateData.shippingDetails.pickupAddress !== undefined) {
				dbUpdate['logistics.pickupAddress'] = updateData.shippingDetails.pickupAddress
				changedFields.push('shippingDetails.pickupAddress')
				pendingChangesData.shippingPickupAddress = updateData.shippingDetails.pickupAddress
			}
			if (updateData.shippingDetails.dispatchTime !== undefined) {
				dbUpdate['logistics.dispatchTime'] = updateData.shippingDetails.dispatchTime
				changedFields.push('shippingDetails.dispatchTime')
				pendingChangesData.shippingDispatchTime = updateData.shippingDetails.dispatchTime
			}
			if (updateData.shippingDetails.packagingType !== undefined) {
				dbUpdate['logistics.packagingType'] = updateData.shippingDetails.packagingType
				changedFields.push('shippingDetails.packagingType')
				pendingChangesData.shippingPackagingType = updateData.shippingDetails.packagingType
			}
		}

		// Add change tracking for admin notification (no approval needed)
		if (changedFields.length > 0) {
			dbUpdate['pendingChanges.hasChanges'] = true
			dbUpdate['pendingChanges.changedAt'] = new Date()
			dbUpdate['pendingChanges.changedFields'] = changedFields
			dbUpdate['pendingChanges.changes'] = pendingChangesData
			console.log('🔔 Setting pending changes:', { changedFields, pendingChangesData })
		}

		const updatedArtisan = await Artisan.findOneAndUpdate(
			{ 
				email: req.user.email,
				approvalStatus: 'approved' 
			},
			{ $set: dbUpdate },
			{ new: true, runValidators: true }
		)

		if (!updatedArtisan) {
			return res.status(404).json({ error: 'Artisan profile not found' })
		}

		console.log('✅ Artisan updated. Pending changes:', updatedArtisan.pendingChanges)

		res.json({ 
			message: 'Profile updated successfully.',
			changesTracked: changedFields.length > 0
		})
	} catch (error) {
		console.error('Error updating artisan profile:', error)
		res.status(500).json({ error: 'Failed to update artisan profile' })
	}
})

// Generic CRUD routes (must come after specific routes)
router.get('/:id', async (req, res) => {
	const item = await Artisan.findById(req.params.id).lean()
	if (!item) return res.status(404).json({ error: 'Not found' })
	return res.json(item)
})

router.post('/', authenticateToken, async (req, res) => {
	const parsed = upsertSchema.safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const created = await Artisan.create(parsed.data)
	return res.status(201).json(created)
})

router.put('/:id', authenticateToken, async (req, res) => {
	const parsed = upsertSchema.partial().safeParse(req.body)
	if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0]?.message })
	const updated = await Artisan.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
	if (!updated) return res.status(404).json({ error: 'Not found' })
	return res.json(updated)
})

router.delete('/:id', authenticateToken, async (req, res) => {
	const deleted = await Artisan.findByIdAndDelete(req.params.id)
	if (!deleted) return res.status(404).json({ error: 'Not found' })
	return res.status(204).end()
})

export default router


