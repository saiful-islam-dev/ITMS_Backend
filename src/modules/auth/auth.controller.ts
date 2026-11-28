import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccessResponse } from '../../utils/response.util';
import { UnauthorizedError } from '../../errors/app.error';

export class AuthController {
  constructor(private readonly authService = new AuthService()) { }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);

      sendSuccessResponse({
        res,
        statusCode: 201,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.refreshToken(req.body.refreshToken);
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User session expired');
      }
      const profile = await this.authService.getProfile(req.user.sub);
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'User profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };
}
