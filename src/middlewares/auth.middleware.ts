import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { env } from '../config/env.config';
import { Role } from '../constants/roles.enum';
import { UnauthorizedError, ForbiddenError } from '../errors/app.error';
import { JwtPayload } from '../utils/jwt.util';
import { prisma } from '../database/prisma.client';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          facilityId: true,
        },
      });

      if (!user) {
        return done(null, false);
      }

      if (user.status === 'SUSPENDED') {
        return done(new ForbiddenError('Account is suspended. Please contact IT administrator.'), false);
      }

      return done(null, {
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as Role,
        facilityId: user.facilityId,
      });
    } catch (error) {
      return done(error, false);
    }
  })
);

export function authenticateJwt(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: JwtPayload | false, info: unknown) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new UnauthorizedError(info instanceof Error ? info.message : 'Invalid or expired access token'));
    }
    req.user = user;
    next();
  })(req, res, next);
}

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden. Requires one of roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
}
