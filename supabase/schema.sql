-- YIDO Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz default now() not null
);

-- Events table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  slug text unique not null,
  title text not null,
  type text not null check (type in ('wedding', 'baptism', 'party', 'corporate', 'other')),
  date date not null,
  time time,
  description text,
  couple_name_1 text,
  couple_name_2 text,
  template text default 'classic' not null,
  package_tier text default 'basic' not null check (package_tier in ('basic', 'premium', 'gold')),
  cover_image_url text,
  is_published boolean default false not null,
  settings jsonb default '{"show_rsvp": true, "show_map": true, "show_timeline": false, "show_gallery": false, "allow_plus_ones": true, "max_plus_ones": 2, "primary_color": "#8B5CF6", "secondary_color": "#EC4899", "custom_message": null}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Guests table
create table public.guests (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  rsvp_status text default 'pending' not null check (rsvp_status in ('pending', 'confirmed', 'declined', 'maybe')),
  plus_ones integer default 0 not null,
  dietary_notes text,
  table_number integer,
  group_name text,
  invited_at timestamptz default now() not null,
  responded_at timestamptz
);

-- Event locations table
create table public.event_locations (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  type text default 'reception' not null check (type in ('ceremony', 'reception', 'party', 'other')),
  name text not null,
  address text not null,
  lat double precision,
  lng double precision,
  time time,
  notes text
);

-- Timeline items table
create table public.timeline_items (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  time time not null,
  title text not null,
  description text,
  icon text,
  sort_order integer default 0 not null
);

-- Gallery photos table (Premium+)
create table public.gallery_photos (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  uploaded_by text, -- guest name or 'host'
  url text not null,
  caption text,
  is_featured boolean default false,
  created_at timestamptz default now() not null
);

-- Payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  amount integer not null, -- in cents
  currency text default 'eur' not null,
  status text default 'pending' not null check (status in ('pending', 'completed', 'failed', 'refunded')),
  package_tier text not null,
  created_at timestamptz default now() not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.event_locations enable row level security;
alter table public.timeline_items enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.payments enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Events policies
create policy "Users can view own events" on public.events
  for select using (auth.uid() = user_id);
create policy "Anyone can view published events" on public.events
  for select using (is_published = true);
create policy "Users can create events" on public.events
  for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on public.events
  for update using (auth.uid() = user_id);
create policy "Users can delete own events" on public.events
  for delete using (auth.uid() = user_id);

-- Guests policies
create policy "Event owners can manage guests" on public.guests
  for all using (
    event_id in (select id from public.events where user_id = auth.uid())
  );
create policy "Public RSVP for published events" on public.guests
  for insert with check (
    event_id in (select id from public.events where is_published = true)
  );
create policy "Guests can update own RSVP" on public.guests
  for update using (
    event_id in (select id from public.events where is_published = true)
  );

-- Locations policies
create policy "Event owners can manage locations" on public.event_locations
  for all using (
    event_id in (select id from public.events where user_id = auth.uid())
  );
create policy "Public can view locations of published events" on public.event_locations
  for select using (
    event_id in (select id from public.events where is_published = true)
  );

-- Timeline policies
create policy "Event owners can manage timeline" on public.timeline_items
  for all using (
    event_id in (select id from public.events where user_id = auth.uid())
  );
create policy "Public can view timeline of published events" on public.timeline_items
  for select using (
    event_id in (select id from public.events where is_published = true)
  );

-- Gallery policies
create policy "Event owners can manage gallery" on public.gallery_photos
  for all using (
    event_id in (select id from public.events where user_id = auth.uid())
  );
create policy "Public can view and upload to published event galleries" on public.gallery_photos
  for select using (
    event_id in (select id from public.events where is_published = true)
  );
create policy "Public can upload to published event galleries" on public.gallery_photos
  for insert with check (
    event_id in (select id from public.events where is_published = true)
  );

-- Payments policies
create policy "Users can view own payments" on public.payments
  for select using (auth.uid() = user_id);
create policy "System can insert payments" on public.payments
  for insert with check (true);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on public.events
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Index for fast slug lookups
create index idx_events_slug on public.events(slug);
create index idx_events_user_id on public.events(user_id);
create index idx_guests_event_id on public.guests(event_id);
create index idx_event_locations_event_id on public.event_locations(event_id);
create index idx_timeline_items_event_id on public.timeline_items(event_id);
create index idx_gallery_photos_event_id on public.gallery_photos(event_id);
create index idx_payments_event_id on public.payments(event_id);

-- Storage buckets (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('event-covers', 'event-covers', true);
-- insert into storage.buckets (id, name, public) values ('event-gallery', 'event-gallery', true);

-- Storage policies for event-covers
-- create policy "Authenticated users can upload covers" on storage.objects
--   for insert with check (bucket_id = 'event-covers' and auth.role() = 'authenticated');
-- create policy "Authenticated users can update covers" on storage.objects
--   for update using (bucket_id = 'event-covers' and auth.role() = 'authenticated');
-- create policy "Public can view covers" on storage.objects
--   for select using (bucket_id = 'event-covers');

-- Storage policies for event-gallery
-- create policy "Authenticated users can upload to gallery" on storage.objects
--   for insert with check (bucket_id = 'event-gallery');
-- create policy "Authenticated users can delete from gallery" on storage.objects
--   for delete using (bucket_id = 'event-gallery' and auth.role() = 'authenticated');
-- create policy "Public can view gallery" on storage.objects
--   for select using (bucket_id = 'event-gallery');
