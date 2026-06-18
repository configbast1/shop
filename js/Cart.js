// Cart — класс корзины, хранит данные в cookie браузера
// Структура items: { "1": 2, "3": 1 } — id товара → количество

class Cart {
    constructor() {
        this.items = this._load(); // при создании сразу загружаем корзину из cookie
    }

    // Записывает cookie в браузер
    // name — название cookie, value — значение, days — срок хранения в днях (по умолчанию 7)
    static setCookie(name, value, days = 7) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString(); // дата истечения в UTC
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`; // записываем cookie
    }

    // Читает значение cookie по названию
    // Возвращает строку или undefined, если cookie не найден
    static getCookie(name) {
        return document.cookie
            .split('; ')                               // разбиваем все cookie через '; '
            .find(row => row.startsWith(name + '='))  // находим нужный
            ?.split('=')[1];                           // берём значение после '='
    }

    // Сохраняет текущее состояние корзины (this.items) в cookie
    _save() {
        Cart.setCookie('cart', JSON.stringify(this.items)); // сериализуем объект в JSON-строку и сохраняем
    }

    // Загружает корзину из cookie при старте
    _load() {
        const raw = Cart.getCookie('cart'); // читаем raw строку из cookie
        try {
            return raw ? JSON.parse(decodeURIComponent(raw)) : {}; // парсим JSON или возвращаем пустой объект
        } catch {
            return {}; // если данные повреждены — возвращаем пустую корзину
        }
    }

    // Добавляет товар в корзину
    // productId — id товара, qty — количество (по умолчанию 1)
    add(productId, qty = 1) {
        const key = String(productId);                    // ключ всегда строка (надёжнее чем число)
        this.items[key] = (this.items[key] || 0) + qty;  // увеличиваем количество (или начинаем с 0)
        this._save();                                     // сохраняем обновлённую корзину в cookie
    }

    // Полностью удаляет товар из корзины (независимо от количества)
    remove(productId) {
        delete this.items[String(productId)]; // удаляем ключ из объекта
        this._save();                         // сохраняем изменения
    }

    // Устанавливает конкретное количество товара
    // Если qty <= 0 — товар удаляется из корзины
    update(productId, qty) {
        if (qty <= 0) {
            this.remove(productId); // если количество 0 или меньше — удаляем товар
        } else {
            this.items[String(productId)] = qty; // устанавливаем новое количество
            this._save();                        // сохраняем
        }
    }

    // Полностью очищает корзину
    clear() {
        this.items = {}; // сбрасываем объект до пустого
        this._save();    // сохраняем пустое состояние в cookie
    }

    // Геттер: возвращает общее количество единиц товаров в корзине
    // Например: { "1": 2, "3": 1 } → 3
    get totalItems() {
        return Object.values(this.items).reduce((s, q) => s + q, 0); // суммируем все количества
    }

    // Возвращает количество конкретного товара в корзине (или 0, если его нет)
    getQuantity(productId) {
        return this.items[String(productId)] || 0;
    }

    // Возвращает массив объектов { product, qty } для отображения в корзине
    // products — полный массив товаров (для поиска данных по id)
    getEntries(products) {
        return Object.entries(this.items)               // [ ['1', 2], ['3', 1] ]
            .map(([id, qty]) => ({
                product: products.find(p => String(p.id) === id), // находим объект товара по id
                qty                                               // количество из корзины
            }))
            .filter(e => e.product); // фильтруем: убираем товары, которых нет в products
    }

    // Рассчитывает общую сумму заказа
    // products — массив всех товаров (для получения цены)
    calcTotal(products) {
        return this.getEntries(products)
            .reduce((sum, { product, qty }) => sum + product.price * qty, 0); // цена × количество для каждого
    }
}
