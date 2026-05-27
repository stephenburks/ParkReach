'use client';

import { useState } from 'react';
import { MapPin, CheckCircle, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSaves } from '@/context/SavesContext';

interface Props {
  parkCode: string;
  minimal?: boolean;
}

export function VisitedButton({ parkCode, minimal = false }: Props) {
  const { isVisited, toggleVisited, loading: savesLoading, isAuthenticated } = useSaves();
  const [isLoading, setIsLoading] = useState(false);
  const visited = isVisited(parkCode);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Sign in to mark parks as visited');
      return;
    }

    setIsLoading(true);
    const ok = await toggleVisited(parkCode);
    setIsLoading(false);

    if (ok) {
      toast.success(visited ? 'Removed from visited' : 'Marked as visited', {
        icon: visited ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />,
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
        className="h-8 w-8 p-0 rounded-full hover:bg-green-50 dark:hover:bg-green-950"
        aria-label={visited ? 'Mark as not visited' : 'Mark as visited'}
      >
        {visited ? (
          <CheckCircle className="h-4 w-4 fill-current text-green-500" />
        ) : (
          <MapPin className="h-4 w-4 text-stone-600 dark:text-stone-400" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={visited ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={savesLoading || isLoading}
      className={visited ? 'bg-park-forest text-white' : ''}
    >
      <MapPin className={`h-4 w-4 mr-2 ${visited ? 'fill-current' : ''}`} />
      {visited ? 'Visited' : 'Mark as Visited'}
    </Button>
  );
}
