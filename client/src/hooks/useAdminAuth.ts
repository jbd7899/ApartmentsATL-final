import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function useAdminAuth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: adminData, isLoading: adminLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/admin"],
    enabled: isAuthenticated,
    retry: false,
  });

  const isLoading = authLoading || (isAuthenticated && adminLoading);
  const isAdmin = !!adminData?.isAdmin;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to access the admin panel.",
        variant: "destructive",
      });
      const id = setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return () => clearTimeout(id);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (!authLoading && !adminLoading && isAuthenticated && adminData !== undefined && !isAdmin) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, adminLoading, isAdmin, adminData, navigate]);

  return { isLoading, isAdmin, isAuthenticated };
}
