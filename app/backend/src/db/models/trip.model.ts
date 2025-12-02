import { DataTypes } from "sequelize";
import { Route } from "./route.model.js";
import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

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

  @ForeignKey(() => Route)
  @Column({ type: DataTypes.UUID, allowNull: true })
  declare routeId?: string;

  @BelongsTo(() => Route, "routeId")
  declare route?: Route;
}
