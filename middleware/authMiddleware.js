const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const jwtConfig = require('../config/jwt');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    const [user] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [decoded.sub]
    );

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    req.user = { id: decoded.sub };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
