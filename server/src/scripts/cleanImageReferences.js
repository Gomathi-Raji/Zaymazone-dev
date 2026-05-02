import 'dotenv/config'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Artisan from '../models/Artisan.js'

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaymazone'

// Function to clean image URLs - remove localhost URLs and keep just filenames
function cleanImagePath(path) {
  if (path.includes('localhost:4000/api/images/')) {
    // Extract just the filename from localhost URL
    return path.split('/').pop();
  }
  if (path.includes('/api/images/')) {
    // Extract just the filename from API URL
    return path.split('/').pop();
  }
  if (path.startsWith('assets/')) {
    // Convert assets/ path to just filename
    return path.replace('assets/', '');
  }
  if (path.startsWith('/assets/')) {
    // Convert /assets/ path to just filename
    return path.replace('/assets/', '');
  }
  // If it's already just a filename, return as is
  return path;
}

async function cleanImageReferences() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Update products
    console.log('Cleaning product image URLs...')
    const products = await Product.find({})
    let productUpdatedCount = 0

    for (const product of products) {
      const cleanedImages = product.images.map(cleanImagePath)
      
      const hasChanges = product.images.some((img, index) => img !== cleanedImages[index])
      
      if (hasChanges) {
        await Product.findByIdAndUpdate(product._id, {
          images: cleanedImages
        })
        productUpdatedCount++
        console.log(`Cleaned images for product: ${product.name}`)
        console.log(`  Old: ${product.images[0]}`)
        console.log(`  New: ${cleanedImages[0]}`)
      }
    }

    // Update artisans
    console.log('\nCleaning artisan avatar URLs...')
    const artisans = await Artisan.find({})
    let artisanUpdatedCount = 0

    for (const artisan of artisans) {
      const cleanedAvatar = cleanImagePath(artisan.avatar)
      
      if (artisan.avatar !== cleanedAvatar) {
        await Artisan.findByIdAndUpdate(artisan._id, {
          avatar: cleanedAvatar
        })
        artisanUpdatedCount++
        console.log(`Cleaned avatar for artisan: ${artisan.name}`)
        console.log(`  Old: ${artisan.avatar}`)
        console.log(`  New: ${cleanedAvatar}`)
      }
    }

    console.log(`\n✅ Update complete!`)
    console.log(`Updated ${productUpdatedCount} products`)
    console.log(`Updated ${artisanUpdatedCount} artisans`)

  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

cleanImageReferences()