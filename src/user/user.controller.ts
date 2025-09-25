import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ConflictException } from '@nestjs/common';
import type { IUser } from '../shared/types/user.types';
import { AllowedUser } from 'src/shared/decorators/allowed-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto
  ): Promise<void> {
    await this.service.createUser(dto);
    return;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshTokenData } = await this.service.login(dto);

    res.cookie('refreshToken', refreshTokenData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshTokenData.expiresAt,
    });
    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ConflictException('refreshToken이 필요합니다.');
    }
    
    return await this.service.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.service.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
    return;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@AllowedUser() user: IUser) {
    return { userId: user.userId };
  }

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('id') id: string) {
    return this.service.getProfile(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.service.update(+id, updateUserDto);
  }

}
