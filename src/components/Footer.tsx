import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t mt-16 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8 max-w-2xl mx-auto">
          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/zaps" className="hover:text-foreground transition-colors">
                  Value4Value
                </Link>
              </li>
            </ul>
          </div>

          {/* Code */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Code</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://github.com/zeroxbob"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://njump.me/npub1vppdwqmhlzhftstq5exturmry4u0pdfm93mqj4zfuuznhclxygfsdatk8w"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Creator (b0b)
                </a>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Android App <span className="text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <Link to="/extension" className="hover:text-foreground transition-colors">
                  Chrome Extension
                </Link>
              </li>
              <li>
                <Link to="/install-bookmarklet" className="hover:text-foreground transition-colors">
                  Bookmarklet
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <p>
            Built with ❤️ on{' '}
            <a
              href="https://nostr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:underline"
            >
              Nostr
            </a>
            {' • '}
            Vibed with{' '}
            <a
              href="https://soapbox.pub/mkstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:underline font-medium"
            >
              MKStack
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
