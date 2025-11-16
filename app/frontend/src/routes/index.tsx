import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="w-svw h-svh flex items-center justify-center gap-2">
      <Link to="/login">
        <Button>Login</Button>
      </Link>
      <Link to="/register">
        <Button>Register</Button>
      </Link>
      <Link to="/protected">
        <Button>Protected Route</Button>
      </Link>
    </div>
  )
}
