'use client';

import { useState, useEffect } from 'react';
import { MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  parkCode: string;
  minimal?: boolean;
}

export function VisitedButton({ parkCode, minimal = false }: Props) {
  const [visited, setVisited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('visited');
    if (saved) {
      const list = JSON.parse(saved);
      setVisited(list.includes(parkCode));
    }
    setIsLoading(false);
  }, [parkCode]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    const saved = localStorage.getItem('visited');
    let list = saved ? JSON.parse(saved) : [];
    
    if (visited) {
      list = list.filter((code: string) => code !== parkCode);
    } else {
      if (!list.includes(parkCode)) {
        list.push(parkCode);
      }
    }
    
    localStorage.setItem('visited', JSON.stringify(list));
    setVisited(!visited);
    setIsLoading(false);
  };

  if (minimal) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="h-8 w-8 p-0 rounded-full hover:bg-green-50"
        aria-label={visited ? 'Mark as not visited' : 'Mark as visited'}
      >
        {visited ? (
          <CheckCircle className="h-4 w-4 fill-current text-green-500" />
        ) : (
          <MapPin className="h-4 w-4 text-gray-600" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={visited ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={isLoading}
      className={visited ? 'bg-park-forest text-white' : ''}
    >
      <MapPin className={`h-4 w-4 mr-2 ${visited ? 'fill-current' : ''}`} />
      {visited ? 'Visited' : 'Mark as Visited'}
    </Button>
  );
}