import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Extract token from "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to request for later use
    req.user = decoded; // { id, username, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export default authMiddleware;