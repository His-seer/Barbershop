-- Create Appointments Table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reference text unique not null,
  client_name text not null,
  client_phone text not null,
  client_email text,
  barber_id text not null,
  service_name text not null,
  service_price numeric default 0,
  addons text[],
  total_amount numeric not null,
  appointment_date date not null,
  appointment_time text not null,
  status text default 'confirmed', -- confirmed, completed, cancelled, no_show
  client_notes text
);

-- Enable RLS
alter table public.appointments enable row level security;

-- Policies (Adjust based on your security needs)
-- Staff can read their own appointments
create policy "Staff can view assigned appointments"
  on public.appointments for select
  using (true); -- For MVP, allowing read-all but ideally check barber_id matches auth.uid() or similar logic if staff are users

-- Public/Server can insert (for booking flow)
create policy "Enable insert for authenticated users and server"
  on public.appointments for insert
  with check (true);

-- Staff can update status/notes
create policy "Enable update for staff"
  on public.appointments for update
  using (true);
