/**
 * Pre-download local CLIP model (same as server startup warmup).
 * Usage: node scripts/warmup-vision.js
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
