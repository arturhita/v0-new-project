'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { type PlatformSettings } from '@/lib/schemas';

export async function getPlatformSettings() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('id', 'singleton')
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "exact one row" error if table is empty
    console.error('Error fetching platform settings:', error);
    return { error: 'Impossibile caricare le impostazioni.' };
  }
  return { data };
}

export async function updatePlatformSettings(settings: PlatformSettings) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('platform_settings')
    .update({ settings })
    .eq('id', 'singleton');

  if (error) {
    console.error('Error updating platform settings:', error);
    return { error: 'Errore durante l\'aggiornamento delle impostazioni.' };
  }

  revalidatePath('/admin/settings/advanced');
  return { success: 'Impostazioni aggiornate con successo.' };
}

export async function updateCompanyDetails(formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const details = {
        name: formData.get('name'),
        address: formData.get('address'),
        vatId: formData.get('vatId'),
        email: formData.get('email'),
        phone: formData.get('phone'),
    };

    const { error } = await supabase
        .from('platform_settings')
        .update({ company_details: details })
        .eq('id', 'singleton');

    if (error) {
        return { error: "Errore durante l'aggiornamento dei dati aziendali." };
    }
    revalidatePath('/admin/company-details');
    return { success: "Dati aziendali aggiornati." };
}
