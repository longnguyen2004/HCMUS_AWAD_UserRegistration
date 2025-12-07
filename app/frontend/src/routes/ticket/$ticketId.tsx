import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ticket/$ticketId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div></div>;
}
