# Example: gRPC API (Orders)
Use gRPC for internal service-to-service with strong typing and streaming. Not for browsers (can't speak it natively, painful to debug with curl).

```proto
syntax = "proto3";
package orders.v1;

// Internal RPC surface. Called from other backend services.
// Not exposed to browsers -- they talk to the REST gateway.
service OrdersService {
  // Idempotency via "idempotency-key" metadata header.
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  // Returns NOT_FOUND if doesn't exist or caller can't see it.
  rpc GetOrder(GetOrderRequest) returns (Order);
  // Stream state changes in real time (admin live-view).
  rpc WatchOrder(GetOrderRequest) returns (stream OrderEvent);
}

message Order {
  string id = 1;
  OrderStatus status = 2;
  string customer_id = 3;
  int64 total_cents = 4;
  string currency = 5;  // ISO 4217
  google.protobuf.Timestamp created_at = 6;
  google.protobuf.Timestamp updated_at = 7;
}

// Proto3 requires a zero value meaning "not set".
enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_PAID = 2;
  ORDER_STATUS_FULFILLED = 3;
  ORDER_STATUS_REFUNDED = 4;
  ORDER_STATUS_CLOSED = 5;
}
```

The `.proto` file is the source of truth -- code is generated from it.
