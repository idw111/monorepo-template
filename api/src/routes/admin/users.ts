import { Router } from 'express';
import { countUsers, getUsers } from '@/services/users';
import { getPaging } from '@/utils/paging';
import { validateRoles } from '@/utils/validators';

const router = Router();

router.get('/', validateRoles(['admin']), async (req, res) => {
  const { page, pageSize, offset, limit } = getPaging(req.query);
  const total = await countUsers({});
  const users = await getUsers({ offset, limit });
  res.json({ users, paging: { page, pageSize, total } });
});

export default router;
