import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { cartService } from "../LANDING-PAGES/utils/cartService";
import { computeTotals, normalizeCart } from "../LANDING-PAGES/utils/cartUtils";

const useCartStore = create(
  devtools(
    (set, get) => {
      return {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        loading: false,
        error: null,

        fetchCart: async () => {
          try {
            set({ loading: true });
            const cartItems = await cartService.getCart();
            const normalizedCart = normalizeCart(cartItems);
            const totals = computeTotals(normalizedCart);
            set({
              items: [...normalizedCart],
              totalItems: totals.totalItems,
              totalAmount: totals.totalAmount,
            });
          } catch (error) {
            set({
              error: `An error occured, unable to fetch cart ${error.message}`,
            });
          } finally {
            set({ loading: false });
          }
        },
      };
    },
    { name: "CartStore", enabled: true },
  ),
);

// const runTest = async () => {
//   await useCartStore.getState().fetchCart();
//   const state = useCartStore.getState();
//   console.log("items:", state.items);
//   console.log("totalItems:", state.totalItems);
//   console.log("totalAmount:", state.totalAmount);
//   console.log("loading:", state.loading);
//   console.log("error:", state.error);
// };
// runTest();

export default useCartStore