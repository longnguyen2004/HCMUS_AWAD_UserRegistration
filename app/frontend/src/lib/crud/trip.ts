import { backend } from "../backend";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

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
