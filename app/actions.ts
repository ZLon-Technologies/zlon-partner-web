'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_ZLON_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function approveApplication(applicationId: string) {
  try {
    // 1. Fetch application details
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('salon_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) throw new Error('Application not found');

    // 2. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: application.email,
      password: 'TempPassword123!',
      email_confirm: true,
      user_metadata: { 
        salon_name: application.salon_name,
        full_name: application.owner_name
      }
    });

    if (authError) throw authError;

    // 3. Create record in salons table
    const { error: salonError } = await supabaseAdmin
      .from('salons')
      .insert([{
        owner_id: authData.user.id,
        name: application.salon_name,
        phone: application.phone,
        city: application.city,
        status: 'active'
      }]);

    if (salonError) throw salonError;

    // 4. Update application status
    const { error: updateError } = await supabaseAdmin
      .from('salon_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);

    if (updateError) throw updateError;

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Approve Error:', error);
    return { error: error.message };
  }
}

export async function rejectApplication(applicationId: string) {
  try {
    const { error } = await supabaseAdmin
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
