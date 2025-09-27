const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (authentication required)
router.use(authenticateToken); // All routes below require authentication

router.get('/profile', authController.getProfile);
router.get('/accounts', authController.getUserAccounts);
router.post('/add-account', authController.addAccount);
router.post('/switch-account', authController.switchAccount);
router.delete('/remove-account/:accountId', authController.removeAccount);
router.post('/logout', authController.logout);

module.exports = router;
