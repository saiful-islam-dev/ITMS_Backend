import { Request, Response, NextFunction } from 'express';
import { AssetsService } from './assets.service';
import { sendSuccessResponse, sendPaginatedResponse } from '../../utils/response.util';
import { BadRequestError } from '../../errors/app.error';

export class AssetsController {
  constructor(private readonly assetsService = new AssetsService()) {}

  public registerAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newAsset = await this.assetsService.registerAsset(req.body);
      sendSuccessResponse({
        res,
        statusCode: 201,
        message: `Hardware asset ${newAsset.assetTag} successfully registered into fleet ledger`,
        data: newAsset,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, totalItems } = await this.assetsService.getAssets(req.query as any);
      sendPaginatedResponse({
        res,
        data,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        totalItems,
        message: 'Hardware assets retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public uploadChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('Please provide a file attachment (PDF or image challan)');
      }

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        fileUrl: `/uploads/challans/${req.file.filename}`,
        uploadedAt: new Date().toISOString(),
      };

      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'Delivery invoice/challan uploaded successfully',
        data: fileData,
      });
    } catch (error) {
      next(error);
    }
  };

  public pingAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.assetsService.pingAsset(assetId);
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'Asset network ICMP ping check executed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
