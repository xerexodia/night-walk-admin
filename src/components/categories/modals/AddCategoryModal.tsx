'use client';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  category?: Category | null;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: AddCategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (category) {
      setFormData({
        title: category.title,
        description: category.description || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Category title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to manage categories');
        return;
      }

      const url = category
        ? `${process.env.NEXT_PUBLIC_API_URL}categories/${category.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}categories`;

      const response = await fetch(url, {
        method: category ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      onSuccess(
        category
          ? 'Category updated successfully!'
          : 'Category created successfully!',
      );
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save category',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className='max-w-md w-full p-6'>
      <div className='flex flex-col gap-6'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <p className='text-gray-500 dark:text-gray-400 mt-1'>
            {category
              ? 'Update the category information'
              : 'Create a new event category'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div>
            <Label>Category Title*</Label>
            <Input
              type='text'
              name='title'
              value={formData.title}
              onChange={handleInputChange}
              placeholder='e.g., Music, Sports, Technology'
              className={errors.title ? 'border-red-500' : ''}
              required
            />
            {errors.title && (
              <p className='mt-1 text-sm text-red-500'>{errors.title}</p>
            )}
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
              disabled={isSubmitting}
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'
            >
              {isSubmitting
                ? category
                  ? 'Updating...'
                  : 'Creating...'
                : category
                ? 'Update Category'
                : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
