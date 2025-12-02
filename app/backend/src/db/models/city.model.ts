import { BusStop } from "./busstop.model.js";
import { DataTypes } from "sequelize";
import { Model, Table, Column, HasMany } from "sequelize-typescript";

@Table
export class City extends Model {
  @Column({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataTypes.STRING })
  declare name: string;

  @HasMany(() => BusStop, "cityId")
  declare busStops: BusStop[];
}
