// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWisEdtCvbtM9MoN0L8pF-57UzyIqDleo",
  authDomain: "college-project-7e53a.firebaseapp.com",
  projectId: "college-project-7e53a",
  storageBucket: "college-project-7e53a.appspot.com",
  messagingSenderId: "944873673168",
  appId: "1:944873673168:web:568c1c4e6772aa4eb7e9d5",
};


// Initialize Firebase
initializeApp(firebaseConfig);

export const db= getFirestore() 
