import { backend } from "../backend";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

type SearchTripParams = Parameters<typeof backend.trip.search.get>[0]["query"];
export const useSearchTrips = (params: Partial<SearchTripParams>) =>
  useQuery({
    queryKey: ["trip", params],
    queryFn: async () => {
      const res = await backend.trip.search.get({
        query: params as SearchTripParams,
      });
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!params.from && !!params.to && !!params.departure,
    placeholderData: keepPreviousData,
  });

export const useGetTrip = (id: string) =>
  useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const res = await backend.trip({ id }).get();
      if (res.error) throw res.error;
      return res.data;
    },
  });
export type Trip = ReturnType<typeof useGetTrip>["data"];

export const useGetOccupiedSeats = (id: string) =>
  useQuery({
    queryKey: ["trip_seat", id],
    queryFn: async () => {
      const res = await backend.trip({ id }).seats_occupied.get();
      if (res.error) throw res.error;
      return res.data;
    },
  });

type CreateTripParams = Parameters<typeof backend.trip.create.post>[0];
export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: CreateTripParams) => {
      const res = await backend.trip.create.post(params);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
};

export const useEditTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: CreateTripParams & { id: string }) => {
      const res = await backend.trip({ id: params.id }).post(params);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
};
