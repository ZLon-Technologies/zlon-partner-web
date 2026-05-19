import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Authentication Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Authorization Check (The Bouncer)
  // Verify if the user is an owner of at least one salon
  const { data: salon, error } = await supabase
    .from('salons')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (error || !salon) {
    // If not a salon owner, redirect to login with error parameter
    redirect('/login?error=unauthorized_role');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
