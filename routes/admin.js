const express = require('express');
const crypto = require('crypto');

const router = express.Router();

/**
 * POST /api/admin/verify
 * Verifies the admin password server-side.
 * Expects { password: string } in the request body.
 * The expected hash is stored in the ADMIN_PASSWORD_HASH env var.
 */
router.post('/verify', async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required' });
  }

  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedHash) {
    return res.status(503).json({ message: 'Admin access is not configured' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== expectedHash) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  res.json({ ok: true });
});

module.exports = router;
