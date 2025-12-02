import { DataTypes } from "sequelize";
import { Table, Model, Column, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Trip } from "./trip.model.js";

@Table
export class Route extends Model {
  @Column({ type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true })
  declare id: string;
  
  @ForeignKey(() => Trip)
  @Column({ type: DataTypes.UUID, allowNull: true })
  declare tripId?: string;

  @BelongsTo(() => Trip, "tripId")
  declare trip?: Trip;

  @Column({ type: DataTypes.ARRAY(DataTypes.UUID), allowNull: true })
  declare stops: string[];
}
