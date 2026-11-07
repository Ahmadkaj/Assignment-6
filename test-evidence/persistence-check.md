# Database Persistence Check

Run on 2026-11-07T20:29:45Z. Shows that tasks are stored in the SQLite file `data/tasks.db`, not in memory: the server process is **stopped and restarted** between steps, and the data is still there.

## 1. Create a task (server run #1)
`POST /tasks` → 201
```json
{
  "message": "Task created",
  "data": {
    "id": 4,
    "title": "Persistence check",
    "description": "Created before restart",
    "status": "pending",
    "priority": "high",
    "dueDate": null,
    "createdAt": "2026-11-07 20:29:38",
    "updatedAt": "2026-11-07 20:29:38"
  }
}
```

## 2. Update it (server run #1)
`PUT /tasks/4` → 200
```json
{
  "message": "Task updated",
  "data": {
    "id": 4,
    "title": "Persistence check",
    "description": "Updated before restart",
    "status": "in-progress",
    "priority": "high",
    "dueDate": null,
    "createdAt": "2026-11-07 20:29:38",
    "updatedAt": "2026-11-07 20:29:38"
  }
}
```

## 3. Server stopped and restarted → read it back (server run #2)
`GET /tasks/4` → 200. The updated values are still there after the restart.
```json
{
  "data": {
    "id": 4,
    "title": "Persistence check",
    "description": "Updated before restart",
    "status": "in-progress",
    "priority": "high",
    "dueDate": null,
    "createdAt": "2026-11-07 20:29:38",
    "updatedAt": "2026-11-07 20:29:38"
  }
}
```

## 4. Delete it (server run #2)
`DELETE /tasks/4` → 200
```json
{
  "message": "Task 4 deleted",
  "data": {
    "id": 4,
    "title": "Persistence check",
    "description": "Updated before restart",
    "status": "in-progress",
    "priority": "high",
    "dueDate": null,
    "createdAt": "2026-11-07 20:29:38",
    "updatedAt": "2026-11-07 20:29:38"
  }
}
```

## 5. Server stopped and restarted → deleted task stays deleted (server run #3)
`GET /tasks/4` → 404
```
{"error":"Task with id 4 not found"} HTTP 404
```

## 6. Rows read straight from the database file (no server running)
`SELECT id, title, status FROM tasks`
```json
[
  {
    "id": 1,
    "title": "Finish Assignment 6",
    "status": "in-progress"
  },
  {
    "id": 2,
    "title": "Buy groceries",
    "status": "pending"
  },
  {
    "id": 3,
    "title": "Read Express docs",
    "status": "completed"
  }
]
```
