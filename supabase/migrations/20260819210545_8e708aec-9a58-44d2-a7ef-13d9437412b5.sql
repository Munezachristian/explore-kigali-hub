-- 1. Fix mutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_simple(_user_id uuid)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $function$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$function$;

-- 2. Bookings: scope policies to authenticated role explicitly
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON public.bookings;

CREATE POLICY "Clients can create bookings" ON public.bookings
FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can view own bookings" ON public.bookings
FOR SELECT TO authenticated USING (auth.uid() = client_id);

CREATE POLICY "Staff can view all bookings" ON public.bookings
FOR SELECT TO authenticated USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'tour_manager') OR has_role(auth.uid(), 'accountant')
);

CREATE POLICY "Staff can update bookings" ON public.bookings
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'tour_manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'tour_manager'));

REVOKE ALL ON public.bookings FROM anon;

-- 3. Comments: hide author_id from public reads
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.comments;

CREATE POLICY "Users can view own comments" ON public.comments
FOR SELECT TO authenticated USING (auth.uid() = author_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can post comments" ON public.comments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

REVOKE ALL ON public.comments FROM anon;

CREATE OR REPLACE VIEW public.comments_public AS
SELECT id, post_id, author_name, content, created_at
FROM public.comments
WHERE is_approved = true;

GRANT SELECT ON public.comments_public TO anon, authenticated;

-- 4. Information centers: hide phone/email from anonymous visitors
DROP POLICY IF EXISTS "Anyone can view published information centers" ON public.information_centers;

CREATE POLICY "Authenticated users can view published information centers"
ON public.information_centers
FOR SELECT TO authenticated USING (status::text = 'published' OR has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.information_centers FROM anon;

CREATE OR REPLACE VIEW public.information_centers_public AS
SELECT id, name, description, address, latitude, longitude, opening_hours, status, created_at, updated_at
FROM public.information_centers
WHERE status::text = 'published';

GRANT SELECT ON public.information_centers_public TO anon, authenticated;