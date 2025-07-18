-- Step 1: Abilita la Row Level Security (RLS) sulle tabelle indicate.
-- Questo "attiva il buttafuori" e dice a Supabase di iniziare a controllare le regole.
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Forza l'applicazione delle regole anche ai proprietari della tabella.
ALTER TABLE public.operator_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items FORCE ROW LEVEL SECURITY;


-- Step 2: Crea le REGOLE (Policies) per la tabella 'operator_profiles'.
-- Le regole dicono al buttafuori chi far passare e cosa fargli fare.

-- REGOLA 1: Permetti a CHIUNQUE (anche visitatori non loggati) di VEDERE i profili degli operatori.
-- Questo è fondamentale per mostrare la lista degli esperti sul suo sito pubblico.
DROP POLICY IF EXISTS "Allow public read access to operator profiles" ON public.operator_profiles;
CREATE POLICY "Allow public read access to operator profiles"
ON public.operator_profiles FOR SELECT
USING (true);

-- REGOLA 2: Permetti a un operatore LOGGATO di MODIFICARE il SUO profilo.
DROP POLICY IF EXISTS "Allow operators to update their own profile" ON public.operator_profiles;
CREATE POLICY "Allow operators to update their own profile"
ON public.operator_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- REGOLA 3: Permetti agli AMMINISTRATORI di fare QUALSIASI COSA (vedere, creare, modificare, cancellare) con i profili.
DROP POLICY IF EXISTS "Allow admins full access to operator profiles" ON public.operator_profiles;
CREATE POLICY "Allow admins full access to operator profiles"
ON public.operator_profiles FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- Step 3: Crea le REGOLE (Policies) per la tabella 'invoice_items'.
-- Questi dati sono sensibili e non devono essere pubblici.

-- REGOLA 1: Permetti a un utente LOGGATO di VEDERE solo gli elementi delle SUE fatture.
DROP POLICY IF EXISTS "Allow users to see their own invoice items" ON public.invoice_items;
CREATE POLICY "Allow users to see their own invoice items"
ON public.invoice_items FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices
    WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  )
);

-- REGOLA 2: Permetti agli AMMINISTRATORI di VEDERE TUTTI gli elementi di tutte le fatture.
DROP POLICY IF EXISTS "Allow admins read access to all invoice items" ON public.invoice_items;
CREATE POLICY "Allow admins read access to all invoice items"
ON public.invoice_items FOR SELECT
USING (public.is_admin(auth.uid()));

-- REGOLA 3: Permetti agli AMMINISTRATORI di creare/modificare/cancellare gli elementi delle fatture.
DROP POLICY IF EXISTS "Allow admins write access to all invoice items" ON public.invoice_items;
CREATE POLICY "Allow admins write access to all invoice items"
ON public.invoice_items FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
