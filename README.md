# Pinstr

### **NIP-B0 Bookmark Support**
- ✅ Full implementation of the NIP-B0 web bookmarks specification
- ✅ Event kind 39701 (addressable events)
- ✅ Required `d` tag with URL without scheme
- ✅ Optional tags: `title`, `published_at`, and `t` (topics)
- ✅ Content field for bookmark descriptions

### **Authentication**
- ✅ Sign in via Nostr browser extensions (NIP-07)
- ✅ LoginArea component integration
- ✅ Protected bookmark creation (requires login)
- ✅ Users can only delete their own bookmarks

### **Bookmark Management**
- ✅ **Create bookmarks** with URL, title, description, and multiple tags
- ✅ **View bookmarks** in a beautiful grid layout
- ✅ **Delete bookmarks** with confirmation dialog
- ✅ **Search bookmarks** by title, description, or URL
- ✅ **Filter bookmarks** by tags
- ✅ Author profile information displayed on each bookmark card
- ✅ External link indicators and date formatting

### **User Interface**
- ✅ **Home page** (`/`) - Showcases latest bookmarks from the network
- ✅ **Bookmarks page** (`/bookmarks`) - Personal bookmark collection with full management
- ✅ Beautiful gradient design with violet/indigo theme
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading skeletons for better UX
- ✅ Empty states with helpful messaging
- ✅ Toast notifications for actions

### **Technical Implementation**
- ✅ Custom hooks: `useBookmarks`, `useUserBookmarks`, `useBookmark`, `useCreateBookmark`, `useDeleteBookmark`
- ✅ Event validation according to NIP-B0 specification
- ✅ Proper query construction with filters by author, kind, and d-tag
- ✅ Query client integration with TanStack Query for caching
- ✅ All TypeScript types properly defined
- ✅ All tests passing ✓
- ✅ ESLint validation passing ✓
- ✅ Build successful ✓

### **Documentation**
- ✅ Created `NIP.md` documenting the NIP-B0 implementation
- ✅ Includes example events and query patterns
- ✅ "Vibed with MKStack" attribution included

## 🚀 Getting Started

To run the app:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

## 🧩 Chrome Extension

To install the Pinstr browser extension:

1. **Clone or download** this repository

2. **Open Chrome** and navigate to `chrome://extensions/`

3. **Enable Developer Mode** by toggling the switch in the top right corner

4. **Click "Load unpacked"** and select the `extension/dist/` folder from this repository

5. **Pin the extension** to your toolbar for easy access

The extension allows you to bookmark any webpage with a single click. It supports NIP-07 extension login, nsec, and bunker authentication, plus private encrypted bookmarks using the same vault system as the web app.

**Note:** The extension uses pinstr.co for authentication. When you click "Connect Extension," it will open pinstr.co in a new tab where you can log in with your NIP-07 browser extension.

**For developers:** To rebuild the extension after making changes, run `npm run ext:build`. The built extension is committed to the repo so users can install directly without building.

## 📝 How to Use

1. **Sign in** with your Nostr browser extension (Alby, nos2x, etc.)
2. **Add bookmarks** by clicking the "Add Bookmark" button
3. **Search and filter** your collection using the search bar and tag filters
4. **Click on bookmarks** to open the URLs in a new tab
5. **Delete bookmarks** you no longer need (only your own)

The app follows the decentralized Nostr protocol, so your bookmarks are stored across multiple relays and can be accessed by any NIP-B0 compatible client!
