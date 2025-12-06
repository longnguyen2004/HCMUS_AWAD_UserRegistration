import { DataTypes } from "sequelize";
import { Table, Model, Column } from "sequelize-typescript";

@Table
export class User extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.STRING, unique: true })
  declare username: string;

  @Column({ type: DataTypes.STRING, unique: true })
  declare email: string;

  @Column({ type: DataTypes.STRING, unique: true })
  declare phone: string;

  @Column({ type: DataTypes.STRING })
  declare passwordHash: string;

  @Column({ type: DataTypes.STRING })
  declare fullName: string;
}
