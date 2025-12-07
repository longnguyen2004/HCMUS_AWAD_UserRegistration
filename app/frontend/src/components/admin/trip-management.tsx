import TripModal from "./trip-modal";
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
import { format } from "date-fns";
import { useSearchTrips } from "@/lib/crud/trip";
import { useGetCities } from "@/lib/crud/city";

export default function TripManagement() {
  const { data: cities } = useGetCities();
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [date, setDate] = useState("");
  const [page, ] = useState(1);
  const { data: tripData } = useSearchTrips({
    from: fromCity,
    to: toCity,
    departure: date,
    page
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("departure");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedTrips = useMemo(() => {
    const result = (tripData?.data || []).filter(() => {
      return true;
    });

    return result;
  }, [tripData, filterStatus, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = (id: string) => {
    console.log(id);
    //setTrips(trips.filter((trip) => trip.id !== id));
  };

  //const [editingTrip, setEditingTrip] = useState<Trip | undefined>();
  const [tripEditOpen, ] = useState(false);

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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From City</label>
              <Select value={fromCity} onValueChange={setFromCity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {(cities || []).map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To City</label>
              <Select value={toCity} onValueChange={setToCity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {(cities || []).map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.currentTarget.value)}
                className="bg-background/80 border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
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
                    {trip.stops.at(0)?.name} → {trip.stops.at(-1)?.name}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm">{format(trip.departure, "dd/MM/yyyy HH:mm")}</td>
                <td className="px-4 py-4 font-semibold text-accent">
                  ${trip.price}
                </td>
                {/* <td className="px-4 py-4 text-sm">{trip.busType}</td>
                <td className="px-4 py-4 text-sm">
                  {trip.booked}/{trip.capacity}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${trip.status === "active"
                        ? "bg-green-100 text-green-800"
                        : trip.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </td> */}
                <td></td><td></td><td></td>
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
      <TripModal isOpen={tripEditOpen} />
    </div>
  );
}
