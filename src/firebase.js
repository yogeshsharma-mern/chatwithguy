// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD434Fijtu5Nr28VW_Q4v0ZS899SQZpPVc",
  authDomain: "push-notification-82194.firebaseapp.com",
  projectId: "push-notification-82194",
  storageBucket: "push-notification-82194.appspot.com",
  messagingSenderId: "133822818220",
  appId: "1:133822818220:web:503f0764fbd47064cabc09",
  measurementId: "G-B20CF7GL6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
