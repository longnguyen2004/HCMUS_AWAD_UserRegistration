import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { backend } from '@/lib/backend';

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();
  const {status, data, error} = useQuery({
    queryKey: ["requires_auth"],
    queryFn: async() => {
      const res = await backend.protected.get();
      if (res.error)
      {
        if (res.error.status === 401)
        {
          await router.navigate({ to: "/login" });
          return undefined;
        }
        else
        {
          throw res.error;
        }
      }
      return res.data;
    }
  });
  if (status === "pending") {
    return <span>Loading...</span>
  }
  else if (status === "error") {
    return <span>Error: {error.message}</span>
  }
  else {
    return <span>{data}</span>
  }
}
