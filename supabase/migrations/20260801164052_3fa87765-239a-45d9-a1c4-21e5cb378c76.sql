CREATE TABLE public.stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  osm_id bigint UNIQUE,
  name text NOT NULL,
  provider text,
  provider_logo text,
  address text NOT NULL,
  district text,
  city text,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  connectors text[] NOT NULL DEFAULT '{}'::text[],
  charging_type text,
  max_power_kw numeric,
  operating_hours text,
  contact_phone text,
  brands text[] NOT NULL DEFAULT '{}'::text[],
  pricing text,
  photos text[] NOT NULL DEFAULT '{}'::text[],
  website text,
  availability text,
  rating numeric,
  review_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stations TO anon;
GRANT SELECT ON public.stations TO authenticated;
GRANT ALL ON public.stations TO service_role;

ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published stations are viewable by everyone"
ON public.stations FOR SELECT
USING (is_published = true);

CREATE TRIGGER stations_set_updated_at
BEFORE UPDATE ON public.stations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX stations_district_idx ON public.stations (district);
CREATE INDEX stations_provider_idx ON public.stations (provider);

DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);