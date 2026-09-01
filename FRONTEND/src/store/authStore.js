import { create } from "zustand";
import { devtools } from "zustand/middleware";

const getInitialAuth = () => {
  const token = localStorage.getItem("token")
  const refreshToken = localStorage.getItem("refreshToken")
  const user = JSON.parse(localStorage.getItem("user") || null);
  return {token, refreshToken, user}
}

const useAuthStore = create(
  devtools((set, get) => {
    const initial = getInitialAuth();

    return {
      token: initial.token,
      refreshToken: initial.refreshToken,
      user: initial.user,
      isAuthenticated: !!initial.token,

      login: (token, refreshToken, user) => {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, refreshToken, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
      setTokens: (token, refreshToken) => {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        set({ token, refreshToken });
      },
      setUser: (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user });
      },
    };
  }, {name: "AuthStore"}),
);

export default useAuthStore