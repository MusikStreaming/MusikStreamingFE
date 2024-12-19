'use client';

import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import Skeleton from '@/app/components/loading/skeleton';
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
  const [limit] = useState(10);

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

  if (isLoading) return
      <div className="space-y-4">
      {[...Array(limit)].map((_, index) => (
        <div key={index} className="flex space-x-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
      ))}
      </div>
  if (!users) return <div>Failed to load users.</div>;

  const userList = Array.isArray(users) ? users : users.data;
  const totalPages = Array.isArray(users) ? undefined : Math.ceil(users.count / limit);

  return (
    <div className=''>
      <PaginationTable
        data={userList}
        columns={[
          { 
            header: 'ID', 
            accessor: 'id',
            enableSorting: true,
            enableFiltering: true
          },
          { 
            header: 'Username', 
            accessor: 'username',
            enableSorting: true,
            enableFiltering: true
          },
          { 
            header: 'Email', 
            accessor: 'email',
            enableSorting: true,
            enableFiltering: true
          },
          { 
            header: 'Role', 
            accessor: 'role',
            enableSorting: true,
            enableFiltering: true
          }
        ]}
        page={page}
        onPageChange={setPage}
        showPageInput={true}
        isLoading={isLoading}
        totalPages={totalPages}
        enableSelection={true}
        onSelectionChange={(selectedUsers) => {
          console.log('Selected users:', selectedUsers);
        }}
      />
    </div>
  );
}
