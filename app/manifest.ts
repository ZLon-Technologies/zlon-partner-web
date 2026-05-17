import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZLon Partner Portal',
    short_name: 'ZLon Partner',
    description: 'B2B SaaS Dashboard for ZLon Salon Owners',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb', // bg-gray-50
    theme_color: '#0a0a0a',      // Primary ZLon black
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
