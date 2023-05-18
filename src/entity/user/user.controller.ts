import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtGuard } from '@/entity/auth/guard';
import { User } from '@prisma/client';
import { GetUserDecorator } from '@/entity/auth/decorator';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  // Note: Alternative way is using AuthGuard
  // @UseGuards(AuthGuard('jwt'))
  @Get('user-info')
  getUser(@GetUserDecorator() user: User) {
    return user;
  }

  @Patch('edit-user')
  editUser(
    @GetUserDecorator('id') userId: User['id'],
    @Body() userEditDto: EditUserDto,
  ) {
    return this.userService.editUser(userId, userEditDto);
  }
}
