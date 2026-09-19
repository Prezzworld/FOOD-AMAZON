import { create } from "zustand";
import { devtools } from "zustand/middleware";

const getInitialAuth = () => {
  const disToken = localStorage.getItem("disToken");
  const disRefreshToken = localStorage.getItem("disRefreshToken");
  const distributor = JSON.parse(localStorage.getItem("distributor"));
  return { disToken, disRefreshToken, distributor };
};

const useDistributorStore = create(
  devtools((set) => {
    const initial = getInitialAuth();

    return {
      disToken: initial.disToken,
      disRefreshToken: initial.disRefreshToken,
      distributor: initial.distributor,
      isAuthenticated: !!initial.disToken,

      login: (disToken, disRefreshToken, distributor) => {
        localStorage.setItem("disToken", disToken);
        localStorage.setItem("disRefreshToken", disRefreshToken);
        localStorage.setItem("distributor", JSON.stringify(distributor));
        set({ disToken, disRefreshToken, distributor, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("disToken");
        localStorage.removeItem("disRefreshToken");
        localStorage.removeItem("distributor");
        set({
          disToken: null,
          disRefreshToken: null,
          distributor: null,
          isAuthenticated: false,
        });
      },
      setTokens: (disToken, disRefreshToken) => {
        localStorage.setItem("disToken", disToken);
        localStorage.setItem("disRefreshToken", disRefreshToken);
        set({ disToken, disRefreshToken });
      },
      setDistributor: (distributor) => {
        localStorage.setItem("distributor", JSON.stringify(distributor));
        set({ distributor });
      },
    };
  }, {name: "DistributorStore", enabled: true}),
);

export default useDistributorStore