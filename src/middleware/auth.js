const authService = require('../services/authService');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Add user info to request
    req.user = {
      uid: decoded.uid,
      type: decoded.type
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Optional authentication middleware (for routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = authService.verifyToken(token);
      req.user = {
        uid: decoded.uid,
        type: decoded.type
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Admin authentication middleware (for future use)
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = authService.verifyToken(token);
    
    // Check if user is admin (you can implement admin logic here)
    // For now, we'll just check if the token is valid
    req.user = {
      uid: decoded.uid,
      type: decoded.type,
      isAdmin: true // You can add admin check logic here
    };

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired admin token'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authenticateAdmin
};
