import { Sequelize } from "sequelize-typescript";
import { City } from "./models/city.model.js";
import { BusStop } from "./models/busstop.model.js";
import { Trip } from "./models/trip.model.js";
import { TripBusStop } from "./models/tripbusstop.model.js";
import { env } from "../lib/env.js";
import pg from "pg";

export const db = new Sequelize(env.DB_CONNECTION_STRING, {
  models: [City, BusStop, Trip, TripBusStop],
  dialect: "postgres",
  dialectModule: pg,
});
