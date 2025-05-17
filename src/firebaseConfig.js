// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBn9pOj45XErxMfkZl4JE0D8NGSJi4wscA",
  authDomain: "booking-app-nuig.firebaseapp.com",
  projectId: "booking-app-nuig",
  storageBucket: "booking-app-nuig.appspot.com",
  messagingSenderId: "924146889227",
  appId: "1:924146889227:web:a6b4de64f01076930e8d0e",
  measurementId: "G-40DMB5DZD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
