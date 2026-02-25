/**
 * Strips unexpected fields from req.body, keeping only those in `allowedFields`.
 * Returns a middleware function.
 */
const sanitizeBody = (allowedFields) => (req, _res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    req.body = {};
  }
  const clean = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      clean[key] = req.body[key];
    }
  }
  req.body = clean;
  next();
};

/**
 * Requires that every field in `requiredFields` is present and non-empty in req.body.
 */
const requireFields = (requiredFields) => (req, res, next) => {
  for (const field of requiredFields) {
    const value = req.body[field];
    if (value === undefined || value === null || value === '') {
      return res.status(400).json({ message: `${field} is required` });
    }
  }
  next();
};

module.exports = { sanitizeBody, requireFields };
