import { CountOptions, FindOptions } from 'sequelize';
import { User } from '@/database/mysql/models/User';

export const countUsers = async (options: CountOptions): Promise<number> => {
  const count = await User.count(options);
  return count;
};

export const getUsers = async (options: FindOptions): Promise<User[]> => {
  const users = await User.findAll({
    ...options,
    attributes: ['id', 'email', 'nickname', 'role'],
    order: [['id', 'DESC']],
  });
  return users;
};
