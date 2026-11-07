# Assignment 6 – Tasks REST API

A RESTful API built with **Node.js + Express** for managing a to-do list of **tasks**, with data stored in a real **SQLite** database file (using Node's built-in `node:sqlite` module, so there is nothing native to compile during `npm install`). It supports full CRUD, input validation, correct HTTP status codes and JSON error messages, and it does not crash on bad input.

## Requirements checklist

| Requirement / rubric criterion | Where it is met | Proof |
|---|---|---|
| **CRUD completeness (30)** – list, get one, create, update, delete | `src/routes/tasks.js` | `test-evidence/test-results.md` (tests 1–7) |
| **RESTful design & status codes (20)** – `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`; 200 / 201 / 400 / 404 / 500 | `src/routes/tasks.js`, `src/middleware/errorHandlers.js` | [Routes](#routes) and [Status codes](#status-codes-used) below; every test checks the status code |
| **Database integration (20)** – real SQLite database file, not in-memory | `src/db/database.js` (file `data/tasks.db`) | `test-evidence/persistence-check.md`: data survives server restarts |
| **Error handling & validation (15)** – validation on create/update, JSON error messages, no crash on bad input or missing record | `src/middleware/validateTask.js`, `src/middleware/errorHandlers.js` | `test-evidence/test-results.md` (tests 8–17): 404s, invalid id, invalid fields, malformed JSON, server still running afterwards |
| **Documentation (15)** – how to run + every route with example request/response | This README | [Setup](#setup-and-running) and [Routes](#routes) |
| `.env` for config, excluded by `.gitignore` | `.env.example`, `.gitignore` | `.env` is not in the repo |
| Postman / Thunder Client collection | `postman/Tasks-API.postman_collection.json` | `test-evidence/postman-newman-run.txt` (19/19 assertions passed) |

## Tech stack

| Part | Tool |
|---|---|
| Runtime | Node.js 22.13+ or 24+ (LTS) |
| Framework | Express 5 |
| Database | SQLite (file on disk, via built-in `node:sqlite`) |
| Config | `dotenv` (`.env` file, not committed) |
| Dev server | `nodemon` |
| Testing | Postman collection + `npm test` script |

## Project structure

```
tasks-rest-api/
├── src/
│   ├── server.js               # Loads .env, starts the server
│   ├── app.js                  # Express app, routes, error handlers
│   ├── routes/tasks.js         # All /tasks CRUD routes
│   ├── db/database.js          # SQLite connection + table creation
│   └── middleware/
│       ├── validateTask.js     # Input validation for POST/PUT
│       └── errorHandlers.js    # 404 + central error handler
├── scripts/
│   ├── seed.js                 # Adds 3 sample tasks
│   └── api-test.js             # Tests every route, writes evidence
├── postman/Tasks-API.postman_collection.json
├── test-evidence/              # Saved test results (see Testing)
├── .env.example
└── package.json
```

## Setup and running

**Requirements:** Node.js **22.13 or newer** (Node 24 LTS recommended) and npm. Check with `node -v`.

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create your `.env` file** by copying the example:
   ```bash
   # macOS / Linux
   cp .env.example .env
   # Windows (PowerShell)
   Copy-Item .env.example .env
   ```
   `.env` contents:
   ```
   PORT=3000
   DB_FILE=./data/tasks.db
   ```
   (If `.env` is missing, the server falls back to these same defaults.)
3. **(Optional) Add sample data**
   ```bash
   npm run seed
   ```
4. **Start the dev server** (auto-restarts on file changes):
   ```bash
   npm run dev
   ```
   Or without auto-restart: `npm start`

The API is now running at **http://localhost:3000**. The database file `data/tasks.db` and its table are created automatically on first run.

## Testing

With the server running, in a second terminal:

```bash
npm test
```

This calls every route (happy paths and error cases), prints PASS/FAIL, and saves the full requests and responses to `test-evidence/test-results.md`.

**Postman / Thunder Client:** import `postman/Tasks-API.postman_collection.json` (Postman: *Import*; Thunder Client: *Collections → ⋯ → Import*). Run the collection in order; the *Create task* request saves the new id into `{{taskId}}` for the following requests. Saved run output: `test-evidence/postman-newman-run.txt`.

**Persistence:** `test-evidence/persistence-check.md` shows a task being created and updated, the server being stopped and restarted, and the task still being there. It then shows the task being deleted and staying deleted after another restart, plus the rows read directly from the database file.

### Test evidence files

| File | What it shows |
|---|---|
| `test-evidence/test-results.md` | 17 requests covering every route and error case, with full request and response bodies |
| `test-evidence/postman-newman-run.txt` | Postman collection run: 14 requests, 19 assertions, 0 failures |
| `test-evidence/persistence-check.md` | Data stays in the database across server restarts |

## The Task resource

| Field | Type | Rules |
|---|---|---|
| `id` | integer | Set by the database |
| `title` | string | **Required**, 1–100 characters |
| `description` | string | Optional, max 1000 characters, default `""` |
| `status` | string | `pending` \| `in-progress` \| `completed`, default `pending` |
| `priority` | string | `low` \| `medium` \| `high`, default `medium` |
| `dueDate` | string \| null | `YYYY-MM-DD`, must be a real date, default `null` |
| `createdAt` | string | Set by the database |
| `updatedAt` | string | Updated on every PUT |

Any other field in the request body is rejected with a 400.

## Routes

| Method | Route | Description | Success |
|---|---|---|---|
| GET | `/tasks` | List all tasks | 200 |
| GET | `/tasks/:id` | Get one task | 200 |
| POST | `/tasks` | Create a task | 201 |
| PUT | `/tasks/:id` | Update a task | 200 |
| DELETE | `/tasks/:id` | Delete a task | 200 |

### Status codes used

| Code | When |
|---|---|
| 200 OK | Successful GET, PUT, DELETE |
| 201 Created | Successful POST |
| 400 Bad Request | Validation failed, invalid id, malformed JSON, invalid filter |
| 404 Not Found | Task id does not exist, or unknown route |
| 500 Internal Server Error | Unexpected server/database error |

---

### 1. GET `/tasks` – list all tasks

Optional query filters: `?status=pending|in-progress|completed` and `?priority=low|medium|high`.

```bash
curl http://localhost:3000/tasks
curl "http://localhost:3000/tasks?status=pending&priority=high"
```

**200 OK**
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
      "createdAt": "2026-11-07 20:22:43",
      "updatedAt": "2026-11-07 20:22:43"
    },
    {
      "id": 2,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "pending",
      "priority": "low",
      "dueDate": null,
      "createdAt": "2026-11-07 20:22:43",
      "updatedAt": "2026-11-07 20:22:43"
    }
  ]
}
```

**400 Bad Request** (invalid filter, e.g. `?status=finished`)
```json
{ "error": "status filter must be one of: pending, in-progress, completed" }
```

---

### 2. GET `/tasks/:id` – get one task

```bash
curl http://localhost:3000/tasks/1
```

**200 OK**
```json
{
  "data": {
    "id": 1,
    "title": "Finish Assignment 6",
    "description": "Build the REST API and write the README",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2026-11-15",
    "createdAt": "2026-11-07 20:22:43",
    "updatedAt": "2026-11-07 20:22:43"
  }
}
```

**404 Not Found**
```json
{ "error": "Task with id 99 not found" }
```

**400 Bad Request** (`/tasks/abc`)
```json
{ "error": "Invalid id: must be a positive integer" }
```

---

### 3. POST `/tasks` – create a task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write README","description":"Document every route","priority":"high","dueDate":"2026-11-20"}'
```

**Request body**
```json
{
  "title": "Write README",
  "description": "Document every route",
  "priority": "high",
  "dueDate": "2026-11-20"
}
```

**201 Created** (also sets the `Location: /tasks/4` header)
```json
{
  "message": "Task created",
  "data": {
    "id": 4,
    "title": "Write README",
    "description": "Document every route",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-11-20",
    "createdAt": "2026-11-07 20:23:19",
    "updatedAt": "2026-11-07 20:23:19"
  }
}
```

**400 Bad Request** – missing title
```json
{ "error": "Validation failed", "details": ["title is required"] }
```

**400 Bad Request** – several invalid values
```json
// request: { "title": "  ", "status": "done", "priority": "urgent", "dueDate": "2026-13-45" }
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

**400 Bad Request** – malformed JSON (e.g. `{"title": "oops",`)
```json
{ "error": "Malformed JSON in request body" }
```

---

### 4. PUT `/tasks/:id` – update a task

PUT replaces the task's editable fields. `title` is required; any optional field you leave out goes back to its default.

```bash
curl -X PUT http://localhost:3000/tasks/4 \
  -H "Content-Type: application/json" \
  -d '{"title":"Write README (final)","description":"Every route documented","status":"completed","priority":"high","dueDate":"2026-11-20"}'
```

**Request body**
```json
{
  "title": "Write README (final)",
  "description": "Every route documented",
  "status": "completed",
  "priority": "high",
  "dueDate": "2026-11-20"
}
```

**200 OK**
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
    "createdAt": "2026-11-07 20:23:19",
    "updatedAt": "2026-11-07 20:25:02"
  }
}
```

**404 Not Found**
```json
{ "error": "Task with id 999999 not found" }
```

**400 Bad Request** – same validation messages as POST, e.g.
```json
{ "error": "Validation failed", "details": ["status must be one of: pending, in-progress, completed"] }
```

---

### 5. DELETE `/tasks/:id` – delete a task

```bash
curl -X DELETE http://localhost:3000/tasks/4
```

**200 OK** (returns the deleted task)
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
    "createdAt": "2026-11-07 20:23:19",
    "updatedAt": "2026-11-07 20:25:02"
  }
}
```

**404 Not Found**
```json
{ "error": "Task with id 4 not found" }
```

---

### Unknown routes

```bash
curl http://localhost:3000/nothing-here
```

**404 Not Found**
```json
{ "error": "Route GET /nothing-here not found" }
```

## Error handling

- Every route handler is wrapped in `try/catch` and forwards errors to one central error handler, which returns JSON instead of crashing.
- Malformed JSON bodies return **400** with a clear message.
- Missing records return **404**; non-numeric ids return **400**.
- Unexpected errors return **500** `{ "error": "Internal server error" }` and are logged to the console.
- All SQL uses prepared statements with `?` placeholders (no SQL injection).

## Environment variables

Stored in `.env`, which is listed in `.gitignore` and never committed. See `.env.example`.

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `DB_FILE` | `./data/tasks.db` | Path of the SQLite database file |
