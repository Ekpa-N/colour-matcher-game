import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDU-V9KlpVrHiAW2A8kCKZKnc1NOF6oE0o",
    authDomain: "colour-matcher.firebaseapp.com",
    projectId: "colour-matcher",
    storageBucket: "colour-matcher.firebasestorage.app",
    messagingSenderId: "124683519101",
    appId: "1:124683519101:web:4475ea160a6ae2efd7dd14"
};


const app = initializeApp(firebaseConfig);
// const realtimeApp = initializeApp(realtimeConfig);

export const db = getFirestore(app);
// export const realtimeDB = getFirestore(realtimeApp);
