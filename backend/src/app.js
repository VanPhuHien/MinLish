import cookieParser from 'cookie-parser';
import progressRouter from './modules/progress/progress.router.js';
import vocabularyRouter from './modules/vocabulary/vocabulary.router.js';
import shadowingRouter from './modules/shadowing/shadowing.router.js';
import dictationRouter from './modules/dictation/dictation.router.js';
import lessonRouter from './modules/lesson/lesson.router.js';
import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import errorLogger from './middlewares/errorLogger.js';
import requestLogger from './middlewares/requestLogger.js';
import authRouter from './modules/auth/auth.router.js';
import swaggerUi from 'swagger-ui-express';
import openapiDocument from './config/openapi/index.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/lessons', lessonRouter);
app.use('/api/v1/dictation', dictationRouter);
app.use('/api/v1/shadowing', shadowingRouter);
app.use('/api/v1/vocabulary', vocabularyRouter);
app.use('/api/v1/progress', progressRouter);

// Global Error Handler
app.use(errorLogger);
app.use(errorHandler);

export default app;
