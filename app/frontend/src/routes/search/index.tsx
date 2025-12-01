import { createFileRoute } from '@tanstack/react-router'
import TripSearch from '@/components/user/trip-search'
import NavBar from '@/components/layout/nav-bar'

export const Route = createFileRoute('/search/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar title="Search Trips" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <TripSearch />
      </div>
    </div>
  )
}
