'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: NavItem[] = [
  {
    name: 'Booking',
    href: '/',
    icon: (
      <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'QR Codes',
    href: '/admin/qr',
    icon: (
      <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zm-6 0H6.4M5 6a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1V6zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V6zM5 16a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    name: 'Parking Zones',
    href: '/zones',
    icon: (
      <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: 'History',
    href: '/history',
    icon: (
      <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },

  {
    name: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname() ?? '';
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
          isActive
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
        <span>{item.name}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-gray-100 px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white">
          S
        </div>
        <span className="text-xl font-bold text-gray-900">Selam Parking</span>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
          Menu
        </p>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>

        {/* GENERAL */}
        <div className="mt-8">
          <p className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
            General
          </p>
          <div className="space-y-1">
            <a
              href="/"
              className="flex items-center gap-4 rounded-xl px-4 py-3 text-base font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Footer card - floating style */}
      <div className="border-t border-gray-100 p-4">
        <div className="rounded-2xl bg-red-900 px-5 py-5 text-white shadow-lg">
          <p className="text-lg font-bold">Parking System</p>
          <p className="mt-1 text-sm font-medium text-red-200">Manage zones with ease</p>
          <button className="mt-4 w-full rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors">
            Get Started
          </button>
        </div>
        <p className="mt-4 text-xs font-medium text-gray-400">© 2024 Selam Parking</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/80 lg:hidden"
        aria-label="Toggle menu"
      >
        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - floating gray card */}
      <aside
        className={`fixed left-4 top-4 z-40 h-[calc(100vh-2rem)] w-72 transform rounded-3xl bg-white shadow-xl ring-1 ring-gray-200/50 transition-all duration-200 ease-in-out lg:left-4 lg:top-4 lg:h-[calc(100vh-2rem)] lg:shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
