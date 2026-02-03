---
name: graphql-schema
description: Designs GraphQL schemas and resolvers. Use when creating GraphQL APIs, defining types, or implementing queries and mutations.
argument-hint: [type-name]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# GraphQL Schema

Designs GraphQL schemas with types, queries, and mutations.

## Your Task

1. **Identify data**: Understand the domain model
2. **Define types**: Create GraphQL type definitions
3. **Design queries**: Plan read operations
4. **Design mutations**: Plan write operations
5. **Implement resolvers**: Write resolver functions

## Schema Example

```graphql
# schema.graphql
type Query {
  user(id: ID!): User
  users(limit: Int = 20, offset: Int = 0): [User!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createPost(input: CreatePostInput!): Post!
}

type User {
  id: ID!
  email: String!
  name: String
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String
  published: Boolean!
  author: User!
  createdAt: DateTime!
}

input CreateUserInput {
  email: String!
  name: String
}

input UpdateUserInput {
  name: String
}

input CreatePostInput {
  title: String!
  content: String
  authorId: ID!
}

scalar DateTime
```

## Resolver Example

```typescript
// resolvers.ts
const resolvers = {
  Query: {
    user: (_, { id }, ctx) => ctx.db.user.findUnique({ where: { id } }),
    users: (_, { limit, offset }, ctx) =>
      ctx.db.user.findMany({ take: limit, skip: offset }),
  },
  Mutation: {
    createUser: (_, { input }, ctx) =>
      ctx.db.user.create({ data: input }),
  },
  User: {
    posts: (user, _, ctx) =>
      ctx.db.post.findMany({ where: { authorId: user.id } }),
  },
};
```

## Tips

- Use DataLoader to solve N+1 problems
- Make fields non-null when appropriate
- Use input types for mutations
- Add descriptions for documentation
