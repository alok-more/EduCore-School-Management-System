'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, Building2, Users, UserCog, UserCircle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: Array<'SUPER_ADMIN' | 'SCHOOL_ADMIN'>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Schools', href: '/schools', icon: Building2, roles: ['SUPER_ADMIN'] },
  { label: 'Students', href: '/students', icon: Users, roles: ['SCHOOL_ADMIN'] },
  { label: 'Staff', href: '/staff', icon: UserCog, roles: ['SCHOOL_ADMIN'] },
  { label: 'Profile', href: '/profile', icon: UserCircle },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { session } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (session && item.roles.includes(session.role)),
  );

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-accent-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold leading-tight">EduCore</span>
          <span className="text-[11px] text-sidebar-muted-foreground">
            School Management
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-muted text-sm font-semibold text-sidebar-foreground">
            {session?.firstName?.[0] ?? '?'}
            {session?.lastName?.[0] ?? ''}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {session ? `${session.firstName} ${session.lastName}` : 'Loading…'}
            </p>
            <p className="truncate text-[11px] capitalize text-sidebar-muted-foreground">
              {session?.role.replace('_', ' ').toLowerCase() ?? ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebarBack() {
  return (
    <div className="flex items-center gap-2 px-5 py-3 text-sidebar-muted-foreground md:hidden">
      <ChevronLeft className="h-4 w-4" />
      <span className="text-xs">Close</span>
    </div>
  );
}
