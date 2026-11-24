import { PasswordUtil } from '../src/utils/password.util';
import { JwtUtil } from '../src/utils/jwt.util';
import { Role } from '../src/constants/roles.enum';

describe('Auth Utilities & Security', () => {
  describe('PasswordUtil (Argon2id)', () => {
    it('should hash a plain password and verify successfully', async () => {
      const password = 'ApexSecurePassword2026!';
      const hash = await PasswordUtil.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await PasswordUtil.verify(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await PasswordUtil.verify(hash, 'WrongPassword!');
      expect(isInvalid).toBe(false);
    });
  });

  describe('JwtUtil', () => {
    it('should generate and verify JWT access tokens with correct payload', () => {
      const payload = {
        sub: 'usr-001',
        email: 'tariq.rahman@apexgarments.com',
        role: Role.SUPER_ADMIN,
        fullName: 'Tariq Rahman',
        facilityId: 'loc-corp-01',
      };

      const token = JwtUtil.generateAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = JwtUtil.verifyAccessToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(Role.SUPER_ADMIN);
      expect(decoded.fullName).toBe(payload.fullName);
    });

    it('should generate and verify refresh tokens', () => {
      const refreshToken = JwtUtil.generateRefreshToken({ sub: 'usr-001' });
      expect(typeof refreshToken).toBe('string');

      const decoded = JwtUtil.verifyRefreshToken(refreshToken);
      expect(decoded.sub).toBe('usr-001');
    });
  });
});
