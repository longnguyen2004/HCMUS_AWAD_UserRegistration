import { DataTypes } from "sequelize";
import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Trip, Seat, User } from "./index.js";

@Table
export class Ticket extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Trip)
  @Column({ type: DataTypes.UUID })
  declare tripId: string;

  @BelongsTo(() => Trip, "tripId")
  declare trip: Trip;

  @ForeignKey(() => Seat)
  @Column({ type: DataTypes.UUID })
  declare seatId: string;

  @BelongsTo(() => Seat, "seatId")
  declare seat: Seat;

  @ForeignKey(() => User)
  @Column({ type: DataTypes.UUID, allowNull: true })
  declare userId?: string;

  @BelongsTo(() => User, "userId")
  declare user?: User;

  @Column({ type: DataTypes.INTEGER })
  declare price: number;

  @Column({ type: DataTypes.STRING })
  declare status: string;

  @Column({ type: DataTypes.STRING })
  declare email: string;

  @Column({ type: DataTypes.STRING })
  declare phone: string;

}
