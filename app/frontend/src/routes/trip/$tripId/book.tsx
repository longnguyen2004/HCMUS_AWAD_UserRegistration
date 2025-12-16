import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/trip/$tripId/book")({
  component: RouteComponent,
});

import { useRouter } from "@tanstack/react-router";
import NavBar from "@/components/layout/nav-bar";
import SeatMap, { type BookingInfo } from "@/components/user/seat-map";
import { useGetTrip } from "@/lib/crud/trip";
import { useCreateTicket } from "@/lib/crud/ticket";
import { useEffect } from "react";

export default function RouteComponent() {
  const { tripId } = Route.useParams();
  const { data: trip, isLoading } = useGetTrip(tripId);
  const createTicket = useCreateTicket();
  const router = useRouter();

  const handleBookingComplete = async (booking: BookingInfo) => {
    await createTicket.mutateAsync(booking);
  };

  useEffect(() => {
    if (createTicket.isSuccess)
      setTimeout(() => {
        router.navigate({
          to: "/ticket/$ticketId",
          params: { ticketId: createTicket.data.id },
        });
      }, 2000);
  }, [createTicket]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trip) {
    return <div></div>;
  }

  if (createTicket.isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar title="Booking Confirmation" />
        <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Booking Confirmed!
            </h2>
            <p className="text-muted-foreground">
              Your seats have been reserved. Redirecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Complete Your Booking" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <SeatMap trip={trip} onBookingComplete={handleBookingComplete} />
      </div>
    </div>
  );
}
