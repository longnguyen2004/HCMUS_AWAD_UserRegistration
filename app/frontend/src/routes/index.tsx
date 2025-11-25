import { createFileRoute } from '@tanstack/react-router'
import { backendAuth } from '@/lib/backend'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
})

export default function App() {
  const {
    data: session,
    isPending,
  } = backendAuth.useSession();
  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  const loginFragment = (
    <Link to="/login">
      <Button>Login</Button>
    </Link>
  )
  const loggedInFragment = (
    <div className="flex flex-row gap-4 justify-center">
      <Button onClick={() => backendAuth.signOut()}>Logout</Button>
      <Link to="/admin">
        <Button>Go to admin page</Button>
      </Link>
    </div>
  )
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">TravelHub</h1>
          <p className="text-muted-foreground">Bus Booking & Management System</p>
          <div className="mt-2">
            {session ? loggedInFragment : loginFragment}
          </div>
        </div>
      </div>
    </div>
  )
}
