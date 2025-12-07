import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

export interface Trip {
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
  status: "active" | "completed" | "cancelled"
  stops?: Stop[]
}

export interface Stop {
  id: string
  city: string
  arrivalTime: string
  departureTime: string
  order: number
}

interface TripModalProps {
  isOpen: boolean
  trip?: Trip
  onClose: () => void
  onSave: (trip: Trip) => void
}

export default function TripModal({ isOpen, trip, onClose, onSave }: TripModalProps) {
  const [formData, setFormData] = useState<Trip>(
    trip || {
      id: `trip-${Date.now()}`,
      from: "",
      to: "",
      departure: "",
      arrival: "",
      price: 0,
      busType: "Standard",
      amenities: [],
      capacity: 50,
      booked: 0,
      status: "active",
      stops: [],
    },
  )
  const [stops, setStops] = useState<Stop[]>(trip?.stops || [])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setFormData(
        trip || {
          id: `trip-${Date.now()}`,
          from: "",
          to: "",
          departure: "",
          arrival: "",
          price: 0,
          busType: "Standard",
          amenities: [],
          capacity: 50,
          booked: 0,
          status: "active",
          stops: [],
        },
      )
      setStops(trip?.stops || [])
      setErrors({})
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.from.trim()) newErrors.from = "Origin is required"
    if (!formData.to.trim()) newErrors.to = "Destination is required"
    if (!formData.departure) newErrors.departure = "Departure time is required"
    if (!formData.arrival) newErrors.arrival = "Arrival time is required"
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (formData.capacity <= 0) newErrors.capacity = "Capacity must be greater than 0"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddStop = () => {
    const newStop: Stop = {
      id: `stop-${Date.now()}`,
      city: "",
      arrivalTime: "",
      departureTime: "",
      order: stops.length + 1,
    }
    setStops([...stops, newStop])
  }

  const handleUpdateStop = (stopId: string, field: string, value: string) => {
    setStops(stops.map((stop) => (stop.id === stopId ? { ...stop, [field]: value } : stop)))
  }

  const handleRemoveStop = (stopId: string) => {
    const updated = stops.filter((s) => s.id !== stopId)
    setStops(updated.map((s, idx) => ({ ...s, order: idx + 1 })))
  }

  const handleSave = () => {
    if (!validateForm()) return

    const tripToSave = {
      ...formData,
      stops: stops.length > 0 ? stops : undefined,
    }

    onSave(tripToSave)
    handleOpenChange(false)
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const amenityOptions = ["WiFi", "AC", "Charging", "Food"]

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{trip ? "Edit Trip" : "Add New Trip"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Trip Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Input
                  placeholder="Origin city"
                  value={formData.from}
                  onChange={(e) => {
                    setFormData({ ...formData, from: e.target.value })
                    if (errors.from) setErrors({ ...errors, from: "" })
                  }}
                  className="bg-background"
                />
                {errors.from && <p className="text-xs text-destructive">{errors.from}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input
                  placeholder="Destination city"
                  value={formData.to}
                  onChange={(e) => {
                    setFormData({ ...formData, to: e.target.value })
                    if (errors.to) setErrors({ ...errors, to: "" })
                  }}
                  className="bg-background"
                />
                {errors.to && <p className="text-xs text-destructive">{errors.to}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Departure</label>
                <Input
                  type="datetime-local"
                  value={formData.departure}
                  onChange={(e) => {
                    setFormData({ ...formData, departure: e.target.value })
                    if (errors.departure) setErrors({ ...errors, departure: "" })
                  }}
                  className="bg-background"
                />
                {errors.departure && <p className="text-xs text-destructive">{errors.departure}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Arrival</label>
                <Input
                  type="datetime-local"
                  value={formData.arrival}
                  onChange={(e) => {
                    setFormData({ ...formData, arrival: e.target.value })
                    if (errors.arrival) setErrors({ ...errors, arrival: "" })
                  }}
                  className="bg-background"
                />
                {errors.arrival && <p className="text-xs text-destructive">{errors.arrival}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })
                    if (errors.price) setErrors({ ...errors, price: "" })
                  }}
                  className="bg-background"
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bus Type</label>
                <Select value={formData.busType} onValueChange={(val) => setFormData({ ...formData, busType: val })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Economy">Economy</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => {
                    setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 1 })
                    if (errors.capacity) setErrors({ ...errors, capacity: "" })
                  }}
                  className="bg-background"
                />
                {errors.capacity && <p className="text-xs text-destructive">{errors.capacity}</p>}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      formData.amenities.includes(amenity)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as Trip["status"] })}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stops Management */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Stops</h3>
              <Button size="sm" onClick={handleAddStop} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Stop
              </Button>
            </div>

            {stops.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No stops added. This is a direct trip.</p>
            ) : (
              <div className="space-y-3">
                {stops.map((stop, idx) => (
                  <Card key={stop.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex gap-2 items-start mb-3">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-2 py-1">
                          Stop {idx + 1}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveStop(stop.id)}
                          className="ml-auto h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">City</label>
                          <Input
                            placeholder="Stop city"
                            value={stop.city}
                            onChange={(e) => handleUpdateStop(stop.id, "city", e.target.value)}
                            className="h-8 text-sm bg-background"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Arrival</label>
                          <Input
                            type="time"
                            value={stop.arrivalTime}
                            onChange={(e) => handleUpdateStop(stop.id, "arrivalTime", e.target.value)}
                            className="h-8 text-sm bg-background"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Departure</label>
                          <Input
                            type="time"
                            value={stop.departureTime}
                            onChange={(e) => handleUpdateStop(stop.id, "departureTime", e.target.value)}
                            className="h-8 text-sm bg-background"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{trip ? "Update Trip" : "Create Trip"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
