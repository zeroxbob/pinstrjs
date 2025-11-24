# Environment Configuration

Pinstr automatically detects whether it's running in development or production and adjusts URLs accordingly.

---

## 🔧 **How It Works**

### **Automatic Detection**

Pinstr uses Vite's built-in environment detection:

- **Development Mode** (`npm run dev`):
  - `import.meta.env.DEV` = `true`
  - Base URL: `http://localhost:5173`
  - Bookmarklet URL: `http://localhost:5173/bookmarklet`

- **Production Mode** (deployed to pinstr.co):
  - `import.meta.env.PROD` = `true`
  - Base URL: `https://pinstr.co`
  - Bookmarklet URL: `https://pinstr.co/bookmarklet`

---

## 📋 **Environment Utilities**

### **`src/lib/env.ts`**

This file provides utility functions for environment-specific configuration:

```typescript
import { getBaseUrl, getBookmarkletUrl, isDevelopment, isProduction, getEnvironment } from '@/lib/env';

// Get the base URL for the current environment
const baseUrl = getBaseUrl();
// Dev: "http://localhost:5173"
// Prod: "https://pinstr.co"

// Get the bookmarklet URL for the current environment
const bookmarkletUrl = getBookmarkletUrl();
// Dev: "http://localhost:5173/bookmarklet?popup=true"
// Prod: "https://pinstr.co/bookmarklet?popup=true"

// Check if we're in development
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Check if we're in production
if (isProduction()) {
  console.log('Running in production mode');
}

// Get environment name
const env = getEnvironment();
// "development" or "production"
```

---

## 🎯 **Use Cases**

### **1. Bookmarklet URL**

The bookmarklet automatically uses the correct URL based on the environment:

```typescript
// BookmarkletInstallPage.tsx
import { getBookmarkletUrl } from '@/lib/env';

const bookmarkletUrl = getBookmarkletUrl();
// Dev: http://localhost:5173/bookmarklet?popup=true
// Prod: https://pinstr.co/bookmarklet?popup=true

const bookmarkletCode = `javascript:(function(){ ... p='${bookmarkletUrl}' ... })();`;
```

**Benefits:**
- ✅ Test bookmarklet locally without changing code
- ✅ Deploy to production with correct production URLs
- ✅ No manual configuration needed

### **2. API Endpoints (Future)**

If you add backend API calls in the future:

```typescript
import { getBaseUrl } from '@/lib/env';

const apiUrl = `${getBaseUrl()}/api/analytics`;
// Dev: http://localhost:5173/api/analytics
// Prod: https://pinstr.co/api/analytics
```

### **3. Feature Flags**

Enable features only in development:

```typescript
import { isDevelopment } from '@/lib/env';

if (isDevelopment()) {
  // Enable debug panel
  <DebugPanel />
}
```

---

## 🔄 **Optional: Environment Variable Override**

If you need to **override the base URL** (e.g., for staging, custom domains, or testing):

### **Step 1: Create `.env.local`**

```bash
# Copy the example file
cp .env.example .env.local
```

### **Step 2: Set Custom URL**

Edit `.env.local`:

```bash
# Override the base URL
VITE_BASE_URL=https://staging.pinstr.com
```

### **Step 3: Restart Dev Server**

```bash
# Kill existing server (Ctrl+C)
npm run dev
```

**Result:**
- Bookmarklet will now use `https://staging.pinstr.com/bookmarklet`
- All environment utilities will use the custom URL

### **When to Use Override:**

- ✅ **Staging environment** - Test with a staging server
- ✅ **Custom domain testing** - Test with a different domain before DNS changes
- ✅ **Preview deployments** - Use preview URLs from Vercel, Netlify, etc.

---

## 📁 **File Structure**

```
pinstrjs/
├── .env.example          # Example environment variables (committed to git)
├── .env.local            # Your local overrides (git-ignored)
├── .gitignore            # Contains .env.* (except .env.example)
└── src/
    └── lib/
        └── env.ts        # Environment utility functions
```

---

## 🚀 **Testing in Different Environments**

### **Local Development**

```bash
npm run dev
# Bookmarklet uses: http://localhost:5173/bookmarklet
```

Visit `http://localhost:5173/install-bookmarklet` to install the dev bookmarklet.

### **Production Build (Local Testing)**

```bash
npm run build
npm run preview
# Bookmarklet uses: https://pinstr.co/bookmarklet
```

Visit `http://localhost:4173/install-bookmarklet` to install the production bookmarklet.

### **Deployed Production**

```bash
# Visit https://pinstr.co/install-bookmarklet
# Bookmarklet uses: https://pinstr.co/bookmarklet
```

---

## 🎯 **Best Practices**

### **1. Never Hardcode URLs**

❌ **Wrong:**
```typescript
const url = 'https://pinstr.co/bookmarklet';
```

✅ **Correct:**
```typescript
import { getBookmarkletUrl } from '@/lib/env';
const url = getBookmarkletUrl();
```

### **2. Use Utility Functions**

❌ **Wrong:**
```typescript
if (window.location.hostname === 'localhost') {
  // Development logic
}
```

✅ **Correct:**
```typescript
import { isDevelopment } from '@/lib/env';
if (isDevelopment()) {
  // Development logic
}
```

### **3. Keep `.env.local` Private**

- ✅ **DO** use `.env.local` for personal overrides
- ✅ **DO** commit `.env.example` to show available variables
- ❌ **DON'T** commit `.env.local` to git (already in `.gitignore`)

---

## 🐛 **Troubleshooting**

### **Bookmarklet Using Wrong URL**

**Problem:** Bookmarklet still uses old URL after changing environment.

**Solution:**
1. **Delete the old bookmarklet** from your bookmarks bar
2. **Hard refresh** the install page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
3. **Drag the new bookmarklet** to your bookmarks bar

### **Environment Variable Not Working**

**Problem:** `.env.local` changes not taking effect.

**Solution:**
1. **Restart the dev server** - Environment variables are loaded at startup
2. **Check file name** - Must be `.env.local` (not `.env.development` or `.env`)
3. **Check variable name** - Must start with `VITE_` (e.g., `VITE_BASE_URL`)

### **Development Bookmarklet on Production**

**Problem:** Accidentally installed dev bookmarklet, now it doesn't work on production.

**Solution:**
1. Visit `https://pinstr.co/install-bookmarklet`
2. Delete the old bookmarklet from your bookmarks bar
3. Drag the new production bookmarklet to your bookmarks bar

---

## 📝 **Summary**

- ✅ **Automatic environment detection** - No manual configuration needed
- ✅ **Development mode** - Uses `http://localhost:5173`
- ✅ **Production mode** - Uses `https://pinstr.co`
- ✅ **Optional override** - Use `.env.local` for custom URLs
- ✅ **Utility functions** - Centralized in `src/lib/env.ts`
- ✅ **Bookmarklet** - Automatically uses correct environment URL
- ✅ **No hardcoded URLs** - Easy to test and deploy

**The system "just works"** - develop locally, deploy to production, and everything uses the correct URLs automatically! 🎉
