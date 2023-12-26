import { Router } from 'express';
import {
  createProfile,
  getProfile,
  getUserById
} from '../controllers/users.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/users/profile', isAuthenticated, getProfile);
router.post('/users/profile', isAuthenticated, createProfile);
router.get('/user/:id', getUserById);

export default router;
