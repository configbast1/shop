//  Toast — класс для показа всплывающих уведомлений (notifications)
class Toast {
    static _container = null; // единственный контейнер для всех toast-уведомлений на странице

    // Возвращает контейнер для toast-ов (или создаёт его, если ещё не существует)
    static _getContainer() {
        if (!this._container) {
            this._container = document.createElement('div'); // создаём div-контейнер
            this._container.className = 'toast-container';   // добавляем CSS-класс для стилизации
            document.body.appendChild(this._container);       // вставляем в конец body
        }
        return this._container; // возвращаем существующий или только что созданный контейнер
    }

    // Показывает одно уведомление
    // message — текст, type — тип ('info', 'success', 'error'), duration — время показа в мс
    static show(message, type = 'info', duration = 3000) {
        const c = this._getContainer();              // получаем контейнер
        const el = document.createElement('div');    // создаём элемент уведомления
        el.className = `toast toast--${type}`;       // класс определяет цвет (success=зелёный, error=красный)
        el.textContent = message;                    // устанавливаем текст
        c.appendChild(el);                           // добавляем в контейнер (появляется на экране)
        setTimeout(() => el.remove(), duration);     // через duration мс автоматически удаляем
    }
}

//  App — главный класс страницы каталога товаров
class App {
    constructor() {
        this.api      = new Api('./');  // объект для запросов к Firestore
        this.cart     = new Cart();     // объект корзины (хранит данные в cookie)
        this.products = [];             // полный список товаров из базы данных
        this.filtered = [];             // отфильтрованный список (то что отображается сейчас)
    }

    // Инициализация: запускается при загрузке страницы
    async init() {
        this._updateCartBadge(); // сразу показываем количество товаров в корзине

        const grid = document.getElementById('product-grid'); // находим сетку товаров в HTML
        if (!grid) return; // если сетки нет — выходим (мы не на странице каталога)

        // Показываем спиннер (анимацию загрузки) пока грузятся товары
        grid.innerHTML = '<div class="spinner"></div>';

        try {
            const data    = await this.api.getProducts();        // запрос к Firestore за товарами
            this.products = data.map(d => new Product(d));       // превращаем каждый объект в класс Product
            this.filtered = [...this.products];                   // изначально фильтр = все товары
            this._render();                                       // рисуем карточки товаров
            this._bindFilters();                                  // подключаем поиск и фильтры
            this._bindAddToCart();                                // подключаем кнопки "Add to Cart"
        } catch (err) {
            // Если произошла ошибка — показываем сообщение вместо товаров
            grid.innerHTML = `<p style="color:var(--danger);padding:32px">Failed to load products: ${err.message}</p>`;
        }
    }

    // Рисует (или перерисовывает) карточки товаров в сетке
    _render() {
        const grid = document.getElementById('product-grid'); // находим сетку
        if (!grid) return; // защита: если элемента нет — ничего не делаем

        if (this.filtered.length === 0) {
            // Если после фильтрации ничего не найдено — показываем пустое состояние
            grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state__icon">🔍</div>
          <p class="empty-state__text">No products found</p>
        </div>`;
            return;
        }

        // Генерируем HTML для каждого товара и вставляем в сетку
        grid.innerHTML = this.filtered.map(p => p.toCardHTML()).join('');
    }

    // Подключает обработчики событий для поиска, фильтра категорий и сортировки
    _bindFilters() {
        const searchEl   = document.getElementById('search');          // поле поиска
        const categoryEl = document.getElementById('filter-category'); // выпадающий список категорий
        const sortEl     = document.getElementById('filter-sort');     // выпадающий список сортировки

        // Функция apply — вызывается каждый раз, когда меняется поиск/фильтр/сортировка
        const apply = () => {
            const q   = searchEl?.value.toLowerCase().trim() || '';  // текст поиска (маленькие буквы)
            const cat = categoryEl?.value || '';                      // выбранная категория
            const sort= sortEl?.value || '';                          // выбранный тип сортировки

            // Фильтруем: оставляем товары, которые соответствуют поиску И категории
            this.filtered = this.products
                .filter(p =>
                    (!q   || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
                    (!cat || p.category === cat)
                );

            // Сортируем отфильтрованные товары по выбранному критерию
            if (sort === 'price-asc')  this.filtered.sort((a,b) => a.price - b.price);   // цена: от меньшей
            if (sort === 'price-desc') this.filtered.sort((a,b) => b.price - a.price);   // цена: от большей
            if (sort === 'rating')     this.filtered.sort((a,b) => b.rating - a.rating); // рейтинг: от высшего

            this._render();         // перерисовываем сетку с новым списком
            this._bindAddToCart();  // повторно подключаем кнопки (т.к. карточки перерисовались)
        };

        // Слушаем изменения в полях — при каждом изменении вызываем apply()
        searchEl?.addEventListener('input', apply);
        categoryEl?.addEventListener('change', apply);
        sortEl?.addEventListener('change', apply);
    }

    // Подключает обработчики клика для всех кнопок "Add to Cart" на странице
    _bindAddToCart() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.currentTarget.dataset.id); // читаем id товара из атрибута data-id
                this.cart.add(id);          // добавляем товар в корзину
                this._updateCartBadge();    // обновляем счётчик на иконке корзины
                Toast.show('Added to cart ✓', 'success'); // показываем зелёное уведомление

                // Микро-анимация: временно меняем текст кнопки
                e.currentTarget.textContent = 'Added!';
                setTimeout(() => { e.currentTarget.textContent = 'Add to Cart'; }, 1200); // через 1.2с возвращаем
            });
        });
    }

    // Обновляет числовой значок на иконке корзины (сколько товаров в корзине)
    _updateCartBadge() {
        const el = document.getElementById('cart-count'); // находим элемент счётчика
        if (el) el.textContent = this.cart.totalItems;    // устанавливаем общее количество товаров
    }
}

//  Boot — запуск приложения после полной загрузки HTML
document.addEventListener('DOMContentLoaded', () => {
    const app = new App(); // создаём экземпляр главного класса
    app.init();            // запускаем инициализацию (загрузка товаров и т.д.)
});
