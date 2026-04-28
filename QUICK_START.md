# Environment Setup Quick Reference

Quick reference for developers setting up Zaymazone development environment.

## 5-Minute Setup

### Step 1: Create Environment Files
```bash
cd d:\Projects\Work\Zaymazone-dev
copy .env.example .env
copy server\.env.example server\.env
```

### Step 2: Generate JWT Secret
```bash
cd server
node scripts/generate-jwt-secret.js
```
Copy the output and paste into `server/.env` for `JWT_SECRET`

### Step 3: Set Minimal .env Values

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_URL=http://localhost:4000/api
VITE_FIREBASE_API_KEY=<get from Firebase Console>
VITE_FIREBASE_AUTH_DOMAIN=<get from Firebase Console>
VITE_FIREBASE_PROJECT_ID=<get from Firebase Console>
VITE_FIREBASE_STORAGE_BUCKET=<get from Firebase Console>
VITE_FIREBASE_MESSAGING_SENDER_ID=<get from Firebase Console>
VITE_FIREBASE_APP_ID=<get from Firebase Console>
```

**Backend (server/.env):**
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/zaymazone
JWT_SECRET=<from step 2 above>
FIREBASE_PROJECT_ID=<from Firebase Console>
CORS_ORIGIN=http://localhost:5173,http://localhost:8080,http://localhost:8081
PAYTM_MOCK_MODE=true
```

### Step 4: Start Development
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

✅ Should see: `✅ Environment variables validated successfully`

## Getting Firebase Credentials

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Scroll to "Your apps" → Select web app
5. Copy the config object:
   ```javascript
   const config = {
     apiKey: "← VITE_FIREBASE_API_KEY",
     authDomain: "← VITE_FIREBASE_AUTH_DOMAIN",
     projectId: "← VITE_FIREBASE_PROJECT_ID",
     storageBucket: "← VITE_FIREBASE_STORAGE_BUCKET",
     messagingSenderId: "← VITE_FIREBASE_MESSAGING_SENDER_ID",
     appId: "← VITE_FIREBASE_APP_ID"
   }
   ```

## Getting MongoDB

**Option A: Local MongoDB**
```bash
# Install from https://www.mongodb.com/try/download/community
# Start MongoDB
mongod

# Use in .env:
MONGODB_URI=mongodb://localhost:27017/zaymazone
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://cloud.mongodb.com/
2. Create cluster
3. Create database user
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Add to `server/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=zaymazone
```

## Common Issues

### App won't start - "Missing required variable"
**Fix:**
1. Check `server/.env` exists
2. Copy from `server/.env.example` if missing
3. Fill in required values

### Firebase auth not working
**Check:**
- All 6 `VITE_FIREBASE_*` variables are set
- Values match your Firebase project
- For production: use production Firebase project

### MongoDB connection fails
**Check:**
- If local: `mongod` is running
- If Atlas: connection string is correct
- If Atlas: IP address is whitelisted

### "CORS blocked" error
**Fix:**
- Add your origin to `CORS_ORIGIN` in `server/.env`
- Multiple origins separated by comma:
  ```
  CORS_ORIGIN=http://localhost:5173,http://localhost:8080
  ```

## Common Commands

```bash
# Generate new JWT secret
node server/scripts/generate-jwt-secret.js

# Check for hardcoded secrets in code
node server/scripts/audit-secrets.js

# Start backend
cd server && npm run dev

# Start frontend
npm run dev

# Run tests
npm test
```

## What Each Variable Does

| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | App mode | `development` or `production` |
| `PORT` | Backend port | `4000` |
| `MONGODB_URI` | Database connection | `mongodb://localhost:27017/zaymazone` |
| `JWT_SECRET` | Auth token secret | 64-char random string |
| `FIREBASE_PROJECT_ID` | Firebase project | `your-project-id` |
| `CORS_ORIGIN` | Allowed frontend URLs | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:4000/api` |
| `VITE_FIREBASE_API_KEY` | Firebase public key | From Firebase Console |
| `PAYTM_MOCK_MODE` | Use fake payments | `true` for testing |

## Environment Variable Validation

The app automatically validates environment variables when it starts.

**Example success:**
```
🔍 Validating environment variables...
✅ Environment variables validated successfully
```

**Example error:**
```
❌ Environment Validation Errors:
   - Missing required variable: JWT_SECRET
   - JWT_SECRET must be at least 32 characters

📋 Please check your .env or .env.production file
```

## Useful .env Files Reference

| File | Purpose | Commit? | Location |
|------|---------|---------|----------|
| `.env.example` | Frontend template | ✅ Yes | Root |
| `.env` | Frontend values | ❌ NO | Root |
| `server/.env.example` | Backend template | ✅ Yes | server/ |
| `server/.env` | Backend values | ❌ NO | server/ |
| `server/.env.production` | Prod reference | ✅ Yes | server/ |

## For Production

See `ENVIRONMENT_CHECKLIST.md` for:
- Generating production JWT secrets
- Setting up production Firebase project
- Configuring Vercel environment variables
- Configuring Render environment variables
- Production deployment checklist

## Need More Help?

- **Full Setup Guide:** ENVIRONMENT_SETUP.md
- **Implementation Checklist:** ENVIRONMENT_CHECKLIST.md
- **Implementation Summary:** ENV_IMPLEMENTATION_SUMMARY.md
- **Validation Code:** server/src/config/environment.js

---

**Pro Tip:** After setting up .env files, run `node server/scripts/audit-secrets.js` to make sure no secrets are hardcoded in your source code!
