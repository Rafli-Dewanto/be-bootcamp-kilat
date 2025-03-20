import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SignUpDTO } from "../types/user";
import UserRepository from "../repositories/user.repository";
import { getErrorMessage } from "../utils/error";

const SECRET_KEY = process.env.JWT_SECRET as string;

export default class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async signUp(user: SignUpDTO): Promise<{
    id: number | null;
    email: string | null;
    error: string | null;
  }> {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const { email, id } = await this.userRepository.createUser({
        ...user,
        password: hashedPassword,
      });
      return {
        id,
        email,
        error: null,
      };
    } catch (error) {
      return {
        id: null,
        email: null,
        error: getErrorMessage(error),
      };
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ token: string | null; error: string | null }> {
    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) return { token: null, error: "Invalid Email or password" };

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return { token: null, error: "Invalid Email or password" };

      const token = jwt.sign(
        {
          email: user.email,
          id: user.id,
        },
        SECRET_KEY,
        {
          expiresIn: 3600,
        }
      );
      return {
        token,
        error: null,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}
