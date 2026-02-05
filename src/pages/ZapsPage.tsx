import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Zap, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CREATOR_NJUMP = 'https://njump.me/npub1vppdwqmhlzhftstq5exturmry4u0pdfm93mqj4zfuuznhclxygfsdatk8w';

export function ZapsPage() {
  useSeoMeta({
    title: 'Value4Value - Pinstr',
    description: 'Support Pinstr development with zaps. Free forever, but zaps are always appreciated.',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-8 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Pinstr
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Bookmarks on Nostr
            </p>
          </Link>

          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 inline-flex items-center gap-2">
              Zaps <Zap className="h-6 w-6 text-amber-500" />
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <Card className="text-center hover:shadow-md transition-shadow">
            <CardContent className="pt-8 pb-6 space-y-4">
              <h4 className="text-xl font-bold">Free</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  All the features
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Open-source forever
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Full freedom
                </li>
              </ul>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">0 sats</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                I like it.
              </Button>
            </CardContent>
          </Card>

          {/* Support Pinstr */}
          <Card className="text-center hover:shadow-md transition-shadow border-violet-300 dark:border-violet-700">
            <CardContent className="pt-8 pb-6 space-y-4">
              <h4 className="text-xl font-bold">Support Pinstr</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Still all the features
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Feel great about it
                </li>
              </ul>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">2,100 sats</p>
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                asChild
              >
                <a href={CREATOR_NJUMP} target="_blank" rel="noopener noreferrer">
                  I love it.
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="text-center hover:shadow-md transition-shadow">
            <CardContent className="pt-8 pb-6 space-y-4">
              <h4 className="text-xl font-bold">Legend</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Fantastic numerology
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Massive bragging rights
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Eternal glory on Nostr
                </li>
              </ul>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">69,420 sats</p>
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <a href={CREATOR_NJUMP} target="_blank" rel="noopener noreferrer">
                  Let's goooooo!
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          I created Pinstr as a passion project. If you can't send zaps, send notes (of any kind).
        </p>

        {/* Back to Home */}
        <div className="text-center py-8">
          <Link
            to="/"
            className="text-violet-600 hover:underline font-medium"
          >
            &larr; Back to Pinstr
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ZapsPage;
