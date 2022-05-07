import { ForbiddenException, Injectable } from '@nestjs/common';
import { Thought } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ThoughtDto } from './dto';

@Injectable()
export class ThoughtsService {
  constructor(private prisma: PrismaService) {}

  async createThought(
    thoughtDto: ThoughtDto,
    userId: number,
  ): Promise<Thought> {
    const { title, content, triggerWarning, tags, isAnonymous } = thoughtDto;
    const tagIds = await this.getTagIds(tags);
    const thought = await this.prisma.thought.create({
      data: {
        title,
        content,
        triggerWarning,
        isAnonymous,
        tags: {
          connect:
            tagIds.map((t) => ({
              id: t,
            })) || [],
        },
        author: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return thought;
  }

  async deleteThought(thoughtId: number, userId: number): Promise<Thought> {
    //check if user is the author of the thought
    const thought = await this.prisma.thought.findFirst({
      where: {
        id: thoughtId,
        author: {
          id: userId,
        },
      },
    });
    if (!thought) {
      throw new ForbiddenException('You are not the author of this thought');
    }
    const deletedThought = await this.prisma.thought.delete({
      where: {
        id: thoughtId,
      },
    });
    return deletedThought;
  }

  async replyToThought(
    thoughtId: number,
    newThoughtDto: ThoughtDto,
    userId: number,
  ): Promise<Thought> {
    const thought = await this.prisma.thought.findFirst({
      where: {
        id: thoughtId,
      },
    });
    if (!thought) {
      throw new ForbiddenException('Thought not found');
    }
    const tagIds = await this.getTagIds(newThoughtDto.tags);
    const reply = await this.prisma.thought.create({
      data: {
        title: newThoughtDto.title,
        content: newThoughtDto.content,
        triggerWarning: newThoughtDto.triggerWarning,
        repliedTo: {
          connect: {
            id: thoughtId,
          },
        },
        isAnonymous: newThoughtDto.isAnonymous,
        tags: {
          connect:
            tagIds.map((t) => ({
              id: t,
            })) || [],
        },
        author: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return reply;
  }

  async getThought(thoughtId: number): Promise<Thought> {
    const thought = await this.prisma.thought.findFirst({
      where: {
        id: thoughtId,
      },
    });
    if (!thought) {
      throw new ForbiddenException('Thought not found');
    }
    if (thought.isAnonymous) {
      thought.authorId = null;
    }

    return thought;
  }

  async getThoughts(
    tags: string[],
    page: number,
    limit: number,
  ): Promise<Thought[]> {
    if (limit > 100) {
      limit = 100;
    }
    const where = {};
    if (tags?.length > 0) {
      where['tags'] = {
        some: {
          name: {
            in: tags,
          },
        },
      };
    }
    const thoughts = await this.prisma.thought.findMany({
      where,
      take: limit || 10,
      skip: limit * (page - 1) || 0,
      orderBy: {
        createdAt: 'desc',
      },
    });
    thoughts
      .filter((thought) => thought.isAnonymous)
      .forEach((thought) => {
        thought.authorId = null;
      });
    return thoughts;
  }

  async getTagIds(tags: string[]): Promise<number[]> {
    const tagIds = await this.prisma.tag.findMany({
      where: {
        name: {
          in: tags,
        },
      },
    });
    return tagIds.map((tag) => tag.id);
  }
}
