# Error Explanations & Solutions

## The Errors You're Seeing

### Error 1: `net::ERR_CONNECTION_REFUSED` for Images
```
localhost:4000/api/images/1777579809924-intier65cif.jpg:1
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**Why it happens**:
- Your Vercel deployment (hosted on vercel.app domain) tries to load images from `http://localhost:4000`
- Browser runs on Vercel servers, not your local machine
- Can't connect to localhost from the cloud
- This is a **frontend-backend URL mismatch** issue

**The Fix**:
- ✅ Automatically uses `https://zaymazone-dev-backend.onrender.com/api/images/...` when on Vercel
- ✅ Still uses `http://localhost:4000` for local development
- ✅ Environment variables can override the default

---

### Error 2: `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`
```
Orders-D-ITE4YO.js:1
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html".
```

**Why it happens**:
- Dynamic imports of chunks fail because routes return HTML instead of JS
- This is a **routing/rewrite issue** in Vercel configuration

**The Fix**:
- ✅ Updated `vercel.json` with proper rewrite rules
- ✅ Added correct Cache-Control headers for assets
- ✅ Proper MIME type headers for `/assets/*.js` files

---

### Error 3: `Failed to load resource: the server responded with a status of 404` for API
```
api/artisans/stats/impact:1
Failed to load resource: the server responded with a status of 404 ()
```

**Why it happens**:
1. Backend endpoint might not exist
2. Backend is not responding (connection issue)
3. Wrong API URL being used

**Common Causes**:
- Backend suspended on Render (free tier auto-suspends after 15 min of inactivity)
- Missing endpoint implementation
- Typo in endpoint path

**The Fix**:
- ✅ Backend URL is now correct (Render)
- ✅ Verify endpoint exists in `server/src/routes/artisans.js`
- ✅ Check Render dashboard to ensure backend is running

---

### Error 4: `TypeError: Failed to fetch dynamically imported module`
```
index-Cjtj4zyP.js:41
TypeError: Failed to fetch dynamically imported module:
https://zaymazone-test2.vercel.app/assets/Orders-D-ITE4YO.js
```

**Why it happens**:
- Vite code splitting creates chunks dynamically
- Router tries to load chunks from `https://zaymazone-test2.vercel.app/assets/...`
- Vercel returns 404 or HTML instead of JS file

**Root Cause**:
- Incorrect `vercel.json` rewrites configuration
- Vercel tries to rewrite these requests to `index.html`

**The Fix**:
- ✅ Proper exclude pattern in `vercel.json` to NOT rewrite `/assets/*` and `/api/*` routes
- ✅ Correct regex: `/((?!_next)(?!api).*)`

---

## How Your App Routes Work

### Before Fix (❌ Broken)
```
Browser (Vercel)
    ↓
    Tries to fetch: http://localhost:4000/api/images/...
    ↓
    Connection refused! (localhost unreachable from cloud)
```

### After Fix (✅ Working)
```
Browser (Vercel)
    ↓
    Checks current location: window.location.origin
    ↓
    Detects: "https://zaymazone-test2.vercel.app" (not localhost)
    ↓
    Automatically uses: https://zaymazone-dev-backend.onrender.com/api/images/...
    ↓
    Image loads! ✓
```

---

## Data Flow Summary

### Local Development
```
Your Computer
├── Frontend: http://localhost:8080 (Vite dev server)
└── Backend: http://localhost:4000 (Express server)
             ↓
        .env file: VITE_API_BASE_URL=http://localhost:4000/api
             ↓
        api.ts detects localhost, uses http://localhost:4000
```

### Production (Vercel + Render)
```
Vercel Cloud                    Render Cloud
├── Frontend                    ├── Backend
│   https://...vercel.app       │   https://...onrender.com
│   ↓                           │   (Node + Express + MongoDB)
│   Vercel Env Vars             │
│   VITE_API_BASE_URL=          │
│   https://...onrender.com/api │
│   ↓                           │
│   api.ts detects non-localhost│
│   ↓                           │
│   Fetches from Render ←───────┘
```

---

## Configuration Files Changed

### 1. `vercel.json` - Routing & Headers
**Before**:
```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Problems**:
- ❌ Rewrites `/assets/chunk.js` to `/index.html`
- ❌ Returns HTML with wrong MIME type
- ❌ Browser expects JS, gets HTML

**After**:
```json
{
  "rewrites": [
    {
      "source": "/((?!_next)(?!api).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript"
        }
      ]
    }
  ]
}
```

**Fixes**:
- ✅ Doesn't rewrite `/assets/*` files
- ✅ Sets correct MIME type for JS files
- ✅ Allows dynamic imports to work

---

### 2. `src/lib/api.ts` - API URL Detection
**Before**:
```javascript
if (import.meta.env.DEV) {
    return "http://localhost:4000";  // ❌ Wrong on Vercel
}
// Falls back to vercel.app backend ❌
return "https://zaymazone-dev-backend.vercel.app";
```

**Problems**:
- ❌ `import.meta.env.DEV` doesn't detect Vercel environment correctly
- ❌ Always returns localhost even on Vercel

**After**:
```javascript
const isLocalhostUrl = apiUrl.includes('localhost');
const isProduction = !window.location.hostname.includes('localhost');

if (isLocalhostUrl && isProduction) {
    // ✅ Ignore localhost config in production
}

// Check actual window location
const isLocalDev = window.location.origin.includes('localhost');
if (isLocalDev) {
    return "http://localhost:4000";  // ✅ Local dev
}

// Production - use Render
return "https://zaymazone-dev-backend.onrender.com";  // ✅ Render
```

**Fixes**:
- ✅ Detects actual environment from `window.location`
- ✅ Ignores localhost config when on Vercel
- ✅ Uses Render backend in production

---

## Why These Changes Work

### Problem 1: Localhost Unreachable
**Fix**: Check `window.location.hostname` instead of relying on environment variables

### Problem 2: Wrong Backend URL
**Fix**: Update fallback from `vercel.app` to `render.com` (your actual backend)

### Problem 3: Environment Variables Not Set
**Fix**: Vercel config detects hostname directly from browser location

### Problem 4: Dynamic Imports Failing
**Fix**: Update `vercel.json` to not rewrite asset requests

---

## Testing Commands

### Test Local Development
```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend
cd server && npm start

# Open: http://localhost:8080
# Should see: "API configured with base URL: http://localhost:4000"
```

### Test Production URL
```bash
# In browser console on https://zaymazone-test2.vercel.app:
# You should see: "API configured with base URL: https://zaymazone-dev-backend.onrender.com"
```

### Test Backend Health
```bash
curl https://zaymazone-dev-backend.onrender.com/api/products
# Should return: JSON array of products (not 404 or error)
```

---

## Checklist: Verify Each Fix

- [ ] `vercel.json` has correct rewrites (not rewriting `/assets/*`)
- [ ] `vercel.json` has headers for JS MIME type
- [ ] `src/lib/api.ts` checks `window.location.hostname`
- [ ] `src/services/api.ts` uses Render backend fallback
- [ ] `src/lib/backendApi.ts` uses Render backend fallback
- [ ] Environment variables set in Vercel dashboard
- [ ] Backend running on Render (status: "Live")
- [ ] Deployment pushed to GitHub and Vercel shows "Ready"
