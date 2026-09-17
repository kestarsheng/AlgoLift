// 配置并导出后端 API 的 Swagger 文档。
import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.3',
    info: { title: 'AlgoLift API', version: '0.1.0' },
    servers: [{ url: '/api' }]
  },
  apis: ['src/modules/**/*.route.ts']
};

export const swaggerSpec = swaggerJSDoc(options);
