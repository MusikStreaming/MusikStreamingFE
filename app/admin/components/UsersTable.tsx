'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import PaginationTable from '@/app/components/tables/PaginationTable';
import OutlinedIcon from "@/app/components/icons/outlined-icon";
// import AddUserDialog from '@/app/components/dialogs/AddUserDialog';
// import EditUserDialog from '@/app/components/dialogs/EditUserDialog';
import TextButton from '@/app/components/buttons/text-button';

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: users, isLoading, isError, refetch } = useQuery<UsersResponse>({
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getCookie('session_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    deleteMutation.mutate(id);
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsAddModalOpen(false);
  };

  const handleSuccess = () => {
    refetch();
  };

  const userList = users?.data || [];
  const totalPages = users?.count ? Math.ceil(users.count / limit) : undefined;

  return (
    <div className=''>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex justify-between w-full">
        <input
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md bg-[--md-sys-color-surface-container-highest] text-[--md-sys-color-on-surface]"
        />
          <div className='flex gap-2'>
            <TextButton
              className='bg-[--md-sys-color-surface-container-high] rounded-md'
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['users'] })
                refetch()
              }}>
              Refresh
            </TextButton>
            <TextButton
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-md"
            >
              Add User
            </TextButton>
          </div>
        </div>
      </div>
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
            header: 'Role', 
            accessor: 'role',
            enableSorting: true,
            enableFiltering: true
          }
        ]}
        page={page}
        onPageChange={setPage}
        showPageInput={true}
        isLoading={isLoading || deleteMutation.isPending}
        isError={isError}
        errorMessage="Failed to load users."
        totalPages={totalPages}
        enableSelection={true}
        onSelectionChange={(selectedUsers) => {
          console.log('Selected users:', selectedUsers);
        }}
        rowActions={(user: User) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRowClick(user); }}
              className="text-[--md-sys-color-primary]"
              aria-label='Edit user'
            >
              <OutlinedIcon icon="edit" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
              className="text-[--md-sys-color-error]"
              aria-label='Delete user'
            >
              <OutlinedIcon icon="delete" />
            </button>
          </div>
        )}
        onRowClick={handleRowClick}
      />

      {/* <AddUserDialog
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {selectedUser && (
        <EditUserDialog
          isOpen={true}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          user={selectedUser}
        />
      )} */}
    </div>
  );
}
