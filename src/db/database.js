const path = require('path');
const fs = require('fs');
// Built-in SQLite driver (Node 22.13+ / 24+) — nothing native to compile
const { DatabaseSync } = require('node:sqlite');

const dbFile = process.env.DB_FILE || './data/tasks.db';
const dbPath = path.resolve(process.cwd(), dbFile);

// Make sure the folder for the database file exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in-progress', 'completed')),
    priority    TEXT    NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
    due_date    TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
