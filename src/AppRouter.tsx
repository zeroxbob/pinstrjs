import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import AllBookmarksPage from "./pages/AllBookmarksPage";
import BookmarksPage from "./pages/BookmarksPage";
import BookmarkletPage from "./pages/BookmarkletPage";
import BookmarkletInstallPage from "./pages/BookmarkletInstallPage";
import SettingsPage from "./pages/SettingsPage";
import { ArticlePage } from "./pages/ArticlePage";
import { DebugReadToRelayPage } from "./pages/DebugReadToRelayPage";
import { DetailedDebugPage } from "./pages/DetailedDebugPage";
import { NIP19Page } from "./pages/NIP19Page";
import TestPrivateBookmarkPage from "./pages/TestPrivateBookmarkPage";
import ExtensionLoginPage from "./pages/ExtensionLoginPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FAQPage from "./pages/FAQPage";
import ZapsPage from "./pages/ZapsPage";
import ExtensionPage from "./pages/ExtensionPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/bookmarks" element={<AllBookmarksPage />} />
        <Route path="/my-bookmarks" element={<BookmarksPage />} />
        <Route path="/bookmarklet" element={<BookmarkletPage />} />
        <Route path="/install-bookmarklet" element={<BookmarkletInstallPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/article/:eventId" element={<ArticlePage />} />
        <Route path="/debug-readtorelay" element={<DebugReadToRelayPage />} />
        <Route path="/detailed-debug" element={<DetailedDebugPage />} />
        <Route path="/test_private_bookmark" element={<TestPrivateBookmarkPage />} />
        <Route path="/extension-login" element={<ExtensionLoginPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/zaps" element={<ZapsPage />} />
        <Route path="/extension" element={<ExtensionPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;