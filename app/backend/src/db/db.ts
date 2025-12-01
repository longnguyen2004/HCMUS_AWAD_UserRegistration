import { Sequelize } from "sequelize-typescript";
import { City } from "./models/city.model.js";
import { BusStop } from "./models/busstop.model.js";
import { Trip } from "./models/trip.model.js";
import { Route } from "./models/route.model.js";
import { RouteStop } from "./models/routeStop.model.js";
import { env } from "../lib/env.js";
import pg from "pg";

export const db = new Sequelize(env.DB_CONNECTION_STRING, {
  models: [City, BusStop, Trip, Route, RouteStop],
  dialect: "postgres",
  dialectModule: pg
});
