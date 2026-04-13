import { Router } from 'express';
import { body } from 'express-validator';
import {
  listWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  uploadWorkoutImage,
} from '../controllers/workoutsController.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { uploadProductImage } from '../middleware/upload.js';

const router = Router();

router.get('/', listWorkouts);

router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Название обязательно')],
  handleValidationErrors,
  createWorkout
);

router.patch(
  '/:id',
  [
    body('title').optional().trim(),
    body('duration').optional().isInt({ min: 0 }),
    body('calories').optional().isInt({ min: 0 }),
  ],
  handleValidationErrors,
  updateWorkout
);

router.post(
  '/:id/image',
  (req, res, next) => {
    uploadProductImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
      }
      next();
    });
  },
  uploadWorkoutImage
);

router.delete('/:id', deleteWorkout);

export default router;

