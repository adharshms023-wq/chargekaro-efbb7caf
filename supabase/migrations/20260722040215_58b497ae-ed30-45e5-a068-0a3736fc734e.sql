
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  is_host BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Chargers
CREATE TYPE public.charger_source AS ENUM ('public', 'community', 'place');
CREATE TYPE public.charging_speed AS ENUM ('fast', 'slow');
CREATE TYPE public.payhip_mode AS ENUM ('fixed', 'pwyw');

CREATE TABLE public.chargers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  source public.charger_source NOT NULL DEFAULT 'community',
  power_kw NUMERIC NOT NULL,
  speed public.charging_speed NOT NULL DEFAULT 'fast',
  connectors TEXT[] NOT NULL DEFAULT '{}',
  price_per_kwh NUMERIC NOT NULL DEFAULT 0,
  hours TEXT NOT NULL DEFAULT '24/7',
  description TEXT,
  image TEXT,
  phone TEXT,
  owner_name TEXT,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  rules TEXT,
  payhip_product_url TEXT,
  payhip_mode public.payhip_mode DEFAULT 'pwyw',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chargers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chargers TO authenticated;
GRANT ALL ON public.chargers TO service_role;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published chargers viewable" ON public.chargers FOR SELECT USING (is_published = true OR auth.uid() = owner_id);
CREATE POLICY "Owners insert own chargers" ON public.chargers FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own chargers" ON public.chargers FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete own chargers" ON public.chargers FOR DELETE USING (auth.uid() = owner_id);

-- Sessions (payments)
CREATE TYPE public.session_mode AS ENUM ('upfront', 'metered');
CREATE TYPE public.session_status AS ENUM ('pending', 'paid', 'cancelled');

CREATE TABLE public.charging_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_id UUID NOT NULL REFERENCES public.chargers ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  mode public.session_mode NOT NULL,
  kwh NUMERIC,
  amount NUMERIC NOT NULL,
  status public.session_status NOT NULL DEFAULT 'pending',
  payhip_reference TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE ON public.charging_sessions TO authenticated;
GRANT ALL ON public.charging_sessions TO service_role;
ALTER TABLE public.charging_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sessions" ON public.charging_sessions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.chargers WHERE id = charger_id));
CREATE POLICY "Users create sessions" ON public.charging_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner updates session" ON public.charging_sessions FOR UPDATE
  USING (auth.uid() IN (SELECT owner_id FROM public.chargers WHERE id = charger_id));

-- Favorites
CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  charger_id UUID NOT NULL REFERENCES public.chargers ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, charger_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Live updates
CREATE TABLE public.live_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_id UUID NOT NULL REFERENCES public.chargers ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users ON DELETE SET NULL,
  author_name TEXT,
  kind TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '3 hours')
);
GRANT SELECT ON public.live_updates TO anon;
GRANT SELECT, INSERT, DELETE ON public.live_updates TO authenticated;
GRANT ALL ON public.live_updates TO service_role;
ALTER TABLE public.live_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Live updates viewable" ON public.live_updates FOR SELECT USING (expires_at > now());
CREATE POLICY "Authenticated insert updates" ON public.live_updates FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author deletes own updates" ON public.live_updates FOR DELETE USING (auth.uid() = author_id);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_id UUID NOT NULL REFERENCES public.chargers ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users ON DELETE SET NULL,
  author_name TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author deletes own reviews" ON public.reviews FOR DELETE USING (auth.uid() = author_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_chargers_updated BEFORE UPDATE ON public.chargers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
