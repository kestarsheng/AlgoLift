// 配置并导出后端 API 的 Swagger 文档。
import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.3',
    info: { title: 'AlgoLift API', version: '0.1.0' },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        RegisterRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8, maxLength: 72 }, displayName: { type: 'string' } } },
        LoginRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } }
      }
    }
  },
  apis: ['src/modules/**/*.route.ts']
};

export const swaggerSpec = swaggerJSDoc(options);
