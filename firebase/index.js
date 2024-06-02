import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWHp2YPcD3COef3f4lNl7Z4ImxzD95_9k",
    authDomain: "colour-matcher-2e7cd.firebaseapp.com",
    projectId: "colour-matcher-2e7cd",
    storageBucket: "colour-matcher-2e7cd.appspot.com",
    messagingSenderId: "114302589176",
    appId: "1:114302589176:web:ad2e879a70c12a5d9cc30d",
    measurementId: "G-LLWHCT0P7B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
