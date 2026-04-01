import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import netlifyIdentity from "netlify-identity-widget";

interface AuthUser {
  id: string;
  email: string;
  token: {
    access_token: string;
    expires_at: number;
  };
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
    roles?: string[];
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  getToken: () => string | null;
  getFreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user on mount
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser(mapUser(currentUser));
    }
    setIsLoading(false);

    // Listen for auth events
    netlifyIdentity.on("login", (netlifyUser) => {
      setUser(mapUser(netlifyUser));
      netlifyIdentity.close();
    });

    netlifyIdentity.on("logout", () => {
      setUser(null);
    });

    return () => {
      netlifyIdentity.off("login");
      netlifyIdentity.off("logout");
    };
  }, []);

  function mapUser(netlifyUser: any): AuthUser {
    return {
      id: netlifyUser.id,
      email: netlifyUser.email,
      token: netlifyUser.token,
      user_metadata: netlifyUser.user_metadata,
      app_metadata: netlifyUser.app_metadata,
    };
  }

  function login() {
    netlifyIdentity.open("login");
  }

  function logout() {
    netlifyIdentity.logout();
  }

  function getToken(): string | null {
    const currentUser = netlifyIdentity.currentUser();
    if (!currentUser || !currentUser.token) return null;
    return currentUser.token.access_token;
  }

  async function getFreshToken(): Promise<string | null> {
    try {
      const token = await netlifyIdentity.refresh();
      return token || getToken();
    } catch {
      return getToken();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        getToken,
        getFreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
