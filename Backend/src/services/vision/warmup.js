/**
 * ФАЙЛ: warmup.js
 * ЧТО ЭТО: Прогрев модели.
 * ЗА ЧТО ОТВЕЧАЕТ: загрузка CLIP при старте сервера.
 */
import { getVisionProviderName } from './resolveProvider.js';

export async function warmupVision() {
  const provider = getVisionProviderName();
  if (provider !== 'local') {
    console.info(`[vision] Warmup skipped (provider: ${provider})`);
    return;
  }

  const { warmupLocalVision } = await import('./LocalVisionAdapter.js');
  await warmupLocalVision();
}
