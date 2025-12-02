import { useState, useMemo } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

import { /*ChevronRight,*/ MapPin, /*Users,*/ Clock, Zap } from "lucide-react";

import { format } from "date-fns";
import { useGetCities } from "@/lib/crud/city";
import { useSearchTrips } from "@/lib/crud/trip";

export default function TripSearch() {
  const cities = useGetCities();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const params = useDebounce(
    {
      from: origin,
      to: destination,
      departure: date ?? undefined,
      page: currentPage,
    },
    500,
  );
  const trips = useSearchTrips(params);
  const totalPages = useMemo(
    () => (trips.data ? Math.ceil(trips.data.total / trips.data.per_page) : 0),
    [trips],
  );

  const [priceRange, setPriceRange] = useState("all");
  const [busType, setBusType] = useState("all");
  const [amenity, setAmenity] = useState("all");
  const [sortBy, setSortBy] = useState("price");

  // const filteredTrips = useMemo(() => {
  //   const result = mockTrips.filter((trip) => {
  //     const matchesOrigin =
  //       !origin || trip.from.toLowerCase().includes(origin.toLowerCase());
  //     const matchesDestination =
  //       !destination ||
  //       trip.to.toLowerCase().includes(destination.toLowerCase());
  //     const matchesPrice =
  //       priceRange === "all" ||
  //       (priceRange === "0-50"
  //         ? trip.price <= 50
  //         : priceRange === "50-100"
  //           ? trip.price > 50 && trip.price <= 100
  //           : trip.price > 100);
  //     const matchesBusType = busType === "all" || trip.busType === busType;
  //     const matchesAmenity =
  //       amenity === "all" || trip.amenities.includes(amenity);

  //     return (
  //       matchesOrigin &&
  //       matchesDestination &&
  //       matchesPrice &&
  //       matchesBusType &&
  //       matchesAmenity
  //     );
  //   });

  //   result.sort((a, b) => {
  //     if (sortBy === "price") {
  //       return a.price - b.price;
  //     } else if (sortBy === "departure") {
  //       return (
  //         new Date(a.departure).getTime() - new Date(b.departure).getTime()
  //       );
  //     } else {
  //       return b.booked - a.booked;
  //     }
  //   });

  //   return result;
  // }, [origin, destination, priceRange, busType, amenity, sortBy]);

  // const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  // const paginatedTrips = filteredTrips.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage,
  // );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-balance text-foreground">
          Find Your Trip
        </h1>
        <p className="text-lg text-muted-foreground">
          Search and book buses to your destination
        </p>
      </div>
      {/* Search & Filter Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-4">
          <CardTitle>Search Trips</CardTitle>
          <CardDescription>Enter your travel details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                From
              </label>
              <Select value={origin} onValueChange={(val) => setOrigin(val)}>
                <SelectTrigger className="w-full bg-background/80 border-border">
                  <SelectValue placeholder="Origin city..." />
                </SelectTrigger>
                <SelectContent>
                  {(cities.data ?? []).map((el) => (
                    <SelectItem key={el.id} value={el.id}>
                      {el.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                To
              </label>
              <Select
                value={destination}
                onValueChange={(val) => setDestination(val)}
              >
                <SelectTrigger className="w-full bg-background/80 border-border">
                  <SelectValue placeholder="Destination city..." />
                </SelectTrigger>
                <SelectContent>
                  {(cities.data ?? []).map((el) => (
                    <SelectItem key={el.id} value={el.id}>
                      {el.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.currentTarget.value)}
                className="bg-background/80 border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      Filter & Sort Card
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Filters & Sort
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Price
              </label>
              <Select
                value={priceRange}
                onValueChange={(val) => {
                  setPriceRange(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">$0 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100+">$100+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Bus Type
              </label>
              <Select
                value={busType}
                onValueChange={(val) => {
                  setBusType(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Economy">Economy</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Amenities
              </label>
              <Select
                value={amenity}
                onValueChange={(val) => {
                  setAmenity(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="All Amenities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amenities</SelectItem>
                  <SelectItem value="WiFi">WiFi</SelectItem>
                  <SelectItem value="AC">Air Conditioning</SelectItem>
                  <SelectItem value="Charging">Charging</SelectItem>
                  <SelectItem value="Food">Food Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="departure">Departure Time</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end">
              <Button
                onClick={() => {
                  setOrigin("");
                  setDestination("");
                  setDate("");
                  setPriceRange("all");
                  setBusType("all");
                  setAmenity("all");
                  setSortBy("price");
                  setCurrentPage(1);
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Results Section */}
      {trips.data && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {trips.data.total} trips found
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Page {trips.data.page}
          </div>

          {/* Trips Grid */}
          {trips.data.data.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16">
                <div className="text-center space-y-3">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      No trips found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Try adjusting your search filters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {trips.data.data.map((trip) => (
                <Card
                  key={trip.id}
                  className="overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col p-5 gap-4">
                      {/* Header with route and price */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-semibold text-foreground text-sm truncate">
                              {trip.stops.at(0)?.name} →{" "}
                              {trip.stops.at(-1)?.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">
                            {format(trip.departure, "dd-MM-yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">
                            ${trip.price}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            per seat
                          </p>
                        </div>
                      </div>

                      {/* Time and duration */}
                      <div className="flex items-center gap-3 px-2 py-2 bg-muted/40 rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex items-center justify-between flex-1 gap-2 text-sm">
                          <div className="font-medium text-foreground">
                            {format(trip.departure, "HH:mm")}
                          </div>
                          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-accent/50 mx-2"></div>
                          <div className="font-medium text-foreground">
                            {format(trip.arrival, "HH:mm")}
                          </div>
                        </div>
                      </div>

                      {/* Bus type and amenities
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {trip.busType}
                      </span>
                      {trip.amenities.slice(0, 2).map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center px-2.5 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {trip.amenities.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                          +{trip.amenities.length - 2} more
                        </span>
                      )}
                    </div> */}

                      {/* Availability and CTA
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {trip.capacity - trip.booked} of {trip.capacity} seats
                          available
                        </span>
                      </div>
                      <Button size="sm" className="gap-1 ml-auto">
                        Book
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
