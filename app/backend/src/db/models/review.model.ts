import { DataTypes } from "sequelize";
import { Model, Table, Column, PrimaryKey } from "sequelize-typescript";
import { Trip } from "./trip.model.js";

@Table
export class Review extends Model {
  @PrimaryKey
  @Column({ type: DataTypes.UUID })
  declare tripId: string;

  declare trip: Trip;

  @PrimaryKey
  @Column({ type: DataTypes.UUID })
  declare userId: string;

  @Column({ type: DataTypes.TINYINT })
  declare star: number;

  @Column({ type: DataTypes.STRING })
  declare message?: string;
}
