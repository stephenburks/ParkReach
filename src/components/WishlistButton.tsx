'use client';

import { useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaves } from '@/hooks/useParkSaves';

interface Props {
  parkCode: string;
  minimal?: boolean;
}

export function WishlistButton({ parkCode, minimal = false }: Props) {
  const { isWishlisted, toggleWishlist, loading } = useSaves();
  const [isLoading, setIsLoading] = useState(false);
  const wishlisted = isWishlisted(parkCode);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    await toggleWishlist(parkCode);
    setIsLoading(false);
  };

  if (minimal) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={loading || isLoading}
        className="h-8 w-8 p-0 rounded-full"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlisted ? (
          <Heart className="h-4 w-4 fill-current text-red-500" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={wishlisted ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={loading || isLoading}
      className={wishlisted ? 'bg-park-forest text-white' : ''}
    >
      <Heart className={`h-4 w-4 mr-2 ${wishlisted ? 'fill-current' : ''}`} />
      {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}