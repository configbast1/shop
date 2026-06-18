//  server.js — Express сервер NexusShop
//  Файл находится в папке js/, обслуживает корень проекта
//  Запуск: npm start (из корня) или node js/server.js

const express = require("express");
const path    = require("path");
const admin   = require("firebase-admin");

//  Firebase Admin — инициализация
//
//  Локально:  serviceAccountKey.json лежит в корне проекта (C:\shop)
//  На Render: Environment → добавьте FIREBASE_SERVICE_ACCOUNT
//             (вставьте весь JSON файла как одну строку)
let db = null;

try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)       // Render — из env переменной
        : require("../serviceAccountKey.json");                   // локально — из корня проекта

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    db = admin.firestore();
    console.log("✅ Firebase Admin подключён к Firestore");
} catch (err) {
    console.warn("⚠️  Firebase Admin не инициализирован:", err.message);
}

//  Express — настройка
const app = express();
app.use(express.json());

// Статические файлы из корня проекта (HTML, CSS, JS, картинки)
app.use(express.static(path.join(__dirname, "..")));

//  Маршруты — статические страницы
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

//  API — Firestore (через Admin SDK)

// GET /api/status — проверка подключения к Firestore
app.get("/api/status", async (req, res) => {
    if (!db) return res.json({ firestore: false, message: "Firebase Admin не инициализирован" });
    try {
        await db.collection("products").limit(1).get();
        res.json({ firestore: true, status: "OK", message: "Firestore подключён успешно!" });
    } catch (err) {
        res.json({ firestore: false, error: err.message });
    }
});

// GET /api/products — получить все товары из Firestore
app.get("/api/products", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Firestore недоступен" });
    try {
        const snapshot = await db.collection("products").get();
        const products = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders — получить все заказы из Firestore
app.get("/api/orders", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Firestore недоступен" });
    try {
        const snapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
        const orders = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users — количество зарегистрированных пользователей
app.get("/api/users", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Firestore недоступен" });
    try {
        const snapshot = await db.collection("users").get();
        res.json({ count: snapshot.size });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`📊 Статус Firestore: http://localhost:${PORT}/api/status`);
});
