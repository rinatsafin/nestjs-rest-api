import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtGuard } from '@/entity/auth/guard';
import { User } from '@prisma/client';
import { GetUserDecorator } from '@/entity/auth/decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  // Note: Alternative way is using AuthGuard
  // @UseGuards(AuthGuard('jwt'))
  @Get('user-info')
  getUser(@GetUserDecorator() user: User) {
    return user;
  }

  @Patch('edit-user')
  editUser(@GetUserDecorator() user: User) {
    return user;
  }
}
