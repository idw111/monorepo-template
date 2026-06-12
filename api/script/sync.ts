import { connect } from '@/database/mysql';
import { signupUser } from '@/services/auth';

// 시드 관리자 계정 — .env의 SEED_ADMIN_* 값이 모두 있을 때만 생성한다
const seedAdmin = async () => {
  const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NICKNAME } = process.env;
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD || !SEED_ADMIN_NICKNAME) {
    console.log('SEED_ADMIN_* envvars not set. skipping admin seeding...');
    return;
  }
  await signupUser(SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NICKNAME, 'admin');
  console.log(`admin user created... ${SEED_ADMIN_EMAIL}`);
};

const sync = async () => {
  try {
    const sequelize = await connect();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    await seedAdmin();
    console.log('database sync finished...');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

sync();
