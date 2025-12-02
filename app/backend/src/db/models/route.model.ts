import { DataTypes } from "sequelize";
import { Table, Model, Column, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { BusStop } from "./busstop.model.js";
import { RouteStop } from "./routeStop.model.js";

@Table
export class Route extends Model {
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => BusStop)
  @Column({ type: DataTypes.UUID })
  declare fromId: string;

  @BelongsTo(() => BusStop, "fromId")
  declare from: BusStop;

  @ForeignKey(() => BusStop)
  @Column({ type: DataTypes.UUID })
  declare toId: string;

  @BelongsTo(() => BusStop, "toId")
  declare to: BusStop;

  @HasMany(() => RouteStop)
  declare stops: RouteStop[];
}
