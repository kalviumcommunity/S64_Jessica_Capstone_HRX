import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
} from '../controllers/userController.js';

const router = express.Router();

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .put(updateUser)

export default router;
