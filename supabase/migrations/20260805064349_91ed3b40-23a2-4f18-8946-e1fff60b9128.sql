DROP VIEW IF EXISTS public.chargers_public;
DROP VIEW IF EXISTS public.reviews_public;

-- ---------- chargers ----------
DROP POLICY IF EXISTS "Owners view own chargers" ON public.chargers;
CREATE POLICY "Published chargers viewable"
  ON public.chargers FOR SELECT
  USING (is_published = true OR auth.uid() = owner_id);

REVOKE SELECT ON public.chargers FROM anon, authenticated;
GRANT SELECT (id, owner_id, name, address, city, lat, lng, source, power_kw, speed,
              connectors, price_per_kwh, hours, description, image, owner_name,
              facilities, rules, payhip_product_url, payhip_mode, is_published,
              created_at, updated_at)
  ON public.chargers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chargers TO authenticated;
GRANT ALL ON public.chargers TO service_role;

-- ---------- reviews ----------
CREATE POLICY "Reviews viewable"
  ON public.reviews FOR SELECT
  USING (true);

REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, charger_id, author_name, rating, comment, created_at)
  ON public.reviews TO anon, authenticated;
GRANT INSERT, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;