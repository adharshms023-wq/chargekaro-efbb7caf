-- ============ CHARGERS: hide host phone from public reads ============
DROP POLICY IF EXISTS "Published chargers viewable" ON public.chargers;
CREATE POLICY "Owners view own chargers"
  ON public.chargers FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE OR REPLACE VIEW public.chargers_public
WITH (security_barrier) AS
  SELECT id, owner_id, name, address, city, lat, lng, source, power_kw, speed,
         connectors, price_per_kwh, hours, description, image, owner_name,
         facilities, rules, payhip_product_url, payhip_mode, created_at
  FROM public.chargers
  WHERE is_published = true;

GRANT SELECT ON public.chargers_public TO anon, authenticated;

-- Signed-in users can retrieve a host's contact number for a published charger.
CREATE OR REPLACE FUNCTION public.get_charger_phone(_charger_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.phone
  FROM public.chargers c
  WHERE c.id = _charger_id
    AND c.is_published = true
    AND auth.uid() IS NOT NULL
$$;

REVOKE ALL ON FUNCTION public.get_charger_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_charger_phone(uuid) TO authenticated;

-- ============ REVIEWS: hide author_id, block spoofed inserts ============
DROP POLICY IF EXISTS "Reviews viewable" ON public.reviews;
CREATE POLICY "Authors view own reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authenticated insert reviews" ON public.reviews;
CREATE POLICY "Authenticated insert reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND author_id IS NOT NULL);

DROP POLICY IF EXISTS "Author deletes own reviews" ON public.reviews;
CREATE POLICY "Author deletes own reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

CREATE OR REPLACE VIEW public.reviews_public
WITH (security_barrier) AS
  SELECT id, charger_id, author_name, rating, comment, created_at
  FROM public.reviews;

GRANT SELECT ON public.reviews_public TO anon, authenticated;