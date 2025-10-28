import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import adminRoutes from './routes/adminRoutes';
import swaggerSpec from './docs/swagger';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use('/admin', adminRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Admin Backend API' });
});

export default app;
