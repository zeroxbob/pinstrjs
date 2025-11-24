import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bookmark, Info, Chrome, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BookmarkletInstallPage() {
  // Production bookmarklet code
  const bookmarkletCode = `javascript:(function(){ var d=document, w=window, e=w.getSelection, k=d.getSelection, x=d.selection, s=(e?e():(k)?k():(x?x.createRange().text:'')), l=d.location, enc=encodeURIComponent, p='https://pinstr.co/bookmarklet?popup=true', u=enc(l.href), t=enc(d.title), z=enc(s); function a(){ if(!w.open(p+'&url='+u+'&title='+t+'&description='+z,'Pinstr','toolbar=no,scrollbars=yes,width=750,height=700')) l.href=p+'&url='+u+'&title='+t+'&description='+z; } if(/Firefox/.test(navigator.userAgent)) setTimeout(a,0); else a(); })();`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <Link
          to="/"
          className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pinstr</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks on Nostr</p>
          </div>
        </Link>

        {/* Main Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Install Pinstr Bookmarklet</CardTitle>
              <CardDescription className="text-base">
                Save any webpage to Nostr with a single click from your browser's bookmarks bar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* The Draggable Button */}
              <div className="bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-lg p-8 text-center border-2 border-dashed border-violet-300 dark:border-violet-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Drag this button to your bookmarks bar:
                </p>
                <a
                  href={bookmarkletCode}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-move"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please drag this button to your bookmarks bar instead of clicking it!');
                  }}
                >
                  <Bookmark className="w-5 h-5" />
                  Save to Pinstr
                </a>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
                  (Don't click it - drag it to your bookmarks bar!)
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Once installed, you can click the "Save to Pinstr" bookmark from any webpage to save it to your Nostr bookmarks.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Installation Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chrome/Edge */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Chrome className="w-5 h-5" />
                  Chrome / Edge / Brave
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-2">
                  <li>Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Ctrl+Shift+B</kbd> (Windows/Linux) or <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">⌘+Shift+B</kbd> (Mac) to show the bookmarks bar</li>
                  <li>Drag the <strong>"Save to Pinstr"</strong> button above to your bookmarks bar</li>
                  <li>That's it! The bookmarklet is installed</li>
                </ol>
              </div>

              {/* Firefox */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Globe className="w-5 h-5" />
                  Firefox
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-2">
                  <li>Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Ctrl+Shift+B</kbd> (Windows/Linux) or <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">⌘+Shift+B</kbd> (Mac) to show the bookmarks toolbar</li>
                  <li>Drag the <strong>"Save to Pinstr"</strong> button above to your bookmarks toolbar</li>
                  <li>The bookmarklet is ready to use!</li>
                </ol>
              </div>

              {/* Safari */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Globe className="w-5 h-5" />
                  Safari
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-2">
                  <li>Go to <strong>View</strong> → <strong>Show Favorites Bar</strong></li>
                  <li>Drag the <strong>"Save to Pinstr"</strong> button above to your Favorites Bar</li>
                  <li>You're all set!</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>
                  <strong>Navigate to any webpage</strong> you want to bookmark
                </li>
                <li>
                  <strong>Click the "Save to Pinstr" bookmarklet</strong> in your bookmarks bar
                </li>
                <li>
                  <strong>A popup window will open</strong> with the page details pre-filled
                </li>
                <li>
                  <strong>If you're logged in,</strong> the bookmark will be saved automatically to Nostr
                </li>
                <li>
                  <strong>If not logged in,</strong> you'll be prompted to sign in with your Nostr extension first
                </li>
                <li>
                  <strong>You can add tags and description</strong> before saving (optional)
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">✓</span>
                  <span><strong>One-click saving:</strong> Bookmark any page instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">✓</span>
                  <span><strong>Auto-fill:</strong> Automatically captures URL, title, and selected text</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">✓</span>
                  <span><strong>Popup window:</strong> Save bookmarks without leaving your current page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">✓</span>
                  <span><strong>Decentralized:</strong> Your bookmarks are stored on Nostr, not a centralized service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-1">✓</span>
                  <span><strong>Cross-browser:</strong> Works in Chrome, Firefox, Safari, Edge, and more</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookmarkletInstallPage;
