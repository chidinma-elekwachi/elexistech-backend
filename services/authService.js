// services/authService.js
import * as SecureStore from 'expo-secure-store';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ACCOUNTS_KEY = 'saved_accounts_v1'; // SecureStore key
const MAX_ACCOUNTS = 15;

/**
 * Account shape:
 * { id, email, password, avatar, username }
 * NOTE: For this assignment we store credentials in SecureStore (demo only).
 */

export async function loadSavedAccounts() {
  const raw = await SecureStore.getItemAsync(ACCOUNTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveAccounts(accounts) {
  if (!Array.isArray(accounts)) accounts = [];
  if (accounts.length > MAX_ACCOUNTS) accounts = accounts.slice(0, MAX_ACCOUNTS);
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function registerAndAddAccount(email, password, username = '', avatar = '') {
  // create user in Firebase Auth
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  console.log("cred: ", cred)
  const uid = cred.user.uid;
  // create user doc
  await setDoc(doc(db, 'users', uid), {
    id: uid,
    name: username || email.split('@')[0],
    avatar: avatar || '',
    email,
    online: true,
    lastSeen: Date.now()
  });
  // add to SecureStore list
  const accounts = await loadSavedAccounts();
  const entry = { id: uid, email, password, avatar: avatar || '', username: username || '' };
  const filtered = accounts.filter(a => a.id !== uid);
  filtered.unshift(entry);
  await saveAccounts(filtered);
  return entry;
}

export async function loginAndAddAccount(email, password, username = '', avatar = '') {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  // ensure user doc exists
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      name: username || email.split('@')[0],
      avatar: avatar || '',
      email,
      online: true,
      lastSeen: Date.now()
    });
  }
  // save to SecureStore accounts
  const accounts = await loadSavedAccounts();
  const entry = { id: uid, email, password, avatar: avatar || '', username: username || '' };
  const filtered = accounts.filter(a => a.id !== uid);
  filtered.unshift(entry);
  await saveAccounts(filtered);
  return entry;
}

export async function switchAccount(entry) {
  // optimistic UI switching should occur on the UI side immediately.
  // Here we perform a silent sign-out + sign-in with stored credentials.
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
  // silent sign-in
  const cred = await signInWithEmailAndPassword(auth, entry.email, entry.password);
  // update lastSeen/online
  await setDoc(doc(db, 'users', cred.user.uid), { online: true, lastSeen: Date.now() }, { merge: true });
  return cred.user;
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
}

export { saveAccounts };
