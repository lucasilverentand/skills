---
name: hono-websockets
description: WebSocket implementation with Hono. Use when building real-time features or WebSocket endpoints with Hono.
---

# Hono WebSockets

Guide to implementing WebSocket functionality in Hono applications.

## Runtime Support

WebSocket support varies by runtime:

- **Cloudflare Workers/Pages** - Native support
- **Bun** - Native support
- **Deno** - Native support
- **Node.js** - Requires `@hono/node-ws` package

## Cloudflare Workers

### Basic Setup

```typescript
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";

const app = new Hono();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log("Received:", event.data);
        ws.send(`Echo: ${event.data}`);
      },
      onClose() {
        console.log("Connection closed");
      },
      onError(event) {
        console.error("WebSocket error:", event);
      },
    };
  }),
);

export default app;
```

### Lifecycle Events

```typescript
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      // Note: onOpen is not supported on Cloudflare Workers
      onOpen(event, ws) {
        console.log("Connection opened");
        ws.send(JSON.stringify({ type: "connected" }));
      },

      onMessage(event, ws) {
        const data = JSON.parse(event.data as string);
        console.log("Message received:", data);

        // Echo back
        ws.send(
          JSON.stringify({
            type: "echo",
            data: data,
            timestamp: Date.now(),
          }),
        );
      },

      onClose(event, ws) {
        console.log("Connection closed:", event.code, event.reason);
      },

      onError(event, ws) {
        console.error("WebSocket error:", event);
      },
    };
  }),
);
```

## Bun

### Bun Setup

```typescript
import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";

const app = new Hono();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        console.log("New connection");
      },
      onMessage(event, ws) {
        ws.send(`Received: ${event.data}`);
      },
      onClose() {
        console.log("Connection closed");
      },
    };
  }),
);

// Export with websocket handler
export default {
  fetch: app.fetch,
  websocket, // Required for Bun WebSocket support
};
```

### Bun with JSX

```typescript
import { Hono } from 'hono'
import { upgradeWebSocket, websocket } from 'hono/bun'
import { html } from 'hono/html'

const app = new Hono()

// Serve WebSocket client page
app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <title>WebSocket Demo</title>
      </head>
      <body>
        <h1>WebSocket Demo</h1>
        <div id="messages"></div>
        <input type="text" id="input" placeholder="Type a message..." />
        <button id="send">Send</button>

        {html`
          <script>
            const ws = new WebSocket('ws://localhost:3000/ws');
            const messages = document.getElementById('messages');
            const input = document.getElementById('input');
            const sendBtn = document.getElementById('send');

            ws.onopen = () => {
              messages.innerHTML += '<p>Connected!</p>';
            };

            ws.onmessage = (event) => {
              messages.innerHTML += '<p>' + event.data + '</p>';
            };

            ws.onclose = () => {
              messages.innerHTML += '<p>Disconnected</p>';
            };

            sendBtn.onclick = () => {
              ws.send(input.value);
              input.value = '';
            };

            input.onkeypress = (e) => {
              if (e.key === 'Enter') sendBtn.click();
            };
          </script>
        `}
      </body>
    </html>
  )
})

// WebSocket endpoint
app.get(
  '/ws',
  upgradeWebSocket((c) => {
    let intervalId: Timer | undefined

    return {
      onOpen(event, ws) {
        // Send periodic updates
        intervalId = setInterval(() => {
          ws.send(JSON.stringify({
            type: 'ping',
            time: new Date().toISOString(),
          }))
        }, 5000)
      },
      onMessage(event, ws) {
        ws.send(`You said: ${event.data}`)
      },
      onClose() {
        if (intervalId) clearInterval(intervalId)
      },
    }
  })
)

export default {
  fetch: app.fetch,
  websocket,
}
```

## Deno

### Deno Setup

```typescript
import { Hono } from "npm:hono";
import { upgradeWebSocket } from "npm:hono/deno";

const app = new Hono();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        console.log("Connection opened");
      },
      onMessage(event, ws) {
        ws.send(`Echo: ${event.data}`);
      },
      onClose() {
        console.log("Connection closed");
      },
    };
  }),
);

Deno.serve(app.fetch);
```

## Node.js

### Installation

```bash
npm install @hono/node-ws
npm install ws
```

### Node.js Setup

```typescript
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { serve } from "@hono/node-server";

const app = new Hono();

const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        console.log("Connection opened");
      },
      onMessage(event, ws) {
        ws.send(`Echo: ${event.data}`);
      },
      onClose() {
        console.log("Connection closed");
      },
    };
  }),
);

const server = serve({ fetch: app.fetch, port: 3000 });
injectWebSocket(server);

console.log("Server running on http://localhost:3000");
```

## Connection Management

### Tracking Connections

```typescript
// Store active connections
const connections = new Set<WebSocket>();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event, ws) {
        connections.add(ws.raw);
        console.log(`Connections: ${connections.size}`);
      },
      onClose(event, ws) {
        connections.delete(ws.raw);
        console.log(`Connections: ${connections.size}`);
      },
      onMessage(event, ws) {
        // Handle message
      },
    };
  }),
);

// Broadcast to all connections
function broadcast(message: string) {
  for (const ws of connections) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}
```

### User-Specific Connections

```typescript
const userConnections = new Map<string, Set<WebSocket>>();

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const userId = c.req.query("userId");

    if (!userId) {
      return {}; // Reject connection
    }

    return {
      onOpen(event, ws) {
        if (!userConnections.has(userId)) {
          userConnections.set(userId, new Set());
        }
        userConnections.get(userId)!.add(ws.raw);
      },
      onClose(event, ws) {
        userConnections.get(userId)?.delete(ws.raw);
        if (userConnections.get(userId)?.size === 0) {
          userConnections.delete(userId);
        }
      },
      onMessage(event, ws) {
        // Handle user message
      },
    };
  }),
);

// Send to specific user
function sendToUser(userId: string, message: string) {
  const connections = userConnections.get(userId);
  if (connections) {
    for (const ws of connections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }
}
```

## Message Handling

### JSON Messages

```typescript
interface Message {
  type: string;
  payload: unknown;
}

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        try {
          const message: Message = JSON.parse(event.data as string);

          switch (message.type) {
            case "ping":
              ws.send(JSON.stringify({ type: "pong" }));
              break;

            case "subscribe":
              handleSubscribe(ws, message.payload);
              break;

            case "message":
              handleMessage(ws, message.payload);
              break;

            default:
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: "Unknown message type",
                }),
              );
          }
        } catch (e) {
          ws.send(
            JSON.stringify({
              type: "error",
              payload: "Invalid JSON",
            }),
          );
        }
      },
    };
  }),
);
```

### Binary Data

```typescript
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        if (event.data instanceof ArrayBuffer) {
          // Handle binary data
          const bytes = new Uint8Array(event.data);
          console.log("Received binary:", bytes.length, "bytes");

          // Echo back
          ws.send(event.data);
        } else {
          // Handle text
          ws.send(`Text: ${event.data}`);
        }
      },
    };
  }),
);
```

## Chat Room Example

```typescript
interface ChatRoom {
  id: string;
  connections: Set<WebSocket>;
}

const rooms = new Map<string, ChatRoom>();

function getOrCreateRoom(roomId: string): ChatRoom {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { id: roomId, connections: new Set() });
  }
  return rooms.get(roomId)!;
}

app.get(
  "/ws/chat/:roomId",
  upgradeWebSocket((c) => {
    const roomId = c.req.param("roomId");
    const username = c.req.query("username") || "Anonymous";
    const room = getOrCreateRoom(roomId);

    return {
      onOpen(event, ws) {
        room.connections.add(ws.raw);

        // Notify room
        broadcast(
          room,
          JSON.stringify({
            type: "system",
            message: `${username} joined the room`,
            timestamp: Date.now(),
          }),
        );
      },

      onMessage(event, ws) {
        const data = JSON.parse(event.data as string);

        // Broadcast message to room
        broadcast(
          room,
          JSON.stringify({
            type: "message",
            username,
            message: data.message,
            timestamp: Date.now(),
          }),
        );
      },

      onClose(event, ws) {
        room.connections.delete(ws.raw);

        // Notify room
        broadcast(
          room,
          JSON.stringify({
            type: "system",
            message: `${username} left the room`,
            timestamp: Date.now(),
          }),
        );

        // Cleanup empty room
        if (room.connections.size === 0) {
          rooms.delete(roomId);
        }
      },
    };
  }),
);

function broadcast(room: ChatRoom, message: string) {
  for (const ws of room.connections) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}
```

## RPC Mode

Type-safe WebSocket connections with Hono RPC:

```typescript
// server.ts
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";

const app = new Hono();

const wsRoute = app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        ws.send(`Echo: ${event.data}`);
      },
    };
  }),
);

export type AppType = typeof wsRoute;
export default app;
```

```typescript
// client.ts
import { hc } from "hono/client";
import type { AppType } from "./server";

const client = hc<AppType>("http://localhost:3000");

// Type-safe WebSocket connection
const socket = client.ws.$ws();

socket.onmessage = (event) => {
  console.log("Received:", event.data);
};

socket.send("Hello!");
```

## Authentication

### Token-Based Auth

```typescript
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    // Validate token from query param
    const token = c.req.query("token");

    if (!token || !isValidToken(token)) {
      // Return empty object to reject upgrade
      return {};
    }

    const user = getUserFromToken(token);

    return {
      onOpen(event, ws) {
        console.log(`User ${user.id} connected`);
      },
      onMessage(event, ws) {
        // Handle authenticated message
      },
      onClose() {
        console.log(`User ${user.id} disconnected`);
      },
    };
  }),
);
```

### Cookie-Based Auth

```typescript
import { getCookie } from "hono/cookie";

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const sessionId = getCookie(c, "session");

    if (!sessionId || !isValidSession(sessionId)) {
      return {};
    }

    const user = getUserFromSession(sessionId);

    return {
      onOpen(event, ws) {
        // Authenticated connection
      },
      onMessage(event, ws) {
        // Handle message
      },
    };
  }),
);
```

## Error Handling

```typescript
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        try {
          const data = JSON.parse(event.data as string);
          processMessage(data);
        } catch (error) {
          ws.send(
            JSON.stringify({
              type: "error",
              code: "PARSE_ERROR",
              message: "Failed to parse message",
            }),
          );
        }
      },

      onError(event, ws) {
        console.error("WebSocket error:", event);
        // Connection will close automatically
      },
    };
  }),
);
```

## Important Considerations

### Header Modification Warning

When using middleware that modifies headers (like CORS) on WebSocket routes, you may encounter errors about immutable headers. This happens because `upgradeWebSocket()` modifies headers internally.

**Solution:** Apply CORS middleware only to non-WebSocket routes:

```typescript
// Apply CORS only to API routes, not WebSocket
app.use('/api/*', cors())

// WebSocket route without CORS
app.get('/ws', upgradeWebSocket(...))
```

### Heartbeat/Ping-Pong

Keep connections alive:

```typescript
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    let pingInterval: Timer | undefined;

    return {
      onOpen(event, ws) {
        // Send ping every 30 seconds
        pingInterval = setInterval(() => {
          if (ws.readyState === 1) {
            // OPEN
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      },

      onMessage(event, ws) {
        const data = JSON.parse(event.data as string);
        if (data.type === "pong") {
          // Client is alive
          return;
        }
        // Handle other messages
      },

      onClose() {
        if (pingInterval) clearInterval(pingInterval);
      },
    };
  }),
);
```

## Best Practices

1. **Validate connections** before accepting
2. **Handle JSON parsing errors** gracefully
3. **Implement heartbeat** for connection health
4. **Clean up resources** on disconnect
5. **Use typed messages** for better maintainability
6. **Rate limit messages** to prevent abuse
7. **Log connection events** for debugging
8. **Handle reconnection** on the client side
9. **Use rooms/channels** for organized broadcasting
10. **Test with multiple connections** to ensure scalability
