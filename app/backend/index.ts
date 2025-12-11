import "./src/db/db.js";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { auth } from "./src/modules/auth/index.js";
import { BusStopController } from "./src/modules/busstop/busstop.controller.js";
import { CityController } from "./src/modules/city/city.controller.js";
import { TripController } from "./src/modules/trip/trip.controller.js";
import { TicketController } from "./src/modules/ticket/ticket.controller.js";
import BusController from "./src/modules/bus/bus.controller.js";
import { EmailController } from "./src/modules/email/email.controller.js";

const app = new Elysia({ adapter: node() })
  .use(cors())
  .use(auth)
  .use(BusStopController)
  .use(CityController)
  .use(TripController)
  .use(TicketController)
  .use(BusController)
  .use(EmailController)
  .listen(3000);

export type App = typeof app;
export default app;

console.log(`Listening on http://localhost:3000`);
