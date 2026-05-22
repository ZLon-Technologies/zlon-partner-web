'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function logout() {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    }
    logout();
  }, [router, supabase]);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-950" />
        <p className="text-sm font-medium text-gray-500">Signing you out...</p>
      </div>
    </div>
  );
}
