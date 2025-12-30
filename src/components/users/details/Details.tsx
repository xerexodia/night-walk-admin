/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Badge from '@/components/ui/badge/Badge';
import FullScreenLoader from '@/components/ui/loader/FullScreenLoader';
import { UserStatusEnum } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const Details = () => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const { push } = useRouter();
  const { id } = useParams();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUser(data.data);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
      });
  }, [id]);

  const handleDelete = async () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}users/${id}`, {
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
          push('/users');
        } else {
          toast.error('Failed to delete user:', data.message);
        }
      })
      .catch(error => toast.error('Error deleting user:', error))
      .finally(() => setLoading(false));
  };

  const handleApprove = async () => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}users/${id}/status?status=${UserStatusEnum.Approved}`,
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
          setUser((prev: any) => ({
            ...prev,
            status: UserStatusEnum.Approved,
          }));
        } else {
          toast.error('Failed to approve user:', data.message);
        }
      })
      .catch(error => toast.error('Error approving user:', error))
      .finally(() => setLoading(false));
  };

  const handleReject = async () => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}users/${id}/status?status=${UserStatusEnum.Rejected}`,
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
          setUser((prev: any) => ({
            ...prev,
            status: UserStatusEnum.Rejected,
          }));
        } else {
          toast.error('Failed to reject user:', data.message);
        }
      })
      .catch(error => toast.error('Error rejecting user:', error))
      .finally(() => setLoading(false));
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center gap-6'>
            <h4 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
              Personal Information
            </h4>
            <Badge
              color={
                user?.status === UserStatusEnum.Approved
                  ? 'success'
                  : user?.status === UserStatusEnum.Pending
                  ? 'warning'
                  : 'error'
              }
            >
              {user?.status}
            </Badge>
          </div>

          <div>
            <div className='flex flex-col gap-4 flex-1'>
              <div className='flex flex-1 gap-4 flex-wrap'>
                <div className='flex-1'>
                  <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                    Creator Name :
                  </span>
                  <span>
                    {user?.username} {user?.userLastName}
                  </span>
                </div>
                <div className='flex-1' />
              </div>
              <div className='flex flex-1 gap-4 flex-wrap'>
                <div className='flex-1'>
                  <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                    Email Address :
                  </span>
                  <span>{user?.email}</span>
                </div>
                <div className='flex-1'>
                  <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                    Phone Number :
                  </span>
                  <span>{user?.phone}</span>
                </div>
              </div>
              <div>
                <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                  Bio :
                </span>
                <span>
                  {user?.bio || 'This user has not provided a bio yet.'}
                </span>
              </div>
              <div>
                <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                  Have you ever gotten paid for content you’ve posted or linked
                  :
                </span>
                <span>{user?.paidBefore ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                  How often do you post to your primary social media account :
                </span>
                <span>{user?.postingOccurence}</span>
              </div>
              <div>
                <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                  Default password :
                </span>
                <span>{user?.autoGeneratedPassword}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white'>
        <div className='flex flex-col gap-6'>
          <h4 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Social Media Links
          </h4>
          <div className='flex flex-1 flex-col gap-4'>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                  Instagram :
                </span>
                <span>{user?.instagram ?? 'Not provided'}</span>
              </div>
              <div className='flex-1'>
                <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                  Youtube :
                </span>
                <span>{user?.youtube ?? 'Not provided'}</span>
              </div>
            </div>
            <div className='flex flex-1 flex-wrap gap-4'>
              <div className='flex-1'>
                <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                  TikTok :
                </span>
                <span>{user?.tiktok ?? 'Not provided'}</span>
              </div>
              <div className='flex-1'>
                <span className='font-medium text-sm text-gray-500 dark:text-white/90 mr-4'>
                  Snapchat :
                </span>
                <span>{user?.snapchat ?? 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex gap-6 items-center justify-end'>
        <button
          onClick={handleDelete}
          className='text-error-600 border border-error-600 rounded-md px-8 py-1 hover:bg-error-100'
        >
          Delete
        </button>
        {user?.status !== UserStatusEnum.Rejected && (
          <button
            onClick={handleReject}
            className='text-warning-600 border border-warning-600 rounded-md px-8 py-1 hover:bg-warning-100'
          >
            Reject
          </button>
        )}
        {user?.status !== UserStatusEnum.Approved && (
          <button
            onClick={handleApprove}
            className='text-success-600 border border-success-600 rounded-md px-8 py-1 hover:bg-success-100'
          >
            Approve
          </button>
        )}
        <button
          onClick={() => push(`/dashboard/users/stats/${id}`)}
          className='text-black border border-black rounded-md px-8 py-1 hover:bg-black hover:text-white'
        >
          View stats
        </button>
      </div>

      {loading && <FullScreenLoader />}
    </div>
  );
};

export default Details;
