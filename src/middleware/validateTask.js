const STATUSES = ['pending', 'in-progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];
const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];

function isValidDate(value) {
  // Accepts YYYY-MM-DD and checks it is a real calendar date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Validates a task body.
 * @param {object} body  request body
 * @param {boolean} requireTitle  true for POST and PUT (full replacement)
 * @returns {string[]} list of error messages (empty = valid)
 */
function validate(body, requireTitle) {
  const errors = [];

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object'];
  }

  const unknown = Object.keys(body).filter((k) => !ALLOWED_FIELDS.includes(k));
  if (unknown.length) {
    errors.push(`Unknown field(s): ${unknown.join(', ')}. Allowed: ${ALLOWED_FIELDS.join(', ')}`);
  }

  const { title, description, status, priority, dueDate } = body;

  if (title === undefined) {
    if (requireTitle) errors.push('title is required');
  } else if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title must be a non-empty string');
  } else if (title.trim().length > 100) {
    errors.push('title must be at most 100 characters');
  }

  if (description !== undefined) {
    if (typeof description !== 'string') errors.push('description must be a string');
    else if (description.length > 1000) errors.push('description must be at most 1000 characters');
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
  }

  if (dueDate !== undefined && dueDate !== null) {
    if (typeof dueDate !== 'string' || !isValidDate(dueDate)) {
      errors.push('dueDate must be a valid date in YYYY-MM-DD format (or null)');
    }
  }

  return errors;
}

function validateTask(req, res, next) {
  const errors = validate(req.body, true);
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
}

module.exports = { validateTask, STATUSES, PRIORITIES };
