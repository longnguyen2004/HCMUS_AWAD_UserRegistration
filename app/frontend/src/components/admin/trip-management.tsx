"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, ArrowUpDown } from "lucide-react";

interface Trip {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  busType: string;
  amenities: string[];
  capacity: number;
  booked: number;
  status: "active" | "completed" | "cancelled";
}

const mockTrips: Trip[] = [
  {
    id: "1",
    from: "New York",
    to: "Boston",
    departure: "2024-01-15 08:00",
    arrival: "2024-01-15 12:00",
    price: 45,
    busType: "Standard",
    amenities: ["WiFi", "AC"],
    capacity: 50,
    booked: 42,
    status: "active",
  },
  {
    id: "2",
    from: "Los Angeles",
    to: "San Francisco",
    departure: "2024-01-15 10:00",
    arrival: "2024-01-15 18:00",
    price: 75,
    busType: "Premium",
    amenities: ["WiFi", "AC", "Charging", "Food"],
    capacity: 40,
    booked: 38,
    status: "active",
  },
  {
    id: "3",
    from: "Chicago",
    to: "Detroit",
    departure: "2024-01-15 06:00",
    arrival: "2024-01-15 10:30",
    price: 35,
    busType: "Economy",
    amenities: ["AC"],
    capacity: 60,
    booked: 45,
    status: "active",
  },
  {
    id: "4",
    from: "Dallas",
    to: "Houston",
    departure: "2024-01-14 15:00",
    arrival: "2024-01-14 18:00",
    price: 30,
    busType: "Economy",
    amenities: ["AC"],
    capacity: 55,
    booked: 55,
    status: "completed",
  },
];

export default function TripManagement() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("departure");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedTrips = useMemo(() => {
    const result = trips.filter((trip) => {
      const matchesSearch =
        trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.to.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || trip.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let aVal = a[sortBy as keyof Trip];
      let bVal = b[sortBy as keyof Trip];

      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [trips, searchTerm, filterStatus, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = (id: string) => {
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Manage Trips</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredAndSortedTrips.length} trips available
          </p>
        </div>
        <Button className="gap-2" size="lg">
          <Plus className="w-4 h-4" />
          Add Trip
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by route</label>
              <Input
                placeholder="Search from/to city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-sm">
                <button
                  onClick={() => toggleSort("from")}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  Route{" "}
                  {sortBy === "from" && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                <button
                  onClick={() => toggleSort("departure")}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  Departure{" "}
                  {sortBy === "departure" && (
                    <ArrowUpDown className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                <button
                  onClick={() => toggleSort("price")}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  Price{" "}
                  {sortBy === "price" && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Bus Type
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                <button
                  onClick={() => toggleSort("booked")}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  Capacity{" "}
                  {sortBy === "booked" && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTrips.map((trip) => (
              <tr
                key={trip.id}
                className="border-b border-border hover:bg-muted/50 transition"
              >
                <td className="px-4 py-4">
                  <div className="font-medium">
                    {trip.from} → {trip.to}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm">{trip.departure}</td>
                <td className="px-4 py-4 font-semibold text-accent">
                  ${trip.price}
                </td>
                <td className="px-4 py-4 text-sm">{trip.busType}</td>
                <td className="px-4 py-4 text-sm">
                  {trip.booked}/{trip.capacity}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      trip.status === "active"
                        ? "bg-green-100 text-green-800"
                        : trip.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(trip.id)}
                      className="gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
