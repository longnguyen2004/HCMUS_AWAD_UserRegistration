import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { useForm, type SubmitHandler } from "react-hook-form"
import { backend } from "@/lib/backend"

export const Route = createFileRoute('/login/')({
  component: LoginForm,
})

type Inputs = {
  username: string,
  password: string,
}

export function LoginForm() {
  const router = useRouter();
  const { queryClient } = Route.useRouteContext();
  const { register, handleSubmit } = useForm<Inputs>();
  const login = useMutation({
    mutationFn: async (data: Inputs) => {
      const res = await backend.login.post(data);
      if (res.error)
        throw res.error;
      return res.response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user/me"] });
      router.navigate({ to: "/" });
    }
  })
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    login.mutateAsync(data);
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      type="text"
                      required
                      {...register("username")}
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <Input id="password" type="password" required {...register("password")}/>
                  </Field>
                  <Field>
                    <Button type="submit" disabled={login.isPending}>Login</Button>
                    <FieldDescription className="text-center">
                      Don&apos;t have an account? <a href="#">Sign up</a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
