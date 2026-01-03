import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, MapPin } from "lucide-react";
import { addMinutes, format } from "date-fns";
import { backendAuth } from "@/lib/backend";
import { useGetOccupiedSeats } from "@/lib/crud/trip";
import type { useGetTrip } from "@/lib/crud/trip";

type Trip = NonNullable<ReturnType<typeof useGetTrip>["data"]>;

interface Seat {
  id: string;
  label: string;
  status: "available" | "occupied" | "selected";
  row: number;
  col: number;
}

const generateSeats = (
  seats: NonNullable<Trip["bus"]>["seats"],
  booked: Set<string>,
  selected: string | null,
): Seat[] => {
  const displaySeats: Seat[] = [];
  for (const seat of seats) {
    displaySeats.push({
      id: seat.id,
      label: seat.label,
      status:
        seat.id == selected
          ? "selected"
          : booked.has(seat.id)
            ? "occupied"
            : "available",
      row: seat.row,
      col: seat.col,
    });
  }
  return displaySeats;
};

export interface BookingInfo {
  tripId: string;
  seatId: string;
  name: string;
  email: string;
  phone: string;
  timestamp: Date;
}

interface SeatMapProps {
  trip: NonNullable<ReturnType<typeof useGetTrip>["data"]>;
  onBookingComplete?: (booking: BookingInfo) => void;
  onCancel?: () => void;
}

function formatFromTo(stops: { name: string }[]) {
  return (
    <>
      {stops.at(0)?.name} - {stops.at(-1)?.name}
    </>
  );
}

export default function SeatMap({
  trip,
  onBookingComplete,
  onCancel,
}: SeatMapProps) {
  const { data: session } = backendAuth.useSession();
  const { data: occupiedSeats } = useGetOccupiedSeats(trip.id);
  const [selectedSeat, setSelectedSeat] = useState(null as string | null);
  const seats = useMemo(
    () =>
      generateSeats(
        trip.bus?.seats ?? [],
        new Set(occupiedSeats),
        selectedSeat,
      ),
    [trip, occupiedSeats, selectedSeat],
  );

  const arrivalTime = useMemo(() => {
    const totalDuration = trip.stops.reduce(
      (sum, stop) => sum + (stop.duration ?? 0),
      0,
    );
    return addMinutes(new Date(trip.departure), totalDuration);
  }, [trip.departure, trip.stops]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  let autofilled = false;
  useEffect(() => {
    if (session && !autofilled) {
      autofilled = true;
      setName(session.user.name);
      setEmail(session.user.email);
    }
  }, [session]);

  const totalPrice = trip.price;

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "occupied") return;
    setSelectedSeat(seat.id);

    setError("");
  };

  const handleBooking = () => {
    if (!selectedSeat) {
      setError("Please select at least one seat");
      return;
    }

    const allFilled = name && email && phone;
    if (!allFilled) {
      setError("Please fill in passenger details");
      return;
    }

    const booking = {
      tripId: trip.id,
      seatId: selectedSeat,
      name,
      email,
      phone,
      timestamp: new Date(),
    } satisfies BookingInfo;

    if (onBookingComplete) {
      onBookingComplete(booking);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat Map Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Info Header */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">
                      {formatFromTo(trip.stops)}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatFromTo(trip.stops)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent">
                    ${trip.price}
                  </div>
                  <p className="text-xs text-muted-foreground">per seat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Your Seats</CardTitle>
              <CardDescription>
                Choose your preferred seats on the bus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seat Legend */}
              <div className="flex flex-wrap gap-6 justify-center p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-background border-2 border-primary rounded"></div>
                  <span className="text-sm font-medium">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <span className="text-sm font-medium">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded"></div>
                  <span className="text-sm font-medium">Selected</span>
                </div>
              </div>

              {/* Seat Map Grid */}
              <div className="flex justify-center overflow-x-auto pb-4">
                <div className="inline-block">
                  <div className="mb-6 text-center">
                    <div className="text-2xl font-semibold text-muted-foreground">
                      🚌
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Front of Bus
                    </p>
                  </div>

                  <div className="grid gap-2 grid-cols-4 grid-rows-10">
                    {seats.map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === "occupied"}
                        className={`w-8 h-8 rounded font-semibold text-xs transition-all ${
                          seat.status === "occupied"
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : seat.status === "selected"
                              ? "bg-primary text-primary-foreground shadow-lg scale-110"
                              : "bg-background border-2 border-primary text-foreground hover:bg-primary/10"
                        }`}
                        title={
                          seat.status === "occupied"
                            ? "Seat occupied"
                            : `Seat ${seat.label}`
                        }
                        style={{
                          gridColumn: seat.col + 1,
                          gridRow: seat.row + 1,
                        }}
                      >
                        {seat.status === "selected" ? (
                          <Check className="w-4 h-4 mx-auto" />
                        ) : (
                          seat.label
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passenger Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Passenger Details</CardTitle>
              <CardDescription>Please enter your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <Input
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Phone
                    </label>
                    <Input
                      placeholder="0123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Selected Seats Display */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Selected Seats
                </p>
                <div className="flex flex-wrap gap-2">
                  {!selectedSeat ? (
                    <span className="text-sm text-muted-foreground italic">
                      No seats selected
                    </span>
                  ) : (
                    [selectedSeat].map((seat) => (
                      <span
                        key={seat}
                        className="inline-flex items-center px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full"
                      >
                        {
                          trip.bus?.seats.filter((el) => el.id === seat)[0]
                            .label
                        }
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-semibold">${trip.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span className="font-semibold">$0</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-accent">
                    ${totalPrice}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleBooking}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Check className="w-4 h-4" />
                  Confirm Booking
                </Button>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="w-full bg-transparent"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>

              {/* Trip Details Summary */}
              <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
                <p>Bus • {formatFromTo(trip.stops)}</p>
                <p>Departure: {format(trip.departure, "dd/MM/yyyy HH:mm")}</p>
                <p>Arrival: {format(arrivalTime, "dd/MM/yyyy HH:mm")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
