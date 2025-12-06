import { DataTypes } from "sequelize";
import { Table, Model, Column } from "sequelize-typescript";

@Table
export class Bus extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.STRING, unique: true })
  declare licensePlate: string;

  @Column({ type: DataTypes.STRING })
  declare model: string;

  @Column({ type: DataTypes.INTEGER })
  declare capacity: number;

  @Column({ type: DataTypes.STRING })
  declare status: string;
}
