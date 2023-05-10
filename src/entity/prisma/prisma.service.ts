import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://root:ecW^4v3K793*4^@localhost:5434/bookmarks_db?schema=public',
        },
      },
    });
  }
}
