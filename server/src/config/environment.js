/**
 * Environment Configuration Validation
 * Ensures all required environment variables are set and valid
 * Should be called at application startup
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
const envPath = path.resolve(__dirname, '..', '..', envFile)

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  console.warn(`⚠️  ${envFile} not found at ${envPath}`)
}

// Define required environment variables
const requiredVars = {
  // Critical (always required)
  MONGODB_URI: { type: 'string', minLength: 20 },
  JWT_SECRET: { type: 'string', minLength: 32 },
  PORT: { type: 'number', default: 4000 },
  NODE_ENV: { type: 'string', enum: ['development', 'production', 'test'] },
  
  // Firebase (required for auth)
  FIREBASE_PROJECT_ID: { type: 'string', minLength: 1 },
  
  // CORS
  CORS_ORIGIN: { type: 'string', minLength: 1 },
}

const optionalVars = {
  // Payment gateways (optional for testing)
  PAYTM_MERCHANT_ID: { type: 'string' },
  PAYTM_MERCHANT_KEY: { type: 'string' },
  PAYTM_MOCK_MODE: { type: 'boolean', default: true },
  
  // Email (optional)
  SMTP_HOST: { type: 'string' },
  SMTP_PORT: { type: 'number' },
  
  // Monitoring (optional)
  SENTRY_DSN: { type: 'string' },
  LOGROCKET_ID: { type: 'string' },
  
  // Logging
  LOG_LEVEL: { type: 'string', default: 'info' },
  
  // Feature flags
  FEATURE_PAYMENT_ENABLED: { type: 'boolean', default: true },
  FEATURE_ARTISAN_APPROVAL_ENABLED: { type: 'boolean', default: true },
  FEATURE_REVIEWS_ENABLED: { type: 'boolean', default: true },
}

/**
 * Validate a single environment variable
 */
function validateVar(name, value, config) {
  if (!config) return { valid: true }
  
  // Check if required but missing
  if (value === undefined || value === '') {
    return { valid: false, error: `Missing required variable: ${name}` }
  }
  
  // Type validation
  if (config.type === 'number') {
    const num = Number(value)
    if (isNaN(num)) {
      return { valid: false, error: `${name} must be a number, got: ${value}` }
    }
  }
  
  if (config.type === 'boolean') {
    if (!['true', 'false', '1', '0', 'yes', 'no'].includes(String(value).toLowerCase())) {
      return { valid: false, error: `${name} must be boolean (true/false), got: ${value}` }
    }
  }
  
  // Enum validation
  if (config.enum && !config.enum.includes(value)) {
    return { valid: false, error: `${name} must be one of: ${config.enum.join(', ')}, got: ${value}` }
  }
  
  // Minimum length validation
  if (config.minLength && String(value).length < config.minLength) {
    return { valid: false, error: `${name} must be at least ${config.minLength} characters, got: ${String(value).length}` }
  }
  
  return { valid: true }
}

/**
 * Validate all environment variables
 */
export function validateEnvironment() {
  const errors = []
  const warnings = []
  
  console.log('🔍 Validating environment variables...')
  
  // Check required variables
  for (const [name, config] of Object.entries(requiredVars)) {
    const value = process.env[name]
    const validation = validateVar(name, value, config)
    
    if (!validation.valid) {
      errors.push(validation.error)
    }
  }
  
  // Check optional variables (warn if invalid format, but don't fail)
  for (const [name, config] of Object.entries(optionalVars)) {
    const value = process.env[name]
    if (value !== undefined && value !== '') {
      const validation = validateVar(name, value, config)
      if (!validation.valid) {
        warnings.push(`⚠️  ${validation.error}`)
      }
    }
  }
  
  // Specific validations
  if (process.env.MONGODB_URI) {
    if (!process.env.MONGODB_URI.includes('mongodb')) {
      errors.push('MONGODB_URI must be a valid MongoDB connection string')
    }
  }
  
  if (process.env.JWT_SECRET === 'change-me' || process.env.JWT_SECRET === 'your_jwt_secret') {
    if (process.env.NODE_ENV === 'production') {
      errors.push('JWT_SECRET must be changed from default value in production')
    } else {
      warnings.push('⚠️  JWT_SECRET is using default value (change for production)')
    }
  }
  
  if (process.env.CORS_ORIGIN === '*') {
    if (process.env.NODE_ENV === 'production') {
      errors.push('CORS_ORIGIN must not use wildcard (*) in production')
    } else {
      warnings.push('⚠️  CORS_ORIGIN is using wildcard (*) - restrict in production')
    }
  }
  
  // Print warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:')
    warnings.forEach(w => console.warn(w))
  }
  
  // Handle errors
  if (errors.length > 0) {
    console.error('❌ Environment Validation Errors:')
    errors.forEach(e => console.error(`   - ${e}`))
    console.error('\n📋 Please check your .env or .env.production file')
    console.error(`📍 Looking for: ${envPath}`)
    console.error(`📖 Reference: ${path.resolve(__dirname, '..', '..', '.env.example')}`)
    throw new Error(`Environment validation failed: ${errors.length} error(s)`)
  }
  
  console.log('✅ Environment variables validated successfully')
}

/**
 * Get a configuration value with type conversion
 */
export function getConfig(name, defaultValue = undefined) {
  const value = process.env[name]
  
  if (value === undefined) return defaultValue
  
  const config = requiredVars[name] || optionalVars[name]
  
  if (config?.type === 'number') {
    return Number(value)
  }
  
  if (config?.type === 'boolean') {
    return ['true', '1', 'yes'].includes(String(value).toLowerCase())
  }
  
  return value
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureName) {
  return getConfig(`FEATURE_${featureName.toUpperCase()}_ENABLED`, true)
}

// Validate on import in production
if (process.env.NODE_ENV === 'production') {
  validateEnvironment()
}

export default {
  validateEnvironment,
  getConfig,
  isFeatureEnabled,
}
