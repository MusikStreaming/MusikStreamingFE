import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useManagerAuth() {
  const router = useRouter();

  return useQuery({
    queryKey: ['userStatus'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user-info', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch user status');
      return response.json();
    },
  });
}
