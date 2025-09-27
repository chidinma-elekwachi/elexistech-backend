const jwt = require('jsonwebtoken');
const { getAuth } = require('../../config/database');

class AuthService {
  constructor() {
    this.auth = getAuth();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    // In-memory storage for user accounts (up to 15 per user)
    this.userAccounts = new Map();
  }

  // Register a new user
  async register(email, password, username, avatar = null) {
    try {
      // Create user in Firebase Auth
      const userRecord = await this.auth.createUser({
        email,
        password,
        displayName: username,
        photoURL: avatar
      });

      // Create initial account data
      const accountData = {
        accountId: this.generateAccountId(),
        username,
        avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random`,
        email,
        isActive: true,
        createdAt: new Date()
      };

      // Store user accounts in memory
      this.userAccounts.set(userRecord.uid, [accountData]);

      // Generate JWT token
      const token = this.generateToken(userRecord.uid);

      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email,
          username,
          avatar: accountData.avatar,
          accounts: [accountData]
        },
        token,
        message: 'User registered successfully'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Get user from Firebase Auth
      const userRecord = await this.auth.getUserByEmail(email);
      
      // Get user accounts from memory
      let accounts = this.userAccounts.get(userRecord.uid) || [];
      
      // If no accounts in memory, create default account
      if (accounts.length === 0) {
        const defaultAccount = {
          accountId: this.generateAccountId(),
          username: userRecord.displayName || 'User',
          avatar: userRecord.photoURL || `https://ui-avatars.com/api/?name=${userRecord.displayName || 'User'}&background=random`,
          email: userRecord.email,
          isActive: true,
          createdAt: new Date()
        };
        accounts = [defaultAccount];
        this.userAccounts.set(userRecord.uid, accounts);
      }

      // Get active account
      const activeAccount = accounts.find(acc => acc.isActive) || accounts[0];

      // Generate JWT token
      const token = this.generateToken(userRecord.uid);

      return {
        success: true,
        user: {
          uid: userRecord.uid,
          email: activeAccount.email,
          username: activeAccount.username,
          avatar: activeAccount.avatar,
          accounts: accounts
        },
        token,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Add new account to existing user
  async addAccount(userId, email, password, username, avatar = null) {
    try {
      // Get current accounts
      const accounts = this.userAccounts.get(userId) || [];

      // Check if user already has 15 accounts
      if (accounts.length >= 15) {
        throw new Error('Maximum 15 accounts allowed');
      }

      // Create new account in Firebase Auth
      const userRecord = await this.auth.createUser({
        email,
        password,
        displayName: username,
        photoURL: avatar
      });

      // Create new account object
      const newAccount = {
        accountId: this.generateAccountId(),
        username,
        avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random`,
        email,
        isActive: false,
        createdAt: new Date(),
        firebaseUid: userRecord.uid
      };

      // Add account to user's accounts array
      const updatedAccounts = [...accounts, newAccount];

      // Update in-memory storage
      this.userAccounts.set(userId, updatedAccounts);

      return {
        success: true,
        account: newAccount,
        message: 'Account added successfully'
      };
    } catch (error) {
      console.error('Add account error:', error);
      throw new Error(error.message || 'Failed to add account');
    }
  }

  // Switch to different account
  async switchAccount(userId, accountId) {
    try {
      // Get current accounts
      const accounts = this.userAccounts.get(userId) || [];

      // Find the account to switch to
      const targetAccount = accounts.find(acc => acc.accountId === accountId);
      
      if (!targetAccount) {
        throw new Error('Account not found');
      }

      // Update all accounts to inactive, then set target as active
      const updatedAccounts = accounts.map(acc => ({
        ...acc,
        isActive: acc.accountId === accountId
      }));

      // Update in-memory storage
      this.userAccounts.set(userId, updatedAccounts);

      // Generate new token for the switched account
      const token = this.generateToken(userId);

      return {
        success: true,
        user: {
          uid: userId,
          email: targetAccount.email,
          username: targetAccount.username,
          avatar: targetAccount.avatar,
          accounts: updatedAccounts
        },
        token,
        message: 'Account switched successfully'
      };
    } catch (error) {
      console.error('Switch account error:', error);
      throw new Error(error.message || 'Failed to switch account');
    }
  }

  // Get user accounts
  async getUserAccounts(userId) {
    try {
      const accounts = this.userAccounts.get(userId) || [];
      return {
        success: true,
        accounts: accounts
      };
    } catch (error) {
      console.error('Get accounts error:', error);
      throw new Error(error.message || 'Failed to get accounts');
    }
  }

  // Remove account
  async removeAccount(userId, accountId) {
    try {
      const accounts = this.userAccounts.get(userId) || [];

      // Check if trying to remove the last account
      if (accounts.length <= 1) {
        throw new Error('Cannot remove the last account');
      }

      // Find account to remove
      const accountToRemove = accounts.find(acc => acc.accountId === accountId);
      
      if (!accountToRemove) {
        throw new Error('Account not found');
      }

      // Remove account from array
      const updatedAccounts = accounts.filter(acc => acc.accountId !== accountId);

      // If removing active account, make first account active
      if (accountToRemove.isActive && updatedAccounts.length > 0) {
        updatedAccounts[0].isActive = true;
      }

      // Update in-memory storage
      this.userAccounts.set(userId, updatedAccounts);

      // Delete Firebase Auth user if it exists
      if (accountToRemove.firebaseUid) {
        try {
          await this.auth.deleteUser(accountToRemove.firebaseUid);
        } catch (error) {
          console.warn('Failed to delete Firebase Auth user:', error.message);
        }
      }

      return {
        success: true,
        message: 'Account removed successfully'
      };
    } catch (error) {
      console.error('Remove account error:', error);
      throw new Error(error.message || 'Failed to remove account');
    }
  }

  // Generate JWT token
  generateToken(uid) {
    return jwt.sign(
      { uid, type: 'access' },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Generate unique account ID
  generateAccountId() {
    return 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new AuthService();
