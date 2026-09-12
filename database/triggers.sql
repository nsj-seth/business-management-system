-- Automatically creates a matching profiles row whenever a new
-- user is created in Supabase's auth.users table, regardless of
-- how that user was created (dashboard, signup form, admin API).

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'staff');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();