import { DataTypes } from "sequelize";
import { Table, Model, Column } from "sequelize-typescript";
import type { Bus, TripBusStop } from "./index.js";

@Table
export class Trip extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.UUID })
  declare busId: string;

  declare bus: Bus;

  @Column({ type: DataTypes.DATE })
  declare departure: Date;

  @Column({ type: DataTypes.DATE })
  declare arrival: Date;

  @Column({ type: DataTypes.INTEGER })
  declare price: number;

  @Column({ type: DataTypes.STRING })
  declare status: string;

  declare tripBusStops: TripBusStop[];
}
