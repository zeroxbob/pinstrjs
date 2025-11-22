# Pinstr Development Guide

## 🚀 Running the Development Server

### Recommended Workflow

Due to WebSocket conflicts between Vite's HMR (Hot Module Replacement) and browser extensions (especially Nostr extensions like Alby, nos2x, etc.), we recommend the following development workflow:

### **Option 1: Private/Incognito Window (Recommended)**

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open your browser in **private/incognito mode**:
   - **Chrome/Brave**: `Cmd+Shift+N` (Mac) or `Ctrl+Shift+N` (Windows/Linux)
   - **Firefox**: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - **Safari**: `Cmd+Shift+N` (Mac)

3. Navigate to `http://localhost:5173`

**✅ Benefits:**
- No WebSocket errors or server crashes
- Fast hot module reloading
- Clean development environment

**⚠️ Note:**
- You won't be able to test Nostr login features in private mode
- Use Option 2 when you need to test authentication

### **Option 2: Separate Browser Profile (For Testing Nostr Features)**

When you need to test Nostr login/authentication features:

#### Chrome/Brave:
```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/chrome-dev

# Linux
google-chrome --user-data-dir=/tmp/chrome-dev

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir=%TEMP%\chrome-dev
```

#### Firefox:
```bash
# macOS
/Applications/Firefox.app/Contents/MacOS/firefox -P development

# Linux
firefox -P development

# Windows
"C:\Program Files\Mozilla Firefox\firefox.exe" -P development
```

Then install your Nostr extension in this separate profile.

**✅ Benefits:**
- Can test Nostr authentication features
- Isolated from your regular browsing profile
- Can enable HMR with fewer conflicts

### **Option 3: Disable Extensions Temporarily**

1. Disable browser extensions (especially Nostr extensions) while developing
2. Re-enable them when you need to test authentication
3. Restart the dev server after disabling extensions

## 🐛 Common Issues

### WebSocket "RSV1 must be clear" Errors

**Causes:**
1. Browser extensions interfering with Vite's WebSocket HMR connection
2. macOS system services conflicting with certain ports (especially port 8080)

**Solutions:**
1. **Port changed to 5173** - The default Vite port, which avoids macOS conflicts
2. Use private/incognito mode (easiest)
3. Use a separate browser profile
4. Temporarily disable extensions

The error occurs because:
- Extensions like Nostr signers intercept WebSocket frames and modify them, violating the WebSocket protocol
- macOS has background services that can interfere with WebSocket connections on certain ports (like 8080)

### Server Crashes

If the dev server keeps crashing:
1. Kill all Node processes: `killall node` (Mac/Linux) or Task Manager (Windows)
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Restart: `npm run dev`
4. Use private/incognito window

## ✅ Validation

Before committing changes, always run:

```bash
# Type checking and linting
npm run test

# Build
npm run build
```

All checks must pass before committing.

## 📚 Technology Stack

- **React 18.x** with TypeScript
- **Vite** - Development server and build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Nostrify** - Nostr protocol integration
- **TanStack Query** - Data fetching and caching

## 🔗 Useful Links

- [NIP-B0 Specification](https://github.com/aljazceru/nips/blob/NIP-B0-Web-Bookmarks/B0.md) - Web Bookmarks standard
- [Nostr Protocol](https://github.com/nostr-protocol/nostr) - Decentralized protocol
- [Vite Documentation](https://vitejs.dev/) - Build tool docs
