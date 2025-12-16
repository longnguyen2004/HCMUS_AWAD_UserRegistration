import { DataTypes } from "sequelize";
import {
  Table,
  Model,
  Column,
  PrimaryKey,
  AllowNull,
} from "sequelize-typescript";
import { Trip, BusStop } from "./index.js";

@Table
export class TripBusStop extends Model {
  @PrimaryKey
  @Column({ type: DataTypes.UUID })
  declare tripId: string;

  declare trip: Trip;

  @PrimaryKey
  @Column({ type: DataTypes.UUID })
  declare busStopId: string;

  declare busStop: BusStop;

  @PrimaryKey
  @Column({ type: DataTypes.SMALLINT })
  declare order: number;

  @AllowNull
  @Column({ type: DataTypes.SMALLINT })
  declare duration: number | null;
}
