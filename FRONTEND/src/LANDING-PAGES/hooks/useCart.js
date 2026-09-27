import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore"
import {useGetCart, useAddToCart, useUpdateCartItem, useRemoveCartItem, useClearCart} from "./useCartQuery"
import { computeTotals } from "../utils/cartUtils";

const useCart = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  const serverCart = useGetCart()
  const guestCart = useCartStore(state => state.items)

  const guestAddToCart = useCartStore(state => state.addToCart)
  const serverAddToCart = useAddToCart()

  const guestUpdateCartItem = useCartStore(state => state.updateItem)
  const serverUpdateCartItem = useUpdateCartItem()

  const guestRemoveCartItem = useCartStore(state => state.removeItem)
  const serverRemoveCartItem = useRemoveCartItem()

  const guestClearCart = useCartStore(state => state.clearCart)
  const serverClearCart = useClearCart()

  const loading = isAuthenticated ? serverCart.isPending : false
  const items = isAuthenticated ? serverCart.data?.items || [] : guestCart
  const totals = isAuthenticated ? {totalItems: serverCart.data?.totalItems ?? 0, totalAmount: serverCart.data?.totalAmount} : computeTotals(guestCart) 
  const isAdding = isAuthenticated ? serverAddToCart.isPending : false;
  const isUpdating = isAuthenticated ? serverUpdateCartItem.isPending : false;
  const isRemoving = isAuthenticated ? serverRemoveCartItem.isPending : false;
  const isClearing = isAuthenticated ? serverClearCart.isPending : false;

  const addToCart = (product, quantity, variety) => {
    if(isAuthenticated) {
      serverAddToCart.mutate({product, quantity, variety})
    } else {
      guestAddToCart(product, quantity, variety)
    }
  }

  const updateCartItem = (item, quantity) => {
    if(isAuthenticated) {
      serverUpdateCartItem.mutate({productId: item._id, quantity})
    } else {
      guestUpdateCartItem(item.itemId, quantity)
    }
  }

  const removeCartItem = (item) => {
    if(isAuthenticated) {
      serverRemoveCartItem.mutate(item.itemId)
    } else {
      guestRemoveCartItem(item.itemId)
    }
  }

  const clearCart = () => {
    if(isAuthenticated) {
      serverClearCart.mutate()
    } else {
      guestClearCart()
    }
  }

  return {items, loading, totalItems: totals.totalItems, totalAmount: totals.totalAmount, isAdding, isUpdating, isRemoving, isClearing, addToCart, updateCartItem, removeCartItem, clearCart}
}

export {useCart}