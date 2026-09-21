import { LogInIcon, UserIcon } from 'lucide-react';
import NavLink from '@/app/components/NavLink';
import { getCurrentUser } from '@/lib/dal';
import Link from 'next/link';
import SignOutButton from '@/app/components/SignOutButton';

const UserNav = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/signin"
        className="flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
      >
        <LogInIcon size={20} className="mr-3 text-gray-400" />
        <span className="hidden md:inline">Увійти</span>
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center px-2 py-2">
        <UserIcon size={20} className="text-gray-400 shrink-0 mr-3" />
        <span className="hidden md:inline text-sm text-gray-300 truncate">{user.name ?? user.email}</span>
      </div>
      <SignOutButton />
    </div>
  );
};

export default UserNav;

// Fallback поки UserNav завантажується
export function UserNavFallback() {
  return <NavLink href="/signin" icon={<LogInIcon size={20} />} label="Увійти" />;
}
