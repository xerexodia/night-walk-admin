'use client';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { TrashBinIcon } from '@/icons';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  category?: Category | null;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: DeleteCategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!category) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to manage categories');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}categories/${category.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      onSuccess('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete category',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className='max-w-md w-full p-6'>
      <div className='flex flex-col gap-6'>
        <div className='flex items-center gap-4'>
          <div className='flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
            <TrashBinIcon className='w-6 h-6 text-red-600' />
          </div>
          <div>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Delete Category
            </h2>
            <p className='text-gray-500 dark:text-gray-400 mt-1'>
              Are you sure you want to delete this category?
            </p>
          </div>
        </div>

        {category && (
          <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
            <h3 className='font-medium text-gray-900 dark:text-white mb-2'>
              {category.title}
            </h3>
            {category.description && (
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {category.description}
              </p>
            )}
            <p className='text-xs text-gray-500 dark:text-gray-500 mt-2'>
              Created: {new Date(category.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800'>
            <strong>Warning:</strong> Deleting this category will remove it from all events that use it. This action cannot be undone.
          </p>
        </div>

        <div className='flex items-center justify-end gap-3 pt-4'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
            className='px-4 py-2'
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isSubmitting}
            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md'
          >
            {isSubmitting ? 'Deleting...' : 'Delete Category'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
