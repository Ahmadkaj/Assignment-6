const express = require('express');
const db = require('../db/database');
const { validateTask, STATUSES, PRIORITIES } = require('../middleware/validateTask');

const router = express.Router();

// Convert a database row (snake_case) to the API shape (camelCase)
function toTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Validate the :id route parameter
function parseId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id: must be a positive integer' });
  }
  req.taskId = id;
  next();
}

const findById = db.prepare('SELECT * FROM tasks WHERE id = ?');

// GET /tasks  — list all (optional ?status= and ?priority= filters)
router.get('/', (req, res, next) => {
  try {
    const { status, priority } = req.query;
    if (status !== undefined && !STATUSES.includes(status)) {
      return res.status(400).json({ error: `status filter must be one of: ${STATUSES.join(', ')}` });
    }
    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `priority filter must be one of: ${PRIORITIES.join(', ')}` });
    }

    let sql = 'SELECT * FROM tasks WHERE 1 = 1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (priority) { sql += ' AND priority = ?'; params.push(priority); }
    sql += ' ORDER BY id ASC';

    const rows = db.prepare(sql).all(...params);
    res.status(200).json({ count: rows.length, data: rows.map(toTask) });
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id  — get one
router.get('/:id', parseId, (req, res, next) => {
  try {
    const row = findById.get(req.taskId);
    if (!row) return res.status(404).json({ error: `Task with id ${req.taskId} not found` });
    res.status(200).json({ data: toTask(row) });
  } catch (err) {
    next(err);
  }
});

// POST /tasks  — create
router.post('/', validateTask, (req, res, next) => {
  try {
    const { title, description = '', status = 'pending', priority = 'medium', dueDate = null } = req.body;
    const info = db
      .prepare(
        `INSERT INTO tasks (title, description, status, priority, due_date)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(title.trim(), description, status, priority, dueDate);

    const row = findById.get(Number(info.lastInsertRowid));
    res.status(201).location(`/tasks/${row.id}`).json({ message: 'Task created', data: toTask(row) });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id  — update (replace the task's editable fields)
router.put('/:id', parseId, validateTask, (req, res, next) => {
  try {
    const existing = findById.get(req.taskId);
    if (!existing) return res.status(404).json({ error: `Task with id ${req.taskId} not found` });

    const { title, description = '', status = 'pending', priority = 'medium', dueDate = null } = req.body;
    db.prepare(
      `UPDATE tasks
         SET title = ?, description = ?, status = ?, priority = ?, due_date = ?,
             updated_at = datetime('now')
       WHERE id = ?`
    ).run(title.trim(), description, status, priority, dueDate, req.taskId);

    res.status(200).json({ message: 'Task updated', data: toTask(findById.get(req.taskId)) });
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id  — delete
router.delete('/:id', parseId, (req, res, next) => {
  try {
    const existing = findById.get(req.taskId);
    if (!existing) return res.status(404).json({ error: `Task with id ${req.taskId} not found` });

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.taskId);
    res.status(200).json({ message: `Task ${req.taskId} deleted`, data: toTask(existing) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
