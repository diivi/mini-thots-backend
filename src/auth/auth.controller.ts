import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register() {
    return this.authService.register();
  }

  @Post('login')
  async login() {
    return this.authService.login();
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }

  @Post('refresh')
  async refresh() {
    return this.authService.refresh();
  }
}
