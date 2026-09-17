// 创建并配置 AlgoLift Express 应用。
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { healthRouter } from './modules/health/health.route';
import { authRouter } from './modules/auth/auth.route';
import { categoryRouter } from './modules/category/category.route';
import { problemNotesRouter } from './modules/problem-notes/problem-notes.route';
import { problemRouter } from './modules/problem/problem.route';

export const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', categoryRouter);
app.use('/api', problemNotesRouter);
app.use('/api', problemRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`AlgoLift backend listening on port ${config.port}`);
  });
}
