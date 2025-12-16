import { useState } from "react"
import { useCreateBus, useEditBus, useGetBus, useSearchBus } from "@/lib/crud/bus"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, ArrowUpDown } from "lucide-react"
import BusEditor, { type EditingBus } from "./bus-editor"

export default function BusManagement() {
  const { data: buses } = useSearchBus();
  const createBus = useCreateBus();
  const editBus = useEditBus();
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const { data: selectedBus } = useGetBus(selectedBusId);

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("licensePlate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  
  const [isAddingBus, setIsAddingBus] = useState(false)
  const [newBusForm, setNewBusForm] = useState({ licensePlate: "", rows: 5, columns: 6 })

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const handleAddBus = async() => {
    if (!newBusForm.licensePlate.trim()) return;
    await createBus.mutateAsync({
      status: "active",
      col: newBusForm.columns,
      row: newBusForm.rows,
      licensePlate: newBusForm.licensePlate,
      model: ""
    });
    if (createBus.isSuccess)
    {
      setNewBusForm({ licensePlate: "", rows: 5, columns: 6 })
      setIsAddingBus(false)
    }
  }

  const handleSaveBusEdit = async (updatedBus: EditingBus) => {
    await editBus.mutateAsync({
      id: selectedBusId,
      ...updatedBus
    })
  }

  const handleDeleteBus = (id: string) => {
    console.log(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Manage Buses</h2>
          <p className="text-sm text-muted-foreground mt-1">{buses?.total} buses available</p>
        </div>
        <Button className="gap-2" size="lg" onClick={() => setIsAddingBus(true)}>
          <Plus className="w-4 h-4" />
          Add Bus
        </Button>
      </div>

      {isAddingBus && (
        <Card className="border-accent bg-accent/5">
          <CardHeader>
            <CardTitle>Add New Bus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">License Plate</label>
                <Input
                  placeholder="e.g., BUS-003"
                  value={newBusForm.licensePlate}
                  onChange={(e) => setNewBusForm({ ...newBusForm, licensePlate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Rows</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={newBusForm.rows}
                  onChange={(e) => setNewBusForm({ ...newBusForm, rows: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seats per Row</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newBusForm.columns}
                  onChange={(e) => setNewBusForm({ ...newBusForm, columns: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="flex gap-2 items-end">
                <Button onClick={handleAddBus} className="flex-1">
                  Create Bus
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingBus(false)
                    setNewBusForm({ licensePlate: "", rows: 5, columns: 6 })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search by license plate</label>
            <Input placeholder="Search bus..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bus List */}
        <div className="lg:col-span-1">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-sm">
                    <button
                      onClick={() => toggleSort("licensePlate")}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      License Plate {sortBy === "licensePlate" && <ArrowUpDown className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Seats</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses?.data.map((bus) => (
                  <tr
                    key={bus.id}
                    className={`border-b border-border cursor-pointer transition ${
                      selectedBus?.id === bus.id ? "bg-accent/10" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedBusId(bus.id)}
                  >
                    <td className="px-4 py-4 font-medium">{bus.licensePlate}</td>
                    <td className="px-4 py-4 text-sm">
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteBus(bus.id)
                          }}
                          className="gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seat Map Configuration */}
        {(selectedBus) && (
          <div className="lg:col-span-2">
            <BusEditor
              bus={selectedBus}
              onSave={handleSaveBusEdit}
              onCancel={() => setSelectedBusId("")}
            />
          </div>
        )}
      </div>
    </div>
  )
}
