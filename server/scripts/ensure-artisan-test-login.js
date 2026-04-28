import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../src/models/User.js'
import Artisan from '../src/models/Artisan.js'

const mongoUri = process.env.MONGODB_URI

async function ensureArtisanLogin() {
  const email = 'dinesh.s@example.com'
  const password = 'password123'
  const passwordHash = await bcrypt.hash(password, 10)

  await mongoose.connect(mongoUri)

  let user = await User.findOne({ email })
  if (!user) {
    user = await User.create({
      name: 'DINESH S',
      email,
      passwordHash,
      authProvider: 'local',
      role: 'artisan',
      isActive: true,
      isEmailVerified: true
    })
  } else {
    user.name = 'DINESH S'
    user.passwordHash = passwordHash
    user.authProvider = 'local'
    user.role = 'artisan'
    user.isActive = true
    user.isEmailVerified = true
    await user.save()
  }

  let artisan = await Artisan.findOne({ email })
  if (!artisan) {
    artisan = await Artisan.findOne({ name: 'DINESH S' })
  }

  if (!artisan) {
    artisan = new Artisan({
      userId: user._id,
      name: 'DINESH S',
      email,
      password: passwordHash,
      location: {
        city: 'Thanjavur',
        state: 'Tamil Nadu',
        country: 'India'
      },
      specialties: ['Pottery', 'Clay Work', 'Traditional Crafts'],
      experience: 15,
      businessInfo: {
        businessName: 'Dinesh Handicrafts',
        sellerType: 'gst',
        gstNumber: '22AAAAA0000A1Z5',
        panNumber: 'AAAAA0000A',
        contact: {
          email,
          phone: '+91-9876543210',
          address: {
            village: 'Kumbakonam',
            district: 'Thanjavur',
            state: 'Tamil Nadu',
            pincode: '612001'
          }
        }
      },
      verification: { isVerified: true },
      approvalStatus: 'approved',
      approvedAt: new Date(),
      isActive: true
    })
  } else {
    artisan.userId = user._id
    artisan.name = 'DINESH S'
    artisan.email = email
    artisan.password = passwordHash
    artisan.location = artisan.location || {
      city: 'Thanjavur',
      state: 'Tamil Nadu',
      country: 'India'
    }
    artisan.specialties = ['Pottery', 'Clay Work', 'Traditional Crafts']
    artisan.experience = 15
    artisan.businessInfo = {
      ...(artisan.businessInfo || {}),
      businessName: 'Dinesh Handicrafts',
      sellerType: 'gst',
      gstNumber: '22AAAAA0000A1Z5',
      panNumber: 'AAAAA0000A',
      contact: {
        ...(artisan.businessInfo?.contact || {}),
        email,
        phone: '+91-9876543210',
        address: {
          village: 'Kumbakonam',
          district: 'Thanjavur',
          state: 'Tamil Nadu',
          pincode: '612001'
        }
      }
    }
    artisan.verification = { ...(artisan.verification || {}), isVerified: true }
    artisan.approvalStatus = 'approved'
    artisan.approvedAt = new Date()
    artisan.isActive = true
  }

  await artisan.save()

  console.log('Artisan test account is ready')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)

  await mongoose.disconnect()
}

ensureArtisanLogin().catch(async (err) => {
  console.error('Failed to prepare artisan account:', err)
  try {
    await mongoose.disconnect()
  } catch {
    // ignore disconnect failures on error path
  }
  process.exit(1)
})
