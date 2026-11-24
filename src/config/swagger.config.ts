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
      '/health': {
        get: {
          summary: 'Service Health Check',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Service is healthy and database is connected',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StandardResponse' },
                },
              },
            },
            503: {
              description: 'Service degraded (database unreachable)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Register New User',
          tags: ['Auth'],
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
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StandardResponse' },
                },
              },
            },
            409: {
              description: 'Email already exists',
            },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'User Login',
          tags: ['Auth'],
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
            200: {
              description: 'Login successful, returns JWT access and refresh tokens',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StandardResponse' },
                },
              },
            },
            401: {
              description: 'Invalid email or password',
            },
          },
        },
      },
      '/auth/refresh': {
        post: {
          summary: 'Refresh JWT Access Token',
          tags: ['Auth'],
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
            200: { description: 'Access token renewed' },
            401: { description: 'Invalid refresh token' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get Current Authenticated User Profile',
          tags: ['Auth'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Current profile data' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
