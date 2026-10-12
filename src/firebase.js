import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiTslWRyGeLuDIVypdZz469dslRkxlgBc",
  authDomain: "dgjhb-6831e.firebaseapp.com",
  projectId: "dgjhb-6831e",
  storageBucket: "dgjhb-6831e.firebasestorage.app",
  messagingSenderId: "665256654676",
  appId: "1:665256654676:web:0ef47f464c07014c9b3ac1",
  measurementId: "G-XB4RMV3VZK"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "default");