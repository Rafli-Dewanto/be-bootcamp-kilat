import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getErrorMessage } from "../utils/error";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const authorize = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!SECRET_KEY) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
  // Authorization = Bearer <token>

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      email: string;
    };
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
