'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaves } from '@/hooks/useParkSaves';

interface Props {
  parkCode: string;
}

export function WishlistButton({ parkCode }: Props) {
  const { isWishlisted, toggleWishlist, loading } = useSaves();
  const [isLoading, setIsLoading] = useState(false);
  const wishlisted = isWishlisted(parkCode);

  const handleClick = async () => {
    setIsLoading(true);
    await toggleWishlist(parkCode);
    setIsLoading(false);
  };

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