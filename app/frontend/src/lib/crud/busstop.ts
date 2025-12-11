import { backend } from "../backend";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

type SearchBusStopParams = NonNullable<
  Parameters<typeof backend.busstop.search.get>[0]
>["query"];
export const useSearchBusStops = (params: Partial<SearchBusStopParams>) =>
  useQuery({
    queryKey: ["busstop", params],
    queryFn: async () => {
      const res = await backend.busstop.search.get({
        query: params,
      });
      if (res.error) throw res.error;
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
