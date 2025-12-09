import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

/**
 * Hook to protect a page/route
 * Redirects to login if user is not authenticated
 * @param requiredRoles - Optional array of roles allowed to access the page
 * @returns Object with authentication status and user info
 */
export const useProtectedRoute = (requiredRoles?: string[]) => {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuthStore();

  useEffect(() => {
    // Check if token exists in cookies as well
    if (!isAuthenticated || !token) {
      router.replace("/auth/login");
      return;
    }

    // Check role-based access
    if (requiredRoles && requiredRoles.length > 0 && user) {
      if (!requiredRoles.includes(user.role)) {
        router.replace("/");
        return;
      }
    }
  }, [isAuthenticated, token, user, router, requiredRoles]);

  return {
    isAuthenticated,
    user,
    isAuthorized:
      isAuthenticated &&
      (!requiredRoles || requiredRoles.length === 0 || (user && requiredRoles.includes(user.role))),
  };
};
