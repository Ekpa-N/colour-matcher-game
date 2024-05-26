import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDU-V9KlpVrHiAW2A8kCKZKnc1NOF6oE0o",
    authDomain: "colour-matcher.firebaseapp.com",
    projectId: "colour-matcher",
    storageBucket: "colour-matcher.appspot.com",
    messagingSenderId: "124683519101",
    appId: "1:124683519101:web:4475ea160a6ae2efd7dd14"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
