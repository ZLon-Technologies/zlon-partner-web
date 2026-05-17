import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZLon Partner',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-[#F9F9F9] text-neutral-950">{children}</body>
    </html>
  );
}
