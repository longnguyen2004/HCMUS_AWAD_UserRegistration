import { createFileRoute, redirect } from "@tanstack/react-router";
import { backendAuth } from "@/lib/backend";

export const Route = createFileRoute("/bookings/")({
  component: BookingsPage,
  beforeLoad: async () => {
    const { data: session } = await backendAuth.getSession();
    if (!session) throw redirect({ to: "/login" });
  },
});

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { backend } from "@/lib/backend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NavBar from "@/components/layout/nav-bar";
import { Calendar, MapPin, Ticket as TicketIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { Link } from "@tanstack/react-router";

export default function BookingsPage() {
  const { data: session } = backendAuth.useSession();
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "booked">("all");

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", { page, filterStatus }],
    queryFn: async () => {
      const res = await backend.ticket["my-bookings"].get({
        query: {
          page,
          status: filterStatus === "all" ? undefined : filterStatus,
        },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!session,
  });

  const totalPages = bookings
    ? Math.ceil(bookings.total / bookings.per_page)
    : 0;

  const handleDownloadPDF = async (ticketId: string) => {
    try {
      const res = await backend.ticket({ id: ticketId }).pdf.get();
      if (res.error) throw res.error;

      const blob = new Blob([res.data as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar title="My Bookings" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your bus tickets
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filterStatus}
                    onValueChange={(v: typeof filterStatus) => {
                      setFilterStatus(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : bookings && bookings.data.length > 0 ? (
            <div className="space-y-4">
              {bookings.data.map((booking) => (
                <Card
                  key={booking.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Route Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          <div className="font-semibold text-lg">
                            {booking.trip.fromCity} → {booking.trip.toCity}
                          </div>
                          <span
                            className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === "booked"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(booking.trip.departure), "dd MMM yyyy, HH:mm")}
                            </span>
                          </div>
                          {booking.seatNumber && (
                            <div className="flex items-center gap-2">
                              <TicketIcon className="w-4 h-4" />
                              <span>Seat: {booking.seatNumber}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Booked on: {format(new Date(booking.createdAt), "dd MMM yyyy")}
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">
                            ${booking.price}
                          </div>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>

                        <div className="flex gap-2">
                          <Link to="/ticket/$ticketId" params={{ ticketId: booking.id }}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                          {booking.status === "booked" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(booking.id)}
                              className="gap-1"
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-3">
                  <TicketIcon className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      No bookings found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      You haven&apos;t booked any trips yet
                    </p>
                  </div>
                  <Link to="/search">
                    <Button className="mt-4">Browse Trips</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
