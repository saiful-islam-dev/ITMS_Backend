import { z } from 'zod';

export const getFacilitiesQuerySchema = z.object({
  category: z.enum(['all', 'corporate', 'manufacturing', 'warehouse']).optional().default('all'),
  status: z.enum(['all', 'healthy', 'operational', 'warning', 'critical', 'maintenance']).optional().default('all'),
});

export type GetFacilitiesQueryDto = z.infer<typeof getFacilitiesQuerySchema>;
