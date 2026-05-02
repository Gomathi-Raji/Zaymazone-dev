import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import FormData from 'form-data'

const API_BASE_URL = 'https://zaymazone-test.onrender.com/api'

async function uploadTeamImage(imagePath, filename) {
  try {
    const form = new FormData()
    form.append('image', fs.createReadStream(imagePath))
    form.append('filename', filename)

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: form
    })

    const result = await response.json()

    if (response.ok) {
      console.log(`✅ Uploaded ${filename}:`, result.message)
    } else {
      console.error(`❌ Failed to upload ${filename}:`, result.error)
    }

    return response.ok
  } catch (error) {
    console.error(`❌ Error uploading ${filename}:`, error.message)
    return false
  }
}

async function uploadAllTeamImages() {
  const teamImages = ['team1.jpg', 'team2.png', 'team3.jpg']
  const assetDir = path.join(process.cwd(), '../src/assets')

  console.log('Starting team image upload to production...')

  for (const imageName of teamImages) {
    const imagePath = path.join(assetDir, imageName)

    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image not found: ${imagePath}`)
      continue
    }

    console.log(`Uploading ${imageName}...`)
    await uploadTeamImage(imagePath, imageName)

    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('Team image upload completed!')
}

uploadAllTeamImages()