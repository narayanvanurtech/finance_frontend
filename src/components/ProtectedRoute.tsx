"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/salesCrmStore/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store the intended destination for redirect after login
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.replace("/auth/login");
      return;
    }

    // Check if user has required role
    if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
      router.replace("/");
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router, pathname, requiredRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
