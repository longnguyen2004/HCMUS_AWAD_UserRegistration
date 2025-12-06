import * as Models from "./models/index.js";

export function setupAssociations() {
  Models.BusStop.belongsTo(Models.City, { foreignKey: "cityId" });
  Models.City.hasMany(Models.BusStop, { foreignKey: "cityId" });

  Models.Seat.belongsTo(Models.Bus, { foreignKey: "busId" });
  Models.Bus.hasMany(Models.Seat, { foreignKey: "busId" });

  Models.Ticket.belongsTo(Models.Trip, { foreignKey: "tripId" });
  Models.Ticket.belongsTo(Models.Seat, { foreignKey: "seatId" });
  Models.Ticket.belongsTo(Models.User, { foreignKey: "userId" });

  Models.Trip.belongsTo(Models.Bus, { foreignKey: "busId" });

  Models.TripBusStop.belongsTo(Models.Trip, { foreignKey: "tripId" });
  Models.Trip.hasMany(Models.TripBusStop, { foreignKey: "tripId" });
  Models.TripBusStop.belongsTo(Models.BusStop, { foreignKey: "busId" });
  Models.BusStop.hasMany(Models.TripBusStop, { foreignKey: "busId" });
}
