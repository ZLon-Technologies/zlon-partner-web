'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      await signOut(auth);
      router.push('/login');
      router.refresh();
    }
    logout();
  }, [router]);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-950" />
        <p className="text-sm font-medium text-gray-500">Signing you out...</p>
      </div>
    </div>
  );
}
