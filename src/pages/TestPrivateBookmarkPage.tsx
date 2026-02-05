import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';
import {
  deriveSaltFromPubkey,
  deriveVaultKeys,
  deserializeEncryptedData,
  decryptContent,
} from '@/lib/vaultCrypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DecryptedBookmark {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  publishedAt?: number;
}

export default function TestPrivateBookmarkPage() {
  const [eventJson, setEventJson] = useState('');
  const [pubkey, setPubkey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<DecryptedBookmark | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleDecrypt = async () => {
    setError(null);
    setDecryptedContent(null);
    setIsDecrypting(true);

    try {
      // Parse the event JSON
      let event;
      try {
        event = JSON.parse(eventJson);
      } catch {
        throw new Error('Invalid JSON format');
      }

      if (!event.content) {
        throw new Error('Event has no content field');
      }

      if (!pubkey.trim()) {
        throw new Error('Pubkey is required to derive the vault salt');
      }

      if (!passphrase) {
        throw new Error('Passphrase is required');
      }

      // Derive keys from passphrase and pubkey-based salt
      const salt = deriveSaltFromPubkey(pubkey.trim());
      const keys = deriveVaultKeys(passphrase, salt);

      // Deserialize and decrypt the content
      const encryptedData = deserializeEncryptedData(event.content);
      const decryptedJson = decryptContent(encryptedData, keys.encryptionKey);

      // Parse the decrypted content
      const bookmark = JSON.parse(decryptedJson) as DecryptedBookmark;
      setDecryptedContent(bookmark);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg">
                <Bookmark className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Pinstr
                </h1>
                <p className="text-sm text-muted-foreground">
                  Private Bookmark Test
                </p>
              </div>
            </Link>
            <Link to="/my-bookmarks">
              <Button variant="outline">Back to Bookmarks</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Private Bookmark Decryption Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event-json">Nostr Event JSON</Label>
              <Textarea
                id="event-json"
                placeholder='{"id": "...", "pubkey": "...", "content": "...", ...}'
                value={eventJson}
                onChange={(e) => setEventJson(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Paste the full JSON of a private bookmark event (kind 39702)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pubkey">User Pubkey (hex)</Label>
              <Input
                id="pubkey"
                placeholder="abc123... (64 character hex pubkey)"
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The pubkey of the user who created the vault (not the vault pubkey)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passphrase">Vault Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Enter your vault passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The passphrase used to encrypt the vault
              </p>
            </div>

            <Button
              onClick={handleDecrypt}
              disabled={isDecrypting || !eventJson.trim() || !pubkey.trim() || !passphrase}
              className="w-full"
            >
              {isDecrypting ? (
                'Decrypting...'
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Decrypt Bookmark
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">Decryption Failed</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {decryptedContent && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-700 dark:text-green-300 mb-3">
                      Decryption Successful
                    </p>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">URL:</span>
                        <a
                          href={decryptedContent.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-violet-600 hover:underline break-all"
                        >
                          {decryptedContent.url}
                        </a>
                      </div>
                      {decryptedContent.title && (
                        <div>
                          <span className="text-muted-foreground">Title:</span>
                          <span className="ml-2">{decryptedContent.title}</span>
                        </div>
                      )}
                      {decryptedContent.description && (
                        <div>
                          <span className="text-muted-foreground">Description:</span>
                          <p className="mt-1 text-gray-700 dark:text-gray-300">
                            {decryptedContent.description}
                          </p>
                        </div>
                      )}
                      {decryptedContent.tags && decryptedContent.tags.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {decryptedContent.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>How it works:</strong> The salt is derived from your user pubkey using SHA-256.
                Combined with your passphrase, Argon2id derives the encryption key. AES-256-GCM
                then decrypts the bookmark content.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
