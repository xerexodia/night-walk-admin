import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign Up — Night Walk Admin',
};

/**
 * Admin accounts are provisioned by a superadmin via `npm run admin:create`.
 * This public signup route is disabled for security.
 */
export default function SignUp() {
  redirect('/signin');
}
