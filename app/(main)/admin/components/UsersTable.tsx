'use client';

import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function UsersTable() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[--md-sys-color-outline]">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[--md-sys-color-outline]">
          {users?.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
