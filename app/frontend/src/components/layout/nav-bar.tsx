import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, LogIn } from "lucide-react";
import { backendAuth } from "@/lib/backend";
import ThemeSwitcher from "./theme-switcher";
import { Link } from "@tanstack/react-router";

interface NavBarProps {
  title: string;
}

export default function NavBar({ title }: NavBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { data: session } = backendAuth.useSession();
  const handleLogout = () => {
    backendAuth.signOut();
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">TravelHub</h1>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="hidden sm:flex items-center gap-3">
              {session ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{session.user.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 bg-transparent"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
            <button
              className="sm:hidden p-2 hover:bg-secondary rounded-md"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        {showMenu && (
          <div className="mt-4 space-y-2 sm:hidden">
            {session ? (
              <>
                <div className="flex items-center gap-2 text-sm p-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{session.user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full gap-2 bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" className="block">
                <Button size="sm" className="w-full gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
