import { City } from "./city.model.js";
import { TripBusStop } from "./tripbusstop.model.js";
import { DataTypes } from "sequelize";
import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";

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

  @ForeignKey(() => City)
  @Column({ type: DataTypes.UUID })
  declare cityId: string;

  @BelongsTo(() => City, "cityId")
  declare city: City;

  @HasMany(() => TripBusStop, "busStopId")
  declare tripBusStops: TripBusStop[];
}
