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
import { practiceRecordRouter } from './modules/practice-record/practice-record.route';
import { noteRouter } from './modules/note/note.route';
import { todoRouter } from './modules/todo/todo.route';
import { progressRouter } from './modules/progress/progress.route';
import { wrongRouter } from './modules/wrong/wrong.route';
import { wrongNotesRouter } from './modules/wrong-notes/wrong-notes.route';
import { statsRouter } from './modules/stats/stats.route';

export const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', categoryRouter);
app.use('/api', problemNotesRouter);
app.use('/api', problemRouter);
app.use('/api', practiceRecordRouter);
app.use('/api', noteRouter);
app.use('/api', todoRouter);
app.use('/api', progressRouter);
app.use('/api', wrongRouter);
app.use('/api', wrongNotesRouter);
app.use('/api', statsRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`AlgoLift backend listening on port ${config.port}`);
  });
}
