'use client';
// import MonthlySalesChart from '@/components/ecommerce/MonthlySalesChart';
import Badge from '@/components/ui/badge/Badge';
import FullScreenLoader from '@/components/ui/loader/FullScreenLoader';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  BoxCubeIcon,
  DollarLineIcon,
} from '@/icons';
import { ProductStatusEnum } from '@/types';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
interface ProductDetails {
  id: number;
  name: string;
  image: string;
  ref: string;
  price: number;
  description: string;
  category: string;
  status: ProductStatusEnum;
  user: {
    username: string;
    userLastName: string;
    email: string;
    status: ProductStatusEnum;
  };
  orders?: Array<{
    quantity: number;
    userPrice: number;
  }>;
  sales: number;
  revenue: number;
  revenueTrend: 'UP' | 'DOWN';
}

const Details = () => {
  const { id } = useParams();
  const { push } = useRouter();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateData, setUpdateData] = useState<{
    price?: number;
    description?: string;
    unitSold?: number;
  }>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/${id}`,
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
      setProduct(result.data || null);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProduct();
  }, [id]);

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
        setUpdateData({});
        toast.success('Product updated successfully');
        fetchProduct(); // Re-fetch the product details to get the latest data
        // Update the local state to reflect changes

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'unitSold' ? Number(value) : value,
    }));
  };

  const changeProductStatus = async (status: ProductStatusEnum) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/validate/${id}`,
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
        setProduct(prev => (prev ? { ...prev, status } : null));
        toast.success(
          `Product ${
            status === ProductStatusEnum.Approved ? 'approved' : 'rejected'
          } successfully`,
        );
      } else {
        throw new Error(result.message || 'Failed to change product status');
      }
    } catch (error) {
      console.error('Error changing product status:', error);
      toast.error('Failed to update product status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}products/${id}`,
        {
          method: 'DELETE',
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
        toast.success('Product deleted successfully');
        push('/dashboard/products');
      } else {
        toast.error(result.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className='flex justify-center items-center h-64'>
        {loading ? <FullScreenLoader /> : 'Product not found'}
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate percentage change (simplified example)
  const percentageChange = 31.01; // This would normally come from your API

  return (
    <div className='flex flex-col gap-10 sm:px-10'>
      <div className='bg-white border border-gray-200 rounded-lg shadow-md p-10'>
        <h3 className='text-2xl text-gray-600 mb-4'>Product Details</h3>
        <div className='flex flex-col md:flex-row gap-6 p-10'>
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className='shadow-md md:w-1/2 md:h-full w-full h-80 object-cover'
          />
          <div className='flex flex-col gap-6 p-4'>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-2xl font-semibold text-gray-700'>
                  {product.name}
                </h2>
                <Badge
                  color={
                    product.status === ProductStatusEnum.Approved
                      ? 'success'
                      : product.status === ProductStatusEnum.Pending
                      ? 'warning'
                      : 'error'
                  }
                >
                  {product.status}
                </Badge>
              </div>
              <p className='text-sm font-medium my-2 text-gray-400'>
                {product.category}
              </p>
              <span className='text-sm font-medium text-gray-400'>
                SKU: <strong className='font-normal'> {product.ref}</strong>
              </span>
            </div>
            <span className='text-lg font-medium'>
              {formatCurrency(product.price)}
            </span>
            <p className='text-sm text-gray-500'>{product.description}</p>
            <span className='text-sm font-medium text-gray-400'>
              User Name:{' '}
              <strong className='font-normal text-gray-800'>
                {product.user?.username} {product.user?.userLastName}
              </strong>
            </span>
            <span className='text-sm font-medium text-gray-400'>
              User Email:{' '}
              <strong className='font-normal text-gray-800'>
                {product.user?.email}
              </strong>
            </span>
            <span className='text-sm font-medium text-gray-400'>
              User status:{' '}
              <Badge
                color={
                  product.user?.status === ProductStatusEnum.Approved
                    ? 'success'
                    : product.user?.status === ProductStatusEnum.Pending
                    ? 'warning'
                    : 'error'
                }
              >
                {product.user?.status}
              </Badge>
            </span>
            <div className='flex flex-1 items-end gap-4 flex-wrap'>
              <button
                onClick={handleDelete}
                className='w-fit px-8 py-1 border border-error-600 text-error-600 rounded-md hover:bg-error-100 transition'
                disabled={loading}
              >
                Delete
              </button>
              {product.status !== ProductStatusEnum.Rejected && (
                <button
                  onClick={() =>
                    changeProductStatus(ProductStatusEnum.Rejected)
                  }
                  className='w-fit px-8 py-1 border border-gray-600 text-black rounded-md hover:bg-black hover:text-white transition'
                  disabled={loading}
                >
                  Reject
                </button>
              )}
              {product.status !== ProductStatusEnum.Approved && (
                <button
                  onClick={() =>
                    changeProductStatus(ProductStatusEnum.Approved)
                  }
                  className='w-fit px-8 py-1 border border-gray-600 text-black rounded-md hover:bg-black hover:text-white transition'
                  disabled={loading}
                >
                  Approve
                </button>
              )}
              <button
                onClick={
                  () => setDialogOpen(true) // Open the dialog to update product
                }
                className='w-fit px-8 py-1 border border-gray-600 text-black rounded-md hover:bg-black hover:text-white transition'
                disabled={loading}
              >
                update
              </button>
            </div>
          </div>
        </div>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Product</AlertDialogTitle>
              <AlertDialogDescription>
                Update details for {product.name}
              </AlertDialogDescription>
            </AlertDialogHeader>
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
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => updateProductByAdmin(product.id, updateData)}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div>
        <h3 className='text-2xl text-gray-600 mb-4'>Product Stats</h3>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
            <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
              <DollarLineIcon className='text-gray-800 size-6 dark:text-white/90' />
            </div>

            <div className='flex items-end justify-between mt-5'>
              <div>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Revenue
                </span>
                <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                  {formatCurrency(product.revenue)}
                </h4>
              </div>
              <Badge
                color={product.revenueTrend === 'UP' ? 'success' : 'error'}
              >
                {product.revenueTrend === 'UP' ? (
                  <ArrowUpIcon />
                ) : (
                  <ArrowDownIcon />
                )}
                {percentageChange.toFixed(2)}%
              </Badge>
            </div>
          </div>

          <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
            <div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
              <BoxCubeIcon className='text-gray-800 size-6 dark:text-white/90' />
            </div>

            <div className='flex items-end justify-between mt-5'>
              <div>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Sales
                </span>
                <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                  {product.sales.toLocaleString()}
                </h4>
              </div>
              <Badge
                color={product.revenueTrend === 'UP' ? 'success' : 'error'}
              >
                {product.revenueTrend === 'UP' ? (
                  <ArrowUpIcon />
                ) : (
                  <ArrowDownIcon />
                )}
                11.01%
              </Badge>
            </div>
          </div>
        </div>

        {/* <div className='mt-6'>
          <MonthlySalesChart />
        </div> */}
      </div>
      {loading && <FullScreenLoader />}
    </div>
  );
};

export default Details;
