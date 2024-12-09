import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  return {
    searchQuery,
    setSearchQuery,
    handleSearchChange,
  };
} 