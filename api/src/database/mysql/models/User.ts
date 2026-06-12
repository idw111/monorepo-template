import { Column, DataType, Model, Table } from 'sequelize-typescript';
import type { UserRole } from 'shared';

export const UserRoleValues = ['user', 'admin'] as const satisfies readonly UserRole[];
export type { UserRole };

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column
  password!: string;

  @Column
  nickname!: string;

  @Column({ type: DataType.ENUM, values: UserRoleValues })
  role!: UserRole;

  toJSON() {
    const { password: _, ...json } = this.get({ plain: true });
    return json;
  }
}
