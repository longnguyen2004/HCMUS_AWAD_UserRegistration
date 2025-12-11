import { backend } from "../backend";
import { useMutation, useQuery } from "@tanstack/react-query";

type CreateTicketParams = Parameters<typeof backend.ticket.create.post>[0];
export const useCreateTicket = () =>
  useMutation({
    mutationFn: async (params: CreateTicketParams) => {
      const res = await backend.ticket.create.post(params);
      if (res.error) throw res.error;
      return res.data;
    },
  });

export type TicketDetail = {
  id: string;
  status: string;
  price: number;
  email: string;
  phone: string;
  seatNumber?: string;
  busPlate?: string;
  orderId?: number;
  createdAt: string | Date;
  trip: {
    id: string;
    departure: string | Date;
    arrival: string | Date;
    fromCity?: string;
    toCity?: string;
  };
};

export const useGetTicket = (id: string) =>
  useQuery<TicketDetail>({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const res = await backend.ticket({ id }).get();
      if (res.error) throw res.error;
      return res.data as unknown as TicketDetail;
    },
    enabled: !!id,
  });
