#!/usr/bin/env node
import 'dotenv/config'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Artisan from '../models/Artisan.js'
import fs from 'fs'

// Simple arg parsing
const argv = process.argv.slice(2)
const args = {}
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a.startsWith('--')) {
    const key = a.replace(/^--/, '')
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true
    args[key] = val
  }
}

const mongoUri = args['mongo-uri'] || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaymazone'
const reportPath = args['report'] || 'clean-image-report.json'
const doApply = args['apply'] === true || args['apply'] === 'true'

function cleanImagePath(path) {
  if (!path) return path
  if (path.includes('localhost:4000/api/images/')) return path.split('/').pop()
  if (path.includes('/api/images/')) return path.split('/').pop()
  if (path.startsWith('assets/')) return path.replace('assets/', '')
  if (path.startsWith('/assets/')) return path.replace('/assets/', '')
  return path
}

async function run() {
  console.log('Connecting to MongoDB...', mongoUri)
  await mongoose.connect(mongoUri)
  console.log('Connected')

  const report = { products: [], artisans: [] }

  const products = await Product.find({})
  for (const product of products) {
    const original = Array.isArray(product.images) ? product.images.slice() : []
    const cleaned = original.map(cleanImagePath)
    const diffs = []
    for (let i = 0; i < original.length; i++) {
      if (original[i] !== cleaned[i]) diffs.push({ index: i, from: original[i], to: cleaned[i] })
    }
    if (diffs.length) {
      report.products.push({ id: product._id.toString(), name: product.name, diffs })
      if (doApply) {
        await Product.findByIdAndUpdate(product._id, { images: cleaned })
      }
    }
  }

  const artisans = await Artisan.find({})
  for (const artisan of artisans) {
    const original = artisan.avatar || ''
    const cleaned = cleanImagePath(original)
    if (original !== cleaned) {
      report.artisans.push({ id: artisan._id.toString(), name: artisan.name, from: original, to: cleaned })
      if (doApply) {
        await Artisan.findByIdAndUpdate(artisan._id, { avatar: cleaned })
      }
    }
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`Report written to ${reportPath}`)
  console.log(`Products changed: ${report.products.length}`)
  console.log(`Artisans changed: ${report.artisans.length}`)

  await mongoose.disconnect()
  console.log('Disconnected')
  if (!doApply) {
    console.log('Dry-run complete. Rerun with --apply true to persist changes.')
  } else {
    console.log('Applied changes to database.')
  }
}

run().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
