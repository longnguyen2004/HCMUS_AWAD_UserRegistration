import { DataTypes } from "sequelize";
import { Table, Model, Column } from "sequelize-typescript";
import type { Trip, Seat } from "./index.js";

@Table
export class Ticket extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.UUID })
  declare tripId: string;

  declare trip: Trip;

  @Column({ type: DataTypes.UUID })
  declare seatId: string;

  declare seat: Seat;

  @Column({ type: DataTypes.UUID, allowNull: true })
  declare userId?: string;

  @Column({ type: DataTypes.INTEGER })
  declare price: number;

  @Column({ type: DataTypes.STRING })
  declare status: string;

  @Column({ type: DataTypes.STRING })
  declare email: string;

  @Column({ type: DataTypes.STRING })
  declare phone: string;

  @Column({ type: DataTypes.BIGINT, allowNull: true })
  declare orderId?: number;
}
