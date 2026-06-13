import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function approveSalon(formData: FormData) {
  const salonId = formData.get('salonId') as string;

  try {
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, { status: 'active' });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error approving salon:', error);
    return { error: 'Failed to approve salon' };
  }
}
