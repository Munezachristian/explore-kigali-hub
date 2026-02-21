
-- Create storage bucket for package images
INSERT INTO storage.buckets (id, name, public) VALUES ('package-images', 'package-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for package images
CREATE POLICY "Anyone can view package images" ON storage.objects FOR SELECT USING (bucket_id = 'package-images');
CREATE POLICY "Staff can upload package images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'package-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'))
);
CREATE POLICY "Staff can delete package images" ON storage.objects FOR DELETE USING (
  bucket_id = 'package-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'))
);

-- Storage policies for CV uploads
CREATE POLICY "Applicants can upload CVs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'cv-uploads' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Staff can view CVs" ON storage.objects FOR SELECT USING (
  bucket_id = 'cv-uploads' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'))
);
CREATE POLICY "Own CV access" ON storage.objects FOR SELECT USING (
  bucket_id = 'cv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]
);
