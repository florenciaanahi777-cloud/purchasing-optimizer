-- ─── Seed: create your org and link your user ────────────────────────────────
-- Run these steps IN ORDER in the Supabase SQL editor.

-- STEP 1: Create your organization. Copy the returned id.
insert into organizations (name)
values ('My Hospital')
returning id;

-- STEP 2: Create a user in Supabase Auth.
-- Go to: Supabase dashboard → Authentication → Users → Add user
-- Set email + password. Copy the user's UUID.

-- STEP 3: Paste both IDs below and run.
 insert into users (id, organization_id, full_name)
 values (
  '9627a086-79ca-4a01-87c6-466175b56d81',
   'bb0901e0-c725-4e3e-807d-9d70ee8cf2c8',
   'FLO'
 );
