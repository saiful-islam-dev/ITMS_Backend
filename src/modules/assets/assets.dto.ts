import { z } from 'zod';

export const registerAssetSchema = z.object({
  assetTag: z.string().min(3, 'Asset Tracking ID is required (e.g. AST-8925)'),
  serialNumber: z.string().min(3, 'Hardware Serial Number is required'),
  name: z.string().min(3, 'Asset formal name is required'),
  category: z.string().min(2, 'Equipment category is required'),
  brand: z.string().optional().default('Zebra Technologies'),
  modelRevision: z.string().optional().default('ZT410 (300 dpi Ethernet)'),
  purchaseDate: z.string().min(4, 'Purchase date is required'),
  costBdt: z.coerce.number().optional().default(185000),
  vendor: z.string().optional().default('Flora Systems Ltd.'),
  warrantyExpires: z.string().min(4, 'Warranty expiry date is required'),
  attachedInvoice: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default(['Factory Critical', 'Line Automation']),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'OFFLINE', 'STORAGE', 'active', 'maintenance', 'offline', 'storage']).optional().default('ACTIVE'),
  assignedTo: z.string().min(2, 'Designated custodian employee is required'),
  facilityId: z.string().optional(),
  facilityName: z.string().optional().default('Gazipur Plant Complex (Plant A)'),
  locationDetail: z.string().optional().default('Floor 2 — Sewing Line 08 (Station D)'),
  department: z.string().optional().default('Cutting & Sewing Ops (DPT-002)'),
  macAddress: z.string().optional().default('00:1B:44:11:3A:B7'),
  ipAddress: z.string().optional().default('10.14.88.42'),
  vlanSubnet: z.string().optional().default('Industrial-VLAN-10'),
  isVlanEnabled: z.boolean().optional().default(true),
});

export const getAssetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  category: z.string().optional(),
  campus: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type RegisterAssetDto = z.infer<typeof registerAssetSchema>;
export type GetAssetsQueryDto = z.infer<typeof getAssetsQuerySchema>;
