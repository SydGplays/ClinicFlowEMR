import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { prisma } from './db';
import apiRouter from './routes';
import { errorHandler, notFound } from './middleware/error';
import './types';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ClinicFlow EMR API' }));
app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, () => console.log(`ClinicFlow API listening on http://localhost:${config.port}`));

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

