import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { backend } from "@/lib/backend";
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
import { Eye, Download, ArrowUpDown } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function TicketManagement() {
  const [page, setPage] = useState(1);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "booked">("all");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const { data: tickets } = useQuery({
    queryKey: ["tickets", { page, searchEmail, searchPhone, filterStatus, sortOrder }],
    queryFn: async () => {
      const res = await backend.ticket.search.get({
        query: {
          from: "",
          to: "",
          email: searchEmail || undefined,
          phone: searchPhone || undefined,
          status: filterStatus === "all" ? undefined : filterStatus,
          page,
          order: sortOrder,
        },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setPage(1);
  }, [searchEmail, searchPhone, filterStatus]);

  const toggleSort = () => {
    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
  };

  const handleDownloadPDF = async (ticketId: string) => {
    try {
      const res = await backend.ticket({ id: ticketId }).pdf.get();
      if (res.error) throw res.error;
      
      // Create a blob from the response
      const blob = new Blob([res.data as unknown as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
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

  const totalPages = tickets ? Math.ceil(tickets.total / tickets.per_page) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Manage Tickets</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all booking tickets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Email</label>
              <Input
                placeholder="customer@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Phone</label>
              <Input
                placeholder="0123456789"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Status</label>
              <Select
                value={filterStatus}
                onValueChange={(v: typeof filterStatus) => setFilterStatus(v)}
              >
                <SelectTrigger>
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

      <Card>
        <CardHeader>
          <CardTitle>
            Ticket List ({tickets?.total ?? 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Ticket ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">
                    Price
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-sm cursor-pointer hover:bg-muted/50"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center gap-1">
                      Created At
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets?.data.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4 text-sm font-mono">
                      {ticket.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-sm">{ticket.email}</td>
                    <td className="py-3 px-4 text-sm">{ticket.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ticket.status === "booked"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      ${ticket.price}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {format(new Date(ticket.createAt), "dd MMM yyyy HH:mm")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to="/ticket/$ticketId" params={{ ticketId: ticket.id }}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                        {ticket.status === "booked" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleDownloadPDF(ticket.id)}
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!tickets?.data || tickets.data.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No tickets found
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
