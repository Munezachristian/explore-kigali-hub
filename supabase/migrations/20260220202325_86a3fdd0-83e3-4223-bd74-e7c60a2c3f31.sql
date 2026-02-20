
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'tour_manager', 'accountant', 'client');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create packages table
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  duration TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  category TEXT,
  availability BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  travel_date DATE,
  num_travelers INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'refunded', 'failed')),
  payment_method TEXT,
  transaction_ref TEXT,
  confirmed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create internships table
CREATE TABLE public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('student', 'professional')),
  university TEXT,
  cover_letter TEXT,
  cv_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id),
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_approved BOOLEAN DEFAULT false,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create gallery table
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create information_center table
CREATE TABLE public.information_center (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL CHECK (category IN ('guideline', 'policy', 'faq', 'visa', 'announcement')),
  language TEXT DEFAULT 'en',
  is_published BOOLEAN DEFAULT true,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create system_logs table
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create translations table
CREATE TABLE public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  language TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(key, language),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create saved_packages table
CREATE TABLE public.saved_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, package_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.information_center ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_packages ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Packages RLS
CREATE POLICY "Anyone can view available packages" ON public.packages FOR SELECT USING (availability = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'));
CREATE POLICY "Admin and tour manager can manage packages" ON public.packages FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'));

-- Bookings RLS
CREATE POLICY "Clients can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Staff can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "Staff can update bookings" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'));

-- Payments RLS
CREATE POLICY "Accountant and admin can manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'accountant'));
CREATE POLICY "Clients can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = payments.booking_id AND bookings.client_id = auth.uid())
);

-- Internships RLS
CREATE POLICY "Anyone can submit internship" ON public.internships FOR INSERT WITH CHECK (true);
CREATE POLICY "Applicants can view own applications" ON public.internships FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Staff can manage internships" ON public.internships FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'));

-- Blog posts RLS
CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'));
CREATE POLICY "Admin and tour manager can manage posts" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'));

-- Comments RLS
CREATE POLICY "Anyone can view approved comments" ON public.comments FOR SELECT USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can post comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage comments" ON public.comments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Testimonials RLS
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage testimonials" ON public.testimonials FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Gallery RLS
CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admin and tour manager can manage gallery" ON public.gallery FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'));

-- Information center RLS
CREATE POLICY "Anyone can view published info" ON public.information_center FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin and tour manager can manage info" ON public.information_center FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tour_manager'));

-- System logs RLS
CREATE POLICY "Only admin can view logs" ON public.system_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert logs" ON public.system_logs FOR INSERT WITH CHECK (true);

-- Settings RLS
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON public.settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Translations RLS
CREATE POLICY "Anyone can view translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Admin can manage translations" ON public.translations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Reviews RLS
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can submit reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage reviews" ON public.reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Saved packages RLS
CREATE POLICY "Users can manage own saved packages" ON public.saved_packages FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup trigger
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
  );
  -- Assign 'client' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_information_center_updated_at BEFORE UPDATE ON public.information_center FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('company_name', 'ESA Tours', 'Company name'),
  ('company_tagline', 'Discover Rwanda & Beyond', 'Company tagline'),
  ('contact_email', 'info@esatours.rw', 'Main contact email'),
  ('contact_phone', '+250 788 000 000', 'Main contact phone'),
  ('contact_address', 'Kigali, Rwanda', 'Company address'),
  ('facebook_url', '', 'Facebook page URL'),
  ('instagram_url', '', 'Instagram page URL'),
  ('twitter_url', '', 'Twitter/X page URL'),
  ('whatsapp_number', '', 'WhatsApp contact number'),
  ('booking_policy', 'All bookings require a 30% deposit.', 'Booking policy text'),
  ('currency', 'USD', 'Default currency');

-- Insert sample packages
INSERT INTO public.packages (title, description, location, duration, price, category, is_featured, images) VALUES
  ('Rwanda Gorilla Trekking Adventure', 'An unforgettable encounter with mountain gorillas in Volcanoes National Park. Experience the magic of being face-to-face with these magnificent creatures in their natural habitat.', 'Volcanoes National Park, Rwanda', '3 Days / 2 Nights', 1500.00, 'Wildlife', true, ARRAY['https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800']),
  ('Kigali City Discovery Tour', 'Explore the cleanest city in Africa. Visit the Genocide Memorial, Kimironko Market, artisan villages, and enjoy the vibrant food scene.', 'Kigali, Rwanda', '2 Days / 1 Night', 350.00, 'Cultural', true, ARRAY['https://images.unsplash.com/photo-1586041828039-b8d193d6d1fd?w=800']),
  ('Nyungwe Forest Canopy Walk', 'Trek through one of Africa''s oldest rainforests and walk above the forest on the famous canopy walkway with breathtaking views.', 'Nyungwe National Park, Rwanda', '2 Days / 1 Night', 600.00, 'Adventure', true, ARRAY['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800']),
  ('Lake Kivu Relaxation Retreat', 'Enjoy the serene beauty of Lake Kivu — one of Africa''s Great Lakes. Island hopping, kayaking, and lakeside dining in Gisenyi.', 'Lake Kivu, Rwanda', '3 Days / 2 Nights', 450.00, 'Beach & Lake', false, ARRAY['https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800']),
  ('East Africa Safari Grand Tour', 'A comprehensive East Africa safari covering Rwanda, Kenya, and Tanzania. Witness the Great Migration and explore multiple national parks.', 'Rwanda, Kenya, Tanzania', '10 Days / 9 Nights', 4500.00, 'Safari', true, ARRAY['https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=800']),
  ('Cultural Heritage Journey', 'Immerse yourself in Rwandan culture through traditional dance, craft-making, home visits, and local cuisine experiences.', 'Multiple Locations, Rwanda', '4 Days / 3 Nights', 520.00, 'Cultural', false, ARRAY['https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800']);

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, status, published_at, cover_image) VALUES
  ('Top 5 Reasons to Visit Rwanda in 2024', 'top-5-reasons-visit-rwanda-2024', 'Rwanda has transformed into one of Africa''s most popular destinations. Here''s why you should visit this year.', 'Rwanda, often called the Land of a Thousand Hills, has emerged as one of Africa''s most compelling destinations...', 'Travel Tips', 'published', now(), 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800'),
  ('Mountain Gorilla Trekking: Everything You Need to Know', 'gorilla-trekking-complete-guide', 'Planning a gorilla trekking experience? This comprehensive guide covers permits, preparation, and what to expect.', 'Mountain gorilla trekking in Rwanda is an experience unlike any other...', 'Adventure', 'published', now(), 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800'),
  ('Kigali: Africa''s Cleanest and Most Innovative City', 'kigali-africas-cleanest-city', 'Discover why Kigali is consistently ranked as one of Africa''s best cities for tourism and business.', 'Kigali stands as a testament to what African cities can achieve...', 'Destination', 'published', now(), 'https://images.unsplash.com/photo-1586041828039-b8d193d6d1fd?w=800');

-- Insert sample testimonials
INSERT INTO public.testimonials (client_name, content, rating, is_approved) VALUES
  ('Sarah Mitchell', 'ESA Tours made our gorilla trekking experience absolutely magical. The guides were knowledgeable, the itinerary was perfect, and every detail was handled professionally. Rwanda exceeded all our expectations!', 5, true),
  ('Jean-Pierre Dubois', 'Notre voyage au Rwanda organisé par ESA Tours était exceptionnel. Service impeccable et une expérience culturelle inoubliable. Je recommande vivement!', 5, true),
  ('David Okonkwo', 'From the airport pickup to the final day, everything was seamless. The gorilla permit was arranged effortlessly. ESA Tours is truly world-class!', 5, true),
  ('Emma Thompson', 'The canopy walk in Nyungwe Forest was breathtaking. ESA Tours organized every detail perfectly. A trip I will cherish forever.', 4, true);

-- Insert sample gallery
INSERT INTO public.gallery (title, media_url, media_type, category, is_featured) VALUES
  ('Mountain Gorillas', 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800', 'image', 'Wildlife', true),
  ('Kigali Skyline', 'https://images.unsplash.com/photo-1586041828039-b8d193d6d1fd?w=800', 'image', 'Cities', true),
  ('Nyungwe Forest', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800', 'image', 'Nature', true),
  ('Lake Kivu', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800', 'image', 'Lakes', true),
  ('Safari Experience', 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=800', 'image', 'Safari', true),
  ('Cultural Dance', 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800', 'image', 'Culture', true);

-- Insert sample information center
INSERT INTO public.information_center (title, content, category, is_published) VALUES
  ('Visa Requirements for Rwanda', 'Citizens of most African countries can enter Rwanda visa-free. Other nationalities can obtain a visa on arrival or apply online at visaonline.gov.rw. The e-visa costs USD 50 for a single entry.', 'visa', true),
  ('Travel Health Guidelines', 'Yellow fever vaccination is required if coming from endemic countries. Malaria prophylaxis is recommended. Rwanda is generally safe with excellent healthcare in Kigali.', 'guideline', true),
  ('Booking & Cancellation Policy', 'A 30% non-refundable deposit is required to confirm your booking. Full payment is due 30 days before departure. Cancellations made 14 days before departure receive a 50% refund.', 'policy', true),
  ('Frequently Asked Questions', 'Q: What is the best time to visit Rwanda? A: Rwanda can be visited year-round. The dry seasons (June-September and December-February) are ideal for gorilla trekking.', 'faq', true);
