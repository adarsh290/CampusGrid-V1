import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusGrid API',
      version: '1.0.0',
      description:
        'REST API for the CampusGrid game store platform. Provides endpoints for authentication, game browsing, purchasing, downloading, and admin management.',
      contact: {
        name: 'CampusGrid',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Application server (proxied via NGINX)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'A descriptive error message' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
            walletBalance: { type: 'number' },
            library: { type: 'array', items: { type: 'string' } },
          },
        },
        Game: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            developer: { type: 'string' },
            price: { type: 'number' },
            coverImage: { type: 'string', format: 'uri' },
            genre: { type: 'string' },
            screenshots: { type: 'array', items: { type: 'string', format: 'uri' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Scan all route files for JSDoc annotations
  apis: ['./routes/*.ts', './routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
