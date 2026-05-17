import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5Rhk7INWk0ky1ghlRoB2KedLKWLhccLE",
  authDomain: "strong-e900b.firebaseapp.com",
  projectId: "strong-e900b",
  storageBucket: "strong-e900b.firebasestorage.app",
  messagingSenderId: "1066960946729",
  appId: "1:1066960946729:web:e9848432242b357840be38"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
