# Vercel Deployment Setup Guide

## Problem Analysis

Your application has multiple connectivity issues:

1. **Frontend deployed on Vercel** trying to reach **localhost:4000** from the browser (impossible)
2. **Environment variables not configured** in Vercel dashboard
3. **Backend URL hardcoded** to localhost in `.env` file
4. **Dynamic module import errors** due to incorrect rewrites
5. **Missing CORS headers** for asset loading

## Solution Summary

The code has been updated to:
- Detect production vs development automatically
- Fall back to Render backend (https://zaymazone-dev-backend.onrender.com) when not on localhost
- Properly handle environment variables from Vercel
- Fixed vite configuration and rewrites

## What You Need to Do

### Step 1: Update Vercel Environment Variables

Go to your **Vercel project dashboard** → **Settings** → **Environment Variables** and add:

```
VITE_API_BASE_URL = https://zaymazone-dev-backend.onrender.com/api
VITE_API_URL = https://zaymazone-dev-backend.onrender.com/api
```

**Important**: These must be added as follows:
- Key: `VITE_API_BASE_URL`
- Value: `https://zaymazone-dev-backend.onrender.com/api`
- Select: **Production**, **Preview**, and **Development**

Repeat for `VITE_API_URL`

### Step 2: Ensure Backend is Running on Render

1. Go to https://render.com and log in
2. Navigate to your **zaymazone-dev-backend** service
3. Check if it's **"Live"** (running) or **"Suspended"**
4. If suspended, click **"Resume"** to start it
5. Verify it's accessible at: https://zaymazone-dev-backend.onrender.com/api/health (or similar endpoint)

### Step 3: Deploy Changes to Vercel

1. Push your changes to GitHub:
```bash
git add .
git commit -m "Fix: API URL detection for production deployments"
git push origin main
```

2. Vercel will automatically redeploy. Monitor at https://vercel.com/dashboard

3. Once deployment completes, open your Vercel app URL and check browser console for logs

### Step 4: Verify the Fix

1. Open your Vercel deployment URL: https://zaymazone-test2.vercel.app
2. Open browser DevTools (F12) → Console tab
3. You should see logs like:
   ```
   API configured with base URL: https://zaymazone-dev-backend.onrender.com/api
   ```

4. Images should load from the backend
5. API endpoints should return data (no more 404s)

## Common Issues & Solutions

### Issue: Still seeing "localhost:4000" errors

**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R on Windows)
- Check that environment variables are set in Vercel dashboard
- Verify the deployment shows the new code (check `/src/lib/api.ts` in Vercel build logs)

### Issue: 404 errors on `/api/artisans/stats/impact`

**Possible causes**:
1. Backend not running - Check Render dashboard
2. Endpoint doesn't exist in backend - Check `/server/routes/artisans.js`
3. Backend URL incorrect - Verify environment variable in Vercel

**Solution**:
```bash
# Test backend is running
curl https://zaymazone-dev-backend.onrender.com/api/artisans/stats/impact

# If that fails, backend needs to be deployed or restarted
```

### Issue: MIME type errors for JS files

**Solution**: Already fixed in `vercel.json` with proper headers

### Issue: Images still not loading

**Causes**:
1. Backend `/api/images` endpoint not working
2. Image files not stored in backend
3. Backend CORS not allowing Vercel origin

**Check**:
```bash
# Test direct image URL
curl https://zaymazone-dev-backend.onrender.com/api/images/1777579809924-intier65cif.jpg
```

## Development vs Production

### Local Development
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:4000
- Environment: Uses `.env` file with `VITE_API_BASE_URL=http://localhost:4000/api`

### Vercel Production
- **Frontend**: https://zaymazone-test2.vercel.app
- **Backend**: https://zaymazone-dev-backend.onrender.com
- Environment: Uses Vercel dashboard environment variables

## Next Steps

1. **Local Testing**: Test with your local backend running
   ```bash
   npm run dev        # Frontend on http://localhost:8080
   cd server && npm start  # Backend on http://localhost:4000
   ```

2. **Verify Backend Endpoints**: 
   - [ ] GET `/api/artisans/stats/impact`
   - [ ] GET `/api/images/{filename}`
   - [ ] GET `/api/products`
   - [ ] All CRUD operations

3. **Monitor Vercel Deployment**:
   - Check build logs for errors
   - Monitor browser console on production URL
   - Set up Vercel alerts for deployment failures

4. **Render Backend Health**:
   - Monitor Render dashboard for service crashes
   - Set up auto-deploy from GitHub
   - Consider upgrading from free tier if needed

## Environment Variables Reference

### Frontend (.env local development)
```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_URL=http://localhost:4000/api
VITE_FIREBASE_API_KEY=...
# ... other Firebase keys
```

### Vercel Dashboard
```
VITE_API_BASE_URL=https://zaymazone-dev-backend.onrender.com/api
VITE_API_URL=https://zaymazone-dev-backend.onrender.com/api
VITE_FIREBASE_API_KEY=...
# ... other Firebase keys (same as development)
```

### Backend (server/.env)
```
MONGODB_URI=...
FIREBASE_...=...
CORS_ORIGIN=https://zaymazone-test2.vercel.app,http://localhost:8080,...
```

## Files Modified

- ✅ `src/lib/api.ts` - Fixed API URL detection logic
- ✅ `src/services/api.ts` - Updated fallback URLs
- ✅ `src/services/adminService.ts` - Updated fallback URLs
- ✅ `vercel.json` - Fixed rewrites and added headers
