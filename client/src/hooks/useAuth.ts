import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  isAdmin: boolean;
  isPro: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState(false);

  const { data: user, isLoading, error } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.status === 401) return null;
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      } catch (err) {
        clearTimeout(timeout);
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error("Request timed out");
        }
        if (err instanceof TypeError) {
          throw new Error("Network error - server unreachable");
        }
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setAuthError(!!error);
  }, [error]);

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries();
      window.location.href = "/";
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isError: authError,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
  };
}
