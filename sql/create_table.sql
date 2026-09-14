-- this table stored every otp that I generated
-- i went with one table for everything instead of splitting it up
-- it keeps things simpler while i am still learning how this all works

create table otps (
  id uuid primary key default gen_random_uuid(),
  -- a unique id for every row, supabase makes this for us automatically

  email text not null,
  -- the email address this otp belongs to

  code varchar(6) not null,
  -- storing the code as text and not a number
  -- this matters because a number would drop the leading zero
  -- example: 042613 would turn into 42613 if this was an integer

  created_at timestamptz not null default now(),
  -- the exact time this otp was first made
  -- i used timestamptz instead of timestamp so timezones do not cause bugs

  expires_at timestamptz not null,
  -- the time this otp stops working
  -- this gets set when the otp is created, and updated again on resend

  resend_count integer not null default 0,
  -- keeps track of how many times this exact otp has been resent

  used boolean not null default false
  -- flips to true the moment someone verifies successfully with this code
  -- this stops the same code being used twice
);

-- almost every query in this project looks up rows by email
-- so an index here makes those lookups much faster
create index idx_otps_email on otps (email);
