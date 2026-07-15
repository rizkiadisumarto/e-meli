const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kas-gang-meli-secret-key-2024';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token tidak valid' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang bisa melakukan ini.' });
  }
  next();
}

// Admin or Committee can manage events
function requireAdminOrCommittee(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'committee') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin atau committee yang bisa melakukan ini.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireAdminOrCommittee, JWT_SECRET };
