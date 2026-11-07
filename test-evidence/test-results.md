# API Test Evidence

Run on 2026-11-07T20:30:08.610Z against `http://localhost:3000` using `npm test` (scripts/api-test.js).

**Result: 17 passed, 0 failed.**

### 1. ✅ Create a task
`POST /tasks` → **201** (expected 201)

Request body:
```json
{"title":"Write README","description":"Document every route with examples","priority":"high","dueDate":"2026-11-20"}
```
Response body:
```json
{
  "message": "Task created",
  "data": {
    "id": 4,
    "title": "Write README",
    "description": "Document every route with examples",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-11-20",
    "createdAt": "2026-11-07 20:30:08",
    "updatedAt": "2026-11-07 20:30:08"
  }
}
```

### 2. ✅ List all tasks
`GET /tasks` → **200** (expected 200)

Response body:
```json
{
  "count": 4,
  "data": [
    {
      "id": 1,
      "title": "Finish Assignment 6",
      "description": "Build the REST API and write the README",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-11-15",
      "createdAt": "2026-11-07 20:30:06",
      "updatedAt": "2026-11-07 20:30:06"
    },
    {
      "id": 2,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "pending",
      "priority": "low",
      "dueDate": null,
      "createdAt": "2026-11-07 20:30:06",
      "updatedAt": "2026-11-07 20:30:06"
    },
    {
      "id": 3,
      "title": "Read Express docs",
      "description": "Routing and middleware chapters",
      "status": "completed",
      "priority": "medium",
      "dueDate": "2026-11-01",
      "createdAt": "2026-11-07 20:30:06",
      "updatedAt": "2026-11-07 20:30:06"
    },
    {
      "id": 4,
      "title": "Write README",
      "description": "Document every route with examples",
      "status": "pending",
      "priority": "high",
      "dueDate": "2026-11-20",
      "createdAt": "2026-11-07 20:30:08",
      "updatedAt": "2026-11-07 20:30:08"
    }
  ]
}
```

### 3. ✅ List tasks filtered by priority
`GET /tasks?priority=high` → **200** (expected 200)

Response body:
```json
{
  "count": 2,
  "data": [
    {
      "id": 1,
      "title": "Finish Assignment 6",
      "description": "Build the REST API and write the README",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-11-15",
      "createdAt": "2026-11-07 20:30:06",
      "updatedAt": "2026-11-07 20:30:06"
    },
    {
      "id": 4,
      "title": "Write README",
      "description": "Document every route with examples",
      "status": "pending",
      "priority": "high",
      "dueDate": "2026-11-20",
      "createdAt": "2026-11-07 20:30:08",
      "updatedAt": "2026-11-07 20:30:08"
    }
  ]
}
```

### 4. ✅ Get one task
`GET /tasks/4` → **200** (expected 200)

Response body:
```json
{
  "data": {
    "id": 4,
    "title": "Write README",
    "description": "Document every route with examples",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-11-20",
    "createdAt": "2026-11-07 20:30:08",
    "updatedAt": "2026-11-07 20:30:08"
  }
}
```

### 5. ✅ Update a task
`PUT /tasks/4` → **200** (expected 200)

Request body:
```json
{"title":"Write README (final)","description":"Every route documented","status":"completed","priority":"high","dueDate":"2026-11-20"}
```
Response body:
```json
{
  "message": "Task updated",
  "data": {
    "id": 4,
    "title": "Write README (final)",
    "description": "Every route documented",
    "status": "completed",
    "priority": "high",
    "dueDate": "2026-11-20",
    "createdAt": "2026-11-07 20:30:08",
    "updatedAt": "2026-11-07 20:30:08"
  }
}
```

### 6. ✅ Get updated task (persisted)
`GET /tasks/4` → **200** (expected 200)

Response body:
```json
{
  "data": {
    "id": 4,
    "title": "Write README (final)",
    "description": "Every route documented",
    "status": "completed",
    "priority": "high",
    "dueDate": "2026-11-20",
    "createdAt": "2026-11-07 20:30:08",
    "updatedAt": "2026-11-07 20:30:08"
  }
}
```

### 7. ✅ Delete a task
`DELETE /tasks/4` → **200** (expected 200)

Response body:
```json
{
  "message": "Task 4 deleted",
  "data": {
    "id": 4,
    "title": "Write README (final)",
    "description": "Every route documented",
    "status": "completed",
    "priority": "high",
    "dueDate": "2026-11-20",
    "createdAt": "2026-11-07 20:30:08",
    "updatedAt": "2026-11-07 20:30:08"
  }
}
```

### 8. ✅ Get deleted task -> 404
`GET /tasks/4` → **404** (expected 404)

Response body:
```json
{
  "error": "Task with id 4 not found"
}
```

### 9. ✅ Update missing task -> 404
`PUT /tasks/999999` → **404** (expected 404)

Request body:
```json
{"title":"x"}
```
Response body:
```json
{
  "error": "Task with id 999999 not found"
}
```

### 10. ✅ Delete missing task -> 404
`DELETE /tasks/999999` → **404** (expected 404)

Response body:
```json
{
  "error": "Task with id 999999 not found"
}
```

### 11. ✅ Invalid id -> 400
`GET /tasks/abc` → **400** (expected 400)

Response body:
```json
{
  "error": "Invalid id: must be a positive integer"
}
```

### 12. ✅ Create without title -> 400
`POST /tasks` → **400** (expected 400)

Request body:
```json
{"description":"no title"}
```
Response body:
```json
{
  "error": "Validation failed",
  "details": [
    "title is required"
  ]
}
```

### 13. ✅ Create with invalid fields -> 400
`POST /tasks` → **400** (expected 400)

Request body:
```json
{"title":"   ","status":"done","priority":"urgent","dueDate":"2026-13-45"}
```
Response body:
```json
{
  "error": "Validation failed",
  "details": [
    "title must be a non-empty string",
    "status must be one of: pending, in-progress, completed",
    "priority must be one of: low, medium, high",
    "dueDate must be a valid date in YYYY-MM-DD format (or null)"
  ]
}
```

### 14. ✅ Malformed JSON -> 400
`POST /tasks` → **400** (expected 400)

Request body:
```json
{"title": "oops",
```
Response body:
```json
{
  "error": "Malformed JSON in request body"
}
```

### 15. ✅ Invalid filter -> 400
`GET /tasks?status=finished` → **400** (expected 400)

Response body:
```json
{
  "error": "status filter must be one of: pending, in-progress, completed"
}
```

### 16. ✅ Unknown route -> 404
`GET /nothing-here` → **404** (expected 404)

Response body:
```json
{
  "error": "Route GET /nothing-here not found"
}
```

### 17. ✅ Server still alive after bad input
`GET /tasks` → **200** (expected 200)

Response body:
```json
{
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "Finish Assignment 6",
      "description": "Build the REST API and write the README",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-11-15",
      "createdAt": "2026-11-07 20:30:06",
      "updatedAt": "2026-11-07 20:30:06"
    },
    {
      "id": 2,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "pending",
      "priority": "low",
      "dueDate": null,
      "createdAt": "2026-11-07 20:30:06",
      "updatedAt": "2026-11-07 20:30:06"
    },
    {
      "id": 3,
      "title": "Read Express docs",
      "description": "Routing and middleware chapters",
      "status": "completed",
      "priority": "medium",
      "dueDate": "2026-11-01",
      "createdAt": "2026-11-07 20:30:06",
      "updatedAt": "2026-11-07 20:30:06"
    }
  ]
}
```
