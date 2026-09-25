import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ6YdQezbyYixhwoOi3fvlmKElY-zImPA",
  authDomain: "baryolink-tubod.firebaseapp.com",
  projectId: "baryolink-tubod",
  storageBucket: "baryolink-tubod.firebasestorage.app",
  messagingSenderId: "272951367405",
  appId: "1:272951367405:web:c8680c010e713f8b161ee4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);