// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // const router = useRouter();

  // const { data: userStatus, isLoading, isError } = useQuery({
  //   queryKey: ['userStatus'],
  //   queryFn: async () => {
  //     const response = await fetch('/api/auth/admin');
  //     return response.json();
  //   },
  // });

  // if (isLoading) {
  //   return <div>Checking authorization...</div>;
  // }

  // if (isError || !userStatus) {
  //   router.push('/');
  //   return null;
  // }

  // if (!userStatus?.admin) {
  //   return null;
  // }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {children}
    </div>
  );
}
