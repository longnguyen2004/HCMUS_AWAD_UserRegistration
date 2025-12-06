import * as Models from "./models/index.js";

export function setupAssociations() {
  Models.BusStop.belongsTo(Models.City, { foreignKey: "cityId", as: "city" });
  Models.City.hasMany(Models.BusStop, { foreignKey: "cityId", as: "busStops" });

  Models.Seat.belongsTo(Models.Bus, { foreignKey: "busId" });
  Models.Bus.hasMany(Models.Seat, { foreignKey: "busId", as: "bus" });

  Models.Ticket.belongsTo(Models.Trip, { foreignKey: "tripId", as: "trip" });
  Models.Ticket.belongsTo(Models.Seat, { foreignKey: "seatId", as: "seat" });
  Models.Ticket.belongsTo(Models.User, { foreignKey: "userId", as: "user" });

  Models.Trip.belongsTo(Models.Bus, { foreignKey: "busId", as: "bus" });

  Models.TripBusStop.belongsTo(Models.Trip, { foreignKey: "tripId", as: "trip" });
  Models.Trip.hasMany(Models.TripBusStop, { foreignKey: "tripId", as: "tripBusStops" });
  Models.TripBusStop.belongsTo(Models.BusStop, { foreignKey: "busStopId", as: "busStop" });
  Models.BusStop.hasMany(Models.TripBusStop, { foreignKey: "busStopId", as: "tripBusStops" });
}
