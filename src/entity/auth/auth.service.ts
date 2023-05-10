import { ForbiddenException, Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';
import { PrismaService } from '@/entity/prisma/prisma.service';
import { AuthDto } from './dto';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signup(authDto: AuthDto) {
    try {
      // Generate the password hash
      const hashedPassword = await hash(authDto.password);
      // Trying to save a new user in the database
      const user: User = await this.prismaService.user.create({
        data: {
          email: authDto.email,
          hashedPassword,
          firstName: authDto.firstName,
          lastName: authDto.lastName,
        },
        // NOTE: Added as an example and a possible option.
        // select: {
        //   id: true,
        //   email: true,
        //   firstName: true,
        //   lastName: true,
        //   hashedPassword: false,
        // },
      });
      // TODO: Add transformer function
      delete user.hashedPassword;
      // Return the saved user
      return this.signToken(user.id, user.email);
    } catch (error:
      | unknown
      | Error
      | Prisma.PrismaClientValidationError
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientValidationError) {
      // NOTE: PrismaClientKnownRequestError is no longer identifiable
      // https://github.com/prisma/prisma/issues/17945
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // TODO: Add more error codes handling
        // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        switch (error.code) {
          case 'P2002':
            throw new ForbiddenException('Credentials already exist');
          default:
            throw error;
        }
      }
      throw error;
    }
  }

  async signin(authDto: AuthDto) {
    try {
      // find the user by Email
      const user = await this.prismaService.user.findUnique({
        where: {
          email: authDto.email,
        },
      });

      // if user does not exist, throw expception
      if (!user) {
        throw new ForbiddenException('Invalid credentials');
      }

      // compare the password
      const isPasswordValid = await verify(
        user.hashedPassword,
        authDto.password,
      );
      // if password does not match, throw exception
      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid credentials');
      }
      // if password matches, return user
      delete user.hashedPassword;
      return this.signToken(user.id, user.email);
    } catch (error) {
      console.error('signin error', error);
      throw error;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    try {
      const payload = { sub: userId, email };
      const secret = this.configService.get<string>('JWT_SECRET');
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret,
      });
      return {
        access_token: token,
      };
    } catch (error) {
      console.error('signToken error', error);
      throw error;
    }
  }
}
