-- Wishes table for Digital Wish Book feature
CREATE TABLE public.wishes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  guest_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Event owners can view and manage all wishes for their events
CREATE POLICY "Event owners can manage wishes"
  ON public.wishes
  FOR ALL
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE user_id = auth.uid()
    )
  );

-- Anyone can view wishes on published events
CREATE POLICY "Anyone can view wishes on published events"
  ON public.wishes
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE is_published = true
    )
  );

-- Anyone can insert wishes on published events with wishes enabled
CREATE POLICY "Anyone can insert wishes on published events"
  ON public.wishes
  FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events
      WHERE is_published = true
        AND (settings->>'show_wishes')::boolean = true
    )
  );

-- Index for performance
CREATE INDEX idx_wishes_event_id ON public.wishes(event_id);
