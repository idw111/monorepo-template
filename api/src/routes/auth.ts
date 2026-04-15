import { Router } from 'express';

import { authenticate, clearTokenCookie, parseJwt, setTokenCookie, signupUser } from '@/services/auth';
import { validateText } from '@/utils/validators';

const router = Router();

router.get('/', parseJwt, async (req, res) => {
  res.json({ user: res.locals.user ?? null });
});

router.post('/signup', validateText(['email', 'password', 'nickname']), async (req, res) => {
  const { email, password, nickname } = req.body;
  const { user, token } = await signupUser(email, password, nickname);
  setTokenCookie(res, token);
  res.json({ user });
});

router.post('/login', validateText(['email', 'password']), async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authenticate(email, password);
  setTokenCookie(res, token);
  res.json({ user });
});

router.post('/logout', async (req, res) => {
  const userId = res.locals.user?.id;
  clearTokenCookie(res);
  res.json({ userId });
});

export default router;
