import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
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
  async register(@Body() body: RegistrationDto): Promise<Tokens> {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
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
