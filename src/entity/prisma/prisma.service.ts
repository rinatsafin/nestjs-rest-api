import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  private NODE_ENV: string;
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
    this.NODE_ENV = configService.get<string>('NODE_ENV');
  }

  clearDB() {
    if (this.NODE_ENV === 'development' || this.NODE_ENV === 'test')
      return this.$transaction([
        // Note: The order of deletion is important
        this.bookmark.deleteMany(),
        this.user.deleteMany(),
      ]);
  }
}
