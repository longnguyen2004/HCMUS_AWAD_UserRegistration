import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, MapPin, Users, Clock, Zap } from "lucide-react"

interface Trip {
  id: string
  from: string
  to: string
  departure: string
  arrival: string
  price: number
  busType: string
  amenities: string[]
  capacity: number
  booked: number
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
  },
  {
    id: "2",
    from: "New York",
    to: "Boston",
    departure: "2024-01-15 14:00",
    arrival: "2024-01-15 18:00",
    price: 55,
    busType: "Premium",
    amenities: ["WiFi", "AC", "Charging", "Food"],
    capacity: 40,
    booked: 15,
  },
  {
    id: "3",
    from: "New York",
    to: "Philadelphia",
    departure: "2024-01-15 10:00",
    arrival: "2024-01-15 13:00",
    price: 35,
    busType: "Economy",
    amenities: ["AC"],
    capacity: 60,
    booked: 45,
  },
  {
    id: "4",
    from: "Los Angeles",
    to: "San Francisco",
    departure: "2024-01-15 10:00",
    arrival: "2024-01-15 18:00",
    price: 75,
    busType: "Premium",
    amenities: ["WiFi", "AC", "Charging", "Food"],
    capacity: 40,
    booked: 38,
  },
  {
    id: "5",
    from: "Chicago",
    to: "Detroit",
    departure: "2024-01-15 06:00",
    arrival: "2024-01-15 10:30",
    price: 35,
    busType: "Economy",
    amenities: ["AC"],
    capacity: 60,
    booked: 45,
  },
  {
    id: "6",
    from: "Miami",
    to: "Orlando",
    departure: "2024-01-15 07:00",
    arrival: "2024-01-15 11:00",
    price: 40,
    busType: "Standard",
    amenities: ["WiFi", "AC"],
    capacity: 50,
    booked: 30,
  },
  {
    id: "7",
    from: "Seattle",
    to: "Portland",
    departure: "2024-01-15 09:30",
    arrival: "2024-01-15 14:00",
    price: 50,
    busType: "Premium",
    amenities: ["WiFi", "AC", "Charging"],
    capacity: 45,
    booked: 25,
  },
  {
    id: "8",
    from: "Denver",
    to: "Boulder",
    departure: "2024-01-15 08:30",
    arrival: "2024-01-15 10:30",
    price: 25,
    busType: "Economy",
    amenities: ["AC"],
    capacity: 55,
    booked: 40,
  },
  {
    id: "9",
    from: "Austin",
    to: "Dallas",
    departure: "2024-01-15 11:00",
    arrival: "2024-01-15 15:00",
    price: 55,
    busType: "Premium",
    amenities: ["WiFi", "AC", "Charging", "Food"],
    capacity: 40,
    booked: 20,
  },
  {
    id: "10",
    from: "Las Vegas",
    to: "Los Angeles",
    departure: "2024-01-15 13:00",
    arrival: "2024-01-15 18:00",
    price: 60,
    busType: "Standard",
    amenities: ["WiFi", "AC"],
    capacity: 48,
    booked: 35,
  },
]

export default function TripSearch() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [busType, setBusType] = useState("all")
  const [amenity, setAmenity] = useState("all")
  const [sortBy, setSortBy] = useState("price")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredTrips = useMemo(() => {
    const result = mockTrips.filter((trip) => {
      const matchesOrigin = !origin || trip.from.toLowerCase().includes(origin.toLowerCase())
      const matchesDestination = !destination || trip.to.toLowerCase().includes(destination.toLowerCase())
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "0-50"
          ? trip.price <= 50
          : priceRange === "50-100"
            ? trip.price > 50 && trip.price <= 100
            : trip.price > 100)
      const matchesBusType = busType === "all" || trip.busType === busType
      const matchesAmenity = amenity === "all" || trip.amenities.includes(amenity)

      return matchesOrigin && matchesDestination && matchesPrice && matchesBusType && matchesAmenity
    })

    result.sort((a, b) => {
      if (sortBy === "price") {
        return a.price - b.price
      } else if (sortBy === "departure") {
        return new Date(a.departure).getTime() - new Date(b.departure).getTime()
      } else {
        return b.booked - a.booked
      }
    })

    return result
  }, [origin, destination, priceRange, busType, amenity, sortBy])

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage)
  const paginatedTrips = filteredTrips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-balance text-foreground">Find Your Trip</h1>
        <p className="text-lg text-muted-foreground">Search and book buses to your destination</p>
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
              <label className="text-sm font-semibold text-foreground">From</label>
              <Input
                placeholder="Origin city..."
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-background/80 border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">To</label>
              <Input
                placeholder="Destination city..."
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-background/80 border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background/80 border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Sort Card */}
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
              <label className="text-sm font-semibold text-foreground">Price</label>
              <Select
                value={priceRange}
                onValueChange={(val) => {
                  setPriceRange(val)
                  setCurrentPage(1)
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
              <label className="text-sm font-semibold text-foreground">Bus Type</label>
              <Select
                value={busType}
                onValueChange={(val) => {
                  setBusType(val)
                  setCurrentPage(1)
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
              <label className="text-sm font-semibold text-foreground">Amenities</label>
              <Select
                value={amenity}
                onValueChange={(val) => {
                  setAmenity(val)
                  setCurrentPage(1)
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
              <label className="text-sm font-semibold text-foreground">Sort By</label>
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
                  setOrigin("")
                  setDestination("")
                  setDate("")
                  setPriceRange("all")
                  setBusType("all")
                  setAmenity("all")
                  setSortBy("price")
                  setCurrentPage(1)
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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{filteredTrips.length} trips found</p>
            {paginatedTrips.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filteredTrips.length)} of {filteredTrips.length}
              </p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {/* Trips Grid */}
        {paginatedTrips.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16">
              <div className="text-center space-y-3">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No trips found</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your search filters</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paginatedTrips.map((trip) => (
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
                            {trip.from} → {trip.to}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">{trip.departure.split(" ")[0]}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">${trip.price}</div>
                        <p className="text-xs text-muted-foreground">per seat</p>
                      </div>
                    </div>

                    {/* Time and duration */}
                    <div className="flex items-center gap-3 px-2 py-2 bg-muted/40 rounded-lg">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex items-center justify-between flex-1 gap-2 text-sm">
                        <div className="font-medium text-foreground">{trip.departure.split(" ")[1]}</div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-accent/50 mx-2"></div>
                        <div className="font-medium text-foreground">{trip.arrival.split(" ")[1]}</div>
                      </div>
                    </div>

                    {/* Bus type and amenities */}
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
                    </div>

                    {/* Availability and CTA */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {trip.capacity - trip.booked} of {trip.capacity} seats available
                        </span>
                      </div>
                      <Button size="sm" className="gap-1 ml-auto">
                        Book
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center gap-6 mt-8 pt-8 border-t border-border">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="gap-2"
              >
                ← Previous
              </Button>

              <div className="flex gap-1 items-center">
                {totalPages <= 7
                  ? Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 p-0"
                        size="sm"
                      >
                        {page}
                      </Button>
                    ))
                  : [
                      ...Array.from({ length: Math.min(2, totalPages) }, (_, i) => i + 1),
                      ...(currentPage > 3 ? [null] : []),
                      ...Array.from({ length: Math.min(3, Math.max(0, totalPages - currentPage + 1)) }, (_, i) =>
                        Math.max(currentPage - 1, i + 1),
                      ),
                      ...(currentPage < totalPages - 2 ? [null] : []),
                      ...Array.from({ length: Math.min(2, totalPages - currentPage + 1) }, (_, i) => totalPages - i),
                    ]
                      .filter((v, i, a) => v !== null && a.indexOf(v) === i)
                      .sort((a, b) => (a ?? 0) - (b ?? 0))
                      .map((page, idx) =>
                        page === null ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                            …
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10 p-0"
                            size="sm"
                          >
                            {page}
                          </Button>
                        ),
                      )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
