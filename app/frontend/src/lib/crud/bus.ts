import { backend } from "../backend";
import { useQuery } from "@tanstack/react-query";

type SearchBusParams = NonNullable<Parameters<typeof backend.bus.get>[0]>["query"];
export const useSearchBus = (params: SearchBusParams) =>
  useQuery({
    queryKey: ["bus", params],
    queryFn: async() => {
      const res = await backend.bus.get({ query: params });
      if (res.error) throw res.error;
      return res.data;
    }
  });

export const useGetBus = (id: string) =>
  useQuery({
    queryKey: ["bus", id],
    queryFn: async() => {
      const res = await backend.bus({ id }).get();
      if (res.error) throw res.error;
      return res.data;
    }
  });
