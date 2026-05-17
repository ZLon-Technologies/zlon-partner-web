import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { createClient } from '@/utils/supabase/server';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F9F9F9',
};

export const metadata: Metadata = {
  title: 'ZLon Partner | Salon Management',
  description: 'Manage your salon bookings, services, and staff with the ZLon Partner Portal.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="flex h-screen overflow-hidden bg-gray-50 text-neutral-950">
        {user && <Sidebar user={user} />}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
