-- This script fixes the RLS policies for the blog system, specifically for storage objects.

-- Drop the faulty combined policy if it exists
DROP POLICY IF EXISTS "Admins can manage blog images" ON storage.objects;

-- Recreate policies for storage objects correctly

-- Policy for UPDATE
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'blog_images' AND
    public.is_admin(auth.uid())
) WITH CHECK (
    bucket_id = 'blog_images' AND
    public.is_admin(auth.uid())
);

-- Policy for DELETE
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'blog_images' AND
    public.is_admin(auth.uid())
);

-- Ensure other policies are correct

-- Policy for INSERT
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'blog_images' AND
    public.is_admin(auth.uid())
);

-- Policy for SELECT
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
CREATE POLICY "Anyone can view blog images" ON storage.objects
FOR SELECT USING (
    bucket_id = 'blog_images'
);

-- Ensure RLS is enabled on the tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

-- Grant usage on schema to authenticated users to allow RLS to check functions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Grant usage on schema to anon users to allow RLS to check functions
GRANT USAGE ON SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;
