# controllers/ — бизнес-логика API

Каждый файл обрабатывает запросы одной предметной области.  
Маршруты в `../routes/` вызывают функции отсюда.

| Файл | Область |
|------|---------|
| `authController.js` | Регистрация, вход, профиль |
| `entriesController.js` | Дневник питания |
| `waterController.js` | Учёт воды |
| `scansController.js` | AI-камера |
| `cartController.js` | Корзина |
| `checkoutController.js` | Оформление заказа |
| `shopController.js` | Витрина магазина |
| `productsController.js` | Админ: товары |
| `ordersController.js` | Админ: заказы |
| `usersController.js` | Админ: пользователи |
| `supportController.js` | Поддержка |
| `workoutsController.js` | Тренировки |
| `adminManagementController.js` | Супер-админ: админы |
| `adminNotificationsController.js` | Бейджи в шапке |

Подробно: [../../docs/ФАЙЛЫ.md](../../docs/ФАЙЛЫ.md)
