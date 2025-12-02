import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReadToRelayContent } from '@/hooks/useReadToRelayContent';
import { useAppContext } from '@/hooks/useAppContext';
import { useNavigate } from 'react-router-dom';

interface ReadToRelayBadgeProps {
  url: string;
}

/**
 * Badge that shows when ReadToRelay saved copies of an article are available.
 * Only queries relays when feature is enabled in settings.
 */
export function ReadToRelayBadge({ url }: ReadToRelayBadgeProps) {
  const { config } = useAppContext();
  const navigate = useNavigate();

  // Check if feature is enabled (default: false for opt-in)
  const featureEnabled = config.showReadToRelay ?? false;

  const { data: articles, isLoading, error } = useReadToRelayContent(url, featureEnabled);

  // Debug logging (remove after testing)
  if (featureEnabled) {
    console.log('[ReadToRelayBadge]', {
      url,
      featureEnabled,
      isLoading,
      articlesCount: articles?.length ?? 0,
      error,
    });
  }

  // Don't show anything if feature is disabled
  if (!featureEnabled) {
    return null;
  }

  // Don't show while loading (avoid UI flicker)
  if (isLoading) {
    return null;
  }

  // Don't show if no saved copies found
  if (!articles || articles.length === 0) {
    return null;
  }

  const handleClick = () => {
    // Navigate to article viewer with the newest saved copy
    navigate(`/article/${articles[0].event.id}`);
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      className="gap-2 h-8"
      title="View paywall-free version saved to Nostr"
    >
      <FileText className="h-3 w-3" />
      {articles.length === 1 ? 'Saved Copy' : `${articles.length} Copies`}
    </Button>
  );
}
