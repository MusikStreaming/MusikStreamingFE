'use client';

import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import PaginationTable from '@/app/components/tables/PaginationTable';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface UsersResponse {
  data: User[];
  count: number;
}

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data: users, isLoading } = useQuery<User[] | UsersResponse>({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    staleTime: 2000,
  });

  if (!users) return <div>Failed to load users.</div>;

  const userList = Array.isArray(users) ? users : users.data;
  const totalPages = Array.isArray(users) ? undefined : Math.ceil(users.count / limit);

  return (
    <div>
      <PaginationTable
        data={userList}
        columns={[
          { header: 'ID', accessor: 'id' },
          { header: 'Username', accessor: 'username' },
          { header: 'Email', accessor: 'email' },
          { header: 'Role', accessor: 'role' }
        ]}
        page={page}
        onPageChange={setPage}
        showPageInput={true}
        isLoading={isLoading}
        totalPages={totalPages}
      />
    </div>
  );
}
