import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCWWRWiiU-vUT5gneVXbIZG-N66KRBrjSc",
  authDomain: "readeaseai-48f4c.firebaseapp.com",
  projectId: "readeaseai-48f4c",
  storageBucket: "readeaseai-48f4c.firebasestorage.app",
  messagingSenderId: "504093171936",
  appId: "1:504093171936:web:71312ebc79efe67148b085"
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