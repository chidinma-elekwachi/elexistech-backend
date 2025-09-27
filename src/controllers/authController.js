const authService = require('../services/authService');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, username, avatar } = req.body;

      // Validation
      if (!email || !password || !username) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and username are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      const result = await authService.register(email, password, username, avatar);

      res.status(201).json(result);
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await authService.login(email, password);

      res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  // Add new account
  async addAccount(req, res) {
    try {
      const { email, password, username, avatar } = req.body;
      const userId = req.user.uid;

      // Validation
      if (!email || !password || !username) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and username are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
      }

      const result = await authService.addAccount(userId, email, password, username, avatar);

      res.status(201).json(result);
    } catch (error) {
      console.error('Add account error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Switch account
  async switchAccount(req, res) {
    try {
      const { accountId } = req.body;
      const userId = req.user.uid;

      // Validation
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'Account ID is required'
        });
      }

      const result = await authService.switchAccount(userId, accountId);

      res.status(200).json(result);
    } catch (error) {
      console.error('Switch account error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get user accounts
  async getUserAccounts(req, res) {
    try {
      const userId = req.user.uid;

      const result = await authService.getUserAccounts(userId);

      res.status(200).json(result);
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Remove account
  async removeAccount(req, res) {
    try {
      const { accountId } = req.params;
      const userId = req.user.uid;

      // Validation
      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: 'Account ID is required'
        });
      }

      const result = await authService.removeAccount(userId, accountId);

      res.status(200).json(result);
    } catch (error) {
      console.error('Remove account error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.uid;

      const result = await authService.getUserAccounts(userId);

      res.status(200).json({
        success: true,
        user: {
          uid: userId,
          ...result.user
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Logout (client-side token removal)
  async logout(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }
}

module.exports = new AuthController();
