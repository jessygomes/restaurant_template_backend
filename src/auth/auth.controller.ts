/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/database/prisma.service';
import { LoginUserDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login') // POST /auth/login
  async login(@Body() authBody: LoginUserDto) {
    return await this.authService.login({ authBody });
  }

  @Post('register') // POST /auth/register
  async register(@Body() registerBody: CreateUserDto) {
    // CreateUserDto est un DTO qui permet de valider les données : la fonction sera exécuté uniquement si les données sont valides
    return await this.authService.register({ registerBody });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAuthenticatedUser(@Request() request: RequestWithUser) {
    return await this.userService.getUserById({ userId: request.user.userId });
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendResetPasswordEmail(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword({ email, token, password });
  }
}
