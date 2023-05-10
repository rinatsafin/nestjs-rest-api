import { Module } from '@nestjs/common';
import { AuthModule, UserModule, BookmarksModule } from '@/entity';
import { ConfigModule } from '@nestjs/config';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    BookmarksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
