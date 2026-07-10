import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Replace these with your actual keys from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDXy8C0OV1gtxkECaXEEjNf6QZqscOUIxU",
  authDomain: "angry-birds-2-8b114.firebaseapp.com",
  projectId: "angry-birds-2-8b114",
  storageBucket: "angry-birds-2-8b114.firebasestorage.app",
  messagingSenderId: "1057295586073",
  appId: "1:1057295586073:web:4d98bb8381bf2410fb6b88",
  measurementId: "G-MCYEJ83X8Z"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);

// auth is the object that will let you do sign in, sign up and login .
