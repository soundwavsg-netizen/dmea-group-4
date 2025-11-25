import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Firebase configuration for dmea-group-4
const firebaseConfig = {
  apiKey: "AIzaSyAE2Qe0XgboJFhWhtGp_0dMpfMR-0mOD64",
  authDomain: "dmea-group-4.firebaseapp.com",
  projectId: "dmea-group-4",
  storageBucket: "dmea-group-4.firebasestorage.app",
  messagingSenderId: "1092350919692",
  appId: "1:1092350919692:web:7c9e5c56d8f0b3a3e4c8d1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { storage };
