"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Unlock, Trash2, ArrowUpDown } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  bookings: number
  spent: number
  status: "active" | "suspended"
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-0101",
    joinDate: "2023-06-15",
    bookings: 12,
    spent: 540,
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1-555-0102",
    joinDate: "2023-08-20",
    bookings: 8,
    spent: 320,
    status: "active",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1-555-0103",
    joinDate: "2023-10-10",
    bookings: 0,
    spent: 0,
    status: "suspended",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    phone: "+1-555-0104",
    joinDate: "2023-12-01",
    bookings: 5,
    spent: 225,
    status: "active",
  },
  {
    id: "5",
    name: "Tom Brown",
    email: "tom@example.com",
    phone: "+1-555-0105",
    joinDate: "2024-01-05",
    bookings: 2,
    spent: 90,
    status: "active",
  },
]

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("joinDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredAndSortedUsers = useMemo(() => {
    const result = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || user.status === filterStatus
      return matchesSearch && matchesStatus
    })

    result.sort((a, b) => {
      let aVal: any = a[sortBy as keyof User]
      let bVal: any = b[sortBy as keyof User]

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return result
  }, [users, searchTerm, filterStatus, sortBy, sortOrder])

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((user) =>
        user.id === id ? { ...user, status: user.status === "active" ? "suspended" : "active" } : user,
      ),
    )
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Manage Users</h2>
        <p className="text-sm text-muted-foreground mt-1">{filteredAndSortedUsers.length} users found</p>
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-sm">
                <button onClick={() => toggleSort("name")} className="flex items-center gap-2 hover:text-primary">
                  Name {sortBy === "name" && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">Phone</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                <button onClick={() => toggleSort("joinDate")} className="flex items-center gap-2 hover:text-primary">
                  Joined {sortBy === "joinDate" && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                <button onClick={() => toggleSort("bookings")} className="flex items-center gap-2 hover:text-primary">
                  Bookings {sortBy === "bookings" && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">
                <button onClick={() => toggleSort("spent")} className="flex items-center gap-2 hover:text-primary">
                  Spent {sortBy === "spent" && <ArrowUpDown className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-sm">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition">
                <td className="px-4 py-4 font-medium">{user.name}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-4 py-4 text-sm">{user.phone}</td>
                <td className="px-4 py-4 text-sm">{user.joinDate}</td>
                <td className="px-4 py-4 font-medium">{user.bookings}</td>
                <td className="px-4 py-4 font-semibold text-accent">${user.spent}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      user.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user.id)} className="gap-1">
                      {user.status === "active" ? (
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
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)} className="gap-1">
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
  )
}
