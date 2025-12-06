import type { City, TripBusStop } from "./index.js";
import { DataTypes } from "sequelize";
import { Table, Model, Column } from "sequelize-typescript";

@Table
export class BusStop extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.STRING })
  declare name: string;

  @Column({ type: DataTypes.UUID })
  declare cityId: string;

  declare city: City;
  declare tripBusStops: TripBusStop[];
}
