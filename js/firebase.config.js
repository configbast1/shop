//  Firebase конфіг — вставте свої дані з Firebase Console
//  Project Settings → Your apps → SDK setup and configuration

const firebaseConfig = {
    apiKey:            "AIzaSyCoZHnkcf4QlpISr6_a1CfeLTsn4ju4Dng",
    authDomain:        "stell-1160d.firebaseapp.com",
    projectId:         "stell-1160d",
    storageBucket:     "stell-1160d.firebasestorage.app",
    messagingSenderId: "904929369138",
    appId:             "1:904929369138:web:02dd32bf142d00b313b02b",
    measurementId:     "G-YZ38TPEQ9F"
};

// Ініціалізація Firebase
firebase.initializeApp(firebaseConfig);

// Отримуємо Firestore
const db = firebase.firestore();
