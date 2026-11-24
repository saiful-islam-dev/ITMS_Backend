import { prisma } from '../../database/prisma.client';
import { CreateTicketDto, GetTicketsQueryDto } from './tickets.dto';
import { TicketSeverity, TicketStatus } from '@prisma/client';

export class TicketsService {
  public async createTicket(dto: CreateTicketDto) {
    let facilityId = dto.facilityId;
    if (!facilityId) {
      const facility = await prisma.facility.findFirst().catch(() => null);
      facilityId = facility?.id || 'loc-fct-01';
    }

    const ticketNumber = `#TCK-2024-${Math.floor(1050 + Math.random() * 8900)}`;

    const severityMap: Record<string, TicketSeverity> = {
      critical: TicketSeverity.CRITICAL,
      high: TicketSeverity.HIGH,
      medium: TicketSeverity.MEDIUM,
      low: TicketSeverity.LOW,
      CRITICAL: TicketSeverity.CRITICAL,
      HIGH: TicketSeverity.HIGH,
      MEDIUM: TicketSeverity.MEDIUM,
      LOW: TicketSeverity.LOW,
    };

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        title: dto.title,
        scope: dto.scope,
        severity: severityMap[dto.severity] || TicketSeverity.HIGH,
        status: TicketStatus.OPEN,
        category: dto.category || 'Hardware',
        description: dto.description,
        assigneeName: dto.assignee || 'Tanvir Hasan',
        facilityId,
      },
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

    return ticket;
  }

  public async updateStatus(ticketId: string, status: string) {
    const statusMap: Record<string, TicketStatus> = {
      open: TicketStatus.OPEN,
      in_progress: TicketStatus.IN_PROGRESS,
      pending_vendor: TicketStatus.PENDING_VENDOR,
      resolved: TicketStatus.RESOLVED,
      assigned: TicketStatus.ASSIGNED,
      closed: TicketStatus.CLOSED,
      OPEN: TicketStatus.OPEN,
      IN_PROGRESS: TicketStatus.IN_PROGRESS,
      PENDING_VENDOR: TicketStatus.PENDING_VENDOR,
      RESOLVED: TicketStatus.RESOLVED,
      ASSIGNED: TicketStatus.ASSIGNED,
      CLOSED: TicketStatus.CLOSED,
    };

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: statusMap[status] || TicketStatus.IN_PROGRESS },
      include: {
        facility: true,
      },
    });

    return updated;
  }

  public async getTickets(query: GetTicketsQueryDto) {
    const { page, limit, severity, status, category, facilityId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (severity && severity !== 'all') {
      where.severity = severity.toUpperCase() as TicketSeverity;
    }
    if (status && status !== 'all') {
      where.status = status.toUpperCase() as TicketStatus;
    }
    if (category && category !== 'all') {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (facilityId && facilityId !== 'all') {
      where.facilityId = facilityId;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { assigneeName: { contains: q, mode: 'insensitive' } },
      ];
    }

    try {
      const [totalItems, tickets] = await Promise.all([
        prisma.supportTicket.count({ where }),
        prisma.supportTicket.findMany({
          where,
          include: {
            facility: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        data: tickets,
        totalItems,
      };
    } catch {
      return {
        data: [],
        totalItems: 0,
      };
    }
  }
}
