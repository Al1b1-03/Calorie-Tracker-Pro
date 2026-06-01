# pages/ — экраны приложения

Каждая `.jsx` — отдельная страница. Соответствие URL см. в `App.jsx`.

| Страница | Кто видит | Что показать на защите |
|----------|-----------|------------------------|
| `HomePage` / `MainPage` | USER | Дневник калорий, график |
| `AdminMainPage` | ADMIN | Плитки разделов |
| `AiCameraPage` | USER | AI-распознавание еды |
| `ProductsShopPage` + `CartPage` | USER | E-commerce |
| `OrdersPage` | ADMIN | Заказы клиентов |
| `SupportMessagesPage` | ADMIN | Обращения |
| `ProductsPage` | ADMIN | CRUD товаров |
| `AdminManagementPage` | SUPER_ADMIN | Управление админами |

Подробно: [../../docs/ФАЙЛЫ.md](../../docs/ФАЙЛЫ.md)
