import { DataTypes } from "sequelize";
import { Table, Model, Column, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Bus } from "./index.js";

@Table
export class Seat extends Model {
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => Bus)
  @Column({ type: DataTypes.UUID })
  declare busId: string;

  @BelongsTo(() => Bus, "busId")
  declare bus: Bus;

  @Column({ type: DataTypes.STRING })
  declare seatNumber: string;

  @Column({ type: DataTypes.STRING })
  declare type: string;
}
