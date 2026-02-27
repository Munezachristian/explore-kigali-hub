
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-images', 'activity-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin can manage activity images" ON storage.objects FOR ALL USING (bucket_id = 'activity-images' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view activity images" ON storage.objects FOR SELECT USING (bucket_id = 'activity-images');
