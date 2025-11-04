import express from 'express';
import {
  registerUser,
  loginUser,
  createTodo,
  getTodos,
  markAsCompleted,
  deleteTodo
} from '../controllers/user.js';
import {authMiddleware} from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/todos', authMiddleware, createTodo);
router.get('/todos', authMiddleware, getTodos);
router.patch('/todos/:id/complete', authMiddleware, markAsCompleted);
router.delete('/todos/:id', authMiddleware, deleteTodo);

export default router;
