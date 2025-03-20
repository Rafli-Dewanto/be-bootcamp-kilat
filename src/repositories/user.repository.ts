import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { SignUpDTO } from "../types/user";
import { getErrorMessage } from "../utils/error";

export default class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createUser(user: SignUpDTO) {
    try {
      return await this.prisma.user.create({
        data: user,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Email already exists");
        }
      }
      console.error(error instanceof Error ? error.message : getErrorMessage(error))
      throw new Error("Error creating user");
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
    } catch (error) {
      throw new Error("Error getting user");
    }
  }
}
