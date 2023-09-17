// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJEVbpMa1KQMBeWu2S4eUgGSGZX-giym0",
  authDomain: "fluxus-cd802.firebaseapp.com",
  projectId: "fluxus-cd802",
  storageBucket: "fluxus-cd802.appspot.com",
  messagingSenderId: "221801529894",
  appId: "1:221801529894:web:764165412e64f334c89ce7",
  measurementId: "G-B16BFR2CGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const fdb = getFirestore(app);
