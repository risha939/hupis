import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { MoreThan, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { ProfileResponseDto } from './response/profile-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken) readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwt: JwtService,
  ) { }

  private async hashSecret(secret: string,): Promise<string> {
    return await argon2.hash(secret, {
      type: argon2.argon2id,
      timeCost: 3,
      parallelism: 2,
    });
  }

  private getJwtSignOptions(userId: number, tokenType: 'access' | 'refresh') {
    const baseOptions = {
      secret: process.env.JWT_SECRET,
      issuer: process.env.JWT_ISSUER,
      subject: userId.toString(),
    };

    if (tokenType === 'access') {
      return {
        ...baseOptions,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      };
    } else {
      return {
        ...baseOptions,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      };
    }
  }

  private getJwtVerifyOptions() {
    return {
      secret: process.env.JWT_SECRET,
      issuer: process.env.JWT_ISSUER,
    };
  }

  private parseJwtExpiration(expiresIn: string): number {
    // JWT 만료 시간 문자열을 밀리초로 변환
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid JWT expiration format: ${expiresIn}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000; // 초
      case 'm': return value * 60 * 1000; // 분
      case 'h': return value * 60 * 60 * 1000; // 시간
      case 'd': return value * 24 * 60 * 60 * 1000; // 일
      default: throw new Error(`Unsupported time unit: ${unit}`);
    }
  }

  private async generateAccessToken(userId: number): Promise<string> {
    const payload = { userId };
    const options = this.getJwtSignOptions(userId, 'access');
    return await this.jwt.signAsync(payload, options);
  }

  async createUser(dto: CreateUserDto) {
    const idCkeck = await this.userRepo.exists({ where: [{ loginId: dto.loginId }] });
    if (idCkeck) {
      throw new ConflictException('이미 사용 중인 아이디 입니다.');
    }
    const nicknameCkeck = await this.userRepo.exists({ where: [{ nickname: dto.nickname }] });
    if (nicknameCkeck) {
      throw new ConflictException('이미 사용 중인 닉네임 입니다.');
    }

    const user = this.userRepo.create({
      loginId: dto.loginId,
      name: dto.name,
      nickname: dto.nickname,
      password: await this.hashSecret(dto.password),
      profileImageUrl: dto?.profileImageUrl ?? null,
    });

    return await this.userRepo.save(user);
  }

  async login(dto: LoginUserDto): Promise<{ accessToken: string; refreshTokenData: { token: string, expiresAt: Date } }> {
    const user = await this.userRepo.findOne({ where: { loginId: dto.loginId } });
    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    const passwordCheck = await argon2.verify(user.password, dto.password);
    if (!passwordCheck) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 토큰 생성
    const accessToken = await this.generateAccessToken(user.userId);
    const payload = { userId: user.userId };
    const refreshOptions = this.getJwtSignOptions(user.userId, 'refresh');
    const refreshToken = await this.jwt.signAsync(payload, refreshOptions);

    // 리프레시 토큰 저장
    const tokenHash = await this.hashSecret(refreshToken);
    const refreshExpirationMs = this.parseJwtExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
    const expiresAt = new Date(Date.now() + refreshExpirationMs);
    const entity = this.refreshTokenRepo.create({ user, tokenHash, expiresAt, revokedAt: null });
    await this.refreshTokenRepo.save(entity);

    return {
      accessToken,
      refreshTokenData: {
        token: refreshToken,
        expiresAt,
      }
    };
  };

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const verifyOptions = this.getJwtVerifyOptions();
    const decoded = await this.jwt.verifyAsync<any>(refreshToken, verifyOptions).catch(() => null);
    if (!decoded?.userId) {
      // 토큰이 유효하지 않으면 로그아웃 처리
      await this.logout(refreshToken);
      throw new ConflictException('유효하지 않은 토큰입니다.');
    }

    const user = await this.userRepo.findOne({ where: { userId: decoded.userId } });
    if (!user) {
      // 사용자가 없으면 로그아웃 처리
      await this.logout(refreshToken);
      throw new ConflictException('유효하지 않은 토큰입니다.');
    }

    // 만료되지 않은 토큰 중 최신 하나만 조회
    const record = await this.refreshTokenRepo.findOne({
      where: {
        userId: user.userId,
        revokedAt: undefined,
        expiresAt: MoreThan(new Date())
      },
      order: { createdAt: 'DESC' }
    });

    if (!record) {
      // 유효한 토큰이 없으면 로그아웃 처리
      await this.logout(refreshToken);
      throw new ConflictException('만료되었거나 폐기된 토큰입니다.');
    }

    // 토큰 검증
    const isValid = await argon2.verify(record.tokenHash, refreshToken);
    if (!isValid) {
      // 토큰이 일치하지 않으면 로그아웃 처리
      await this.logout(refreshToken);
      throw new ConflictException('유효하지 않은 토큰입니다.');
    }

    // 유효한 토큰이면 액세스 토큰 발급
    const accessToken = await this.generateAccessToken(user.userId);
    return { accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const verifyOptions = this.getJwtVerifyOptions();
    const decoded = await this.jwt.verifyAsync<any>(refreshToken, verifyOptions).catch(() => null);
    if (!decoded?.userId) return;

    // 최신 토큰 하나만 조회
    const record = await this.refreshTokenRepo.findOne({
      where: {
        userId: decoded.userId,
        revokedAt: undefined,
        expiresAt: MoreThan(new Date())
      },
      order: { createdAt: 'DESC' }
    });

    // 리프레시 토큰 폐기
    if (record) {
      const ok = await argon2.verify(record.tokenHash, refreshToken).catch(() => false);
      if (ok) {
        record.revokedAt = new Date();
        await this.refreshTokenRepo.save(record);
      }
    }
  }

  async getProfile(userId: number): Promise<ProfileResponseDto> {
    const user = await this.userRepo.findOne({
      where: { userId },
      select: ['userId', 'nickname', 'profileImageUrl']
    });
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    return { userId: user.userId, nickname: user.nickname, profileImageUrl: user.profileImageUrl };
  }
}
