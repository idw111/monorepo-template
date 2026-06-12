import { Router } from 'express';
import { getSequelize } from '@/database/mysql';
import admin from '@/routes/v1/admin';
import auth from '@/routes/v1/auth';
import { parseJwt } from '@/services/auth';
import { authRateLimiter, rateLimiter } from '@/utils/middleware';

const router = Router();

router.use(rateLimiter);

router.get('/status', async (req, res) => {
  const sequelize = getSequelize();
  try {
    await sequelize.authenticate();
    res.send('OK');
  } catch {
    res.status(500).send('Not OK');
  }
});

router.use('/auth', authRateLimiter, auth);

router.use(parseJwt);

router.use('/admin', admin);

export default router;
