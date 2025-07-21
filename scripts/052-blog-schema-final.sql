-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create articles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.blog_articles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    excerpt text,
    content text,
    image_url text,
    category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'draft'::text CHECK (status IN ('draft', 'published')),
    published_at timestamp with time zone,
    read_time_minutes integer,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create or replace the trigger function for updating 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_blog_article_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists, then create it. This is idempotent.
DROP TRIGGER IF EXISTS on_blog_article_update ON public.blog_articles;
CREATE TRIGGER on_blog_article_update
BEFORE UPDATE ON public.blog_articles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_blog_article_update();

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog_images', 'blog_images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
ON CONFLICT (id) DO NOTHING;

-- RLS Policies - these are idempotent because of DROP POLICY IF EXISTS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read categories" ON public.blog_categories;
CREATE POLICY "Public can read categories" ON public.blog_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage categories" ON public.blog_categories;
CREATE POLICY "Admins can manage categories" ON public.blog_categories FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published articles" ON public.blog_articles;
CREATE POLICY "Public can read published articles" ON public.blog_articles FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Admins can manage articles" ON public.blog_articles;
CREATE POLICY "Admins can manage articles" ON public.blog_articles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Storage RLS Policies
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog_images');
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog_images' AND public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog_images' AND public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog_images' AND public.is_admin(auth.uid()));

-- Seed initial categories - this is idempotent because of ON CONFLICT
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Astrologia', 'astrologia', 'Approfondimenti sui segni, i pianeti e le case astrologiche.'),
('Cartomanzia', 'cartomanzia', 'Interpreta i tarocchi e gli oracoli per svelare il futuro.'),
('Numerologia', 'numerologia', 'Scopri il potere dei numeri e il loro significato nella tua vita.'),
('Sogni', 'sogni', 'Analizza i tuoi sogni per comprendere il tuo inconscio.'),
('Spiritualità', 'spiritualita', 'Percorsi di crescita interiore, meditazione e benessere.')
ON CONFLICT (slug) DO NOTHING;
