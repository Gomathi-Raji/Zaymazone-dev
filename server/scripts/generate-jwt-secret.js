#!/usr/bin/env node

/**
 * Generate a strong random JWT secret
 * Usage: node scripts/generate-jwt-secret.js
 */

import crypto from 'crypto'

const secret = crypto.randomBytes(32).toString('hex')

console.log('🔐 Generated strong JWT secret (32 bytes / 64 hex characters):')
console.log('─'.repeat(70))
console.log(secret)
console.log('─'.repeat(70))
console.log('\n📋 Add this to your .env or .env.production file:')
console.log('JWT_SECRET=' + secret)
console.log('\n✅ Done! This secret is cryptographically secure.')
