// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzXnpEMCQYBpJtyGN2_90y7hY3MsocrKc",
  authDomain: "assemblyhub-acfb0.firebaseapp.com",
  projectId: "assemblyhub-acfb0",
  storageBucket: "assemblyhub-acfb0.firebasestorage.app",
  messagingSenderId: "650700463959",
  appId: "1:650700463959:web:23bd92bc9ac9b97ba36812",
  measurementId: "G-BQBC6PB7ZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
