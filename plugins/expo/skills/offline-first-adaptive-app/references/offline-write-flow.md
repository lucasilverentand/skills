# Offline Write Flow
Use this when the user needs a concrete mutation sequence.

```txt
User presses Save
  -> TaskForm validates input
  -> useCreateTask calls taskRepo.createLocal
  -> transaction starts
  -> insert task row with sync_state = pending
  -> insert outbox row with operation = create and idempotency_key
  -> transaction commits
  -> TaskList updates from local DB subscription or query
  -> Sync engine runs when online
  -> Server accepts write
  -> local row gets server_id, server_version, sync_state = synced
  -> outbox row marked sent or removed
```

The UI should not wait for the server before showing the new task.
