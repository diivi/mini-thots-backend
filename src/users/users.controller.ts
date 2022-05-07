import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { GetCurrentUser } from 'src/auth/decorators';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/:id')
  async getUser(
    @GetCurrentUser('sub') currUserId: number,
    @Param('id') userId: number,
  ) {
    return this.userService.getUser(currUserId, userId);
  }
}
