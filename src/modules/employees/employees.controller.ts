import { Request, Response, NextFunction } from 'express';
import { EmployeesService } from './employees.service';
import { sendSuccessResponse, sendPaginatedResponse } from '../../utils/response.util';

export class EmployeesController {
  constructor(private readonly employeesService = new EmployeesService()) {}

  public getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, totalItems } = await this.employeesService.getEmployees(req.query as any);
      sendPaginatedResponse({
        res,
        data,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 8,
        totalItems,
        message: 'Employees retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.employeesService.getMetrics();
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: 'Employee aggregate metrics retrieved successfully',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  public createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newEmployee = await this.employeesService.createEmployee(req.body);
      sendSuccessResponse({
        res,
        statusCode: 201,
        message: 'Employee provisioned successfully in directory',
        data: newEmployee,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.employeesService.updateStatus(req.params.id, req.body.status);
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: `Employee status updated to ${req.body.status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  public exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const csv = await this.employeesService.exportCsv(req.query as any);
      const timestamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="apex_garments_employee_directory_${timestamp}.csv"`
      );
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };
}
