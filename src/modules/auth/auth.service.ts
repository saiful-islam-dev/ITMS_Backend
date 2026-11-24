import { prisma } from '../../database/prisma.client';
import { PasswordUtil } from '../../utils/password.util';
import { JwtUtil } from '../../utils/jwt.util';
import { RegisterDto, LoginDto } from './auth.dto';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../errors/app.error';
import { Role } from '../../constants/roles.enum';

export class AuthService {
  public async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await PasswordUtil.hash(dto.password);

    const user = await prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role || Role.FIELD_TECH,
        facilityId: dto.facilityId || null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        facilityId: true,
        createdAt: true,
      },
    });

    const accessToken = JwtUtil.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      fullName: user.fullName,
      facilityId: user.facilityId,
    });

    const refreshToken = JwtUtil.generateRefreshToken({ sub: user.id });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        facility: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    const isPasswordValid = await PasswordUtil.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account has been suspended. Please contact Super Admin.');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = JwtUtil.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      fullName: user.fullName,
      facilityId: user.facilityId,
    });

    const refreshToken = JwtUtil.generateRefreshToken({ sub: user.id });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        facility: user.facility,
      },
    };
  }

  public async refreshToken(token: string) {
    try {
      const decoded = JwtUtil.verifyRefreshToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          facilityId: true,
        },
      });

      if (!user || user.status === 'SUSPENDED') {
        throw new UnauthorizedError('Invalid refresh token or inactive account');
      }

      const accessToken = JwtUtil.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role as Role,
        fullName: user.fullName,
        facilityId: user.facilityId,
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  public async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        avatar: true,
        facilityId: true,
        facility: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return user;
  }
}
