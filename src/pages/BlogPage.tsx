import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

// Add new blog posts here (newest first)
export const blogPosts: BlogPost[] = [
  {
    slug: 'getting-started-with-pinstr-android',
    title: 'Getting Started with Pinstr for Android',
    date: '2026-02-06',
    excerpt: 'A complete guide to using Pinstr on Android — signing in with Amber, setting up your vault, adding bookmarks, and syncing across devices.',
  },
  {
    slug: 'getting-started-with-pinstr',
    title: 'Getting Started with Pinstr',
    date: '2026-02-06',
    excerpt: 'Learn how to save your first bookmark with Pinstr — from the web app, browser extension, or bookmarklet. Plus: public vs private bookmarks explained.',
  },
  {
    slug: 'how-pinstr-encrypts-private-bookmarks',
    title: 'How Pinstr Encrypts Private Bookmarks',
    date: '2026-02-06',
    excerpt: 'A deep dive into how Pinstr solves the problem of private bookmarks on Nostr — encrypted, unlinkable to your identity, and quantum-resistant.',
  },
  {
    slug: 'welcome-to-pinstr',
    title: 'Welcome to Pinstr',
    date: '2026-02-06',
    excerpt: 'Introducing Pinstr, a decentralized bookmark manager built on Nostr. Save, organize, and share your favorite web pages.',
  },
];

export function BlogPage() {
  useSeoMeta({
    title: 'Blog - Pinstr',
    description: 'News and updates from Pinstr, the decentralized bookmark manager on Nostr.',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Blog</h2>
          <p className="text-muted-foreground mt-1">
            News and updates from Pinstr.
          </p>
        </div>

        <div className="space-y-8">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}

          {blogPosts.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default BlogPage;
