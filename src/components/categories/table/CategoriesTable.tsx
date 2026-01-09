'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import FullScreenLoader from '@/components/ui/loader/FullScreenLoader';
import { TrashBinIcon } from '@/icons';
import Button from '@/components/ui/button/Button';

interface Category {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesTableProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoriesTable({ onDelete }: CategoriesTableProps) {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchCategories = async (page: number) => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}categories?${params}`,
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

      setData(result.data || []);
      setTotalItems(result.data.total || 0);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

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
                Title
              </TableCell>

              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {data.map(category => (
              <TableRow
                key={category.id}
                className='hover:bg-gray-100 hover:cursor-pointer'
              >
                <TableCell className='py-3'>
                  <p className='font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                    {category.title}
                  </p>
                </TableCell>

                <TableCell className='py-3'>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onDelete(category)}
                      className='text-red-600 border-red-600 hover:bg-red-50'
                    >
                      <TrashBinIcon className='w-4 h-4' />
                    </Button>
                  </div>
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

      {loading && <FullScreenLoader />}
    </div>
  );
}
