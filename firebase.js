import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDbZ3w_SgZb29yGt31KVmPgo3chyve9_RA",
  authDomain: "elexis-test.firebaseapp.com",
  projectId: "elexis-test",
  storageBucket: "elexis-test.firebasestorage.app",
  messagingSenderId: "1063743330510",
  appId: "1:1063743330510:web:dd644b177c467e3005589f",
  measurementId: "G-Z1HL2QC315",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
