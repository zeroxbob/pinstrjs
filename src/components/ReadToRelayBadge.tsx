import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReadToRelayContent } from '@/hooks/useReadToRelayContent';
import { useAppContext } from '@/hooks/useAppContext';
import { useNavigate } from 'react-router-dom';

interface ReadToRelayBadgeProps {
  url: string;
}

/**
 * Icon button that shows when ReadToRelay saved copies of an article are available.
 * Only queries relays when feature is enabled in settings.
 * Matches the style of the adjacent code viewer icon.
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

  const title = articles.length === 1
    ? 'View saved copy (paywall-free)'
    : `View ${articles.length} saved copies (paywall-free)`;

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      title={title}
    >
      <Save className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
}
