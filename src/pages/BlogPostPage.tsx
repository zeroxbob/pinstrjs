import { useParams, Navigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { blogPosts } from './BlogPage';

// Blog post content - add content for each slug here
const blogContent: Record<string, React.ReactNode> = {
  'welcome-to-pinstr': (
    <>
      <p>
        We're excited to introduce Pinstr, a decentralized bookmark manager built on the Nostr
        protocol. Pinstr lets you save, organize, and share your favorite web pages — all without
        relying on a centralized service.
      </p>

      <h3>Why Pinstr?</h3>
      <p>
        Traditional bookmark managers store your data on company servers. If the company shuts down,
        changes their terms, or gets acquired, your bookmarks could disappear or become locked behind
        a paywall.
      </p>
      <p>
        Pinstr is different. Your bookmarks are stored on Nostr relays — independent servers that
        you choose. You own your data. You can switch clients anytime. Nobody can lock you out.
      </p>

      <h3>Features</h3>
      <ul>
        <li><strong>Public bookmarks</strong> — Share your favorite links with the world</li>
        <li><strong>Private vault</strong> — Encrypt sensitive bookmarks with a passphrase</li>
        <li><strong>Cross-platform</strong> — Web app, Chrome extension, and Android app</li>
        <li><strong>Decentralized</strong> — No single point of failure</li>
        <li><strong>Free forever</strong> — No subscriptions, no ads</li>
      </ul>

      <h3>Get Started</h3>
      <p>
        Head to <a href="https://pinstr.co" className="text-violet-600 hover:underline">pinstr.co</a> and
        sign in with your Nostr browser extension. You can also install
        the <a href="/extension" className="text-violet-600 hover:underline">Chrome extension</a> for
        one-click bookmarking, or grab the <a href="https://github.com/zeroxbob/pinstr-kotlin" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Android app</a> from
        GitHub.
      </p>

      <p>
        We'd love to hear your feedback. Find us on Nostr or open an issue on GitHub.
      </p>
    </>
  ),
};

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const post = blogPosts.find((p) => p.slug === slug);
  const content = slug ? blogContent[slug] : null;

  useSeoMeta({
    title: post ? `${post.title} - Pinstr Blog` : 'Blog - Pinstr',
    description: post?.excerpt ?? 'Pinstr blog',
  });

  if (!post || !content) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <a href="/blog" className="text-sm text-violet-600 hover:underline mb-4 inline-block">
            &larr; Back to Blog
          </a>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{post.title}</h2>
          <p className="text-muted-foreground mt-1">{post.date}</p>
        </div>

        <Card>
          <CardContent className="py-8 prose prose-violet dark:prose-invert max-w-none">
            <div className="text-sm text-muted-foreground space-y-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:mt-6 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-1 [&>ul]:ml-2">
              {content}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default BlogPostPage;
