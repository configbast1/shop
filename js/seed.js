//  seed.js — скрипт для заповнення Firebase Firestore товарами
//  Запуск: node js/seed.js
//  Потрібно: npm install firebase-admin

const admin = require('firebase-admin');

// Завантажуємо ключ сервісного акаунта
// Скачати з: Firebase Console → Project Settings → Service accounts → Generate new private key
// Ключ лежит в корне проекта (C:\shop\serviceAccountKey.json)
let serviceAccount;
try {
    serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : require('../serviceAccountKey.json');
} catch (err) {
    console.error('❌ serviceAccountKey.json не найден в корне проекта!');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

//  Дані товарів
const products = [
    {
        id: 1,
        name: "SteelSeries Arctis Nova Pro",
        category: "Headsets",
        price: 349.99,
        rating: 4.8,
        stock: 15,
        brand: "SteelSeries",
        color: "Black",
        warranty: "2 years",
        connectivity: "USB / 3.5mm",
        weight: "336g",
        image: "🎧",
        description: "Premium gaming headset with active noise cancellation and hi-res audio."
    },
    {
        id: 2,
        name: "Logitech G Pro X Superlight 2",
        category: "Mice",
        price: 159.99,
        rating: 4.9,
        stock: 30,
        brand: "Logitech",
        color: "White",
        warranty: "2 years",
        connectivity: "Wireless (2.4GHz)",
        weight: "60g",
        image: "🖱️",
        description: "Ultra-lightweight wireless gaming mouse with HERO 25K sensor."
    },
    {
        id: 3,
        name: "Razer BlackWidow V4 Pro",
        category: "Keyboards",
        price: 229.99,
        rating: 4.7,
        stock: 20,
        brand: "Razer",
        color: "Black",
        warranty: "2 years",
        connectivity: "USB / Bluetooth",
        weight: "1.44kg",
        image: "⌨️",
        description: "Mechanical gaming keyboard with Razer Yellow switches and RGB lighting."
    },
    {
        id: 4,
        name: "ASUS ROG Swift OLED PG27AQDM",
        category: "Monitors",
        price: 799.99,
        rating: 4.9,
        stock: 8,
        brand: "ASUS",
        color: "Black",
        warranty: "3 years",
        connectivity: "HDMI 2.1 / DisplayPort 1.4",
        weight: "5.8kg",
        image: "🖥️",
        description: "27\" OLED 240Hz gaming monitor with 0.03ms response time."
    },
    {
        id: 5,
        name: "HyperX Cloud Alpha Wireless",
        category: "Headsets",
        price: 199.99,
        rating: 4.6,
        stock: 25,
        brand: "HyperX",
        color: "Red/Black",
        warranty: "2 years",
        connectivity: "Wireless (2.4GHz)",
        weight: "335g",
        image: "🎧",
        description: "Wireless gaming headset with up to 300 hours battery life."
    },
    {
        id: 6,
        name: "Razer DeathAdder V3 HyperSpeed",
        category: "Mice",
        price: 89.99,
        rating: 4.7,
        stock: 27,
        brand: "Razer",
        color: "Black",
        warranty: "2 years",
        connectivity: "Wireless (2.4GHz)",
        weight: "75g",
        image: "🖱️",
        description: "Ergonomic wireless gaming mouse with Focus X 26K optical sensor."
    }
];

//  Завантаження в Firestore
async function seed() {
    console.log('🚀 Починаємо заповнення Firestore...');

    const batch = db.batch(); // batch = групова операція (швидше ніж по одному)

    products.forEach(product => {
        const ref = db.collection('products').doc(String(product.id)); // колекція "products", документ = id товару
        batch.set(ref, product); // додаємо товар в batch
    });

    await batch.commit(); // відправляємо всі товари одним запитом

    console.log(`✅ Успішно додано ${products.length} товарів у Firestore!`);
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Помилка:', err);
    process.exit(1);
});
