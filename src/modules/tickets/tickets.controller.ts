import { Request, Response, NextFunction } from 'express';
import { TicketsService } from './tickets.service';
import { sendSuccessResponse, sendPaginatedResponse } from '../../utils/response.util';

export class TicketsController {
  constructor(private readonly ticketsService = new TicketsService()) {}

  public createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.ticketsService.createTicket(req.body);
      sendSuccessResponse({
        res,
        statusCode: 201,
        message: `Support incident ${ticket.ticketNumber} created successfully`,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await this.ticketsService.updateStatus(ticketId, req.body.status);
      sendSuccessResponse({
        res,
        statusCode: 200,
        message: `Ticket status updated to ${req.body.status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, totalItems } = await this.ticketsService.getTickets(req.query as any);
      sendPaginatedResponse({
        res,
        data,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        totalItems,
        message: 'Support tickets retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
