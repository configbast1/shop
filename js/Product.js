//  Product — класс для представления одного товара
//  Каждый объект из Firestore превращается в экземпляр этого класса
class Product {
    // Конструктор принимает объект с данными товара (деструктуризация)
    constructor({ id, name, category, price, rating, stock,
                    brand, color, warranty, connectivity, weight,
                    image, description }) {
        this.id           = id;           // уникальный числовой идентификатор
        this.name         = name;         // название товара
        this.category     = category;     // категория (Headsets, Mice, Keyboards, Monitors)
        this.price        = price;        // цена (число, например 349.99)
        this.rating       = rating;       // рейтинг от 1 до 5 (например 4.8)
        this.stock        = stock;        // количество на складе
        this.brand        = brand;        // производитель (SteelSeries, Logitech и т.д.)
        this.color        = color;        // цвет товара
        this.warranty     = warranty;     // гарантия (например "2 years")
        this.connectivity = connectivity; // тип подключения (USB, Wireless и т.д.)
        this.weight       = weight;       // вес товара
        this.image        = image;        // эмодзи-иконка товара (🎧, 🖱️ и т.д.)
        this.description  = description;  // короткое описание товара
    }

    // Геттер: возвращает цену в формате "$349.99" (всегда 2 знака после точки)
    get formattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }

    // Геттер: возвращает строку со звёздочками рейтинга (например "★★★★½☆")
    get stars() {
        const full  = Math.floor(this.rating);          // количество полных звёзд
        const half  = this.rating % 1 >= 0.5 ? 1 : 0;  // есть ли половинная звезда
        const empty = 5 - full - half;                  // пустые звёзды до 5
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty); // составляем строку
    }

    // Геттер: возвращает true если товар есть в наличии (stock > 0)
    get inStock() {
        return this.stock > 0;
    }

    // Генерирует HTML-строку карточки товара для вставки в сетку каталога
    toCardHTML() {
        // Значок наличия: зелёный "In Stock: N" или красный "Out of Stock"
        const stockBadge = this.inStock
            ? `<span class="badge badge--stock">In Stock: ${this.stock}</span>`
            : `<span class="badge badge--out">Out of Stock</span>`;

        // Возвращаем HTML-шаблон карточки со всеми данными товара
        return `
      <article class="product-card" data-id="${this.id}">
        <div class="product-card__emoji">${this.image}</div>
        <div class="product-card__body">
          <span class="product-card__category">${this.category}</span>
          <h3 class="product-card__name">${this.name}</h3>
          <p class="product-card__desc">${this.description}</p>

          <ul class="product-card__specs">
            <li><span>Brand</span><strong>${this.brand}</strong></li>
            <li><span>Color</span><strong>${this.color}</strong></li>
            <li><span>Connectivity</span><strong>${this.connectivity}</strong></li>
            <li><span>Weight</span><strong>${this.weight}</strong></li>
            <li><span>Warranty</span><strong>${this.warranty}</strong></li>
            <li><span>Rating</span><strong>${this.stars} (${this.rating})</strong></li>
          </ul>

          <div class="product-card__footer">
            <span class="product-card__price">${this.formattedPrice}</span>
            ${stockBadge}
            ${this.inStock
            ? `<button class="btn btn--primary add-to-cart" data-id="${this.id}">Add to Cart</button>`
            : `<button class="btn btn--disabled" disabled>Unavailable</button>`
        }
          </div>
        </div>
      </article>`;
    }
}
