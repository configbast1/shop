//  Validator — класс для валидации HTML-форм
//  Использование: new Validator(formElement)
class Validator {
    // form — DOM-элемент формы (<form>), которую будем валидировать
    constructor(form) {
        this.form = form;   // сохраняем ссылку на форму
        this.errors = {};   // объект для хранения ошибок: { fieldName: 'текст ошибки' }
    }

    // Статические правила валидации — набор готовых функций-проверок
    // Каждое правило: функция(value) → строка ошибки или null (если OK)
    static rules = {
        // Обязательное поле — не может быть пустым или состоять из пробелов
        required: (value) => {
            if (!value || !value.toString().trim()) {
                return 'Это поле является обязательным'; // возвращаем текст ошибки
            }
            return null; // null = нет ошибки
        },

        // Минимальная длина строки — возвращает функцию-валидатор с параметром min
        minLen: (min) => (value) => {
            if (value && value.length < min) {
                return `Минимум ${min} символов`; // ошибка если короче чем min
            }
            return null;
        },

        // Максимальная длина строки — возвращает функцию-валидатор с параметром max
        maxLen: (max) => (value) => {
            if (value && value.length > max) {
                return `Максимум ${max} символов`; // ошибка если длиннее чем max
            }
            return null;
        },

        // Проверка email-адреса через регулярное выражение
        email: (value) => {
            if (!value) return null; // пустое поле — пропускаем (для этого есть required)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // базовый паттерн email
            if (!emailRegex.test(value)) {
                return 'Пожалуйста, введите правильный email адрес';
            }
            return null;
        },

        // Проверка номера телефона — допускает цифры, пробелы, +, -, скобки
        phone: (value) => {
            if (!value) return null; // пустое поле — пропускаем
            const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/; // минимум 7 символов
            if (!phoneRegex.test(value)) {
                return 'Пожалуйста, введите правильный номер телефона';
            }
            return null;
        },

        // Проверка что значение является числом
        number: (value) => {
            if (!value) return null; // пустое — пропускаем
            if (isNaN(value) || value === '') {
                return 'Введите правильное число'; // не число — ошибка
            }
            return null;
        },

        // Минимальное числовое значение — возвращает функцию-валидатор с параметром min
        minValue: (min) => (value) => {
            if (value && Number(value) < min) {
                return `Значение должно быть не меньше ${min}`;
            }
            return null;
        },

        // Максимальное числовое значение — возвращает функцию-валидатор с параметром max
        maxValue: (max) => (value) => {
            if (value && Number(value) > max) {
                return `Значение не должно превышать ${max}`;
            }
            return null;
        },

        // Проверка пароля: минимум 6 символов, обязательно буквы и цифры
        password: (value) => {
            if (!value) return null;
            if (value.length < 6) {
                return 'Пароль должен быть не менее 6 символов'; // слишком короткий
            }
            if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
                return 'Пароль должен содержать буквы и цифры'; // нет букв или цифр
            }
            return null;
        }
    };

    // Валидирует одно поле по набору правил
    // fieldName — имя поля, value — значение, rules — массив функций-правил
    // Возвращает true если поле валидно, false если есть ошибка
    validateField(fieldName, value, rules = []) {
        this.errors[fieldName] = null; // сбрасываем предыдущую ошибку для этого поля

        for (let rule of rules) {     // перебираем все правила по очереди
            let error = null;

            if (typeof rule === 'function') {
                error = rule(value); // вызываем правило с текущим значением
            }

            if (error) {
                this.errors[fieldName] = error; // сохраняем первую найденную ошибку
                return false;                   // останавливаемся при первой ошибке
            }
        }

        return true; // все правила пройдены — поле валидно
    }

    // Валидирует все поля формы одновременно
    // fieldRules — объект { fieldName: [rule1, rule2, ...] }
    // Возвращает true если ВСЯ форма валидна
    validateForm(fieldRules) {
        this.errors = {};     // очищаем все предыдущие ошибки
        let isValid = true;   // предполагаем что форма валидна

        Object.entries(fieldRules).forEach(([fieldName, rules]) => {
            const input = this.form.querySelector(`[name="${fieldName}"]`); // находим input в DOM
            const value = input?.value || '';                                // читаем значение

            if (!this.validateField(fieldName, value, rules)) {
                isValid = false; // если хотя бы одно поле невалидно — форма невалидна
            }
        });

        return isValid;
    }

    // Показывает или скрывает ошибку для конкретного поля в DOM
    // Добавляет CSS-класс 'input--error' и вставляет span с текстом ошибки
    showFieldError(fieldName, error) {
        const input = this.form.querySelector(`[name="${fieldName}"]`); // находим input
        if (!input) return; // если поле не найдено — выходим

        // Удаляем предыдущее сообщение об ошибке (если есть)
        const oldError = input.parentElement?.querySelector('.error-message');
        if (oldError) oldError.remove();

        input.classList.remove('input--error'); // убираем красную рамку

        if (error) {
            input.classList.add('input--error'); // добавляем красную рамку к полю

            // Создаём элемент с текстом ошибки
            const errorEl = document.createElement('span');
            errorEl.className = 'error-message';  // CSS-класс для стилизации
            errorEl.textContent = error;           // текст ошибки
            input.parentElement?.appendChild(errorEl); // вставляем после поля
        }
    }

    // Показывает ошибки для ВСЕХ полей одновременно (после попытки отправить форму)
    showAllErrors(fieldRules) {
        Object.keys(fieldRules).forEach(fieldName => {
            this.showFieldError(fieldName, this.errors[fieldName]); // для каждого поля — показываем или убираем ошибку
        });
    }

    // Очищает ВСЕ ошибки в форме (рамки и тексты)
    clearErrors() {
        this.errors = {}; // сбрасываем внутреннее состояние
        this.form.querySelectorAll('.input--error').forEach(el => {
            el.classList.remove('input--error'); // убираем красные рамки
        });
        this.form.querySelectorAll('.error-message').forEach(el => {
            el.remove(); // удаляем span-ы с текстами ошибок
        });
    }

    // Очищает ошибку только для одного конкретного поля
    clearFieldError(fieldName) {
        delete this.errors[fieldName];          // удаляем ошибку из внутреннего состояния
        this.showFieldError(fieldName, null);   // убираем отображение (null = нет ошибки)
    }
}
