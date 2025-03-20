import { type User as PrismaUser } from "@prisma/client";

export default class UserModel {
  private id: number;
  private name: string;
  private email: string;

  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  fromEntity(prismaUser: PrismaUser) {
    return new UserModel(prismaUser.id, prismaUser.name, prismaUser.email);
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }
}
