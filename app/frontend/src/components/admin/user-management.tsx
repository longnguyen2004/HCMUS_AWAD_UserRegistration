import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { backendAuth } from "@/lib/backend";
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
import { Lock, Unlock, Trash2, ArrowUpDown } from "lucide-react";

const USERS_PER_PAGE = 10;

export default function UserManagement() {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "suspended"
  >("all");
  const [sortBy, setSortBy] = useState("joinDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { data: users, refetch: refetchUser } = useQuery({
    queryKey: ["users", { searchTerm, filterStatus, sortOrder }],
    queryFn: () =>
      backendAuth.admin.listUsers({
        query: {
          offset: page * USERS_PER_PAGE,
          limit: USERS_PER_PAGE,
          searchValue: searchTerm,
          searchOperator: "contains",
          filterField: "banned",
          filterValue:
            filterStatus === "active"
              ? false
              : filterStatus === "suspended"
                ? true
                : undefined,
          sortBy: "createdAt",
          sortDirection: sortOrder,
        },
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterStatus]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const setUserStatus = async (id: string, banned: boolean) => {
    if (banned) await backendAuth.admin.banUser({ userId: id });
    else await backendAuth.admin.unbanUser({ userId: id });
    refetchUser();
  };

  const handleDelete = async (id: string) => {
    await backendAuth.admin.removeUser({ userId: id });
    refetchUser();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Manage Users</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search users</label>
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by status</label>
              <Select
                value={filterStatus}
                onValueChange={(v: typeof filterStatus) => setFilterStatus(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!users ? (
        <div>Loading...</div>
      ) : users.error ? (
        <div>Failed to load users: {users.error.message}</div>
      ) : (
        <>
          <div>
            <p className="text-sm text-muted-foreground mt-1">
              {users?.data?.total} users found
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      Name{" "}
                      {sortBy === "name" && <ArrowUpDown className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    <button
                      onClick={() => toggleSort("joinDate")}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      Joined{" "}
                      {sortBy === "joinDate" && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    <button
                      onClick={() => toggleSort("bookings")}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      Bookings{" "}
                      {sortBy === "bookings" && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    <button
                      onClick={() => toggleSort("spent")}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      Spent{" "}
                      {sortBy === "spent" && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
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
                {users.data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/50 transition"
                  >
                    <td className="px-4 py-4 font-medium">{user.name}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 text-sm">0123456789</td>
                    <td className="px-4 py-4 text-sm">
                      {format(user.createdAt, "yyyy-MM-dd HH:mm")}
                    </td>
                    <td className="px-4 py-4 font-medium">1</td>
                    <td className="px-4 py-4 font-semibold text-accent">$1</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          !user.banned
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.banned ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserStatus(user.id, !user.banned)}
                          className="gap-1"
                        >
                          {!user.banned ? (
                            <>
                              <Lock className="w-4 h-4" />
                              <span className="hidden sm:inline">Suspend</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4" />
                              <span className="hidden sm:inline">Activate</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
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
        </>
      )}
    </div>
  );
}
