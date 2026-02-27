-- ─── Purchasing Decision Optimizer — Database Schema ────────────────────────
-- Run this in your Supabase SQL editor to set up the full schema.

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Organizations ──────────────────────────────────────────────────────────
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ─── Users (extends Supabase auth.users) ────────────────────────────────────
create table users (
  id               uuid primary key references auth.users(id) on delete cascade,
  organization_id  uuid not null references organizations(id) on delete cascade,
  full_name        text,
  created_at       timestamptz not null default now()
);

-- ─── Suppliers (persistent directory) ───────────────────────────────────────
create table suppliers (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,
  email            text not null,
  contact_name     text,
  notes            text,
  created_at       timestamptz not null default now()
);

-- ─── RFQs ───────────────────────────────────────────────────────────────────
create type rfq_status as enum ('draft', 'open', 'comparing', 'decided');

create table rfqs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  created_by       uuid not null references users(id),
  title            text not null,
  description      text,
  deadline         date not null,
  status           rfq_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── RFQ Items ───────────────────────────────────────────────────────────────
create table rfq_items (
  id          uuid primary key default gen_random_uuid(),
  rfq_id      uuid not null references rfqs(id) on delete cascade,
  sku         text,
  description text not null,
  unit        text not null,
  quantity    numeric not null,
  sort_order  integer not null default 0
);

-- ─── RFQ Suppliers (join: which suppliers are on this RFQ) ──────────────────
create type rfq_supplier_status as enum ('invited', 'submitted');

create table rfq_suppliers (
  id           uuid primary key default gen_random_uuid(),
  rfq_id       uuid not null references rfqs(id) on delete cascade,
  supplier_id  uuid not null references suppliers(id) on delete cascade,
  public_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status       rfq_supplier_status not null default 'invited',
  invited_at   timestamptz not null default now(),
  unique (rfq_id, supplier_id)
);

-- ─── Quotes ─────────────────────────────────────────────────────────────────
create table quotes (
  id               uuid primary key default gen_random_uuid(),
  rfq_id           uuid not null references rfqs(id) on delete cascade,
  supplier_id      uuid not null references suppliers(id),
  rfq_supplier_id  uuid not null references rfq_suppliers(id),
  notes            text,
  submitted_at     timestamptz not null default now(),
  unique (rfq_id, supplier_id)
);

-- ─── Quote Items ─────────────────────────────────────────────────────────────
create table quote_items (
  id            uuid primary key default gen_random_uuid(),
  quote_id      uuid not null references quotes(id) on delete cascade,
  rfq_item_id   uuid not null references rfq_items(id),
  unit_price    numeric(12, 4) not null,
  total_price   numeric(12, 4) not null,
  delivery_days integer,
  notes         text
);

-- ─── Decisions ───────────────────────────────────────────────────────────────
create table decisions (
  id                   uuid primary key default gen_random_uuid(),
  rfq_id               uuid not null unique references rfqs(id),
  winning_supplier_id  uuid not null references suppliers(id),
  winning_quote_id     uuid not null references quotes(id),
  reason               text not null,
  ai_recommendation    text,
  decided_by           uuid not null references users(id),
  decided_at           timestamptz not null default now()
);

-- ─── Auto-update updated_at on rfqs ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger rfqs_updated_at
  before update on rfqs
  for each row execute function update_updated_at();

-- ─── Row-Level Security ──────────────────────────────────────────────────────
alter table organizations  enable row level security;
alter table users          enable row level security;
alter table suppliers      enable row level security;
alter table rfqs           enable row level security;
alter table rfq_items      enable row level security;
alter table rfq_suppliers  enable row level security;
alter table quotes         enable row level security;
alter table quote_items    enable row level security;
alter table decisions      enable row level security;

-- Helper: get the current user's organization_id
create or replace function auth_org_id()
returns uuid as $$
  select organization_id from users where id = auth.uid()
$$ language sql security definer stable;

-- Buyers: full access to their own organization's data
create policy "org members can read own org"        on organizations  for select using (id = auth_org_id());
create policy "org members can read own users"      on users          for select using (organization_id = auth_org_id());
create policy "org members manage suppliers"        on suppliers      for all    using (organization_id = auth_org_id());
create policy "org members manage rfqs"             on rfqs           for all    using (organization_id = auth_org_id());
create policy "org members manage rfq_items"        on rfq_items      for all    using (rfq_id in (select id from rfqs where organization_id = auth_org_id()));
create policy "org members manage rfq_suppliers"    on rfq_suppliers  for all    using (rfq_id in (select id from rfqs where organization_id = auth_org_id()));
create policy "org members manage quotes"           on quotes         for all    using (rfq_id in (select id from rfqs where organization_id = auth_org_id()));
create policy "org members manage quote_items"      on quote_items    for all    using (quote_id in (select id from quotes where rfq_id in (select id from rfqs where organization_id = auth_org_id())));
create policy "org members manage decisions"        on decisions      for all    using (rfq_id in (select id from rfqs where organization_id = auth_org_id()));

-- Suppliers: public read/write via token (enforced in API route, not RLS)
-- Quote submission is handled server-side using the service role key,
-- so no RLS policy needed for anonymous supplier access.
