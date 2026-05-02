import 'dotenv/config'
import mongoose from 'mongoose'
import Product from '../src/models/Product.js'
import Artisan from '../src/models/Artisan.js'

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaymazone'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000'

// Function to convert asset paths to API URLs
function convertImagePath(path) {
  if (path.startsWith('assets/')) {
    // Convert to API endpoint URL
    const filename = path.replace('assets/', '')
    return `${API_BASE_URL}/api/images/${filename}`
  }
  return path
}

async function updateImageReferences() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Update products
    console.log('Updating product images...')
    const products = await Product.find({})
    let productUpdatedCount = 0

    for (const product of products) {
      const updatedImages = product.images.map(convertImagePath)
      
      const hasChanges = product.images.some((img, index) => img !== updatedImages[index])
      
      if (hasChanges) {
        await Product.findByIdAndUpdate(product._id, {
          images: updatedImages
        })
        productUpdatedCount++
        console.log(`Updated images for product: ${product.name}`)
        console.log(`  New: ${updatedImages[0]}`)
      }
    }

    // Update artisans
    console.log('\nUpdating artisan avatars...')
    const artisans = await Artisan.find({})
    let artisanUpdatedCount = 0

    for (const artisan of artisans) {
      const updatedAvatar = convertImagePath(artisan.avatar)
      
      if (artisan.avatar !== updatedAvatar) {
        await Artisan.findByIdAndUpdate(artisan._id, {
          avatar: updatedAvatar
        })
        artisanUpdatedCount++
        console.log(`Updated avatar for artisan: ${artisan.name}`)
        console.log(`  New: ${updatedAvatar}`)
      }
    }

    console.log(`\n🎉 Image reference update complete!`)
    console.log(`✅ Products updated: ${productUpdatedCount}`)
    console.log(`✅ Artisans updated: ${artisanUpdatedCount}`)
    
  } catch (error) {
    console.error('Error updating image references:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

updateImageReferences()