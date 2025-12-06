import { db } from "./src/db/db.js";
import { City } from "./src/db/models/city.model.js";
import { BusStop } from "./src/db/models/busstop.model.js";
import { Trip } from "./src/db/models/trip.model.js";
import { TripBusStop } from "./src/db/models/tripbusstop.model.js";
import { Bus } from "./src/db/models/bus.model.js";
import { Seat } from "./src/db/models/seat.model.js";
import { Ticket } from "./src/db/models/ticket.model.js";
import { User } from "./src/db/models/user.model.js";

// Helper to build departure/arrival times
const makeDate = (daysFromNow: number, hour: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
};

// Sync DB and seed sample data for development.
// Run with: `pnpm exec tsx --env-file=.env ./create_db.ts`
try {
  // Drop & recreate tables to ensure clean seed (change to { alter: true } for safer updates)
  await db.sync({ force: true });

  // Create cities
  const [cityA, cityB, cityC] = await Promise.all([
    City.create({ name: "City A" }),
    City.create({ name: "City B" }),
    City.create({ name: "City C" }),
  ]);

  // Create bus stops
  const [stopA1, stopB1, stopC1] = await Promise.all([
    BusStop.create({ name: "Central Station", cityId: cityA.id }),
    BusStop.create({ name: "North Stop", cityId: cityB.id }),
    BusStop.create({ name: "East Terminal", cityId: cityC.id }),
  ]);

  // Create bus
  const bus1 = await Bus.create({
    licensePlate: "51A-12345",
    model: "Hyundai County",
    capacity: 30,
    status: "active",
  });

  // Create seats for bus1
  const seats = await Promise.all([
    Seat.create({ busId: bus1.id, seatNumber: "A1", type: "regular", row: 0, col: 0 }),
    Seat.create({ busId: bus1.id, seatNumber: "A2", type: "regular", row: 0, col: 1 }),
    Seat.create({ busId: bus1.id, seatNumber: "A3", type: "regular", row: 0, col: 2 }),
    Seat.create({ busId: bus1.id, seatNumber: "A4", type: "regular", row: 0, col: 3 }),
    Seat.create({ busId: bus1.id, seatNumber: "B1", type: "vip", row: 1, col: 0 }),
    Seat.create({ busId: bus1.id, seatNumber: "B2", type: "vip", row: 1, col: 1 }),
  ]);

  // Create trips
  const trip1 = await Trip.create({
    busId: bus1.id,
    departure: makeDate(1, 9),
    arrival: makeDate(1, 11),
    price: 120,
    status: "scheduled",
  });
  const trip2 = await Trip.create({
    busId: bus1.id,
    departure: makeDate(2, 14),
    arrival: makeDate(2, 17),
    price: 200,
    status: "scheduled",
  });

  await Promise.all([
    TripBusStop.create({ tripId: trip1.id, busStopId: stopA1.id, order: 1 }),
    TripBusStop.create({ tripId: trip1.id, busStopId: stopB1.id, order: 2 }),
    TripBusStop.create({ tripId: trip1.id, busStopId: stopC1.id, order: 3 }),
    TripBusStop.create({ tripId: trip2.id, busStopId: stopA1.id, order: 1 }),
    TripBusStop.create({ tripId: trip2.id, busStopId: stopC1.id, order: 2 }),
  ]);

  // Create users (after db.sync so the Users table exists)
  const [userA, userB] = await Promise.all([
    User.create({
      username: "alice",
      email: "alice@example.com",
      phone: "084901234567",
      passwordHash: "hash1",
      fullName: "Alice Nguyen",
    }),
    User.create({
      username: "bob",
      email: "bob@example.com",
      phone: "084907654321",
      passwordHash: "hash2",
      fullName: "Bob Tran",
    }),
  ]);

  // Create tickets for trip1
  await Promise.all([
    Ticket.create({
      tripId: trip1.id,
      seatId: seats[0].id,
      userId: userA.id,
      price: 120,
      status: "booked",
      email: userA.email,
      phone: userA.phone,
    }),
    Ticket.create({
      tripId: trip1.id,
      seatId: seats[1].id,
      userId: userB.id,
      price: 120,
      status: "booked",
      email: userB.email,
      phone: userB.phone,
    }),
  ]);

  console.log("Database synced and seeded successfully.");
  process.exit(0);
} catch (err) {
  console.error("Failed to sync/seed database:", err);
  process.exit(1);
}
