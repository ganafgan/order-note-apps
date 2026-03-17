import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import {
  createClothesType,
  getClothesTypes,
  updateClothesType,
  deleteClothesType,
} from '../controllers/clothesTypeController';

const router = Router();

router.use(verifyToken);

router.post('/', createClothesType);
router.get('/', getClothesTypes);
router.put('/:id', updateClothesType);
router.delete('/:id', deleteClothesType);

export default router;
