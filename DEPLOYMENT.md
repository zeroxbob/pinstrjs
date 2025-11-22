# Deploying Pinstr to GitHub Pages

This guide explains how to deploy your Pinstr app to GitHub Pages.

---

## 📋 Prerequisites

1. **GitHub repository** - Your code must be pushed to GitHub
2. **Main branch** - Ensure your code is on the `main` branch
3. **GitHub Pages enabled** - Follow the setup steps below

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

Your Pinstr app will be available at:

```
https://YOUR_USERNAME.github.io/pinstrjs/
```

Replace `YOUR_USERNAME` with your GitHub username.

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

### **Blank page after deployment**

**Possible causes:**
1. **Incorrect base path** - Check `vite.config.ts`
2. **Build errors** - Check the Actions workflow logs
3. **Missing dependencies** - Ensure `package.json` is complete

**Debug steps:**
1. Open browser console (F12) and check for errors
2. Look for 404 errors on JS/CSS files
3. Verify the correct base path in `vite.config.ts`

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
