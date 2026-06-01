/**
 * ФАЙЛ: shopRoutes.js
 * ЧТО ЭТО: Публичный магазин.
 * ЗА ЧТО ОТВЕЧАЕТ: GET /api/products — витрина для пользователя.
 */
import { Router } from 'express';
import { listProductsPublic } from '../controllers/shopController.js';

const router = Router();

router.get('/products', listProductsPublic);

export default router;
