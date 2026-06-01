import { Router } from 'express';
import users from '@/routes/v1/admin/users';
import { validateRoles } from '@/utils/validators';

const router = Router();

router.use(validateRoles(['admin']));

router.use('/users', users);

export default router;
