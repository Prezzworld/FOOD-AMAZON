import axiosInstance from "./axiosInstance";

const endpointUrl = "food-amazon-database/cart/";

export const checkDataExists = (response, functionName) => {
  if(!response.data.cart || !response.data.cart.items || !Array.isArray(response.data.cart.items)) {
    throw new Error(`This error is coming from the ${functionName} function`)
  }
  return response.data.cart
}

const getCart = async () => {
  const response = await axiosInstance.get(`/${endpointUrl}get-cart`)
  return checkDataExists(response, "getCart")
}

const addToCart = async (product, quantity = 1, variety = null) => {
  const requestBody = {
    productId: product._id,
    quantity,
  };

  if (variety && variety.trim() !== "") {
    requestBody.variety = variety;
  }

  const response = await axiosInstance.post(`/${endpointUrl}add-item`, requestBody);
  return checkDataExists(response, "addToCart");
};

// Uses product's id
const updateCartItem = async (productId, quantity) => {
  const response = await axiosInstance.put(`/${endpointUrl}update-item/${productId}`, {quantity})
  return checkDataExists(response, "updateCartItem");
}

// Uses cart item's id
const removeCartItem = async (itemId) => {
  const response = await axiosInstance.delete(`/${endpointUrl}remove-item/${itemId}`)
  return checkDataExists(response, "removeCartItem");
}

const clearCart = async () => {
  const response = await axiosInstance.delete(`/${endpointUrl}clear-cart`)
  return checkDataExists(response, "clearCart");
}

export {getCart, addToCart, updateCartItem, removeCartItem, clearCart}