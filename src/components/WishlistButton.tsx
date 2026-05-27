'use client';

import { useState } from 'react';
import { Heart, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSaves } from '@/context/SavesContext';

interface Props {
  parkCode: string;
  minimal?: boolean;
}

export function WishlistButton({ parkCode, minimal = false }: Props) {
  const { isWishlisted, toggleWishlist, loading: savesLoading, isAuthenticated } = useSaves();
  const [isLoading, setIsLoading] = useState(false);
  const wishlisted = isWishlisted(parkCode);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Sign in to save parks to your wishlist');
      return;
    }

    setIsLoading(true);
    const ok = await toggleWishlist(parkCode);
    setIsLoading(false);

    if (ok) {
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
        icon: wishlisted ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />,
      });
    } else {
      toast.error('Something went wrong — please try again');
    }
  };

  if (minimal) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={savesLoading || isLoading}
        className="h-8 w-8 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-950"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current text-red-500' : 'text-stone-600 dark:text-stone-400'}`} />
      </Button>
    );
  }

  return (
    <Button
      variant={wishlisted ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={savesLoading || isLoading}
      className={wishlisted ? 'bg-park-forest text-white' : ''}
    >
      <Heart className={`h-4 w-4 mr-2 ${wishlisted ? 'fill-current' : ''}`} />
      {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}
