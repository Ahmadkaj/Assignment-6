require('dotenv').config();
const db = require('../src/db/database');

const samples = [
  ['Finish Assignment 6', 'Build the REST API and write the README', 'in-progress', 'high', '2026-11-15'],
  ['Buy groceries', 'Milk, eggs, bread', 'pending', 'low', null],
  ['Read Express docs', 'Routing and middleware chapters', 'completed', 'medium', '2026-11-01'],
];

const insert = db.prepare(
  'INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)'
);
samples.forEach((s) => insert.run(...s));
console.log(`Seeded ${samples.length} tasks.`);
