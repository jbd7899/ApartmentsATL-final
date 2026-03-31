declare module "netlify-identity-widget" {
  interface User {
    id: string;
    email: string;
    token: {
      access_token: string;
      expires_at: number;
      refresh_token: string;
      token_type: string;
    };
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
    app_metadata: {
      provider?: string;
      roles?: string[];
    };
    confirmed_at?: string;
    created_at?: string;
    updated_at?: string;
  }

  function init(opts?: { APIUrl?: string; logo?: boolean }): void;
  function open(tab?: "login" | "signup"): void;
  function close(): void;
  function currentUser(): User | null;
  function logout(): Promise<void>;
  function refresh(force?: boolean): Promise<string>;
  function on(event: "init" | "login" | "logout" | "error" | "open" | "close", callback: (user?: User) => void): void;
  function off(event: "init" | "login" | "logout" | "error" | "open" | "close"): void;

  export default {
    init,
    open,
    close,
    currentUser,
    logout,
    refresh,
    on,
    off,
  };
}
