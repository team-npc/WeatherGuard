import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9_HiVzTQNxTYWcf0I_p6ZztGVNIJwHbU",
  authDomain: "realestate-456c4.firebaseapp.com",
  projectId: "realestate-456c4",
  storageBucket: "realestate-456c4.firebasestorage.app",
  messagingSenderId: "628551361975",
  appId: "1:628551361975:web:b1b142fc82678d11af3432",
  measurementId: "G-VT0F7YRT1H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Analytics will be initialized separately when needed
export const analytics = null;

export default app;
