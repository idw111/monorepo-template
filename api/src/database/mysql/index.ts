import path from 'path';
import { Sequelize } from 'sequelize-typescript';
import envvars from '@/configs/envvars';
import { logger } from '@/utils/logger';
import { loadModels } from '../loader';

let sequelize: Sequelize = null;

export const connect = async (): Promise<Sequelize> => {
  const models = await loadModels(path.join(__dirname, 'models'));
  sequelize = new Sequelize({
    dialect: 'mysql',
    database: envvars.mysqlDatabase,
    username: envvars.mysqlUsername,
    password: envvars.mysqlPassword,
    host: envvars.mysqlHost,
    port: envvars.mysqlPort,
    models,
    timezone: envvars.timezone,
  });

  try {
    await sequelize.authenticate();
    logger().info('- mysql connected... mysql://%s:%s', envvars.mysqlHost, envvars.mysqlPort);
    return sequelize;
  } catch (err) {
    logger().error(err, '- failed to connect to mysql');
    throw err;
  }
};

export const getSequelize = (): Sequelize => sequelize;
