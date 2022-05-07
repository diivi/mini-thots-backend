import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GetCurrentUser } from 'src/auth/decorators';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/me')
  async getMe(@GetCurrentUser('sub') currUserId: number) {
    return this.userService.getUser(currUserId, currUserId);
  }

  @Get('/:id')
  async getUser(
    @GetCurrentUser('sub') currUserId: number,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return this.userService.getUser(currUserId, userId);
  }

  @Get('/thoughts/:id')
  async getThoughts(
    @GetCurrentUser('sub') currUserId: number,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return this.userService.getThoughts(currUserId, userId);
  }
}
