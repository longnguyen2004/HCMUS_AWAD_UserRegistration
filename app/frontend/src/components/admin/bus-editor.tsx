import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Check } from "lucide-react"

interface Seat {
  id: string
  row: number
  col: number
  seatNumber: string
}

export interface EditingBus {
  licensePlate: string
  seats: Seat[]
}

interface BusEditorProps {
  bus: EditingBus
  isEditing?: boolean
  onSave: (bus: EditingBus) => void
  onCancel: () => void
}

export default function BusEditor({ bus, isEditing = true, onSave, onCancel }: BusEditorProps) {
  const [editingBus, setEditingBus] = useState<EditingBus>(bus);
  const { row, col } = useMemo(() => {
    let maxRow = 0;
    let maxCol = 0;
    for (const { row, col } of editingBus.seats)
    {
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
    }
    return { row: maxRow + 1, col: maxCol + 1 };
  }, [editingBus])
  const [editingSeatLabel, setEditingSeatLabel] = useState<{ seatId: string; seatNumber: string } | null>(null)

  const handleUpdateSeatLabel = (seatId: string, newLabel: string) => {
    setEditingBus({
      ...editingBus,
      seats: editingBus.seats.map((seat) => (seat.id === seatId ? { ...seat, seatNumber: newLabel } : seat)),
    })
    setEditingSeatLabel(null)
  }

  const handleSave = () => {
    onSave(editingBus)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Seat Configuration - {editingBus.licensePlate}</CardTitle>
        {isEditing && (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="gap-1">
              <Check className="w-4 h-4" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} className="gap-1 bg-transparent">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-6 rounded-lg overflow-auto max-h-96">
          <div
            className="grid gap-2 w-fit mx-auto"
            style={{
              gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
            }}
          >
            {editingBus.seats.map((seat) => (
              <div
                key={seat.id}
                className="relative"
                onClick={() => {
                  if (isEditing) {
                    setEditingSeatLabel({ seatId: seat.id, seatNumber: seat.seatNumber })
                  }
                }}
              >
                {editingSeatLabel?.seatId === seat.id ? (
                  <div className="flex flex-col gap-1">
                    <Input
                      autoFocus
                      value={editingSeatLabel.seatNumber}
                      onChange={(e) => setEditingSeatLabel({ seatId: seat.id, seatNumber: e.target.value })}
                      onBlur={() => handleUpdateSeatLabel(seat.id, editingSeatLabel.seatNumber)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateSeatLabel(seat.id, editingSeatLabel.seatNumber)
                        }
                      }}
                      className="h-8 text-xs w-12 text-center"
                    />
                  </div>
                ) : (
                  <button
                    className={`w-12 h-12 rounded border-2 flex items-center justify-center text-xs font-medium transition ${
                      isEditing
                        ? "bg-background border-border hover:bg-accent/20 hover:border-accent cursor-pointer"
                        : "bg-background border-border"
                    }`}
                  >
                    {seat.seatNumber}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {isEditing && <p className="text-xs text-muted-foreground">Click on any seat to edit its label</p>}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Seats</p>
            <p className="text-lg font-semibold">{editingBus.seats.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Layout</p>
            <p className="text-lg font-semibold">
              {row} x {col}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
