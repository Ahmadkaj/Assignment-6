const express = require('express');
const tasksRouter = require('./routes/tasks');
const { notFound, errorHandler } = require('./middleware/errorHandlers');

const app = express();

app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Tasks REST API',
    endpoints: {
      'GET /tasks': 'List all tasks (filters: ?status=, ?priority=)',
      'GET /tasks/:id': 'Get one task',
      'POST /tasks': 'Create a task',
      'PUT /tasks/:id': 'Update a task',
      'DELETE /tasks/:id': 'Delete a task',
    },
  });
});

app.use('/tasks', tasksRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
