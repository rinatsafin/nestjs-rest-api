import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '@/entity/prisma';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    PrismaModule,
  ],
  providers: [AuthResolver, AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
