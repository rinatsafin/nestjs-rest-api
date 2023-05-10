import { Module } from '@nestjs/common';
import { AuthModule, UserModule, BookmarksModule } from '@/entity';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

@Module({
  imports: [AuthModule, UserModule, BookmarksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
