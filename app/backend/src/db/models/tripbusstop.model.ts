import { DataTypes } from "sequelize";
import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from "sequelize-typescript";
import { Trip, BusStop } from "./index.js";

@Table
export class TripBusStop extends Model {
  @PrimaryKey
  @ForeignKey(() => Trip)
  @Column({ type: DataTypes.UUID })
  declare tripId: string;

  @BelongsTo(() => Trip, "tripId")
  declare trip: Trip;

  @PrimaryKey
  @ForeignKey(() => BusStop)
  @Column({ type: DataTypes.UUID })
  declare busStopId: string;

  @BelongsTo(() => BusStop, "busStopId")
  declare busStop: BusStop;

  @Column({ type: DataTypes.SMALLINT })
  declare order: number;
}
