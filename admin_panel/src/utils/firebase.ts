import { initializeApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCG_uNGAek8__J8h4-ibAFlD3oUeQC3ysM",
  authDomain: "pivony-case-study.firebaseapp.com",
  databaseURL:
    "https://pivony-case-study-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pivony-case-study",
  storageBucket: "pivony-case-study.appspot.com",
  messagingSenderId: "947214991477",
  appId: "1:947214991477:web:cc63c5b8176ed84662f83c",
  measurementId: "G-PHBMX1H7SD",
};

// Initialize Firebase
export const firebase: FirebaseApp = initializeApp(firebaseConfig);
export const firestore: Firestore = getFirestore(firebase);
