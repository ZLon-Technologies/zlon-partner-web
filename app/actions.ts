'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveApplication(applicationId: string) {
  try {
    const supabase = await createClient();

    // Update application status to 'approved'
    // Note: User creation and salon record insertion should be handled by 
    // a Supabase Edge Function or Database Trigger on status change 
    // since we no longer use the Service Role Key here.
    const { error } = await supabase
      .from('salon_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Approve Error:', error);
    return { error: error.message };
  }
}

export async function rejectApplication(applicationId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('salon_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Reject Error:', error);
    return { error: error.message };
  }
}
