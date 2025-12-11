import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { backendAuth } from "@/lib/backend";

export const Route = createFileRoute("/login/")({
  component: Login,
});

import { useState } from "react";
import { FieldDescription } from "@/components/ui/field";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async (type: string) => {
    setError("");
    setIsLoading(true);
    switch (type) {
      case "email": {
        const { error } = await backendAuth.signIn.email({ email, password });
        if (error == null) router.navigate({ to: "/" });
        break;
      }
      case "github": {
        await backendAuth.signIn.social({
          provider: "github",
          callbackURL: window.location.origin,
        });
        break;
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">TravelHub</h1>
          <p className="text-muted-foreground">
            Bus Booking & Management System
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin("email");
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <Button
              onClick={() => handleLogin("github")}
              className="w-full"
              disabled={isLoading}
            >
              Sign in with GitHub
            </Button>

            <FieldDescription className="text-center text-sm pt-2">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-600 underline">
                Create one
              </Link>
            </FieldDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
