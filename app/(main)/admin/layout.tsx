'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { data: userStatus, isLoading } = useQuery({
    queryKey: ['userStatus'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user-info');
      return response.json();
    },
    onError: () => router.push('/'),
    onSuccess: (data) => {
      if (!data.admin) router.push('/');
    }
  });

  if (isLoading) {
    return <div>Checking authorization...</div>;
  }

  if (!userStatus?.admin) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {children}
    </div>
  );
}
