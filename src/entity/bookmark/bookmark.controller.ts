import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Bookmark, User } from '@prisma/client';
import { GetUserDecorator } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}
  // TODO: Add deleteBookmarsById
  @Get()
  getBookmarks(@GetUserDecorator('id') userId: User['id']) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Post('create-bookmark')
  createBookmark(
    @GetUserDecorator('id') userId: User['id'],
    @Body() createBookmarkDto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, createBookmarkDto);
  }

  @Get(':id')
  getBookmarkById(
    @GetUserDecorator('id') userId: User['id'],
    @Param('id', ParseIntPipe) bookmarkId: Bookmark['id'],
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Patch(':id')
  editBookmarksById(
    @GetUserDecorator('id') userId: User['id'],
    @Param('id', ParseIntPipe) bookmarkId: Bookmark['id'],
    @Body() editBookmarkDto: EditBookmarkDto,
  ) {
    return this.bookmarkService.editBookmarkById(
      userId,
      bookmarkId,
      editBookmarkDto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUserDecorator('id') userId: User['id'],
    @Param('id', ParseIntPipe) bookmarkId: Bookmark['id'],
  ) {
    this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
