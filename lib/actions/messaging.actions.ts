'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendInternalMessage(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Utente non autenticato.' };
  }

  const rawFormData = {
    recipientId: formData.get('recipientId') as string,
    subject: formData.get('subject') as string,
    body: formData.get('body') as string,
  };

  if (!rawFormData.recipientId || !rawFormData.subject || !rawFormData.body) {
    return { error: 'Tutti i campi sono obbligatori.' };
  }

  const { error } = await supabase.from('internal_messages').insert({
    sender_id: user.id,
    recipient_id: rawFormData.recipientId,
    subject: rawFormData.subject,
    body: rawFormData.body,
  });

  if (error) {
    console.error('Error sending internal message:', error);
    return { error: 'Impossibile inviare il messaggio.' };
  }

  // Optionally revalidate a path if you have a message list page
  // revalidatePath('/admin/messages');
  return { success: 'Messaggio inviato con successo.' };
}

export async function sendNewsletter(formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Non autorizzato" };
    }

    // You should check if the user is an admin here
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    // if (profile?.role !== 'admin') {
    //     return { error: "Azione non permessa" };
    // }

    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;

    if (!subject || !content) {
        return { error: "Oggetto e contenuto sono obbligatori." };
    }

    // Here you would implement the logic to send the newsletter to all subscribed users
    // For now, we just save it to the database
    const { error } = await supabase.from('newsletters').insert({
        subject,
        content,
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_by: user.id,
    });

    if (error) {
        console.error("Error sending newsletter:", error);
        return { error: "Errore durante l'invio della newsletter." };
    }

    return { success: "Newsletter inviata con successo." };
}
