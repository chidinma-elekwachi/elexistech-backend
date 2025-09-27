// User model for Firestore
class User {
  constructor(data) {
    this.uid = data.uid;
    this.email = data.email;
    this.username = data.username;
    this.avatar = data.avatar;
    this.createdAt = data.createdAt || new Date();
    this.accounts = data.accounts || [];
  }

  // Convert to Firestore document
  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      username: this.username,
      avatar: this.avatar,
      createdAt: this.createdAt,
      accounts: this.accounts
    };
  }

  // Create from Firestore document
  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      uid: doc.id,
      ...data
    });
  }

  // Add account to user
  addAccount(accountData) {
    if (this.accounts.length >= 15) {
      throw new Error('Maximum 15 accounts allowed');
    }

    const newAccount = {
      accountId: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: accountData.username,
      avatar: accountData.avatar || `https://ui-avatars.com/api/?name=${accountData.username}&background=random`,
      email: accountData.email,
      isActive: false,
      createdAt: new Date(),
      firebaseUid: accountData.firebaseUid
    };

    this.accounts.push(newAccount);
    return newAccount;
  }

  // Switch to account
  switchToAccount(accountId) {
    const targetAccount = this.accounts.find(acc => acc.accountId === accountId);
    
    if (!targetAccount) {
      throw new Error('Account not found');
    }

    // Set all accounts to inactive
    this.accounts.forEach(acc => acc.isActive = false);
    
    // Set target account to active
    targetAccount.isActive = true;
    
    // Update user info
    this.username = targetAccount.username;
    this.avatar = targetAccount.avatar;
    this.email = targetAccount.email;

    return targetAccount;
  }

  // Remove account
  removeAccount(accountId) {
    if (this.accounts.length <= 1) {
      throw new Error('Cannot remove the last account');
    }

    const accountIndex = this.accounts.findIndex(acc => acc.accountId === accountId);
    
    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    const removedAccount = this.accounts.splice(accountIndex, 1)[0];

    // If removed account was active, make first account active
    if (removedAccount.isActive && this.accounts.length > 0) {
      this.accounts[0].isActive = true;
      this.username = this.accounts[0].username;
      this.avatar = this.accounts[0].avatar;
      this.email = this.accounts[0].email;
    }

    return removedAccount;
  }

  // Get active account
  getActiveAccount() {
    return this.accounts.find(acc => acc.isActive) || this.accounts[0];
  }
}

module.exports = User;
