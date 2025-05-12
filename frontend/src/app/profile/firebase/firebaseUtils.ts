// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvaFNyX3e3VoIEyCt1RJJ7STZI0kuuLVg",
  authDomain: "term-project-4683d.firebaseapp.com",
  projectId: "term-project-4683d",
  storageBucket: "term-project-4683d.firebasestorage.app",
  messagingSenderId: "619650738784",
  appId: "1:619650738784:web:abad282ca64b734eb5b105"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
