'use client';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { PlusIcon } from '@/icons';
import CategoriesTable from '@/components/categories/table/CategoriesTable';
import { useState } from 'react';
import AddCategoryModal from '@/components/categories/modals/AddCategoryModal';
import { toast } from 'react-toastify';
import DeleteCategoryModal from '@/components/categories/modals/DeleteCategoryModal';

interface Category {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const CategoriesPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddCategory = () => {
    setIsAddModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsAddModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCategorySuccess = (message: string) => {
    toast.success(message);
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className='flex flex-col gap-6'>
      <PageBreadcrumb pageTitle='Categories' />

      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-white'>
            Categories
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-1'>
            Manage event categories
          </p>
        </div>
        <Button
          onClick={handleAddCategory}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2'
        >
          <PlusIcon />
          Add Category
        </Button>
      </div>

      <CategoriesTable
        key={refreshKey}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCategorySuccess}
        category={selectedCategory}
      />

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCategorySuccess}
        category={selectedCategory}
      />
    </div>
  );
};

export default CategoriesPage;
