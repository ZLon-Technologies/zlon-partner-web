import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveSalon(formData: FormData) {
  const salonId = formData.get('salonId') as string;
  const supabase = await createClient();

  const { error } = await supabase
    .from('salons')
    .update({ status: 'active' })
    .eq('id', salonId);

  if (error) {
    console.error('Error approving salon:', error);
    return { error: 'Failed to approve salon' };
  }

  revalidatePath('/admin');
  return { success: true };
}
