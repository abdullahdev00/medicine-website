import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - allow cached data reuse
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache
      retry: (failureCount, error: any) => {
        // Stop infinite retries on CORS errors
        if (error?.message?.includes('CORS') || 
            error?.message?.includes('Cross-Origin') ||
            error?.message?.includes('blocked') ||
            error?.message?.includes('401') || 
            error?.message?.includes('403')) {
          return false; // Don't retry CORS or auth errors
        }
        return failureCount < 1; // Only retry once to prevent infinite loops
      },
      retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000), // Slower retry
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        // Don't log sensitive mutation errors in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Mutation error:', error);
        }
      },
    },
  },
});
