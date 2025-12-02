import { db } from "./src/db/db.js";
import { City } from "./src/db/models/city.model.js";
import { BusStop } from "./src/db/models/busstop.model.js";
import { Trip } from "./src/db/models/trip.model.js";
import { Route } from "./src/db/models/route.model.js";
import { RouteStop } from "./src/db/models/routeStop.model.js";

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

	// Helper to build departure/arrival times
	const makeDate = (daysFromNow: number, hour: number, minute = 0) => {
		const d = new Date();
		d.setDate(d.getDate() + daysFromNow);
		d.setHours(hour, minute, 0, 0);
		return d;
	};

	// Create trips

	// Create routes (one route per from->to pair)
	const routeAB = await Route.create({ fromId: stopA1.id, toId: stopB1.id });
	const routeBC = await Route.create({ fromId: stopB1.id, toId: stopC1.id });

	// Add ordered stops to routes (for routeAB we have stopA1 then stopB1)
	await Promise.all([
		RouteStop.create({ routeId: routeAB.id, busStopId: stopA1.id, order: 1 }),
		RouteStop.create({ routeId: routeAB.id, busStopId: stopB1.id, order: 2 }),
		RouteStop.create({ routeId: routeBC.id, busStopId: stopB1.id, order: 1 }),
		RouteStop.create({ routeId: routeBC.id, busStopId: stopC1.id, order: 2 }),
	]);

	// Create trips and link them to the routes
	await Promise.all([
		Trip.create({
			routeId: routeAB.id,
			departure: makeDate(1, 9),
			arrival: makeDate(1, 11),
			price: 120,
		}),
		Trip.create({
			routeId: routeBC.id,
			departure: makeDate(2, 14),
			arrival: makeDate(2, 17),
			price: 200,
		}),
	]);

	console.log("Database synced and seeded successfully.");
	process.exit(0);
} catch (err) {
	console.error("Failed to sync/seed database:", err);
	process.exit(1);
}
