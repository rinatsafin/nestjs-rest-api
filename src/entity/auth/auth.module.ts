import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '@/entity/prisma';

@Module({
  imports: [
    // JwtModule.register({ secret: 'secret' })
    PrismaModule,
  ],
  providers: [AuthResolver, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
