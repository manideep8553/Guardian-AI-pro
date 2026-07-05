import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/v1/auth.routes';
import incidentRoutes from './routes/v1/incident.routes';
import workerRoutes from './routes/v1/worker.routes';
import factoryRoutes from './routes/v1/factory.routes';
import deviceRoutes from './routes/v1/device.routes';
import monitorRoutes from './routes/v1/monitor.routes';
import analyticsRoutes from './routes/v1/analytics.routes';
import { ApiError } from './utils/ApiError';

const app = express();

if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

app.use(helmet());
app.use(cors({
  origin: config.env === 'development' ? '*' : process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(config.apiPrefix, generalLimiter);

app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/incidents`, incidentRoutes);
app.use(`${config.apiPrefix}/workers`, workerRoutes);
app.use(`${config.apiPrefix}/factories`, factoryRoutes);
app.use(`${config.apiPrefix}/devices`, deviceRoutes);
app.use(`${config.apiPrefix}/monitor`, monitorRoutes);
app.use(`${config.apiPrefix}/analytics`, analyticsRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GuardianAI Pro API Docs',
}));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'GuardianAI Pro API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    models: 32,
    routes: 80,
    workers: 7,
    queues: 9,
  });
});

app.all('*', (_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
});

app.use(errorHandler);

export default app;
