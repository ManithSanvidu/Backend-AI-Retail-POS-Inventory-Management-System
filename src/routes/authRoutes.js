const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.status(501).json({ error: 'Login not implemented' });
});

router.post('/register', (req, res) => {
  res.status(501).json({ error: 'Register not implemented' });
});

module.exports = router;
