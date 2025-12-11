import { createFileRoute } from "@tanstack/react-router";
import NavBar from "@/components/layout/nav-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetTicket, useInitPayment } from "@/lib/crud/ticket";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ticket/$ticketId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ticketId } = Route.useParams();
  const { data: ticket, isLoading, isError, refetch, isFetching, error } =
    useGetTicket(ticketId);
  const initPayment = useInitPayment();

  const handleInitPayment = async () => {
    await initPayment.mutateAsync(ticketId);
  };

  const formatDateTime = (value?: Date | string) =>
    value
      ? new Intl.DateTimeFormat("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(value))
      : "-";

  const formatCurrency = (value?: number) =>
    typeof value === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(value)
      : "-";

  const statusBadge = (status?: string) => {
    const isPaid = status === "booked";
    const label = isPaid ? "Paid" : "Pending Payment";
    const styles = isPaid
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
          styles,
        )}
      >
        <span
          className={cn("size-2 rounded-full", isPaid ? "bg-emerald-500" : "bg-amber-500")}
        />
        {label}
      </span>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    if (isError || !ticket) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Ticket not found</CardTitle>
            <CardDescription>
              {error ? String((error as Error)?.message ?? error) : "We could not load this ticket. Try again."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Button onClick={() => refetch()} disabled={isFetching} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Ticket {ticket.id}</CardTitle>
              <CardDescription>Issued on {formatDateTime(ticket.createdAt)}</CardDescription>
            </div>
            {statusBadge(ticket.status)}
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Passenger email</p>
              <p className="font-semibold">{ticket.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact phone</p>
              <p className="font-semibold">{ticket.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seat</p>
              <p className="font-semibold">{ticket.seatNumber ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bus</p>
              <p className="font-semibold">{ticket.busPlate ?? "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip details</CardTitle>
            <CardDescription>Itinerary and schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">From</p>
                <p className="text-lg font-semibold">{ticket.trip.fromCity ?? "-"}</p>
              </div>
              <div className="text-center text-muted-foreground">-&gt;</div>
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p className="text-lg font-semibold">{ticket.trip.toCity ?? "-"}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Departure</p>
                <p className="font-semibold">{formatDateTime(ticket.trip.departure)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arrival</p>
                <p className="font-semibold">{formatDateTime(ticket.trip.arrival)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>Fare and payment status</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(ticket.price)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Status</p>
              {statusBadge(ticket.status)}
              {ticket.status !== "booked" && (
                <>
                  <p className="text-sm text-amber-700">
                    Payment is still pending. Complete the payment to confirm your seat.
                  </p>
                  <Button
                    onClick={handleInitPayment}
                    disabled={initPayment.isSuccess || initPayment.isPending}
                    className="mt-2"
                  >
                    {(initPayment.isSuccess || initPayment.isPending) ? "Processing..." : "Pay Now"}
                  </Button>
                </>
              )}
              {ticket.status === "booked" && (
                <p className="text-sm text-emerald-700">Payment received. Check your email for the ticket PDF.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Ticket Details" />
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Ticket Information</h2>
            <p className="text-sm text-muted-foreground">
              Review your ticket status and itinerary
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
