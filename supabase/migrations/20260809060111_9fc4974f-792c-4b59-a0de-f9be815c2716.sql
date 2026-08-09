-- 1. Charger phone helper: drop elevated privileges, block anonymous callers
CREATE OR REPLACE FUNCTION public.get_charger_phone(_charger_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT c.phone
  FROM public.chargers c
  WHERE c.id = _charger_id
    AND c.is_published = true
    AND auth.uid() IS NOT NULL
$function$;

REVOKE ALL ON FUNCTION public.get_charger_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_charger_phone(uuid) TO authenticated;

-- 2. charging_sessions: allow deletion by the session creator or charger owner
CREATE POLICY "Users or hosts delete sessions"
ON public.charging_sessions
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR auth.uid() IN (SELECT c.owner_id FROM public.chargers c WHERE c.id = charging_sessions.charger_id)
);

-- 3. live_updates: authors can edit their own updates
CREATE POLICY "Author updates own updates"
ON public.live_updates
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 4. reviews: remove redundant policy and hide author_id from public reads
DROP POLICY IF EXISTS "Authors view own reviews" ON public.reviews;

REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, charger_id, author_name, rating, comment, created_at) ON public.reviews TO anon, authenticated;
GRANT SELECT (author_id) ON public.reviews TO authenticated;
GRANT INSERT, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;