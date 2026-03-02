
-- Create the gallery-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admin/tour_manager to upload
CREATE POLICY "Staff can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery-images'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'))
);

-- Allow authenticated admin/tour_manager to delete
CREATE POLICY "Staff can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery-images'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'))
);

-- Allow public read access
CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-images');
