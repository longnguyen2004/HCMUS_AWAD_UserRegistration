import { DataTypes } from "sequelize";
import { Table, Model, Column, HasMany } from "sequelize-typescript";
import { TripBusStop } from "./tripbusstop.model.js";

@Table
export class Trip extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.DATE })
  declare departure: Date;

  @Column({ type: DataTypes.DATE })
  declare arrival: Date;

  @Column({ type: DataTypes.INTEGER })
  declare price: number;

  @Column({ type: DataTypes.STRING })
  declare status: string;

  @HasMany(() => TripBusStop, "tripId")
  declare tripBusStops: TripBusStop[];
}
