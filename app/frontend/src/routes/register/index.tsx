import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { backendAuth } from "@/lib/backend";

export const Route = createFileRoute("/register/")({
  component: SignupForm,
  beforeLoad: async () => {
    const { data: session } = await backendAuth.getSession();
    if (session) throw redirect({ to: "/" });
  },
});

type Inputs = {
  name: string;
  email: string;
  password: string;
};

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const { register, handleSubmit } = useForm<Inputs>();
  const createAccount = useMutation({
    mutationFn: async (data: Inputs) => {
      const res = await backendAuth.signUp.email(data);
      if (res.error) throw res.error;
      return res;
    },
    onSuccess: async () => {
      router.navigate({ to: "/login" });
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    createAccount.mutateAsync(data);
  };
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card {...props}>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    {...register("name")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    {...register("email")}
                  />
                  <FieldDescription>
                    We&apos;ll use this to contact you. We will not share your
                    email with anyone else.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    required
                    {...register("password")}
                  />
                </Field>
                {createAccount.error && (
                  <span className="text-red-700">
                    An error occurred: {createAccount.error.message}
                  </span>
                )}
                <FieldGroup>
                  <Field>
                    <Button type="submit" disabled={createAccount.isPending}>
                      Create Account
                    </Button>
                    <FieldDescription className="px-6 text-center">
                      Already have an account? <Link to="/login">Log in</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
