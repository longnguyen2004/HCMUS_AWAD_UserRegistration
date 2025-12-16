import { backend } from "../backend";
import { useQuery, useMutation } from "@tanstack/react-query";

type SearchBusParams = NonNullable<
  Parameters<typeof backend.bus.get>[0]
>["query"];
export const useSearchBus = (params?: SearchBusParams) =>
  useQuery({
    queryKey: ["bus", params],
    queryFn: async () => {
      const res = await backend.bus.get({ query: params });
      if (res.error) throw res.error;
      return res.data;
    },
  });

export const useGetBus = (id: string) =>
  useQuery({
    queryKey: ["bus", id],
    queryFn: async () => {
      const res = await backend.bus({ id }).get();
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!id
  });

type CreateBusParams = Parameters<typeof backend.bus.create.post>[0];
export const useCreateBus = () =>
  useMutation({
    mutationFn: async (params: CreateBusParams) => {
      const res = await backend.bus.create.post(params);
      if (res.error) throw res.error;
      return res.data;
    }
  });

type EditBusParams = Parameters<ReturnType<typeof backend.bus>["patch"]>[0];
export const useEditBus = () =>
  useMutation({
    mutationFn: async (params: { id: string } & EditBusParams) => {
      const res = await backend.bus({ id: params.id }).patch(params);
      if (res.error) throw res.error;
      return res.data;
    }
  })
