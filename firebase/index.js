import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// TODO: Replace the following with your app's Firebase project configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyCWHp2YPcD3COef3f4lNl7Z4ImxzD95_9k",
//     authDomain: "colour-matcher.firebaseapp.com",
//     projectId: "colour-matcher",
//     storageBucket: "colour-matcher.appspot.com",
//     messagingSenderId: "114302589176",
//     appId: "1:114302589176:web:ad2e879a70c12a5d9cc30d",
//     measurementId: "G-LLWHCT0P7B"
// };

const firebaseConfig = {
    apiKey: "AIzaSyDU-V9KlpVrHiAW2A8kCKZKnc1NOF6oE0o",
    authDomain: "colour-matcher.firebaseapp.com",
    projectId: "colour-matcher",
    storageBucket: "colour-matcher.firebasestorage.app",
    messagingSenderId: "124683519101",
    appId: "1:124683519101:web:4475ea160a6ae2efd7dd14"
};


//Realtime Database
// const realtimeConfig = {
//     apiKey: "AIzaSyBQryOlqVduz_MeOPYTVwAgiz44YkTgWus",
//     authDomain: "colour-matcher-realtime-app.firebaseapp.com",
//     databaseURL: "https://colour-matcher-realtime-app-default-rtdb.firebaseio.com",
//     projectId: "colour-matcher-realtime-app",
//     storageBucket: "colour-matcher-realtime-app.appspot.com",
//     messagingSenderId: "1080704217300",
//     appId: "1:1080704217300:web:95f5b362d39c529c6f4b41",
//     measurementId: "G-M9Y9K88583"
// };

const app = initializeApp(firebaseConfig);
// const realtimeApp = initializeApp(realtimeConfig);

export const db = getFirestore(app);
// export const realtimeDB = getFirestore(realtimeApp);
