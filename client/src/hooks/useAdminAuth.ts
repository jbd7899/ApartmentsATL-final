import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useAdminAuth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, login, getFreshToken } = useAuthContext();

  const { data: adminData, isLoading: adminLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/admin"],
    enabled: isAuthenticated,
    retry: false,
    queryFn: async () => {
      const token = await getFreshToken();
      const res = await fetch("/api/auth/admin", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
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
        login();
      }, 500);
      return () => clearTimeout(id);
    }
  }, [isAuthenticated, authLoading, toast, login]);

  useEffect(() => {
    if (!authLoading && !adminLoading && isAuthenticated && adminData !== undefined && !isAdmin) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, adminLoading, isAdmin, adminData, navigate]);

  return { isLoading, isAdmin, isAuthenticated };
}
