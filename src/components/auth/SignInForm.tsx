'use client';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useAuth } from '@/context/AuthContext';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: async data => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors: any = {};
      if (!data.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = 'Email is invalid';
      }
      if (!data.password) {
        errors.password = 'Password is required';
      } else if (data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      return { values: data, errors };
    },
  });
  const onSubmit = async (data: SignInFormData) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          localStorage.setItem('token', data.data.accessToken);
          setUser({
            id: data.data.user.id,
            username: data.data.user.firstName + ' ' + data.data.user.lastName,
            email: data.data.user.email,
            token: data.data.accessToken,
            status: data.data.user.status,
          });
          document.cookie = `token=${data.data.accessToken}; path=/; secure; samesite=lax`;
          toast.success('Login successful!');
          router.replace('/');
        } else {
          toast.error(
            'Login failed. Please check your credentials and try again.',
          );
        }
      })
      .catch(error => {
        console.error('Error during login:', error);
        toast.error(
          'Login failed. Please check your credentials and try again.',
        );
      });
  };
  return (
    <div className='flex flex-col flex-1 w-full items-center'>
      <div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
        <div>
          <div>
            <form>
              <div className='space-y-6'>
                <div>
                  <Label>
                    Email <span className='text-error-500'>*</span>{' '}
                  </Label>
                  <Input
                    placeholder='info@gmail.com'
                    type='email'
                    {...register('email')}
                    error={!!errors.email}
                    hint={errors?.email as string | undefined}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className='text-error-500'>*</span>{' '}
                  </Label>
                  <div className='relative'>
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      error={errors?.password ? true : false}
                      hint={errors?.password as string | undefined}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2'
                    >
                      {showPassword ? (
                        <EyeIcon className='fill-gray-500 dark:fill-gray-400' />
                      ) : (
                        <EyeCloseIcon className='fill-gray-500 dark:fill-gray-400' />
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit(onSubmit)}
                  className='w-full bg-white text-gray-900 border border-gray-400 hover:bg-black transition hover:text-white rounded-md py-2'
                >
                  LOG IN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
