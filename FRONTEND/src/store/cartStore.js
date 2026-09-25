import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

const generateCartId = () => {
  const timeStamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `FA${timeStamp}${random}`;
};

const useCartStore = create(
  devtools(
    persist((set, get) => {
      return {
        items: [],
        totalItems: 0,
        totalAmount: 0,

        addToCart: (product, quantity, variety) => {
          const existingItemIndex = get().items.findIndex(
            (item) => item._id === product._id && item.variety === variety,
          );
          if (existingItemIndex !== -1) {
            const updatedItems = get().items.map((item) =>
              item._id === product._id && item.variety === variety
                ? {
                    ...item,
                    quantity: Math.min(
                      item.quantity + quantity,
                      product.inStock,
                    ),
                  }
                : item,
            );
            set({ items: updatedItems });
          } else {
            const newId = generateCartId();
            const newItem = {
              itemId: newId,
              cartItemId: newId,
              _id: product._id,
              name: product.name,
              price: product.price,
              productImg: product.productImg,
              quantity: Math.min(quantity, product.inStock),
              variety,
            };
            const newItems = [...get().items, newItem];
            set({ items: newItems });
          }
        },
        updateItem: (itemId, quantity) => {
          const updatedItems = get().items.map((item) =>
            item.itemId === itemId ? { ...item, quantity: quantity } : item,
          );
          set({ items: updatedItems });
        },
        removeItem: (itemId) => {
          const itemAfterRemove = get().items.filter(
            (item) => item.itemId !== itemId,
          );
          set({ items: itemAfterRemove });
        },
        clearCart: () => {
          set({ items: [], totalItems: 0, totalAmount: 0 });
        },
      };
    }, {name: "guest-cart-storage", storage: createJSONStorage(() => localStorage), partialize: (state) => ({items: state.items})}),
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

export default useCartStore;
