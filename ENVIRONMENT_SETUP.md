# Environment Configuration Guide

This guide covers setting up environment variables for Zaymazone in development and production.

## Overview

- **`.env.example`** - Template file showing all available variables (commit to repo)
- **`.env`** - Your local development environment (DO NOT commit)
- **`.env.production`** - Production-specific configuration (use secrets manager)
- **`server/src/config/environment.js`** - Validation utility that checks all required variables

## Quick Start

### Development Setup

1. **Copy the template files:**
   ```bash
   # Frontend
   cp .env.example .env
   
   # Backend
   cp server/.env.example server/.env
   ```

2. **Fill in your local values** in `.env` and `server/.env`

3. **Generate a strong JWT secret** (for development, strong one needed for production):
   ```bash
   node server/scripts/generate-jwt-secret.js
   ```
   Add the generated secret to `server/.env`:
   ```
   JWT_SECRET=<generated-secret>
   ```

4. **Start development server:**
   ```bash
   cd server
   npm run dev
   ```

### Production Setup

1. **Use your hosting platform's secrets manager:**
   - **Vercel** (Frontend): Project Settings → Environment Variables
   - **Render** (Backend): Service Settings → Environment
   - **AWS**: Secrets Manager
   - **Azure**: Key Vault
   - **Heroku**: Config Vars

2. **Generate production secrets:**
   ```bash
   # Strong JWT secret (must be done locally, then added to secrets manager)
   node server/scripts/generate-jwt-secret.js
   ```

3. **Set the following critical variables** in your platform's secrets manager:
   - `NODE_ENV=production`
   - `JWT_SECRET=<your-generated-secret>`
   - `MONGODB_URI=<production-mongodb-uri>`
   - `FIREBASE_PROJECT_ID=<production-firebase-id>`
   - All Payment API keys (Paytm, Zoho, etc.)

## Required Environment Variables

### Backend (.env / .env.production)

**Critical (Application will not start without these):**
- `NODE_ENV` - "development" | "production" | "test"
- `PORT` - Server port (default: 4000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong random secret (minimum 32 characters)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `CORS_ORIGIN` - Comma-separated list of allowed origins

**Important (Feature-related):**
- `PAYTM_MERCHANT_ID` - Paytm merchant ID (optional if mock mode enabled)
- `PAYTM_MERCHANT_KEY` - Paytm merchant key (optional if mock mode enabled)
- `PAYTM_MOCK_MODE` - Use true for testing without live credentials

**Optional (Nice-to-have):**
- `SENTRY_DSN` - Error tracking service
- `LOGROCKET_ID` - Session replay service
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - Email configuration
- `LOG_LEVEL` - Logging level (debug | info | warn | error)

### Frontend (.env)

**Required:**
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_API_URL` - Backend API URL (duplicate, being phased out)
- Firebase configuration (6 variables):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

## Firebase Setup

### Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click Settings ⚙️ → Project Settings
4. In the "Your apps" section, select your web app
5. Copy the Firebase configuration

### Production vs Development Firebase Project

- **Development**: Can use any Firebase project (even test project)
- **Production**: Must use dedicated Firebase project for security

## MongoDB Connection

### Development (Local)
```
MONGODB_URI=mongodb://localhost:27017/zaymazone
```

### Production (MongoDB Atlas)
Get connection string from [MongoDB Atlas](https://cloud.mongodb.com/):
1. Cluster → Connect → Connect your application
2. Copy the connection string
3. Replace `<password>` with actual password
4. Add to secrets manager

**Note:** If experiencing DNS issues, use direct replica-set URI instead of mongodb+srv://

## JWT Secret Generation

**For Development:**
Simple secret is fine (for testing purposes)

**For Production:**
Must use cryptographically strong secret:
```bash
node server/scripts/generate-jwt-secret.js
```

This generates a 32-byte (64 hex character) random secret suitable for production.

**Security Tips:**
- Never commit secrets to version control
- Never share secrets in logs or error messages
- Rotate secrets regularly (at least annually)
- Use different secrets for development and production
- Consider using a secrets manager (HashiCorp Vault, AWS Secrets Manager, etc.)

## CORS Configuration

### Development
```
CORS_ORIGIN=http://localhost:5173,http://localhost:8080,http://localhost:8081
```

### Production
```
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

**⚠️ Security Warning:** 
- NEVER use wildcard (`*`) in production
- Only include trusted domains
- Remove localhost origins from production

## Payment Gateway Setup

### Paytm Integration

1. Go to [Paytm Merchant Dashboard](https://merchant.paytm.com/)
2. Get credentials:
   - Merchant ID
   - Merchant Key
   - Website name
3. Add to `.env.production`:
   ```
   PAYTM_MERCHANT_ID=your_merchant_id
   PAYTM_MERCHANT_KEY=your_merchant_key
   PAYTM_WEBSITE=your_website_name
   PAYTM_MOCK_MODE=false
   ```

### Testing Payment Flow

Set `PAYTM_MOCK_MODE=true` to test without live credentials (returns mock responses)

## Environment Validation

The application validates all environment variables on startup.

### Validation Rules

1. **Required variables** must be present (application won't start without them)
2. **Type checking** - Numbers, booleans, and enums are validated
3. **Minimum length** - JWT_SECRET must be at least 32 characters
4. **Format validation** - MongoDB URI and CORS origins checked

### What Happens on Validation Error

```
❌ Environment Validation Errors:
   - Missing required variable: MONGODB_URI
   - JWT_SECRET must be at least 32 characters

📋 Please check your .env or .env.production file
📍 Looking for: /path/to/server/.env
📖 Reference: /path/to/server/.env.example
```

Application will not start until all errors are resolved.

## Troubleshooting

### "Missing required variable: MONGODB_URI"
- Check that `server/.env` exists
- Verify MONGODB_URI is set and not empty
- For local dev: use `mongodb://localhost:27017/zaymazone`

### "JWT_SECRET must be at least 32 characters"
- Generate new secret: `node server/scripts/generate-jwt-secret.js`
- Use the generated value in `.env`

### "CORS blocked for origin: https://example.com"
- Add your domain to `CORS_ORIGIN` in environment file
- Multiple origins separated by comma: `https://example.com,https://app.example.com`

### "Cannot find module 'dotenv/config'"
- Install dependencies: `npm install` (in both root and server directories)

### Firebase authentication failing
- Verify VITE_FIREBASE_* variables in `.env`
- Check they match your Firebase project
- For production, use production Firebase project credentials

## Migration from Old Setup

If migrating from old environment setup:

1. **Update frontend:**
   - Replace all hardcoded Firebase keys with `VITE_FIREBASE_*` env vars
   - Move API URLs to `VITE_API_BASE_URL`
   - Remove any hardcoded secrets from code

2. **Update backend:**
   - Move JWT_SECRET from code to `.env`
   - Move MongoDB URI to MONGODB_URI env var
   - Move Firebase credentials to Firebase console
   - Move Payment API keys to `.env`

3. **Remove secrets from version control:**
   ```bash
   git rm --cached .env server/.env
   git commit -m "Remove secrets from version control"
   ```

4. **Verify .gitignore:**
   ```
   .env
   .env.local
   .env.production
   .env.*.local
   ```

## Deployment Platforms

### Vercel (Frontend)
1. Connect GitHub repository
2. Go to Settings → Environment Variables
3. Add all `VITE_*` variables
4. Redeploy after changes

### Render (Backend)
1. Go to Service → Settings → Environment
2. Add all variables (including NODE_ENV=production)
3. Service will restart automatically

### AWS / Azure / Heroku
Refer to platform documentation for setting environment variables in production.

## Security Best Practices

1. ✅ Store secrets in platform's secrets manager, not `.env` files
2. ✅ Use strong, randomly-generated JWT secrets (64+ hex characters for production)
3. ✅ Never commit `.env` files to version control
4. ✅ Rotate secrets regularly (quarterly or when compromised)
5. ✅ Use different Firebase projects for dev/prod
6. ✅ Restrict CORS origins to necessary domains only
7. ✅ Use HTTPS only in production
8. ✅ Never log or expose sensitive values
9. ✅ Use strong database passwords
10. ✅ Enable IP whitelisting for databases (MongoDB Atlas)

## Additional Resources

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Paytm Developer Documentation](https://developer.paytm.com/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
