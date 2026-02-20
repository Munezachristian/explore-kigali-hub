
-- Fix: Remove permissive INSERT WITH CHECK (true) policies and restrict properly
-- Fix internships - require auth or limit to public submissions properly
DROP POLICY IF EXISTS "Anyone can submit internship" ON public.internships;
CREATE POLICY "Public can submit internship" ON public.internships FOR INSERT WITH CHECK (
  applicant_id IS NULL OR auth.uid() = applicant_id
);

-- Fix system_logs - only system/authenticated inserts
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;
CREATE POLICY "Authenticated users can insert logs" ON public.system_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fix handle_new_user function search_path (already set, but ensure it's correct)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
