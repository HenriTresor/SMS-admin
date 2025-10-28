import swaggerJsdoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Credit Jambo Admin API',
    version: '1.0.0',
    description:
      'REST API for the Credit Jambo administrator dashboard. Use the available operations to authenticate admins, review users/devices, and manage verification workflows.',
  },
  servers: [
    {
      url: process.env.SWAGGER_BASE_URL || 'http://localhost:3001',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      AdminLoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            example: 'admin',
          },
          password: {
            type: 'string',
            example: 'admin123',
          },
        },
      },
      AdminLoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT access token to authorize subsequent requests',
          },
          admin: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              username: {
                type: 'string',
              },
            },
          },
        },
      },
      AdminErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
        },
      },
      UserSummary: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          balance: { type: 'number', format: 'double' },
          createdAt: { type: 'string', format: 'date-time' },
          devices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                isVerified: { type: 'boolean' },
              },
            },
          },
        },
      },
      DeviceSummary: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          deviceId: { type: 'string' },
          isVerified: { type: 'boolean' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
      TransactionSummary: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          amount: { type: 'number', format: 'double' },
          type: { type: 'string', enum: ['DEPOSIT', 'WITHDRAW'] },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: 'Auth', description: 'Admin authentication endpoints' },
    { name: 'Users', description: 'Manage customer accounts' },
    { name: 'Devices', description: 'Review and verify user devices' },
    { name: 'Transactions', description: 'Inspect savings transactions' },
  ],
  paths: {
    '/admin/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate an admin and receive a JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AdminLoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful authentication',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminLoginResponse',
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Users'],
        summary: 'List all customer accounts',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Array of users with device summaries',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/UserSummary',
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/admin/devices': {
      get: {
        tags: ['Devices'],
        summary: 'List all registered devices',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Array of registered devices',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/DeviceSummary',
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/admin/devices/{deviceId}/verify': {
      put: {
        tags: ['Devices'],
        summary: 'Verify a pending device',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'deviceId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Updated device record',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DeviceSummary',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Device not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/admin/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'Retrieve all transactions',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Array of transactions',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/TransactionSummary',
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({ definition, apis: [] });

export default swaggerSpec;
