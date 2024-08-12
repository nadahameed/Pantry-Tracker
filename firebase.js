// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-uejxGICQTETWXBerYnsJcTZ9G2sXxAU",
  authDomain: "inventory-management-7ef2a.firebaseapp.com",
  projectId: "inventory-management-7ef2a",
  storageBucket: "inventory-management-7ef2a.appspot.com",
  messagingSenderId: "760442122353",
  appId: "1:760442122353:web:18a3b36b1a64eb986d6bd0",
  measurementId: "G-2YHWGFP1DF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}