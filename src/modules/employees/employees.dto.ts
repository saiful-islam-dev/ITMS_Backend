import { z } from 'zod';

export const employeeStatusEnum = z.enum([
  'ACTIVE',
  'ON_CALL',
  'LEAVE',
  'SUSPENDED',
  'OFFBOARDING',
  'active',
  'on_call',
  'leave',
  'suspended',
  'offboarding',
]);

export const getEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(8),
  tab: z.enum(['all', 'supervisors', 'corporate', 'it_systems']).optional().default('all'),
  department: z.string().optional(),
  facilityId: z.string().optional(),
  location: z.string().optional(),
  status: employeeStatusEnum.optional(),
  search: z.string().optional(),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  role: z.string().min(2, 'Role/Designation is required'),
  title: z.string().optional(),
  department: z.string().min(2, 'Department is required'),
  shift: z.string().default('General (09:00 - 18:00)'),
  phone: z.string().min(5, 'Valid phone number is required'),
  email: z.string().email('Valid work email is required'),
  status: employeeStatusEnum.optional().default('ACTIVE'),
  isAdmin: z.boolean().optional().default(false),
  avatar: z.string().optional().default(''),
  certifications: z.array(z.string()).optional().default([]),
  specialty: z.string().optional().default('General Operations Support'),
  linkedAssets: z.array(z.string()).optional().default([]),
  facilityId: z.string().optional(),
  facilityName: z.string().optional(),
});

export const updateEmployeeStatusSchema = z.object({
  status: employeeStatusEnum,
});

export type GetEmployeesQueryDto = z.infer<typeof getEmployeesQuerySchema>;
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeStatusDto = z.infer<typeof updateEmployeeStatusSchema>;
