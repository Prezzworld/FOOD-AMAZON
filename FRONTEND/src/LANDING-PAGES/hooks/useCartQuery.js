import useAuthStore from "../../store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../utils/cartApi";
import { cartKey } from "../utils/cartUtils";

const useGetCart = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = user?._id || null;
  return useQuery({
    queryKey: cartKey(userId),
    queryFn: getCart,
    enabled: isAuthenticated && !!userId,
    staleTime: 0,
  });
};

const useAddToCart = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ product, quantity, variety }) =>
      addToCart(product, quantity, variety),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKey(user?._id), data);
    },
  });
};

const useUpdateCartItem = () => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({productId, quantity}) => updateCartItem(productId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKey(user?._id), data);
    }
  })
}

const useRemoveCartItem = () => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId) => removeCartItem(itemId),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKey(user?._id), data);
    }
  })
}

const useClearCart = () => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKey(user?._id), data);
    }
  })
}

export { useGetCart, useAddToCart, useUpdateCartItem, useRemoveCartItem, useClearCart };
