import { ForbiddenException, Injectable } from '@nestjs/common';
import { Thought, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUser(currUserId: number, userId: number): Promise<Partial<User>> {
    const userSearched = this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: currUserId === userId,
        username: true,
        email: currUserId === userId,
        createdAt: true,
        updatedAt: currUserId === userId,
        blacklisted: true,
      },
    });
    if (!userSearched) {
      throw new ForbiddenException('User not found');
    }
    return userSearched;
  }

  async getThoughts(currUserId: number, userId: number): Promise<Thought[]> {
    let thoughts = await this.prisma.thought.findMany({
      where: {
        authorId: userId,
      },
    });
    if (!thoughts) {
      throw new ForbiddenException('Thoughts not found');
    }
    if (currUserId !== userId) {
      thoughts = thoughts.filter((thought) => {
        return !thought.isAnonymous;
      });
    }
    return thoughts;
  }
}
