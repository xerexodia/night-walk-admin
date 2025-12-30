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
import { useState } from 'react';

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

interface Product {
  id: number;
  name: string;
  sales: number;
  revenu: string;
  image: string;
  date: string;
  status: 'Delivered' | 'Pending' | 'Canceled';
}

const tableData: Product[] = [
  {
    id: 1,
    name: 'MacBook Pro 13”',
    sales: 212,
    revenu: '$2399.00',
    status: 'Delivered',
    date: '2025-03-10',
    image: '/images/product/product-01.jpg',
  },
  {
    id: 2,
    name: 'Apple Watch Ultra',
    sales: 1412,
    revenu: '$879.00',
    status: 'Pending',
    date: '2025-03-10',
    image: '/images/product/product-02.jpg',
  },
  {
    id: 3,
    name: 'iPhone 15 Pro Max',
    sales: 42,
    revenu: '$1869.00',
    status: 'Delivered',
    date: '2025-03-10',
    image: '/images/product/product-03.jpg',
  },
  {
    id: 4,
    name: 'iPad Pro 3rd Gen',
    sales: 454,
    revenu: '$1699.00',
    status: 'Canceled',
    date: '2025-03-10',
    image: '/images/product/product-04.jpg',
  },
  {
    id: 5,
    name: 'AirPods Pro 2nd Gen',
    sales: 567,
    revenu: '$240.00',
    status: 'Delivered',
    date: '2025-03-10',
    image: '/images/product/product-05.jpg',
  },
  {
    id: 6,
    name: 'MacBook Air M2',
    sales: 321,
    revenu: '$1199.00',
    status: 'Delivered',
    date: '2025-03-11',
    image: '/images/product/product-01.jpg',
  },
  {
    id: 7,
    name: 'Apple Watch SE',
    sales: 789,
    revenu: '$249.00',
    status: 'Pending',
    date: '2025-03-12',
    image: '/images/product/product-02.jpg',
  },
  {
    id: 8,
    name: 'iPhone 15',
    sales: 654,
    revenu: '$799.00',
    status: 'Delivered',
    date: '2025-03-13',
    image: '/images/product/product-03.jpg',
  },
];

export default function UsersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>(tableData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'approve' | 'disapprove' | 'delete';
    productId: number;
  } | null>(null);

  const itemsPerPage = 5;

  // Calculate pagination
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = products.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleActionClick = (
    type: 'approve' | 'disapprove' | 'delete',
    productId: number,
  ) => {
    setCurrentAction({ type, productId });
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!currentAction) return;

    const { type, productId } = currentAction;

    if (type === 'delete') {
      setProducts(products.filter(product => product.id !== productId));
    } else {
      setProducts(
        products.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              status: type === 'approve' ? 'Delivered' : 'Canceled',
            };
          }
          return product;
        }),
      );
    }

    setDialogOpen(false);
    setCurrentAction(null);
  };

  const getDialogContent = () => {
    if (!currentAction) return { title: '', description: '' };

    const product = products.find(p => p.id === currentAction.productId);
    const productName = product?.name || 'this product';

    switch (currentAction.type) {
      case 'approve':
        return {
          title: 'Approve Product',
          description: `Are you sure you want to approve ${productName}? This will mark it as delivered.`,
        };
      case 'disapprove':
        return {
          title: 'Disapprove Product',
          description: `Are you sure you want to disapprove ${productName}? This will mark it as canceled.`,
        };
      case 'delete':
        return {
          title: 'Delete Product',
          description: `Are you sure you want to delete ${productName}? This action cannot be undone.`,
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
                Products
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Revenu
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
            {currentItems.map(product => (
              <TableRow key={product.id} className=''>
                <TableCell className='py-3'>
                  <div className='flex items-center gap-3'>
                    <div className='h-[50px] w-[50px] overflow-hidden rounded-md'>
                      <Image
                        width={50}
                        height={50}
                        src={product.image}
                        className='h-[50px] w-[50px]'
                        alt={product.name}
                      />
                    </div>
                    <div>
                      <p className='font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                        {product.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  {product.revenu}
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  {product.date}
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  {product.sales}
                </TableCell>
                <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                  <Badge
                    size='sm'
                    color={
                      product.status === 'Delivered'
                        ? 'success'
                        : product.status === 'Pending'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {product.status}
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
                        </svg>{' '}
                      </span>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      className='bg-white shadow dark:bg-gray-900 p-2 rounded-md '
                      align='end'
                    >
                      <DropdownMenu.Item
                        className='flex items-center gap-2 text-gray-400  cursor-pointer mb-1'
                        onClick={() => handleActionClick('approve', product.id)}
                      >
                        {/* <Check className='h-4 w-4 text-green-500' /> */}
                        Approve
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className='flex items-center gap-2 text-gray-400 cursor-pointer my-1'
                        onClick={() =>
                          handleActionClick('disapprove', product.id)
                        }
                      >
                        {/* <X className='h-4 w-4 text-yellow-500' /> */}
                        Disapprove
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className='flex items-center gap-2 text-gray-400 cursor-pointer mt-1'
                        onClick={() => handleActionClick('delete', product.id)}
                      >
                        {/* <Trash2 className='h-4 w-4' /> */}
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
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{' '}
          {totalItems} entries
        </div>
        <div className='flex gap-1'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${
              currentPage === 1
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
              className={`px-3 py-1 rounded-md border ${
                currentPage === page
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${
              currentPage === totalPages
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
    </div>
  );
}
