import { backend } from "../backend";
import { useMutation } from "@tanstack/react-query";

type CreateTicketParams = Parameters<typeof backend.ticket.create.post>[0];
export const useCreateTicket = () =>
  useMutation({
    mutationFn: async (params: CreateTicketParams) => {
      const res = await backend.ticket.create.post(params);
      if (res.error) throw res.error;
      return res.data;
    },
  });
