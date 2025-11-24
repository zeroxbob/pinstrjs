# Deploying Pinstr to GitHub Pages

This guide explains how to deploy your Pinstr app to GitHub Pages.

---

## 📋 Prerequisites

1. **GitHub repository** - Your code must be pushed to GitHub
2. **Main branch** - Ensure your code is on the `main` branch
3. **GitHub Pages enabled** - Follow the setup steps below

---

## ⚠️ CRITICAL: Verify Source Configuration

**IMPORTANT:** After setting up a custom domain or any changes to Pages settings, GitHub may reset the deployment source. You MUST verify:

1. Go to your repository **Settings** → **Pages**
2. Under **Build and deployment** → **Source**:
   - ✅ **MUST BE:** "GitHub Actions"
   - ❌ **NOT:** "Deploy from a branch"
3. If it shows "Deploy from a branch", change it to "GitHub Actions" and save

**Why this matters:** If Pages is set to "Deploy from a branch", it will serve the source `index.html` (development version with `/src/main.tsx`) instead of the built `dist/index.html` (production version with `/assets/index-*.js`), causing MIME type errors.

---

## 🚀 GitHub Pages Setup

### **Step 1: Enable GitHub Pages in Repository Settings**

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/pinstrjs`
2. Click on **Settings** (top right, gear icon)
3. Scroll down to **Pages** in the left sidebar
4. Under **Build and deployment**, configure:
   - **Source**: Select **"GitHub Actions"** from the dropdown
   - (NOT "Deploy from a branch" - we're using Actions)

### **Step 2: Verify Permissions**

The workflow file already has the correct permissions:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### **Step 3: Push Changes to Trigger Deployment**

The deployment workflow runs automatically on:
- **Every push to `main` branch**
- **Manual trigger** from the Actions tab

To deploy now:

```bash
# Make sure all changes are committed
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### **Step 4: Monitor Deployment**

1. Go to the **Actions** tab in your repository
2. Watch the **"Deploy to GitHub Pages"** workflow run
3. Once complete (green checkmark ✓), your site is live!

---

## 🌐 Accessing Your Deployed Site

**IMPORTANT:** Make sure you access the correct URL!

Your Pinstr app will be available at:

```
https://YOUR_USERNAME.github.io/pinstrjs/
```

⚠️ **Note the `/pinstrjs/` at the end!** Without it, you'll get a blank page or MIME type errors.

Replace `YOUR_USERNAME` with your GitHub username.

### **Common Mistake:**
- ❌ Wrong: `https://zeroxbob.github.io/` (missing repo name)
- ✅ Correct: `https://zeroxbob.github.io/pinstrjs/`

---

## 🔧 Important: Base Path Configuration

Since GitHub Pages serves your app at `/pinstrjs/` (not the root `/`), you need to configure Vite to use the correct base path.

### **Update `vite.config.ts`**

Add the `base` option:

```typescript
export default defineConfig({
  base: '/pinstrjs/', // ← Add this line
  plugins: [react()],
  // ... rest of config
});
```

**If your repository has a different name**, change `/pinstrjs/` to match your repo name.

### **For Custom Domains**

If you're using a custom domain (like `pinstr.com`), use:

```typescript
export default defineConfig({
  base: '/', // Root path for custom domains
  plugins: [react()],
  // ... rest of config
});
```

---

## 🐛 Troubleshooting

### **Error: "Not Found - Pages not enabled"**

**Solution:**
1. Go to **Settings → Pages**
2. Under **Build and deployment → Source**, select **"GitHub Actions"**
3. Click **Save**
4. Re-run the workflow from the **Actions** tab

### **Error: "404 - Page Not Found" after deployment**

**Cause:** The base path is incorrect.

**Solution:**
1. Update `vite.config.ts` with the correct `base` path
2. Rebuild and push:
   ```bash
   npm run build
   git add .
   git commit -m "Fix base path for GitHub Pages"
   git push origin main
   ```

### **React Router shows "404" on page refresh**

**Cause:** GitHub Pages doesn't support client-side routing by default.

**Solution:** The workflow already includes this fix:
```bash
cp dist/index.html dist/404.html
```

This copies `index.html` to `404.html`, so all routes redirect to the React app.

### **MIME Type Error: "Disallowed MIME type (text/html)"**

**Error in console:**
```
Loading module from "https://username.github.io/src/main.tsx" was blocked because of a disallowed MIME type ("text/html").
```

**Cause:** Your browser cached an old deployment OR GitHub Pages CDN hasn't updated yet.

**Solution (try in this order):**

1. **Hard refresh your browser** (this fixes it 90% of the time):
   - **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
   - **macOS:** `Cmd + Shift + R`

2. **Try incognito/private window** (bypasses cache completely):
   - Chrome: `Ctrl/Cmd + Shift + N`
   - Firefox: `Ctrl/Cmd + Shift + P`
   - Then visit: `https://zeroxbob.github.io/pinstrjs/`

3. **Clear browser cache**:
   - **Chrome:** Settings → Privacy and security → Clear browsing data → Select "Cached images and files" → Clear data
   - **Firefox:** Settings → Privacy & Security → Cookies and Site Data → Clear Data → Select "Cached Web Content" → Clear

4. **Wait 5-10 minutes for GitHub Pages CDN** to fully update (sometimes it takes time)

5. **Verify deployment succeeded**:
   - Go to your repository → **Actions** tab
   - Check that the latest workflow has a green checkmark ✓
   - If it failed (red X), click on it to see error logs

6. **Manually trigger a fresh deployment**:
   - Actions tab → "Deploy to GitHub Pages" → "Run workflow" → "Run workflow"
   - Wait for it to complete
   - Then hard refresh your browser again

7. **Verify the correct URL** (as a last resort):
   - ❌ Wrong: `https://zeroxbob.github.io/`
   - ✅ Correct: `https://zeroxbob.github.io/pinstrjs/`

### **Blank page after deployment**

**Possible causes:**
1. **Wrong URL** - Make sure you include `/pinstrjs/` in the URL
2. **Incorrect base path** - Check `vite.config.ts` has `base: '/pinstrjs/'`
3. **Build errors** - Check the Actions workflow logs
4. **Missing dependencies** - Ensure `package.json` is complete

**Debug steps:**
1. Open browser console (F12) and check for errors
2. Look for 404 errors on JS/CSS files
3. Verify the correct base path in `vite.config.ts`
4. Verify you're using the correct URL with `/pinstrjs/` at the end

---

## 🔄 Manual Deployment

You can manually trigger deployment:

1. Go to **Actions** tab
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** button
4. Select `main` branch
5. Click **"Run workflow"**

---

## 📝 Workflow Overview

The deployment workflow (`deploy.yml`) does:

1. **Checkout code** from the repository
2. **Setup Node.js** (version 22)
3. **Install dependencies** (`npm install`)
4. **Build production bundle** (`npm run build`)
5. **Copy index.html to 404.html** (for React Router support)
6. **Upload build artifacts** to GitHub Pages
7. **Deploy to GitHub Pages**

---

## 🎯 Next Steps After Deployment

1. **Test the live site** at your GitHub Pages URL
2. **Share the link** with users
3. **Configure custom domain** (optional) in Settings → Pages
4. **Enable HTTPS** (automatically enabled by GitHub Pages)

---

## 🔗 Useful Links

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router GitHub Pages Guide](https://create-react-app.dev/docs/deployment/#github-pages)

---

## ✅ Checklist

Before deploying, ensure:

- [ ] Repository pushed to GitHub
- [ ] Code on `main` branch
- [ ] GitHub Pages enabled with "GitHub Actions" source
- [ ] `base` path configured in `vite.config.ts`
- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] `.github/workflows/deploy.yml` file present

Once all items are checked, push to `main` and watch your app go live! 🚀
