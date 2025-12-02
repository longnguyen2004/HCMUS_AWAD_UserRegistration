import { DataTypes } from "sequelize";
import { Model, Table, Column } from "sequelize-typescript";

@Table
export class City extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.STRING })
  declare name: string;
}
