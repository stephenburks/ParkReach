'use client';

import { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  parkCode: string;
  minimal?: boolean;
}

export function WishlistButton({ parkCode, minimal = false }: Props) {
  const [wishlisted, setWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      const list = JSON.parse(saved);
      setWishlisted(list.includes(parkCode));
    }
    setIsLoading(false);
  }, [parkCode]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    const saved = localStorage.getItem('wishlist');
    let list = saved ? JSON.parse(saved) : [];
    
    if (wishlisted) {
      list = list.filter((code: string) => code !== parkCode);
    } else {
      if (!list.includes(parkCode)) {
        list.push(parkCode);
      }
    }
    
    localStorage.setItem('wishlist', JSON.stringify(list));
    setWishlisted(!wishlisted);
    setIsLoading(false);
  };

  if (minimal) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlisted ? (
          <Heart className="h-4 w-4 fill-current text-red-500" />
        ) : (
          <Heart className="h-4 w-4 text-gray-600" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={wishlisted ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={isLoading}
      className={wishlisted ? 'bg-park-forest text-white' : ''}
    >
      <Heart className={`h-4 w-4 mr-2 ${wishlisted ? 'fill-current' : ''}`} />
      {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}