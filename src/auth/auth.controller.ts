import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetCurrentUser, Public } from './decorators';
import { RegistrationDto, LoginDto } from './dto/index';
import { RtGuard } from './guards';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: RegistrationDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.register(body);
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 60 * 24 * 7,
      secure: false,
    });
    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 60 * 24 * 7,
      secure: false,
    });
    return tokens;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(body);
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 60 * 24 * 7,
      secure: false,
    });
    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 60 * 24 * 7,
      secure: false,
    });
    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUser('sub') userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetCurrentUser('refreshToken') refreshToken: string,
    @GetCurrentUser('sub') userId: number,
  ) {
    return this.authService.refresh(userId, refreshToken);
  }
}
