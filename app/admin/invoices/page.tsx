import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateInvoiceModal } from '@/components/create-invoice-modal';
import { getInvoices } from '@/lib/actions/invoice.actions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { useState } from 'react';
import InvoicesClientPage from './invoices-client-page';

export default async function InvoicesPage() {
  const { data: invoices, error } = await getInvoices();
  const supabase = await createSupabaseServerClient();
  const { data: usersData, error: usersError } = await supabase.from('users').select('id, email, raw_user_meta_data');

  if (error || usersError) {
    return <div className="text-red-500">Errore nel caricamento dei dati: {error || usersError?.message}</div>;
  }

  const formattedUsers = usersData?.map(u => ({
      id: u.id,
      email: u.email,
      type: u.raw_user_meta_data?.role === 'operator' ? 'operator' : 'client' as 'client' | 'operator'
  })) || [];

  return (
    <InvoicesClientPage initialInvoices={invoices || []} users={formattedUsers} />
  );
}
