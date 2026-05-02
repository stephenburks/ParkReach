'use client';

import { useState } from 'react';
import { Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaves } from '@/hooks/useParkSaves';

interface Props {
  parkCode: string;
}

export function VisitedButton({ parkCode }: Props) {
  const { isVisited, toggleVisited, loading } = useSaves();
  const [isLoading, setIsLoading] = useState(false);
  const visited = isVisited(parkCode);

  const handleClick = async () => {
    setIsLoading(true);
    await toggleVisited(parkCode);
    setIsLoading(false);
  };

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