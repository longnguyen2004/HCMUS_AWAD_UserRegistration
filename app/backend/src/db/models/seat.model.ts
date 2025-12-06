import { DataTypes } from "sequelize";
import { Table, Model, Column } from "sequelize-typescript";
import type { Bus } from "./index.js";

@Table
export class Seat extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.UUID })
  declare busId: string;

  declare bus: Bus;

  @Column({ type: DataTypes.STRING })
  declare seatNumber: string;

  @Column({ type: DataTypes.STRING })
  declare type: string;
}
