import { z } from 'zod';

export const ticketSeverityEnum = z.enum([
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'critical',
  'high',
  'medium',
  'low',
]);

export const ticketStatusEnum = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'PENDING_VENDOR',
  'RESOLVED',
  'ASSIGNED',
  'CLOSED',
  'open',
  'in_progress',
  'pending_vendor',
  'resolved',
  'assigned',
  'closed',
]);

export const createTicketSchema = z.object({
  title: z.string().min(3, 'Incident title is required'),
  facilityId: z.string().optional(),
  facilityName: z.string().optional().default('Factory Building A'),
  scope: z.string().optional().default('Floor 2 — Sewing Line 08 (Station D)'),
  severity: ticketSeverityEnum.optional().default('HIGH'),
  category: z.string().optional().default('Hardware'),
  requester: z.string().min(2, 'Requester name is required'),
  requesterRole: z.string().optional().default('Line 08 Supervisor'),
  assignee: z.string().optional().default('Tanvir Hasan'),
  description: z.string().min(5, 'Incident description is required'),
});

export const updateTicketStatusSchema = z.object({
  status: ticketStatusEnum,
});

export const getTicketsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  severity: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  facilityId: z.string().optional(),
  search: z.string().optional(),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusDto = z.infer<typeof updateTicketStatusSchema>;
export type GetTicketsQueryDto = z.infer<typeof getTicketsQuerySchema>;
