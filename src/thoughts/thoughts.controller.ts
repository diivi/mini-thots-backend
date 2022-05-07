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
import { ThoughtDto } from './dto';
import { ThoughtsService } from './thoughts.service';

@Controller('thoughts')
export class ThoughtsController {
  constructor(private thoughtsService: ThoughtsService) {}

  @Post('/new')
  async createThought(
    @GetCurrentUser('sub') userId: number,
    @Body() thoughtDto: ThoughtDto,
  ) {
    return this.thoughtsService.createThought(thoughtDto, userId);
  }

  @Delete('/delete/:id')
  async deleteThought(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) thoughtId: number,
  ) {
    return this.thoughtsService.deleteThought(thoughtId, userId);
  }

  @Post('/reply/:id')
  async replyToThought(
    @GetCurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) thoughtId: number,
    @Body() thoughtDto: ThoughtDto,
  ) {
    return this.thoughtsService.replyToThought(thoughtId, thoughtDto, userId);
  }

  @Get('/:id')
  async getThought(@Param('id', ParseIntPipe) thoughtId: number) {
    return this.thoughtsService.getThought(thoughtId);
  }

  @Get('/')
  async getThoughts(
    @Query('tags') tags: string[],
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.thoughtsService.getThoughts(tags, page, limit);
  }
}
