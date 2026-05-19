// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXUFndAk0wnBohGpYbtSx9br1bENb2Qvk",
  authDomain: "duansinhnhat.firebaseapp.com",
  projectId: "duansinhnhat",
  storageBucket: "duansinhnhat.firebasestorage.app",
  messagingSenderId: "502502940373",
  appId: "1:502502940373:web:8db44df918bf88df4c4c5c",
  measurementId: "G-Z5GTD3BGWK",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
};
