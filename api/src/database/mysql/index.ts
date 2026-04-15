import path from 'path';

import { Sequelize } from 'sequelize-typescript';

import envvars from '@/configs/envvars';

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
    timezone: '+09:00',
  });
  console.log('- mysql connected...', `mysql://${envvars.mysqlHost}:${envvars.mysqlPort}`);
  return sequelize;
};

export const getSequelize = (): Sequelize => sequelize;
