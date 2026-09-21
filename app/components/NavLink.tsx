'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

export default function NavLink({ href, icon, label, isActive }: NavLinkProps) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center px-2 py-2 text-sm font-medium rounded-md group',
        isActive || pathname === href
          ? 'bg-gray-800 text-purple-800 dark:text-purple-400 border-l-4 border-purple-500'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border-l-4 border-transparent',
      )}
    >
      <span className="text-gray-500 dark:text-gray-400 mr-3">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}
