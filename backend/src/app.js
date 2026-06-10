import cookieParser from 'cookie-parser';
import progressRouter from './modules/progress/progress.router.js';
import vocabularyRouter from './modules/vocabulary/vocabulary.router.js';
import shadowingRouter from './modules/shadowing/shadowing.router.js';
import dictationRouter from './modules/dictation/dictation.router.js';
import lessonRouter from './modules/lesson/lesson.router.js';
import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './modules/auth/auth.router.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapiDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config', 'openapi.json'), 'utf8')
);

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/lessons', lessonRouter);
app.use('/api/v1/dictation', dictationRouter);
app.use('/api/v1/shadowing', shadowingRouter);
app.use('/api/v1/vocabulary', vocabularyRouter);
app.use('/api/v1/progress', progressRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
