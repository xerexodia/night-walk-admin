'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';
import Badge from '../ui/badge/Badge';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import FullScreenLoader from '../ui/loader/FullScreenLoader';
import { useParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  image: string;
  ref: string;
  revenu: number;
  createdAt: string;
  sales: number;
  status: 'approved' | 'pending' | 'rejected';
}

export default function UserProductTable() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const {id} = useParams();
  const itemsPerPage = 10;

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/user/${id}?${params}`,
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
      setData(result.data.products || []);
      setTotalItems(result.data.total || 0);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
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
                Products
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Revenue
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Date Added
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Sales
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 float-end pr-4'
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className='relative divide-y divide-gray-100 dark:divide-gray-800 '>
            {data?.length ? (
              data?.map(product => (
                <TableRow key={product.id}>
                  <TableCell className='py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='h-[50px] w-[50px] overflow-hidden rounded-md'>
                        <Image
                          width={50}
                          height={50}
                          src={product.image}
                          className='h-[50px] w-[50px] object-cover'
                          alt={product.name}
                          unoptimized={process.env.NODE_ENV === 'development'}
                        />
                      </div>
                      <div>
                        <p className='font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                          {product.name}
                        </p>
                        <span className='text-xs text-gray-400'>
                          SKU: {product.ref}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    ${product.revenu?.toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    {product.sales?.toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400 float-end'>
                    <Badge
                      size='sm'
                      color={
                        product.status === 'approved'
                          ? 'success'
                          : product.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {product.status.charAt(0).toUpperCase() +
                        product.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <div className='h-80'>
                <div className='absolute flex flex-col gap-6 flex-1 items-center justify-center w-full h-full'>
                  <span className='text-gray-400'>
                    No products found! consider adding products
                  </span>
                  <svg
                    className='h-12 w-12 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1}
                      d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
            )}
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
