import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUser(currUserId: number, userId: number): Promise<User> {
    const userSearched = this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!userSearched) {
      throw new ForbiddenException('User not found');
    }
    if (currUserId === userId) {
      return userSearched;
    }
  }
}
