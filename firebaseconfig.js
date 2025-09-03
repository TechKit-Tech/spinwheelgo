import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBEc-f-0_JFeZpgwzNluzdSo-sfA93ikbo",
    authDomain: "spinwheelgo.firebaseapp.com",
    projectId: "spinwheelgo",
    storageBucket: "spinwheelgo.firebasestorage.app",
    messagingSenderId: "123003812538",
    appId: "1:123003812538:web:24c8d783a343603873e083"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };