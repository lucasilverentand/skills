# Schema Examples
Example schemas showing data conventions applied. Copy the patterns, adapt to your domain.

## Orders domain
```sql
orders (
  id          text primary key,          -- ord_01HF2M3N...
  tenant_id   text not null,
  customer_id text not null references customers(id),
  status      text not null default 'pending'
              check (status in ('pending','paid','fulfilled','refunded','closed')),
  total_cents integer not null,
  currency    text not null default 'USD',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index idx_orders_tenant_id on orders(tenant_id);
create index idx_orders_customer_id on orders(customer_id);
create index idx_orders_status on orders(tenant_id, status) where deleted_at is null;

line_items (
  id              text primary key,      -- li_01HF...
  tenant_id       text not null,
  order_id        text not null references orders(id),
  sku             text not null,
  qty             integer not null check (qty > 0),
  unit_price_cents integer not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- Outbox: append-only, no updated_at/deleted_at
order_events (
  id          text primary key,          -- evt_01HF...
  tenant_id   text not null,
  order_id    text not null references orders(id),
  type        text not null,             -- 'order.created', 'order.paid'
  payload     jsonb not null,
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_order_events_unpublished
  on order_events(created_at) where published = false;

-- RLS backstop
alter table orders enable row level security;
create policy tenant_isolation on orders
  using (tenant_id = current_setting('app.tenant_id'));
```

**Patterns shown:** prefixed ULIDs, tenant_id + RLS, soft delete, status as CHECK enum, money as cents, outbox table (append-only), partial index.

## Users domain
```sql
users (
  id          text primary key,          -- usr_01HF...
  tenant_id   text not null,
  email       text not null,             -- PII: encrypted at rest
  name        text,                      -- PII: encrypted at rest
  role        text not null default 'member',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz                -- GDPR: soft delete, then scrub PII after 30 days
);

-- Audit log: append-only, never updated or deleted
audit_log (
  id          text primary key,          -- aud_01HF...
  tenant_id   text not null,
  actor_id    text not null,
  action      text not null,             -- 'user.created', 'order.refunded'
  entity_type text not null,
  entity_id   text not null,
  occurred_at timestamptz not null default now(),
  context     jsonb                      -- request metadata (JSONB OK: varies per action)
);

create index idx_audit_log_entity on audit_log(entity_type, entity_id);
create index idx_audit_log_actor on audit_log(tenant_id, actor_id, occurred_at);
```

**Patterns shown:** PII columns marked, audit log (append-only, no soft delete), JSONB for variable context.
