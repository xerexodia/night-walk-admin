'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog/dialog';
import { DropdownMenu } from 'radix-ui';
import { useRouter } from 'next/navigation';
import { UserStatusEnum } from '@/types';
import { toast } from 'react-toastify';
import FullScreenLoader from '@/components/ui/loader/FullScreenLoader';

interface User {
  id: number;
  username: string;
  email: string;
  pendingCount: number;
  approvedCount: number;
  createdAt: string;
  status: UserStatusEnum;
}

export default function UsersTable() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { push } = useRouter();
  const [currentAction, setCurrentAction] = useState<{
    type: 'approve' | 'reject' | 'delete' | 'details' | 'stats';
    userId: number;
  } | null>(null);
  const itemsPerPage = 10;

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}users?${params}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data.users || []);
      setTotalItems(result.data.total || 0);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleActionClick = (
    type: 'approve' | 'reject' | 'delete' | 'details' | 'stats',
    userId: number,
  ) => {
    setCurrentAction({ type, userId });

    if (type === 'details') {
      return push(`/dashboard/users/details/${userId}`);
    }

    if (type === 'stats') {
      return push(`/dashboard/users/stats/${userId}`);
    }

    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!currentAction) return;

    const { type, userId } = currentAction;

    if (type === 'delete') {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            toast.success('User deleted successfully');
            setData(data => data.filter(user => user.id !== userId));
          } else {
            toast.error('Failed to delete user:', data.message);
          }
        })
        .catch(error => toast.error('Error deleting user:', error))
        .finally(() => setLoading(false));
    } else {
      setData(
        data.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              status:
                type === 'approve'
                  ? UserStatusEnum.Approved
                  : UserStatusEnum.Rejected,
            };
          }
          return user;
        }),
      );
    }

    if (type === 'approve') {
      setLoading(true);
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}users/${userId}/status?status=${UserStatusEnum.Approved}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      )
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            toast.success('User approved successfully');
          } else {
            toast.error('Failed to approve user:', data.message);
          }
        })
        .catch(error => toast.error('Error approving user:', error))
        .finally(() => setLoading(false));
    } else if (type === 'reject') {
      setLoading(true);
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}users/${userId}/status?status=${UserStatusEnum.Rejected}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      )
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            toast.success('User rejected successfully');
          } else {
            toast.error('Failed to reject user:', data.message);
          }
        })
        .catch(error => toast.error('Error rejecting user:', error))
        .finally(() => setLoading(false));
    }

    setDialogOpen(false);
    setCurrentAction(null);
  };

  const getDialogContent = () => {
    if (!currentAction) return { title: '', description: '' };

    const user = data.find(u => u.id === currentAction.userId);
    const userName = user?.username || 'this user';

    switch (currentAction.type) {
      case 'approve':
        return {
          title: 'Approve User',
          description: `Are you sure you want to approve ${userName}? This will grant them full access.`,
        };
      case 'reject':
        return {
          title: 'Reject User',
          description: `Are you sure you want to reject ${userName}? This will restrict their access.`,
        };
      case 'delete':
        return {
          title: 'Delete User',
          description: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
        };
      default:
        return { title: '', description: '' };
    }
  };

  const { title, description } = getDialogContent();

  return (
    <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6'>
      <div className='max-w-full overflow-x-auto'>
        <Table>
          <TableHeader className='border-gray-100 dark:border-gray-800 border-y'>
            <TableRow>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Join Date
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Products Online
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Products Pending
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400'
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {data.map(user => (
              <TableRow
                key={user.id}
                className='hover:bg-gray-100 hover:cursor-pointer'
              >
                <TableCell className='py-3'>
                  <p className='font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                    {user.username}
                  </p>
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  {user.email}
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  {user.approvedCount ?? 0}
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  {user.pendingCount ?? 0}
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  <Badge
                    size='sm'
                    color={
                      user.status === UserStatusEnum.Approved
                        ? 'success'
                        : user.status === UserStatusEnum.Rejected
                        ? 'error'
                        : 'warning'
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className='py-3 text-end'>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <span className='float-right'>
                        <svg
                          width='16'
                          height='16'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                        >
                          <path
                            d='M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z'
                            fill='gray'
                            stroke='gray'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z'
                            fill='gray'
                            stroke='gray'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z'
                            fill='gray'
                            stroke='gray'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </span>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      className='bg-white shadow dark:bg-gray-900 p-2 rounded-md'
                      align='end'
                    >
                      <DropdownMenu.Item
                        className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer mb-1'
                        onClick={() => handleActionClick('details', user.id)}
                      >
                        View details
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer mb-1'
                        onClick={() => handleActionClick('stats', user.id)}
                      >
                        View stats
                      </DropdownMenu.Item>
                      {user.status !== UserStatusEnum.Approved && (
                        <DropdownMenu.Item
                          className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer mb-1'
                          onClick={() => handleActionClick('approve', user.id)}
                        >
                          Approve
                        </DropdownMenu.Item>
                      )}
                      <DropdownMenu.Item
                        className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer my-1'
                        onClick={() => handleActionClick('reject', user.id)}
                      >
                        Reject
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer mt-1'
                        onClick={() => handleActionClick('delete', user.id)}
                      >
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between mt-4'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Showing {startItem} to {endItem} of {totalItems} entries
        </div>
        <div className='flex gap-1'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1 || loading
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
            }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={loading}
              className={`px-3 py-1 rounded-md border ${
                currentPage === page
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className={`px-3 py-1 rounded-md border ${
              currentPage === totalPages || loading
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {loading && <FullScreenLoader />}
    </div>
  );
}
