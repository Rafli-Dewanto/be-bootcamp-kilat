import { PrismaClient, Prisma } from "@prisma/client";
import Note from "../models/note.model";
import { CreateNoteDto, UpdateNoteDto, NoteFilters } from "../types/note";
import { PaginationParams } from "../types/pagination";
import { getErrorMessage } from "../utils/error";

class NoteRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(
    userId: number,
    pagination?: PaginationParams,
    filters?: NoteFilters
  ): Promise<{ notes: Note[]; total: number } | string> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 12;
      const skip = (page - 1) * limit;

      const where: Prisma.NoteWhereInput = {
        isDeleted: false,
        userId,
        ...(filters?.search && {
          OR: [
            {
              title: {
                contains: filters.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              content: {
                contains: filters.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }),
        ...(filters?.startDate && { createdAt: { gte: filters.startDate } }),
        ...(filters?.endDate && { createdAt: { lte: filters.endDate } }),
      };

      const [] = await Promise.all([
        this.prisma.note.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        
      ]);
    } catch (error) {}
  }
}

export default NoteRepository;
