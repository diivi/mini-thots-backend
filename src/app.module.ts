import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guards';
import { UsersModule } from './users/users.module';
import { ThoughtsModule } from './thoughts/thoughts.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ThoughtsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
