'use client';

import { useState } from 'react';
import { MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaves } from '@/hooks/useParkSaves';

interface Props {
  parkCode: string;
  minimal?: boolean;
}

export function VisitedButton({ parkCode, minimal = false }: Props) {
  const { isVisited, toggleVisited, loading } = useSaves();
  const [isLoading, setIsLoading] = useState(false);
  const visited = isVisited(parkCode);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    await toggleVisited(parkCode);
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
        aria-label={visited ? 'Mark as not visited' : 'Mark as visited'}
      >
        {visited ? (
          <CheckCircle className="h-4 w-4 fill-current text-green-500" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={visited ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={loading || isLoading}
      className={visited ? 'bg-park-forest text-white' : ''}
    >
      <MapPin className={`h-4 w-4 mr-2 ${visited ? 'fill-current' : ''}`} />
      {visited ? 'Visited' : 'Mark as Visited'}
    </Button>
  );
}