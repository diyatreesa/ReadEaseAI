import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyD-HUU_MLYS6JxeO1TAfJ8ArWpmw__6gwU",
  authDomain: "readeaseai.firebaseapp.com",
  projectId: "readeaseai",
  storageBucket: "readeaseai.firebasestorage.app",
  messagingSenderId: "132925742451",
  appId: "1:132925742451:web:ec47b61b4b889437b3b906"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase Authentication
const auth = getAuth(app);


// Firestore Database
const db = getFirestore(app);


// Firebase Storage
const storage = getStorage(app);


// Export everything
export {
  app,
  auth,
  db,
  storage
};