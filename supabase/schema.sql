-- ============================================================
-- Grand MF Arena — Sales & Inventory Management System
-- Supabase schema
-- Run this whole file once in Supabase SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

create table if not exists public.stores (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  units_sold integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references public.stores(id) on delete cascade,
  grand_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_items (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_store on public.transactions(store_id);
create index if not exists idx_transactions_created on public.transactions(created_at);
create index if not exists idx_items_transaction on public.transaction_items(transaction_id);
create index if not exists idx_items_product on public.transaction_items(product_id);

-- ------------------------------------------------------------
-- Function + trigger: keep products.updated_at fresh
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- Simple policy: any authenticated user (your staff) has full access.
-- Adjust if you need per-role restrictions later.
-- ------------------------------------------------------------
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;

drop policy if exists "authenticated full access" on public.stores;
create policy "authenticated full access" on public.stores
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on public.products;
create policy "authenticated full access" on public.products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on public.transactions;
create policy "authenticated full access" on public.transactions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on public.transaction_items;
create policy "authenticated full access" on public.transaction_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- Sample data
-- ------------------------------------------------------------

insert into public.stores (name) values
  ('Sugbabs'),
  ('Vins'),
  ('Egoy'),
  ('Rouxsther'),
  ('GMD')
on conflict (name) do nothing;

insert into public.products (name, price, stock, units_sold) values
  ('Red Horse', 65.00, 200, 0),
  ('Grande', 75.00, 150, 0),
  ('San Mig Light', 60.00, 200, 0),
  ('Pale Pilsen', 55.00, 200, 0),
  ('Coke Mismo', 25.00, 300, 0),
  ('Sprite Mismo', 25.00, 300, 0),
  ('Royal Mismo', 25.00, 300, 0)
on conflict (name) do nothing;

-- ------------------------------------------------------------
-- RPC: record a sale (transaction + items) and decrement stock
-- atomically. Call this from the app instead of writing to
-- transactions/transaction_items/products directly.
-- ------------------------------------------------------------
create or replace function public.record_sale(
  p_store_id uuid,
  p_items jsonb -- array of {product_id, quantity, unit_price}
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_transaction_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(10,2);
  v_subtotal numeric(12,2);
  v_grand_total numeric(12,2) := 0;
  v_current_stock integer;
  v_product_name text;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'At least one product item is required';
  end if;

  insert into public.transactions (store_id, grand_total)
  values (p_store_id, 0)
  returning id into v_transaction_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := (v_item->>'unit_price')::numeric(10,2);

    select stock, name into v_current_stock, v_product_name
    from public.products where id = v_product_id
    for update;

    if v_current_stock is null then
      raise exception 'Product not found: %', v_product_id;
    end if;

    if v_current_stock < v_quantity then
      raise exception 'Not enough stock for %: have %, need %', v_product_name, v_current_stock, v_quantity;
    end if;

    v_subtotal := v_quantity * v_unit_price;
    v_grand_total := v_grand_total + v_subtotal;

    insert into public.transaction_items
      (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
    values
      (v_transaction_id, v_product_id, v_product_name, v_quantity, v_unit_price, v_subtotal);

    update public.products
    set stock = stock - v_quantity,
        units_sold = units_sold + v_quantity
    where id = v_product_id;
  end loop;

  update public.transactions
  set grand_total = v_grand_total
  where id = v_transaction_id;

  return v_transaction_id;
end;
$$;

grant execute on function public.record_sale(uuid, jsonb) to authenticated;
