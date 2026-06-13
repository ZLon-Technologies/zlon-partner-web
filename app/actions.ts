'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function approveApplication(applicationId: string) {
  try {
    // Update application status to 'approved'
    const appRef = doc(db, 'salon_applications', applicationId);
    await updateDoc(appRef, { status: 'approved' });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Approve Error:', error);
    return { error: error.message };
  }
}

export async function rejectApplication(applicationId: string) {
  try {
    const appRef = doc(db, 'salon_applications', applicationId);
    await updateDoc(appRef, { status: 'rejected' });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Reject Error:', error);
    return { error: error.message };
  }
}
