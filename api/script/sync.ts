import { connect } from '@/database/mysql';
import { signupUser } from '@/services/auth';

const sync = async () => {
  try {
    const sequelize = await connect();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    await signupUser('idw111@gmail.com', 'test1234', '임동원', 'admin');
    console.log('database sync finished...');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

sync();
