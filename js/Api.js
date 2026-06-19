// Api — класс для сетевых запросов (fetch + Firebase Firestore)

class Api {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    // Базовый fetch-запрос
    async _request(url, options = {}) {
        const response = await fetch(url, options); // отправляем запрос
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json(); // парсим ответ из JSON в JS-объект
    }

    // Загрузить товары из Firebase Firestore
    async getProducts() {
        const snapshot = await db.collection('products').get(); // GET-запрос к коллекции "products" в Firestore
        return snapshot.docs.map(doc => doc.data()); // превращаем документы Firestore в массив JS-объектов
    }
    // Дз fetch функция и FakeStoreAPI
    // Получить один случайный товар с FakeStoreAPI (демонстрация внешнего fetch)
    async getFeaturedProduct() {
        const id = Math.floor(Math.random() * 20) + 1;
        return this._request(`https://fakestoreapi.com/products/${id}`); // GET-запрос к внешнему API
    }

    // Сохранить заказ в Firebase Firestore (коллекция "orders")
    async placeOrder(orderData) {
        const docRef = await db.collection('orders').add({
            ...orderData,
            status: 'new',
            createdAt: firebase.firestore.FieldValue.serverTimestamp() // временная метка на сервере
        });
        return { id: docRef.id }; // возвращаем айдии созданного документа
    }

    // Загрузить все заказы из Firestore (для панели модератора)
    async getOrders() {
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc') // сортировка: новые первые
            .get();
        return snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
    }

    // Обновить товар в Firestore (цена и наличие)
    async updateProduct(productId, data) {
        await db.collection('products').doc(String(productId)).update(data);
    }

    // Удалить товар из Firestore
    async deleteProduct(productId) {
        await db.collection('products').doc(String(productId)).delete();
    }

    // Сохранить пользователя в Firestore (коллекция "users") 
    async registerUser(userData) {
        const docRef = await db.collection('users').add({
            name:      userData.name,
            email:     userData.email,
            phone:     userData.phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id };
    }

    // Симуляция отправки формы обратной связи — POST-запрос
    async submitContact(formData) {
        return this._request('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
    }

    // Симуляция входа модератора
    async loginModerator(credentials) {
        return new Promise((resolve, reject) => { // создаём промис вручную для имитации async-запроса
            setTimeout(() => { // задержка 600мс имитирует сетевой запрос
                if (credentials.password === 'mod123') {
                    resolve({ token: 'mock-token-xyz', role: 'moderator' });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 600);
        });
    }
}
