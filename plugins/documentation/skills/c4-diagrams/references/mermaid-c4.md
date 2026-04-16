# Mermaid C4 Templates
Uses `flowchart` (not `C4Context`) for universal rendering (GitHub, Obsidian, VS Code, Notion).

## Styling
Paste at the bottom of any diagram:

```text
classDef person fill:#08427b,stroke:#052e56,color:#fff
classDef container fill:#1168bd,stroke:#0b4884,color:#fff
classDef db fill:#1168bd,stroke:#0b4884,color:#fff
classDef external fill:#999,stroke:#666,color:#fff
classDef queue fill:#438dd5,stroke:#2a6496,color:#fff
```

Shapes: Person `(( ))`, Data store `[( )]`, Queue `[/ /]`, System boundary `subgraph` with dashed border.

## Level 1 -- System Context
```mermaid
flowchart TB
  Customer(("Customer<br/>[Person]<br/>Buys products"))
  subgraph Boundary [" "]
    System["<b>Storefront</b><br/>[Software System]<br/>Browse, buy, track orders"]
  end
  Stripe["Stripe<br/>[External]"]
  Email["Resend<br/>[External]"]
  Customer -->|"HTTPS"| System
  System -->|"Charges"| Stripe
  System -->|"Sends emails"| Email
  style Boundary stroke-dasharray: 5 5,fill:none
```

## Level 2 -- Container
```mermaid
flowchart TB
  Customer(("Customer"))
  subgraph Boundary ["Storefront"]
    Web["<b>Storefront Web</b><br/>[Astro on Workers]"]
    API["<b>Orders API</b><br/>[Hono on Workers]"]
    DB[("<b>Orders DB</b><br/>[Postgres / Neon]")]
    Queue[/"<b>order-events</b><br/>[CF Queue]"/]
  end
  Stripe["Stripe<br/>[External]"]
  Customer -->|"HTTPS"| Web
  Web -->|"POST /orders"| API
  API -->|"SQL"| DB
  API -->|"PaymentIntent"| Stripe
  Stripe -->|"Webhook"| API
  API -->|"publish"| Queue
  style Boundary stroke-dasharray: 5 5,fill:none
```

## Level 3 -- Component
```mermaid
flowchart TB
  Web["Storefront Web"]
  DB[("Orders DB")]
  Stripe["Stripe"]
  subgraph API ["Orders API [Hono on Workers]"]
    Router["<b>Router</b><br/>HTTP entry, auth, Zod"]
    OrderSvc["<b>OrderService</b><br/>State transitions, outbox"]
    PaySvc["<b>PaymentService</b><br/>Stripe PaymentIntents"]
    Repo["<b>OrderRepository</b><br/>Drizzle SQL"]
  end
  Web -->|"POST /orders"| Router
  Router --> OrderSvc
  OrderSvc --> PaySvc
  OrderSvc --> Repo
  PaySvc -->|"HTTPS"| Stripe
  Repo -->|"SQL"| DB
  style API stroke-dasharray: 5 5,fill:none
```

## Tips
- Labels: 3 lines max per node. Protocol on the arrow, not the node.
- Max ~15 elements per diagram. More = split or zoom out.
- Reorder nodes to reduce arrow crossings. Try `TB` (default) or `LR` for wide systems.
