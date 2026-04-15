import { Router } from 'express';

import users from '@/routes/admin/users';
import { validateRoles } from '@/utils/validators';

const router = Router();

router.use(validateRoles(['admin']));

router.use('/users', users);

export default router;
