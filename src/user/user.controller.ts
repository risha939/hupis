import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenResponseDto } from './response/access-token-response.dto';
import { ProfileResponseDto } from './response/profile-response.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) { }

  @ApiOperation({ summary: '사용자 회원가입' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 409, description: '이미 존재하는 사용자' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto
  ): Promise<void> {
    await this.service.createUser(dto);
    return;
  }

  @ApiOperation({ summary: '사용자 로그인', description: '쿠키로 리프레시 토큰을 발급합니다.' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AccessTokenResponseDto
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AccessTokenResponseDto> {
    const { accessToken, refreshTokenData } = await this.service.login(dto);

    res.cookie('refreshToken', refreshTokenData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshTokenData.expiresAt,
    });
    return { accessToken };
  }

  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: AccessTokenResponseDto
  })
  @ApiResponse({ status: 401, description: '인증 정보가 없거나 유효하지 않습니다.' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
  ): Promise<AccessTokenResponseDto> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('refreshToken이 필요합니다.');
    }

    return await this.service.refresh(refreshToken);
  }

  @ApiOperation({ summary: '사용자 로그아웃' })
  @ApiResponse({ status: 204, description: '로그아웃 성공' })
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

  @ApiOperation({ summary: '사용자 프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: ProfileResponseDto
  })
  @ApiResponse({ status: 401, description: '인증이 필요합니다' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다' })
  @ApiBearerAuth('JWT-auth')
  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('id') id: string): Promise<ProfileResponseDto> {
    return this.service.getProfile(+id);
  }

}
