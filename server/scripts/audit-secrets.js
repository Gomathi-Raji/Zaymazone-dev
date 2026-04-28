#!/usr/bin/env node

/**
 * Audit script to detect potential hardcoded secrets in the codebase
 * Usage: node scripts/audit-secrets.js
 * 
 * Searches for patterns that might indicate hardcoded secrets:
 * - API keys
 * - JWT tokens
 * - Database credentials
 * - Firebase keys
 * - Payment gateway credentials
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')

// Patterns to detect potential secrets
const secretPatterns = [
  { pattern: /AIza[a-zA-Z0-9\-_]{35}/, name: 'Firebase API Key' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  { pattern: /mongodb:\/\/.*:.*@/, name: 'MongoDB URI with credentials' },
  { pattern: /postgres:\/\/.*:.*@/, name: 'PostgreSQL URI with credentials' },
  { pattern: /Bearer\s+[a-zA-Z0-9\-_]{32,}/, name: 'Bearer Token' },
  { pattern: /eyJ[a-zA-Z0-9_\-]{20,}/, name: 'JWT Token' },
  { pattern: /pk_live_[a-zA-Z0-9]{20,}/, name: 'Stripe Key' },
  { pattern: /sk_live_[a-zA-Z0-9]{20,}/, name: 'Stripe Secret' },
  { pattern: /paytm_.*?[=:]\s*['\"]?[a-zA-Z0-9]{20,}/, name: 'Paytm Credential' },
  { pattern: /api[_-]?key[=:\s]+['\"]?[a-zA-Z0-9]{20,}['\"]?/i, name: 'API Key' },
  { pattern: /secret[=:\s]+['\"]?[a-zA-Z0-9]{20,}['\"]?/i, name: 'Secret Key' },
  { pattern: /password[=:\s]+['\"]?[^\s'\"{}<>&]{8,}['\"]?/i, name: 'Password' },
]

// Files/folders to skip
const skipPatterns = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.env.example',
  '.env.production',
  '*.log',
  '.next',
  'coverage',
  '.vscode',
  'ENVIRONMENT_SETUP.md',
  'audit-secrets.js',
]

function shouldSkip(filePath) {
  return skipPatterns.some(pattern => {
    if (pattern.startsWith('*')) {
      return filePath.endsWith(pattern.slice(1))
    }
    return filePath.includes(pattern)
  })
}

function isTextFile(filePath) {
  const ext = path.extname(filePath)
  const textExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.json',
    '.html', '.css', '.scss', '.md',
    '.env', '.yml', '.yaml', '.xml',
  ]
  return textExtensions.includes(ext)
}

function scanFile(filePath) {
  try {
    if (!isTextFile(filePath)) return []

    const content = fs.readFileSync(filePath, 'utf8')
    const findings = []

    secretPatterns.forEach(({ pattern, name }) => {
      const matches = content.matchAll(new RegExp(pattern, 'g'))
      for (const match of matches) {
        const lineNum = content.substring(0, match.index).split('\n').length
        findings.push({
          file: path.relative(projectRoot, filePath),
          line: lineNum,
          type: name,
          value: match[0].substring(0, 50) + (match[0].length > 50 ? '...' : ''),
        })
      }
    })

    return findings
  } catch (error) {
    return []
  }
}

function scanDirectory(dirPath) {
  let findings = []

  try {
    const files = fs.readdirSync(dirPath)

    files.forEach(file => {
      const filePath = path.join(dirPath, file)
      if (shouldSkip(filePath)) return

      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        findings = [...findings, ...scanDirectory(filePath)]
      } else if (stat.isFile()) {
        findings = [...findings, ...scanFile(filePath)]
      }
    })
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message)
  }

  return findings
}

console.log('🔍 Scanning for potential hardcoded secrets...\n')

const findings = scanDirectory(projectRoot)

if (findings.length === 0) {
  console.log('✅ No obvious hardcoded secrets detected')
  console.log('\n⚠️  Note: This is not a complete security scan.')
  console.log('   Always review code for sensitive data before deployment.')
} else {
  console.log(`❌ Found ${findings.length} potential secret(s):\n`)

  // Group by type
  const grouped = findings.reduce((acc, finding) => {
    if (!acc[finding.type]) acc[finding.type] = []
    acc[finding.type].push(finding)
    return acc
  }, {})

  Object.entries(grouped).forEach(([type, items]) => {
    console.log(`\n🔐 ${type} (${items.length}):`)
    items.slice(0, 5).forEach(item => {
      console.log(`   📄 ${item.file}:${item.line}`)
      console.log(`      → ${item.value}`)
    })
    if (items.length > 5) {
      console.log(`   ... and ${items.length - 5} more`)
    }
  })

  console.log('\n⚠️  ACTION REQUIRED:')
  console.log('   1. Review findings above')
  console.log('   2. Move secrets to environment variables')
  console.log('   3. Remove from source code')
  console.log('   4. Force-push to remote (if already committed)')
  console.log('   5. Rotate the compromised secrets')
}

console.log('\n📚 Reference: ENVIRONMENT_SETUP.md')
