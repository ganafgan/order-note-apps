import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import {
  createOrder,
  getOrders,
  getOrderStats,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController';

const router = Router();

// All order routes are protected
router.use(verifyToken);

router.get('/stats', getOrderStats);         // GET  /api/orders/stats
router.get('/', getOrders);                  // GET  /api/orders
router.post('/', createOrder);               // POST /api/orders
router.patch('/:id/status', updateOrderStatus); // PATCH /api/orders/:id/status
router.delete('/:id', deleteOrder);          // DELETE /api/orders/:id

export default router;
