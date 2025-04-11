import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
} from '../controllers/userController.js';

const router = express.Router();

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUserById)

export default router;
