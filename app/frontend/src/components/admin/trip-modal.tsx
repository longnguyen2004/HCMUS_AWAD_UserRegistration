import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useSearchBus, useGetBus } from "@/lib/crud/bus";
import { useSearchBusStops } from "@/lib/crud/busstop";
import { format } from "date-fns";

export interface EditingTrip {
  id?: string;
  busId?: string;
  departure: string;
  price: number;
}
export interface Stop {
  id: string;
  duration: number | null;
}

export interface TripModalProps {
  isOpen: boolean;
  trip?: EditingTrip & { stops: Stop[] };
  onClose: () => void;
  onSave: (trip: EditingTrip & { stops: Stop[] }) => void;
}

export default function TripModal({
  isOpen,
  trip,
  onClose,
  onSave,
}: TripModalProps) {
  const { data: busStops } = useSearchBusStops({});
  const { data: buses } = useSearchBus({});
  const [formData, setFormData] = useState<EditingTrip>({
    departure: format(new Date(), "yyyy-MM-dd'T'HH:mm'Z'"),
    price: 0,
  });
  const [stops, setStops] = useState<Stop[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { data: selectedBus } = useGetBus(formData.busId ?? "");

  // Merge selected bus with buses list if not already present
  const availableBuses = buses?.data ?? [];
  const busListWithSelected =
    selectedBus && !availableBuses.find((b) => b.id === selectedBus.id)
      ? [selectedBus, ...availableBuses]
      : availableBuses;

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: trip?.id,
        busId: trip?.busId,
        departure:
          trip?.departure ?? format(new Date(), "yyyy-MM-dd'T'HH-mm'Z'"),
        price: trip?.price ?? 0,
      });
      setStops(trip?.stops || []);
      setErrors({});
    }
  }, [isOpen, trip]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.departure) newErrors.departure = "Departure time is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (stops.length < 2) newErrors.stops = "There must be at least 2 stops";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStop = () => {
    const newStop: Stop = {
      id: "",
      duration: null,
    };
    setStops([...stops, newStop]);
  };

  const handleUpdateStop = <T extends keyof Stop>(
    stopIndex: number,
    key: T,
    value: Stop[T],
  ) => {
    const newStops = structuredClone(stops);
    newStops[stopIndex][key] = value;
    setStops(newStops);
  };

  const handleRemoveStop = (stopIndex: number) => {
    const newStops = structuredClone(stops);
    newStops.splice(stopIndex, 1);
    setStops(newStops);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const tripToSave = {
      ...formData,
      stops,
    };

    onSave(tripToSave);
  };

  // const handleAmenityToggle = (amenity: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     amenities: prev.amenities.includes(amenity)
  //       ? prev.amenities.filter((a) => a !== amenity)
  //       : [...prev.amenities, amenity],
  //   }))
  // }

  // const amenityOptions = ["WiFi", "AC", "Charging", "Food"]

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
                <label className="text-sm font-medium">Departure</label>
                <Input
                  type="datetime-local"
                  value={formData.departure.replace("Z", "")}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      departure: e.target.value + "Z",
                    });
                    if (errors.departure)
                      setErrors({ ...errors, departure: "" });
                  }}
                  className="bg-background"
                />
                {errors.departure && (
                  <p className="text-xs text-destructive">{errors.departure}</p>
                )}
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
                    setFormData({
                      ...formData,
                      price: Number.parseFloat(e.target.value) || 0,
                    });
                    if (errors.price) setErrors({ ...errors, price: "" });
                  }}
                  className="bg-background"
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price}</p>
                )}
              </div>

              {/* <div className="space-y-2">
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
              </div>*/}
            </div>

            {/* Assigned Bus */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned Bus</label>
              <Select
                value={formData.busId}
                onValueChange={(val) =>
                  setFormData({ ...formData, busId: val })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a bus" />
                </SelectTrigger>
                <SelectContent>
                  {busListWithSelected.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Amenities */}
            {/* <div className="space-y-2">
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
          </div> */}

            {/* Stops Management */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Stops</h3>
                <Button size="sm" onClick={handleAddStop} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Stop
                </Button>
              </div>

              {errors.stops && (
                <p className="text-xs text-destructive">{errors.stops}</p>
              )}

              {stops.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No stops added. Add at least one to proceed.
                </p>
              ) : (
                <div className="space-y-2">
                  {stops.map((stop, idx) => (
                    // eslint-disable-next-line react/jsx-key
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-2 py-1 whitespace-nowrap">
                        {idx === 0
                          ? "Origin"
                          : idx === stops.length - 1
                            ? "Destination"
                            : `Stop ${idx}`}
                      </span>
                      <Select
                        value={stop.id}
                        onValueChange={(value) =>
                          handleUpdateStop(idx, "id", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm bg-background flex-1">
                          <SelectValue placeholder="Select a stop" />
                        </SelectTrigger>
                        <SelectContent>
                          {(busStops?.data ?? []).map(({ id, name }) => (
                            <SelectItem key={id} value={id}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {idx > 0 && (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            value={stop.duration || 0}
                            onChange={(e) =>
                              handleUpdateStop(
                                idx,
                                "duration",
                                Number.parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-8 w-20 text-sm bg-background"
                            placeholder="0"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            min
                          </span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveStop(idx)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {trip ? "Update Trip" : "Create Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
