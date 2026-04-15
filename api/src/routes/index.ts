import { Router } from 'express';

import { getSequelize } from '@/database/mysql';
import admin from '@/routes/admin';
import auth from '@/routes/auth';
import { parseJwt } from '@/services/auth';

const router = Router();

router.get('/status', async (req, res) => {
  const sequelize = getSequelize();
  try {
    await sequelize.authenticate();
    res.send('OK');
  } catch {
    res.status(500).send('Not OK');
  }
});

router.use('/auth', auth);

router.use(parseJwt);

router.use('/admin', admin);

export default router;
