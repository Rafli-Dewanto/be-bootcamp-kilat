import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import UserRepository from "../repositories/user.repository";
import AuthService from "../services/auth.service";
import AuthController from "../controllers/auth.controller";

const router = Router();

const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const authService = new AuthService(userRepository);
const userController = new AuthController(authService);

router.post("/signup", (req, res) => userController.signUp(req, res));
router.post("/signin", (req, res) => userController.signIn(req, res));
router.post("/authorize", (req, res) => userController.authorize(req, res));

export default router;
