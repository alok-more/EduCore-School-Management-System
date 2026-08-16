'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { GraduationCap } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? '/dashboard' : '/login');
  }, [loading, session, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
          <Image
            src="/EduCore_Logo_Symbol.png"
            alt="EduCore"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
        <p className="text-sm text-muted-foreground">Loading EduCore…</p>
      </div>
    </div>
  );
}
