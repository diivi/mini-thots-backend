import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto';
import { RegistrationDto } from './dto/registration.dto';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegistrationDto): Promise<Tokens> {
    const hashedPassword = await argon2.hash(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        hashedPassword,
        username: dto.username,
      },
    });
    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Incorrect Email or Password');
    }
    const pwMatches = await argon2.verify(user.hashedPassword, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Incorrect Email or Password');
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
    return {
      message: 'Logout Successful',
    };
  }

  async refresh(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    const rtMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!rtMatches) {
      throw new ForbiddenException('Access Denied');
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRtHash(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.sign(
        {
          sub: userId,
          email,
        },
        {
          secret: 'access-secret',
          expiresIn: '15m',
        },
      ),
      this.jwtService.sign(
        {
          sub: userId,
          email,
        },
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }
}
