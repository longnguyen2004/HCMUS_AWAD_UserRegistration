import { backend } from "../backend";
import { useQuery } from "@tanstack/react-query";

export const useGetCities = () =>
  useQuery({
    queryKey: ["city"],
    queryFn: async () => {
      const res = await backend.city.get();
      if (res.error) throw res.error;
      return res.data;
    },
  });
