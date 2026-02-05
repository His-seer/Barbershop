-- Create a table for public profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- This triggers a function every time a user is created
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for Staff (handling custom PIN auth)
create table staff (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text unique not null,
  pin_hash text not null, -- Stores the hashed PIN
  role text check (role in ('owner', 'senior', 'junior')) default 'junior',
  is_active boolean default true,
  avatar_url text
);

-- RLS for Staff
alter table staff enable row level security;

-- Public can view active staff (for booking)
create policy "Public can view active staff" on staff
  for select using (is_active = true);

-- Only admins/owners can update staff (Implementation depends on auth context, keeping it open for now or restricted to service_role)
-- For now, we'll allow read-only for public, and rely on server-side actions (service role) for management.

-- SEED DATA (Mock Staff)
-- PIN: 1234 (Hash this in real implementation, using plain text for this mock/example only, OR ideally pre-hash it)
-- Note: In production, NEVER store plain text pins. We will assume the application handles hashing before comparison or uses a secure verification method.
-- For this initial setup, we will perform the hashing in the application logic (Server Action) and store the hash here. 
-- Since we can't easily generate bcrypt hashes in SQL without extensions, we will insert a placeholder and update it via the app, 
-- or use a known hash if available. 
-- Let's insert them with a placeholder 'REPLACE_ME' and we can build a seed script or tool to update them.

insert into staff (name, phone, pin_hash, role, is_active)
values 
  ('Emmanuel Darko', '0201234567', '$2b$10$XXXXXXXXXXXXXXXXXXXXXX', 'senior', true),
  ('Samuel Osei', '0249876543', '$2b$10$XXXXXXXXXXXXXXXXXXXXXX', 'junior', true),
  ('Kwabena Agyei', '0551122334', '$2b$10$XXXXXXXXXXXXXXXXXXXXXX', 'senior', true)
on conflict (phone) do nothing;
