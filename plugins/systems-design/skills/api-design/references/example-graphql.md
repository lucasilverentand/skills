# Example: GraphQL API (Orders)

Use GraphQL when clients need flexible field selection across diverse query shapes (admin dashboards + mobile). For a single client type, REST is simpler.

```graphql
"""Orders API. Auth: Bearer JWT in Authorization header."""
schema { query: Query, mutation: Mutation }

type Order {
  id: ID!
  status: OrderStatus!
  customer: Customer!
  lineItems: [LineItem!]!
  "Total in smallest currency unit (cents for USD)."
  totalCents: Int!
  currency: Currency!
  createdAt: DateTime!
}

enum OrderStatus { PENDING, PAID, FULFILLED, REFUNDED, CLOSED }

type Query {
  "Returns null if not found or caller can't see it."
  order(id: ID!): Order
  "Cursor pagination. Pass after: null for first page."
  customerOrders(customerId: ID!, first: Int = 20, after: String, status: OrderStatus): OrderConnection!
}

type Mutation {
  "Creates order in PENDING state. Returns Stripe client_secret."
  createOrder(input: CreateOrderInput!): CreateOrderResult!
  "Refund a paid order. Amount in order's currency."
  refundOrder(orderId: ID!, amountCents: Int!, reason: RefundReason!): Refund!
}

input CreateOrderInput {
  customerId: ID!
  items: [OrderItemInput!]!
  currency: Currency!
  "Optional. Reusing a key returns the cached result."
  idempotencyKey: String
}
```

Every type and field has a description -- the schema IS the documentation.
