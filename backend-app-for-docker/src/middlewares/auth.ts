import dotenv from "dotenv";
import type {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
dotenv.config();

// Augment Express Request to include `user`
// The below is the global scoped interface for express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;

// Check if JWT_SECRET is defined
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({message: "Authorization header missing or malformed"});
  }
  const token = authHeader.split(" ")[1];
  if(!token) {
    return res.status(401).json({message: "Token not provided"});
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during authentication",
    });
  }
}
