import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
    refetch
  };
}