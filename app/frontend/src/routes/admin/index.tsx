import { createFileRoute, redirect } from "@tanstack/react-router";
import { backendAuth } from "@/lib/backend";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  beforeLoad: async () => {
    const { data: session } = await backendAuth.getSession();
    if (!session) throw redirect({ to: "/login" });
  },
});

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavBar from "@/components/layout/nav-bar";
import UserManagement from "@/components/admin/user-management";
import TripManagement from "@/components/admin/trip-management";
import BusManagement from "@/components/admin/bus-management";
import TicketManagement from "@/components/admin/ticket-management";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Admin Dashboard" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="trips">Trip Management</TabsTrigger>
            <TabsTrigger value="buses">Bus Management</TabsTrigger>
            <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
          <TabsContent value="trips" className="space-y-4">
            <TripManagement />
          </TabsContent>
          <TabsContent value="buses" className="space-y-4">
            <BusManagement />
          </TabsContent>
          <TabsContent value="tickets" className="space-y-4">
            <TicketManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
