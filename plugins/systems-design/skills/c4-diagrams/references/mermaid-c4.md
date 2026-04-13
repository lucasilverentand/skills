# Mermaid Templates for C4 Levels

Mermaid's C4 support (`C4Context`) is inconsistently rendered. These templates use `flowchart` instead, which renders everywhere (GitHub, Obsidian, Notion, VS Code preview, etc.) and stays readable.

## Styling conventions

Consistent colors/shapes across all three levels make it easy to jump between them:

- **Person** → stadium shape `(( ))` or rounded, outlined blue
- **System in focus (boundary)** → subgraph with a dashed border
- **Container** inside the boundary → rectangle, filled light blue
- **External system** → rectangle, filled grey
- **Data store** → cylinder `[( )]`
- **Queue / topic** → parallelogram `[/ /]` or a distinct color

Paste this classDef block at the bottom of any diagram to apply the styling:

```
classDef person fill:#08427b,stroke:#052e56,color:#fff
classDef container fill:#1168bd,stroke:#0b4884,color:#fff
classDef db fill:#1168bd,stroke:#0b4884,color:#fff
classDef external fill:#999,stroke:#666,color:#fff
classDef queue fill:#438dd5,stroke:#2a6496,color:#fff
```

---

## Level 1 — System Context

Shows the system as a black box, its users, and the external systems it talks to.

```mermaid
flowchart TB
  Customer(("Customer<br/>[Person]<br/>Buys products"))
  Admin(("Store admin<br/>[Person]<br/>Manages catalog and orders"))

  subgraph Boundary [" "]
    System["<b>Storefront</b><br/>[Software System]<br/>Lets customers browse, buy,<br/>and track orders"]
  end

  Stripe["Stripe<br/>[External System]<br/>Payment processing"]
  Email["Resend<br/>[External System]<br/>Transactional email"]
  Inventory["Warehouse IMS<br/>[External System]<br/>Stock and fulfillment"]

  Customer -->|"Browses, orders,<br/>tracks (HTTPS)"| System
  Admin -->|"Manages (HTTPS)"| System
  System -->|"Charges (HTTPS/JSON)"| Stripe
  System -->|"Sends order emails"| Email
  System -->|"Reserves stock,<br/>fetches status"| Inventory

  classDef person fill:#08427b,stroke:#052e56,color:#fff
  classDef system fill:#1168bd,stroke:#0b4884,color:#fff
  classDef external fill:#999,stroke:#666,color:#fff
  class Customer,Admin person
  class System system
  class Stripe,Email,Inventory external
  style Boundary stroke-dasharray: 5 5,fill:none
```

---

## Level 2 — Container

Shows the runnable pieces inside the system, their tech, and how they communicate.

```mermaid
flowchart TB
  Customer(("Customer<br/>[Person]"))

  subgraph Boundary ["Storefront"]
    Web["<b>Storefront Web</b><br/>[Astro on Workers]<br/>Marketing pages, product<br/>browsing, checkout UI"]
    API["<b>Orders API</b><br/>[Hono on Workers]<br/>Accepts orders,<br/>owns order state"]
    Worker["<b>Events Worker</b><br/>[Worker]<br/>Drains outbox,<br/>publishes to queue"]
    DB[("<b>Orders DB</b><br/>[Postgres / Neon]<br/>Orders, payments,<br/>outbox")]
    Queue[/"<b>order-events</b><br/>[CF Queue]"/]
  end

  Stripe["Stripe<br/>[External]"]
  Email["Resend<br/>[External]"]

  Customer -->|"HTTPS"| Web
  Web -->|"POST /orders<br/>(JSON)"| API
  API -->|"SQL"| DB
  Worker -->|"SELECT ... FOR UPDATE"| DB
  Worker -->|"publish"| Queue
  Queue -->|"consume"| Email
  API -->|"PaymentIntent<br/>(HTTPS)"| Stripe
  Stripe -->|"Webhook"| API

  classDef person fill:#08427b,stroke:#052e56,color:#fff
  classDef container fill:#1168bd,stroke:#0b4884,color:#fff
  classDef db fill:#1168bd,stroke:#0b4884,color:#fff
  classDef queue fill:#438dd5,stroke:#2a6496,color:#fff
  classDef external fill:#999,stroke:#666,color:#fff
  class Customer person
  class Web,API,Worker container
  class DB db
  class Queue queue
  class Stripe,Email external
  style Boundary stroke-dasharray: 5 5,fill:none
```

---

## Level 3 — Component

Shows modules inside one container. In this example, we zoom into the Orders API.

```mermaid
flowchart TB
  Web["Storefront Web<br/>[Container]"]
  DB[("Orders DB<br/>[Postgres]")]
  Stripe["Stripe<br/>[External]"]

  subgraph API ["Orders API [Hono on Workers]"]
    Router["<b>Router</b><br/>[Hono routes]<br/>HTTP entry, auth,<br/>validation (Zod)"]
    OrderSvc["<b>OrderService</b><br/>[Module]<br/>Order creation and state<br/>transitions; writes outbox"]
    PaySvc["<b>PaymentService</b><br/>[Module]<br/>Creates Stripe<br/>PaymentIntents"]
    WebhookHandler["<b>WebhookHandler</b><br/>[Module]<br/>Verifies Stripe signatures,<br/>updates order state"]
    Repo["<b>OrderRepository</b><br/>[Drizzle]<br/>SQL access layer"]
  end

  Web -->|"POST /orders"| Router
  Stripe -->|"Webhook"| Router
  Router --> OrderSvc
  Router --> WebhookHandler
  OrderSvc --> PaySvc
  OrderSvc --> Repo
  WebhookHandler --> Repo
  PaySvc -->|"HTTPS"| Stripe
  Repo -->|"SQL"| DB

  classDef container fill:#1168bd,stroke:#0b4884,color:#fff
  classDef external fill:#999,stroke:#666,color:#fff
  classDef db fill:#1168bd,stroke:#0b4884,color:#fff
  class Web container
  class Stripe external
  class DB db
  style API stroke-dasharray: 5 5,fill:none
```

---

## Tips

- **Keep labels short inside nodes.** Use `<br/>` for newlines; three lines max per node is comfortable.
- **Put protocol on the arrow**, not the node. `-->|"HTTPS/JSON"|` is clearer than sticking it in the box.
- **Reorder to reduce crossings.** `flowchart TB` (top-to-bottom) usually works; try `LR` for wide systems.
- **A legend is redundant but helpful.** After the diagram, list each element with its responsibility for copy-paste into tickets.
