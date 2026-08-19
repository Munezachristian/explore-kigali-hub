ALTER VIEW public.information_centers_public SET (security_invoker = on);
ALTER VIEW public.comments_public SET (security_invoker = on);

GRANT SELECT (id, name, description, address, latitude, longitude, opening_hours, status, created_at, updated_at)
  ON public.information_centers TO anon;

CREATE POLICY "Anon can view published information centers (no contact)"
ON public.information_centers
FOR SELECT TO anon USING (status::text = 'published');

GRANT SELECT (id, post_id, author_name, content, created_at, is_approved)
  ON public.comments TO anon;

CREATE POLICY "Anon can view approved comments (no author id)"
ON public.comments
FOR SELECT TO anon USING (is_approved = true);