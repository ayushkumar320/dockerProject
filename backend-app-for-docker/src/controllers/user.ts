import {authMiddleware} from "../middlewares/auth.js";
import jwt from "jsonwebtoken";
import type {Request, Response} from "express";
import prisma from "../db/db.js";
import bcrypt, { genSalt } from "bcryptjs";
const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;

interface RegisterUserBody {
  email: string;
  name: string;
  password: string;
}


export async function registerUser(req: Request, res: Response) {
  const {email, name, password} = req.body as RegisterUserBody;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      }
    });
    if (existingUser) {
      return res.status(400).json({message: "User with this email already exists"});
    }
    const salt = await genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    });
    const token = jwt.sign({email: newUser.email}, JWT_SECRET);
    return res.status(201).json({
      message: "User registered successfully",
      userId: newUser.id,
      token: token,
    });
  } catch(error) {
    return res.status(500).json({message: "Internal server error during user registration"});
  }
}

interface LoginUserBody {
  email: string;
  password: string;
}

export async function loginUser(req: Request, res: Response) {
  const {email, password} = req.body as LoginUserBody;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      }
    });
    if (!user) {
      return res.status(400).json({message: "Invalid email or password"});
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({message: "Invalid email or password"});
    }
    const token = jwt.sign({email: user.email}, JWT_SECRET);
    return res.status(200).json({
      message: "User logged in successfully",
      userId: user.id,
      token: token,
    });
  } catch(error) {
    return res.status(500).json({message: "Internal server error during user login"});
  }
}

interface createTodoBody {
  title: string;
}

export async function createTodo(req: Request, res: Response) {
  const {title} = req.body as createTodoBody;
  const userEmail = req.user?.email;
  try {
    const newTodo = await prisma.todo.create({
      data: {
        title,
        user: {
          connect: {
            email: userEmail,
          }
        }
      }
    });
    return res.status(201).json({
      message: "Todo created successfully",
      todoId: newTodo.id,
    });
  } catch(error) {
    return res.status(500).json({message: "Internal server error during todo creation"});
  }
}

export async function markAsCompleted(req: Request, res: Response) {
  const idParam = req.params.id;
  if (!idParam) {
    return res.status(400).json({message: "Todo id is required"});
  }
  const todoId = parseInt(idParam, 10);
  if (Number.isNaN(todoId)) {
    return res.status(400).json({message: "Invalid todo id"});
  }
  const userEmail = req.user?.email;
  try {
    const updatedTodo = await prisma.todo.update({
      where: {
        id: todoId,
        user: {
          email: userEmail,
        }
      },
      data: {
        completed: true,
      }
    });
    return res.status(200).json({
      message: "Todo marked as completed",
      todoId: updatedTodo.id,
    });
  } catch(error) {
    return res.status(500).json({message: "Internal server error during marking todo as completed"});
  }
}

export async function deleteTodo(req: Request, res: Response) {
  const idParam = req.params.id;
  if (!idParam) {
    return res.status(400).json({message: "Todo id is required"});
  }
  const todoId = parseInt(idParam, 10);
  if (Number.isNaN(todoId)) {
    return res.status(400).json({message: "Invalid todo id"});
  }
  const userEmail = req.user?.email;
  try {
    await prisma.todo.deleteMany({
      where: {
        id: todoId,
        user: {
          email: userEmail,
        }
      }
    });
    return res.status(200).json({message: "Todo deleted successfully"});
  } catch(error) {
    return res.status(500).json({message: "Internal server error during deleting todo"});
  }
}