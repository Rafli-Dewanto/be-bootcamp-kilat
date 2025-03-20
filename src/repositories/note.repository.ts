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

      const [notes, total] = await Promise.all([
        this.prisma.note.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        this.prisma.note.count({ where }),
      ]);

      return {
        notes: notes.map((note) => Note.fromEntity(note)),
        total,
      };
    } catch (error) {
      return getErrorMessage(error);
    }
  }

  async findById(id: number, userId: number): Promise<Note | null | string> {
    try {
      const note = await this.prisma.note.findFirst({
        where: {
          id,
          userId,
          isDeleted: false,
        } as Prisma.NoteWhereInput,
      });
      return note ? Note.fromEntity(note) : null;
    } catch (error) {
      return getErrorMessage(error);
    }
  }

  async create(noteData: CreateNoteDto): Promise<Note | string> {
    try {
      const note = await this.prisma.note.create({
        data: {
          title: noteData.title,
          content: noteData.content,
          user: {
            connect: {
              email: noteData.email,
            },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Prisma.NoteCreateInput,
      });
      return Note.fromEntity(note);
    } catch (error) {
      return getErrorMessage(error);
    }
  }

  async update(id: number, noteData: UpdateNoteDto): Promise<Note | string> {
    try {
      const note = await this.prisma.note.update({
        where: { id } as Prisma.NoteWhereUniqueInput,
        data: {
          ...noteData,
          updatedAt: new Date(),
        },
      });
      return Note.fromEntity(note);
    } catch (error) {
      return getErrorMessage(error);
    }
  }

  async softDelete(id: number): Promise<Note | string> {
    try {
      const note = await this.prisma.note.update({
        where: { id } as Prisma.NoteWhereUniqueInput,
        data: {
          isDeleted: true,
          updatedAt: new Date(),
        } as Prisma.NoteUpdateInput,
      });
      return Note.fromEntity(note);
    } catch (error) {
      return getErrorMessage(error);
    }
  }
}

export default NoteRepository;
