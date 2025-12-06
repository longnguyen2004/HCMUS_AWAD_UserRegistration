import { DataTypes } from "sequelize";
import { Table, Model, Column, createIndexDecorator } from "sequelize-typescript";
import type { Bus } from "./index.js";

const SeatUniqueIndex = createIndexDecorator({
  name: "seat_unique",
  type: "UNIQUE",
  unique: true
})

@Table
export class Seat extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @SeatUniqueIndex
  @Column({ type: DataTypes.UUID })
  declare busId: string;

  declare bus: Bus;

  @Column({ type: DataTypes.STRING })
  declare seatNumber: string;

  @Column({ type: DataTypes.STRING })
  declare type: string;

  @SeatUniqueIndex
  @Column({ type: DataTypes.SMALLINT })
  declare row: number;

  @SeatUniqueIndex
  @Column({ type: DataTypes.SMALLINT })
  declare col: number;
}
