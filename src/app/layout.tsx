import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from '@/components/routes/ProtectedRoutes';

const outfit = Outfit({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <ProtectedRoute>{children}</ProtectedRoute>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
        <ToastContainer className={'z-9999999'} style={{ zIndex: 9999999 }} />
      </body>
    </html>
  );
}
