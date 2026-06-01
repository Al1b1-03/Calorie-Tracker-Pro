/**
 * ФАЙЛ: warmup-vision.js
 * ЧТО ЭТО: CLI-скрипт.
 * ЗА ЧТО ОТВЕЧАЕТ: прогреть модель vision вручную.
 */
import { warmupVision } from '../src/services/vision/warmup.js';

warmupVision()
  .then(() => {
    console.log('Vision warmup complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Vision warmup failed:', err.message);
    process.exit(1);
  });
