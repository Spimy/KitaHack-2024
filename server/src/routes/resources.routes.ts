import { Router } from 'express';
import {
  createResource,
  deleteResourceById,
  editResource,
  getResourceById,
  getResources,
  getResourcesByAuthorId
} from '../controllers/resources.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/resources/:authorId/:token?',
  isAuthenticated,
  getResourcesByAuthorId
);
router.get('/resources/:token?', isAuthenticated, getResources);
router.get('/resource/:id?', isAuthenticated, getResourceById);
router.post('/resource', isAuthenticated, createResource);
router.patch('/resource/:id', isAuthenticated, editResource);
router.delete('/resource/:id', isAuthenticated, deleteResourceById);

export default router;
