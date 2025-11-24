# Force Refresh Guide

Your deployment is successful, but you're seeing cached content. Here's how to force a refresh:

## Immediate Solutions

### 1. Hard Refresh (Try This First)
**macOS + Firefox:**
```
Cmd + Shift + R
```

**macOS + Chrome/Safari:**
```
Cmd + Shift + R
```

### 2. Clear All Cache for This Site
**Firefox:**
1. Press `F12` to open Developer Tools
2. Right-click the **Refresh** button in the browser toolbar
3. Select **"Empty Cache and Hard Reload"**

**Chrome:**
1. Press `F12` to open Developer Tools
2. Right-click the **Refresh** button
3. Select **"Empty Cache and Hard Reload"**

### 3. Clear Specific Site Data
**Firefox:**
1. Go to `https://zeroxbob.github.io/pinstrjs/`
2. Press `Cmd + I` (or click the lock icon in address bar)
3. Click **"Clear Cookies and Site Data"**
4. Refresh the page

### 4. Disable Cache While DevTools Open
**Firefox:**
1. Open DevTools (`F12`)
2. Click the **Settings** gear icon (top right)
3. Check **"Disable HTTP Cache (when toolbox is open)"**
4. Keep DevTools open and refresh the page

### 5. Nuclear Option - Clear All Browser Data
**Firefox:**
1. `Cmd + Shift + Delete` to open Clear Data dialog
2. Select **"Cached Web Content"**
3. Click **"Clear Now"**

## Verify What's Being Loaded

Open DevTools (`F12`) → **Network** tab → Refresh the page

**What you SHOULD see:**
```
✓ GET /pinstrjs/assets/index-*.js (Status: 200)
✓ GET /pinstrjs/assets/index-*.css (Status: 200)
```

**What you SHOULD NOT see:**
```
✗ GET /src/main.tsx
```

If you still see `/src/main.tsx`, the cache hasn't been cleared yet.

## GitHub Pages Settings to Verify

1. Go to https://github.com/zeroxbob/pinstrjs/settings/pages
2. Verify:
   - **Source:** GitHub Actions
   - **Branch:** Should show "gh-pages" or deployment info
   - **Visit site** button shows: `https://zeroxbob.github.io/pinstrjs/`

## Still Not Working?

If after trying all the above you still see errors, try:

1. **Different browser** - Try Chrome, Safari, or Edge
2. **Incognito/Private window** - Should have no cache
3. **Different device** - Phone, tablet, different computer
4. **Wait 5-10 minutes** - GitHub Pages CDN might still be propagating

## Check If Deployment Succeeded

Visit: https://github.com/zeroxbob/pinstrjs/actions

- Latest workflow should have a **green checkmark** ✓
- Click on it to see the deployment URL
- The workflow should show "deployed to GitHub Pages"
