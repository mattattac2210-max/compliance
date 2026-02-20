import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SupportStatus {
  active: boolean;
  targetUserId?: string;
  targetEmail?: string;
}

export function useSupportMode() {
  const { data: status, isLoading } = useQuery<SupportStatus>({
    queryKey: ["/api/admin/support/status"],
    retry: false,
    refetchOnWindowFocus: true,
  });

  const exitMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/support/exit"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/status"] });
    },
  });

  return {
    isActive: status?.active ?? false,
    targetUserId: status?.targetUserId,
    targetEmail: status?.targetEmail,
    isLoading,
    exit: exitMutation.mutate,
    isExiting: exitMutation.isPending,
  };
}
