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

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Admin Dashboard" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
