import * as Models from "./models/index.js"
import { env } from "../lib/env.js";
import { Sequelize } from "sequelize-typescript";
import pg from "pg";

export const db = new Sequelize(env.DB_CONNECTION_STRING, {
  models: [Models.City, Models.BusStop, Models.Trip, Models.TripBusStop, Models.Bus, Models.Ticket, Models.Seat, Models.User],
  dialect: "postgres",
  dialectModule: pg,
});
