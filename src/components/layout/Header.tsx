'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Booking', subtitle: 'Book parking for vehicles' },
  '/zones': { title: 'Parking Zones', subtitle: 'Manage zones and availability' },
  '/history': { title: 'History', subtitle: 'View all parking sessions' },
  '/admin/qr': { title: 'QR Codes', subtitle: 'Generate QR codes for zones' },
  '/analytics': { title: 'Analytics', subtitle: 'Monitor parking metrics' },
  '/confirm': { title: 'Confirm', subtitle: 'Review and confirm booking' },
  '/complete': { title: 'Complete Session', subtitle: 'Review price and confirm payment' },
};

export default function Header() {
  const pathname = usePathname() ?? '';
  const basePath = pathname.startsWith('/complete/') ? '/complete' : pathname;
  const { title, subtitle } = pageTitles[basePath] ?? { title: 'Dashboard', subtitle: 'Selam Parking System' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 py-4 backdrop-blur-sm lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* Search */}
      
        {/* Icons */}
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        {/* User */}
        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-sm font-semibold text-red-600">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">admin@parking.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
