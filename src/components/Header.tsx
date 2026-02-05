import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Settings } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog';
import { LoginArea } from '@/components/auth/LoginArea';
import { Button } from '@/components/ui/button';

export function Header() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Pinstr" className="h-10 w-10 rounded-xl" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Pinstr
              </h1>
              <p className="text-xs text-muted-foreground">Bookmarks on Nostr</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user && <AddBookmarkDialog />}
            <Button
              variant="outline"
              onClick={() => navigate('/my-bookmarks')}
              className="gap-2"
            >
              My Bookmarks
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <LoginArea className="max-w-60" />
          </div>
        </div>
      </div>
    </header>
  );
}
