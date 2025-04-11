import express from 'express';
import {
  getAllUsers,
  getUserById,
} from '../controllers/userController.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorizeRoles('admin', 'hr'), getAllUsers)

router
  .route('/:id')
  .get(protect, getUserById)

export default router;
