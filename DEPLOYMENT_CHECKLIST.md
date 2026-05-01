# Deployment Fix - Quick Verification Checklist

## Immediate Actions (Today)

### 1. Push Code Changes
```bash
cd d:\Projects\Work\Zaymazone-dev
git add .
git commit -m "fix: API URL detection and Vercel configuration for production"
git push origin main
```

### 2. Configure Vercel Environment Variables

**Go to**: https://vercel.com/dashboard → Select your project → Settings → Environment Variables

**Add these variables** (set for Production, Preview, and Development):

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://zaymazone-dev-backend.onrender.com/api` |
| `VITE_API_URL` | `https://zaymazone-dev-backend.onrender.com/api` |

**Steps**:
1. Click "Add New"
2. Enter key: `VITE_API_BASE_URL`
3. Enter value: `https://zaymazone-dev-backend.onrender.com/api`
4. Select checkboxes: ✅ Production ✅ Preview ✅ Development
5. Click "Save"
6. Repeat for `VITE_API_URL`

### 3. Verify Render Backend is Running

**Go to**: https://render.com/dashboard

1. Find "zaymazone-dev-backend" service
2. Check status:
   - ✅ **Live** (green) = Running ✓
   - ⏸️ **Suspended** = Click "Resume"
   - ❌ **Error** = Check logs

### 4. Wait for Vercel Redeploy

**Go to**: https://vercel.com/dashboard → Your project → Deployments

Monitor until you see:
- Status: "Ready" (green checkmark)
- Environment variables should show in deployment

---

## Testing After Deployment

### Test 1: Check Frontend Logs
1. Open: https://zaymazone-test2.vercel.app
2. Open DevTools: Press `F12`
3. Go to Console tab
4. Refresh page (`F5`)
5. Look for log:
   ```
   API configured with base URL: https://zaymazone-dev-backend.onrender.com/api
   ```
   **Expected**: ✅ Shows Render URL, not localhost

### Test 2: Check Image Loading
1. Navigate to a product page
2. Product images should load (not grayed out)
3. DevTools → Network tab
4. Filter: `img`
5. Images should load from: `https://zaymazone-dev-backend.onrender.com/api/images/...`
   **Expected**: Status 200, not "net::ERR_CONNECTION_REFUSED"

### Test 3: Check API Responses
1. DevTools → Network tab
2. Filter: `fetch` or `xhr`
3. Perform action (e.g., scroll products, view artisans)
4. Look for API calls to `/api/artisans`, `/api/products`, etc.
5. Responses should be 200, not 404
   **Expected**: API calls return data

### Test 4: Browser Console Errors
1. DevTools → Console tab
2. Should NOT see:
   - ❌ `localhost:4000 net::ERR_CONNECTION_REFUSED`
   - ❌ `MIME type of "text/html"` for JS files
   - ❌ Uncaught errors

---

## Troubleshooting

### If images still show "Failed to load"

**Step 1**: Verify backend image endpoint
```bash
# In terminal, test the endpoint:
curl "https://zaymazone-dev-backend.onrender.com/api/images/1777579809924-intier65cif.jpg"
```

**Expected response**: Image file or helpful error message

**If connection refused**:
- Backend might be suspended
- Go to Render dashboard and click "Resume"
- Wait 2-3 minutes for restart

### If API returns 404

**Example**: `GET /api/artisans/stats/impact` returns 404

**Possible causes**:
1. Endpoint doesn't exist in backend
2. Backend code is outdated
3. Backend needs redeploy

**Solution**:
```bash
# Check if endpoint exists in backend code:
cd server
grep -r "stats/impact" src/
```

### If still seeing "localhost:4000" errors

**Common cause**: Browser cache

**Solution**:
1. Open DevTools: `F12`
2. Right-click refresh button
3. Select "Empty cache and hard refresh"
4. Or: Press `Ctrl+Shift+Delete`, select "All time", clear

### If Vercel deployment fails

1. Go to: https://vercel.com/dashboard → Deployments
2. Click latest failed deployment
3. Scroll to "Build Logs"
4. Look for error message
5. Common fixes:
   - Check environment variables are set
   - Check for syntax errors in code
   - Verify package.json scripts

---

## Monitoring & Prevention

### Set Up Alerts

**Vercel Alerts**:
- Go to Project Settings → Integrations
- Set up failed deployment notifications

**Render Alerts**:
- Go to Service Settings
- Enable "Notify on service events"

### Weekly Checks

- [ ] Vercel deployment status
- [ ] Render backend "Live" status
- [ ] No errors in browser console on production
- [ ] Images loading correctly
- [ ] API calls returning data

---

## Files Changed

✅ **Updated**:
- `src/lib/api.ts` - Better production detection
- `src/lib/backendApi.ts` - Uses Render backend
- `src/services/api.ts` - Render fallback URL
- `src/services/adminService.ts` - Render fallback URL
- `vercel.json` - Fixed rewrites and headers

---

## Summary of the Fix

**Problem**: Frontend on Vercel tried to connect to `localhost:4000` (impossible)

**Solution**: 
1. ✅ Detect production vs development environment
2. ✅ Use Render backend on production
3. ✅ Set environment variables in Vercel dashboard
4. ✅ Fixed rewrite rules and CORS headers

**Result**: Frontend on Vercel will now properly connect to backend on Render
