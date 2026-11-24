import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.config';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Apex Garments ITMS Enterprise API',
      version: '1.0.0',
      description:
        'Industrial IT Operations Management & Facility System Backend API for Apex Garments distributed campuses, network topology, and IT hardware assets.',
      contact: {
        name: 'Apex IT Operations Team',
        email: 'it.ops@apexgarments.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token (e.g. Bearer eyJhbGciOi...)',
        },
      },
      schemas: {
        StandardResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            error: { type: 'string', example: 'BadRequest' },
            message: { type: 'string', example: 'Validation failed' },
            validationErrors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    paths: {
      // 1. Health
      '/health': {
        get: {
          summary: 'Service Health Check',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Service is healthy and database is connected',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } },
            },
            503: {
              description: 'Service degraded (database unreachable)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },

      // 2. Auth APIs
      '/auth/register': {
        post: {
          summary: 'Register New User',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['fullName', 'email', 'password'],
                  properties: {
                    fullName: { type: 'string', example: 'Tanvir Hasan' },
                    email: { type: 'string', format: 'email', example: 'tanvir.hasan@apexgarments.com' },
                    password: { type: 'string', minLength: 8, example: 'SecurePassword123!' },
                    role: { type: 'string', enum: ['SUPER_ADMIN', 'FACILITY_ADMIN', 'FIELD_TECH', 'COMPLIANCE_AUDITOR', 'VIEWER'], example: 'FIELD_TECH' },
                    facilityId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'User Login',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'tariq.rahman@apexgarments.com' },
                    password: { type: 'string', example: 'MasterAdminPassword123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns JWT access and refresh tokens', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
            401: { description: 'Invalid email or password' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          summary: 'Refresh JWT Access Token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Access token renewed', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
            401: { description: 'Invalid refresh token' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get Current Authenticated User Profile',
          tags: ['Authentication'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Current profile data', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
            401: { description: 'Unauthorized' },
          },
        },
      },

      // 3. Employees APIs
      '/employees': {
        get: {
          summary: 'Get employees with filtering, search, and pagination',
          tags: ['Employees'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Search name, email, or employeeId' },
            { in: 'query', name: 'department', schema: { type: 'string' } },
            { in: 'query', name: 'facility', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED'] } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 8 } },
          ],
          responses: {
            200: { description: 'Paginated employee directory', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
        post: {
          summary: 'Create / Provision new employee',
          tags: ['Employees'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['employeeId', 'fullName', 'email', 'department', 'designation', 'location'],
                  properties: {
                    employeeId: { type: 'string', example: 'EMP-9821' },
                    fullName: { type: 'string', example: 'Mohammad Farhad' },
                    email: { type: 'string', format: 'email', example: 'm.farhad@apexgarments.com' },
                    department: { type: 'string', example: 'Cutting & Sewing' },
                    designation: { type: 'string', example: 'Senior Quality Inspector' },
                    location: { type: 'string', example: 'Gazipur Plant Complex (Plant A)' },
                    status: { type: 'string', enum: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED'], default: 'ACTIVE' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Employee provisioned successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
      '/employees/metrics': {
        get: {
          summary: 'Get employee headcount & department statistics',
          tags: ['Employees'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Headcount metrics and department breakdown', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
      '/employees/export/csv': {
        get: {
          summary: 'Export employee directory as CSV',
          tags: ['Employees'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'CSV file download',
              content: { 'text/csv': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/employees/{id}/status': {
        patch: {
          summary: 'Update employee employment status',
          tags: ['Employees'],
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Status updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },

      // 4. IT Assets APIs
      '/assets': {
        get: {
          summary: 'Get IT assets inventory with pagination & filtering',
          tags: ['IT Assets'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'category', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'facilityId', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Asset list', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
      '/assets/register': {
        post: {
          summary: 'Register new hardware asset',
          tags: ['IT Assets'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['assetTrackingId', 'serialNumber', 'assetName', 'equipmentCategory', 'manufacturer', 'modelRevision', 'purchaseDate', 'acquisitionCost', 'vendor', 'warrantyExpiry', 'lifecycleStatus', 'custodianId', 'facilityLocation'],
                  properties: {
                    assetTrackingId: { type: 'string', example: 'AST-8925' },
                    serialNumber: { type: 'string', example: 'SN-4820199025-GB' },
                    assetName: { type: 'string', example: 'Zebra ZT410 Industrial Thermal Barcode Printer' },
                    equipmentCategory: { type: 'string', example: 'Industrial Label Printer' },
                    manufacturer: { type: 'string', example: 'Zebra Technologies' },
                    modelRevision: { type: 'string', example: 'ZT410 (300 dpi Ethernet)' },
                    purchaseDate: { type: 'string', format: 'date', example: '2025-05-18' },
                    acquisitionCost: { type: 'number', example: 185000 },
                    vendor: { type: 'string', example: 'Flora Systems Ltd.' },
                    warrantyExpiry: { type: 'string', format: 'date', example: '2028-05-18' },
                    attachedInvoiceUrl: { type: 'string', example: 'uploads/challans/delivery_challan_8925.pdf' },
                    tags: { type: 'array', items: { type: 'string' }, example: ['Factory Critical', 'Line Automation'] },
                    lifecycleStatus: { type: 'string', example: 'Assigned to Production Floor' },
                    custodianId: { type: 'string', example: 'EMP-3114' },
                    custodianName: { type: 'string', example: 'Kabir Hossain' },
                    facilityLocation: { type: 'string', example: 'Gazipur Plant Complex (Plant A)' },
                    floorStation: { type: 'string', example: 'Floor 2 - Sewing Line 08 (Station D)' },
                    linkedDepartment: { type: 'string', example: 'Cutting & Sewing Ops (DPT-002)' },
                    assignVlanIp: { type: 'boolean', example: true },
                    macAddress: { type: 'string', example: '00:1B:44:11:3A:B7' },
                    reservedIp: { type: 'string', example: '10.14.88.42' },
                    subnet: { type: 'string', example: 'Industrial-VLAN-10' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Hardware asset registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
      '/assets/upload-challan': {
        post: {
          summary: 'Upload delivery challan or invoice document (PDF / JPG / PNG)',
          tags: ['IT Assets'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Challan file uploaded successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
      '/assets/{id}/ping': {
        post: {
          summary: 'Execute asset network ping test',
          tags: ['IT Assets'],
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Ping result with packet stats and latency', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },

      // 5. Support Tickets APIs
      '/tickets': {
        get: {
          summary: 'Get all support tickets with pagination & filters',
          tags: ['Support Tickets'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } },
            { in: 'query', name: 'priority', schema: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Ticket list', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
        post: {
          summary: 'Create support ticket',
          tags: ['Support Tickets'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'category', 'priority', 'facilityId'],
                  properties: {
                    title: { type: 'string', example: 'Sewing Floor #4 Switch Port flapping causing RFID dropouts' },
                    description: { type: 'string', example: 'Cisco Catalyst 2960 switch port Gi0/14 intermittently down.' },
                    category: { type: 'string', example: 'Network Infrastructure' },
                    priority: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], example: 'HIGH' },
                    facilityId: { type: 'string', example: 'fac-gzp-01' },
                    assetId: { type: 'string', example: 'AST-8925' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Support ticket opened successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
      '/tickets/{id}/status': {
        patch: {
          summary: 'Update ticket status and resolution notes',
          tags: ['Support Tickets'],
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
                    notes: { type: 'string', example: 'Re-crimped RJ45 patch cable, interface now stable.' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Ticket status updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },

      // 6. Facilities & Network APIs
      '/facilities': {
        get: {
          summary: 'Get all facilities and network health topology',
          tags: ['Facilities & Network'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['OPTIMAL', 'DEGRADED', 'OFFLINE'] } },
            { in: 'query', name: 'zone', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Facilities and network health overview', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
      '/facilities/ping-all': {
        post: {
          summary: 'Ping all facilities and aggregate round-trip latency & packet health',
          tags: ['Facilities & Network'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Diagnostic ping results for all facilities', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
      '/facilities/{id}/thermals': {
        get: {
          summary: 'Get facility server room temperature, humidity & HVAC metrics',
          tags: ['Facilities & Network'],
          security: [{ BearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Facility thermal telemetry data', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
