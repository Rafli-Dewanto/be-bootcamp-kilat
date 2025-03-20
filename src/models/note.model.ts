import { type Note as PrismaNote } from "@prisma/client";

class Note {
  private id: number;
  private title: string;
  private content: string;
  private createdAt: Date;

  constructor(id: number, title: string, content: string, createdAt: Date) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
  }

  static fromEntity(prismaNote: PrismaNote) {
    return new Note(
      prismaNote.id,
      prismaNote.title,
      prismaNote.content,
      prismaNote.createdAt
    );
  }

  toDTO() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      createdAt: this.createdAt,
    };
  }
}

export default Note;
