/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { DropdownMenu } from 'radix-ui';
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
import { useRouter } from 'next/navigation';
import { ProductStatusEnum } from '@/types';
import { toast } from 'react-toastify';
interface Product {
  id: number;
  name: string;
  image: string;
  ref: string;
  revenu: number;
  createdAt: string;
  sales: number;
  status: ProductStatusEnum;
  price: number;
  user: any;
  grossRevenue: number;
  revenue: number;
}

export default function ProductsTable() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [updateData, setUpdateData] = useState<{
    price?: number;
    description?: string;
    unitSold?: number;
  }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { push } = useRouter();
  const [currentAction, setCurrentAction] = useState<{
    type: 'approve' | 'reject' | 'delete' | 'details' | 'update';
    productId: number;
  } | null>(null);
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
        `${process.env.NEXT_PUBLIC_API_URL}products/?${params}`,
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
  const handleActionClick = (
    type: 'approve' | 'reject' | 'delete' | 'details' | 'update',
    productId: number,
  ) => {
    setCurrentAction({ type, productId });
    if (type === 'details') {
      return push(`/dashboard/products/details/${productId}`);
    }

    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!currentAction) return;

    const { type, productId } = currentAction;

    if (type === 'delete') {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          return response.json();
        })
        .then(result => {
          if (result.success) {
            toast.success('Product deleted successfully');
            setData(data.filter(product => product.id !== productId));
          } else {
            toast.error(result.message || 'Failed to delete product');
          }
        })
        .catch(error => {
          console.error('Error deleting product:', error);
          toast.error('Failed to delete product');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (type === 'update') {
      updateProductByAdmin(productId, updateData)
        .then(() => {
          setUpdateData({});
          fetchProducts(currentPage);
        })
        .catch(error => {
          console.error('Error updating product:', error);
          toast.error('Failed to update product');
        });
    } else {
      changeProductStatus(
        productId,
        type === 'approve'
          ? ProductStatusEnum.Approved
          : ProductStatusEnum.Rejected,
      );
    }

    setDialogOpen(false);
    setCurrentAction(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'unitSold' ? Number(value) : value,
    }));
  };

  const getDialogContent = () => {
    if (!currentAction) return { title: '', description: '', form: null };

    const product = data.find(p => p.id === currentAction.productId);
    const productName = product?.name || 'this product';

    switch (currentAction.type) {
      case 'approve':
        return {
          title: 'Approve Product',
          description: `Are you sure you want to approve ${productName}?`,
          form: null,
        };
      case 'reject':
        return {
          title: 'Reject Product',
          description: `Are you sure you want to reject ${productName}?`,
          form: null,
        };
      case 'delete':
        return {
          title: 'Delete Product',
          description: `Are you sure you want to delete ${productName}? This action cannot be undone.`,
          form: null,
        };
      case 'update':
        return {
          title: 'Update Product',
          description: `Update details for ${productName}`,
          form: (
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label htmlFor='price' className='text-right'>
                  Price
                </label>
                <input
                  id='price'
                  name='price'
                  type='number'
                  value={updateData.price || ''}
                  onChange={handleInputChange}
                  className='col-span-3 border rounded-md p-2 '
                  placeholder='Enter product price'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label htmlFor='unitSold' className='text-right'>
                  Units Sold
                </label>
                <input
                  id='unitSold'
                  name='unitSold'
                  type='number'
                  value={updateData.unitSold || ''}
                  onChange={handleInputChange}
                  className='col-span-3 border rounded-md p-2 '
                  placeholder='Enter units sold'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <label htmlFor='description' className='text-right'>
                  Description
                </label>
                <textarea
                  id='description'
                  name='description'
                  value={updateData.description || ''}
                  onChange={handleInputChange}
                  className='col-span-3 border rounded-md p-2 h-20'
                  placeholder='Enter product description'
                />
              </div>
            </div>
          ),
        };
      default:
        return { title: '', description: '', form: null };
    }
  };

  const { title, description, form } = getDialogContent();

  const changeProductStatus = async (
    productId: number,
    status: ProductStatusEnum,
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/validate/${productId}`,
        {
          method: 'POST',
          body: JSON.stringify({ status }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setData(prev =>
          prev.map(product =>
            product.id == productId ? { ...product, status: status } : product,
          ),
        );
        toast.success(
          `Product ${
            status === ProductStatusEnum.Approved ? 'approved' : 'rejected'
          } successfully`,
        );
        setDialogOpen(false);
        setCurrentAction(null);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to change product status');
      }
    } catch (error) {
      console.error('Error changing product status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProductByAdmin = async (
    productId: number,
    updateData: {
      price?: number;
      description?: string;
      unitSold?: number;
    },
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/admin/update`,
        {
          method: 'PATCH',
          body: JSON.stringify({ ...updateData, productId }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Product updated successfully');
        // Update the local state to reflect changes
        setData(prev =>
          prev.map(product =>
            product.id === productId
              ? {
                  ...product,
                  ...updateData,
                  revenu: updateData.unitSold
                    ? (product.revenu || 0) +
                      updateData.unitSold * (product.price || 0)
                    : product.revenu,
                }
              : product,
          ),
        );
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    } finally {
      setLoading(false);
    }
  };
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
                User
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Gross Revenue
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
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 float-end pr-4'
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
                    <span>{product.user?.email}</span>
                    <p className='text-xs text-gray-400'>
                      {product.user?.username} {product.user?.userLastName}
                    </p>
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    ${product.grossRevenue?.toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    ${product.revenue?.toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    {product.sales?.toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    ${product.price ?? 0}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400 float-right mt-4'>
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
                          className='flex text-sm items-center gap-2 text-gray-400  cursor-pointer mb-1'
                          onClick={() =>
                            handleActionClick('details', product.id)
                          }
                        >
                          {/* <Check className='h-4 w-4 text-green-500' /> */}
                          View details
                        </DropdownMenu.Item>
                        {product?.status !== ProductStatusEnum.Approved && (
                          <DropdownMenu.Item
                            className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer mb-1'
                            onClick={() =>
                              handleActionClick('approve', product.id)
                            }
                          >
                            {/* <Check className='h-4 w-4 text-green-500' /> */}
                            Approve
                          </DropdownMenu.Item>
                        )}
                        {product.status !== ProductStatusEnum.Rejected && (
                          <DropdownMenu.Item
                            className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer my-1'
                            onClick={() =>
                              handleActionClick('reject', product.id)
                            }
                          >
                            {/* <X className='h-4 w-4 text-yellow-500' /> */}
                            Reject
                          </DropdownMenu.Item>
                        )}
                        <DropdownMenu.Item
                          className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer mt-1'
                          onClick={() =>
                            handleActionClick('delete', product.id)
                          }
                        >
                          {/* <Trash2 className='h-4 w-4' /> */}
                          Delete
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className='flex text-sm items-center gap-2 text-gray-400 cursor-pointer mt-1'
                          onClick={() =>
                            handleActionClick('update', product.id)
                          }
                        >
                          {/* <Trash2 className='h-4 w-4' /> */}
                          Update
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
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
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {form}
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
