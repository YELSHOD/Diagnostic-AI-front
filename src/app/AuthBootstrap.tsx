import { useEffect, type ReactNode } from "react";
import { me } from "@features/auth/api";
import { useAuthStore } from "@features/auth/store";

type Props = {
  children: ReactNode;
};

export function AuthBootstrap({ children }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    let active = true;
    me()
      .then((user) => {
        if (active) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (active) {
          clearSession();
        }
      });
    return () => {
      active = false;
    };
  }, [accessToken, setCurrentUser, clearSession]);

  return <>{children}</>;
}
