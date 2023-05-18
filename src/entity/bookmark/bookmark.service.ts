import { ForbiddenException, Injectable } from '@nestjs/common';
import { Bookmark, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}
  async getBookmarks(userId: User['id']) {
    try {
      const bookmars = await this.prismaService.bookmark.findMany({
        where: {
          userId,
        },
      });
      return bookmars;
    } catch (error) {
      console.log(error);
    }
  }

  async getBookmarkById(userId: User['id'], bookmarkId: Bookmark['id']) {
    try {
      const bookmars = await this.prismaService.bookmark.findFirst({
        where: {
          id: bookmarkId,
          userId,
        },
      });
      return bookmars;
    } catch (error) {
      console.log(error);
    }
  }

  async createBookmark(
    userId: User['id'],
    createBookmarkDto: CreateBookmarkDto,
  ) {
    try {
      const bookmark = await this.prismaService.bookmark.create({
        data: {
          userId,
          ...createBookmarkDto,
        },
      });
      console.log(`bookmark`, bookmark);
      return bookmark;
    } catch (error) {
      console.error(error);
    }
  }

  async editBookmarkById(
    userId: User['id'],
    bookmarkId: Bookmark['id'],
    editBookmarkDto: EditBookmarkDto,
  ) {
    try {
      // get bookmark by id
      const bookmark = await this.prismaService.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

      // check if bookmark exists
      if (!bookmark || bookmark.userId !== userId) {
        throw new ForbiddenException('Access to resources denied');
      }
      // update bookmark
      return this.prismaService.bookmark.update({
        where: {
          id: bookmarkId,
        },
        data: {
          ...editBookmarkDto,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async deleteBookmarkById(userId: User['id'], bookmarkId: Bookmark['id']) {
    try {
      // get bookmark by id
      const bookmark = await this.prismaService.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

      // check if bookmark exists
      if (!bookmark || bookmark.userId !== userId) {
        throw new ForbiddenException('Access to resources denied');
      }
      // update bookmark
      return this.prismaService.bookmark.delete({
        where: {
          id: bookmarkId,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  // TODO: Add deleteBookmarsById
  // async getBookmarksById(userId: User['id'], bookmarkIds: Bookmark['id'][]) {}
}
