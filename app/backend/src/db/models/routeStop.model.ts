import { DataTypes } from "sequelize";
import { Table, Model, Column, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Route } from "./route.model.js";
import { BusStop } from "./busstop.model.js";

@Table
export class RouteStop extends Model {
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => Route)
  @Column({ type: DataTypes.UUID })
  declare routeId: string;

  @BelongsTo(() => Route, "routeId")
  declare route: Route;

  @ForeignKey(() => BusStop)
  @Column({ type: DataTypes.UUID })
  declare busStopId: string;

  @BelongsTo(() => BusStop, "busStopId")
  declare busStop: BusStop;

  @Column({ type: DataTypes.INTEGER })
  declare order: number;
}
