import { Request, Response, NextFunction } from 'express';
import { FacilitiesService } from './facilities.service';
import { sendSuccessResponse } from '../../utils/response.util';

export class FacilitiesController {
  constructor(private readonly facilitiesService = new FacilitiesService()) {}

  public getFacilities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const facilities = await this.facilitiesService.getFacilities(req.query as any);
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'Facilities and network health telemetry retrieved successfully',
        data: facilities,
      });
    } catch (error) {
      next(error);
    }
  };

  public pingAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pingResult = await this.facilitiesService.pingAll();
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'Global SD-WAN mesh ping test executed across all campuses',
        data: pingResult,
      });
    } catch (error) {
      next(error);
    }
  };

  public getThermals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const thermals = await this.facilitiesService.getThermals(req.params.id);
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'Facility environmental and thermal sensor diagnostics retrieved',
        data: thermals,
      });
    } catch (error) {
      next(error);
    }
  };
}
