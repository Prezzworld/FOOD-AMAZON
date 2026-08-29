import { cartLocalStorage } from "./cartLocalStorage";
import axiosInstance from "./axiosInstance";

// const API_BASE_URL = "http://localhost:3004/api/";
const endpointUrl = "food-amazon-database/cart/";

class CartService {
	constructor() {
		this.isAuthenticated = false;
		this.checkAuthStatus();
	}

	checkAuthStatus() {
		const token = localStorage.getItem("token");

		return !!token
	}

	setAuthStatus(isAuth, token = null) {
		if (isAuth && token) {
			localStorage.setItem("token", token);
		} else {
			localStorage.removeItem("token");
		}
	}

	// getAxiosConfig() {
	// 	return {
	// 		headers: {
	// 			"x-auth-token": this.authToken,
	// 			"content-type": "application/json",
	// 		},
	// 	};
	// }

	handleTokenExpiration() {
		console.warn("JWT token expired - logging out user");
		// Clear authentication
		this.setAuthStatus(false, null);
		// Dispatch custom event so app can respond
		window.dispatchEvent(
			new CustomEvent("tokenExpired", {
				detail: { message: "Your session has expired. Please log in again." },
			})
		);
		return false;
	}

	async makeAuthenticatedRequest(requestFn) {
		try {
			return await requestFn();
		} catch (error) {
			if (error.response?.status === 401 || error.response?.status === 403) {
				const errorMessage = error.response?.data?.toLowerCase() || "";

				if (
					errorMessage.includes("token") &&
					(errorMessage.includes("expired") ||
						errorMessage.includes("invalid") ||
						errorMessage.includes("unauthorized"))
				) {
					this.handleTokenExpiration();
					throw new Error("Your session has expired. Please log in again.");
				}
			}

			throw error;
		}
	}

	async getCart() {
		try {
			

			if (this.checkAuthStatus()) {
				return await this.makeAuthenticatedRequest(async () => {
					const response = await axiosInstance.get(
						`/${endpointUrl}get-cart`
						// this.getAxiosConfig()
					);
					const items = response.data.items || [];
					localStorage.setItem("foodAmazonCart", JSON.stringify(items));
					return items;
				});
			} else {
				return cartLocalStorage.getCart();
			}
		} catch (error) {
			console.error("Error fetching cart from server", error);
			console.error("❌ Error response:", error.response?.data);
			if (this.checkAuthStatus()) {
				console.warn("Backend cart fetch failed, falling back to localStorage");
			}

			return cartLocalStorage.getCart();
		}
	}

	async addToCart(product, quantity = 1, variety = null) {
		try {

			if (this.checkAuthStatus()) {
				const items = await this.makeAuthenticatedRequest(async () => {
					const requestBody = {
						productId: product._id,
						quantity,
					};
					// Only add variety if it exists and isn't empty
					if (variety && variety.trim() !== "") {
						requestBody.variety = variety;
					}
					const response = await axiosInstance.post(
						`/${endpointUrl}add-item`,
						requestBody
						// this.getAxiosConfig()
					);
					const backendItems = response.data.cart.items;
					// Overwrite local storage with backend data to get the new cartItemIds
					localStorage.setItem("foodAmazonCart", JSON.stringify(backendItems));
					return backendItems || [];
				});

				window.dispatchEvent(
					new CustomEvent("cartUpdated", { detail: { cart: items } })
				);

				return items;
			} else {
				const updatedCart = cartLocalStorage.addToCart(product, quantity);
				return updatedCart;
			}
		} catch (error) {
			console.error("Error adding item to cart", error);

			if (this.checkAuthStatus()) {
				const errorMessage =
					error.response?.data || error.message || "Faied to add item to cart";
				throw new Error(errorMessage);
			}

			return cartLocalStorage.addToCart(product, quantity);
		}
	}

	async updateQuantity(productId, quantity) {
		try {

			if (this.checkAuthStatus()) {
				const items = await this.makeAuthenticatedRequest(async () => {
					const response = await axiosInstance.put(
						`/${endpointUrl}update-item/${productId}`,
						{ quantity }
						// this.getAxiosConfig()
					);
					return response.data.cart.items || [];
				});

				window.dispatchEvent(
					new CustomEvent("cartUpdated", { detail: { cart: items } })
				);

				return items;
			} else {
				return cartLocalStorage.updateQuantity(productId, quantity);
			}
		} catch (error) {
			console.error("Error updating item quantity", error);

			if (this.checkAuthStatus()) {
				const errorMessage =
					error.response?.data ||
					error.message ||
					"Failed to update item quantity";
				throw new Error(errorMessage);
			}

			return cartLocalStorage.updateQuantity(productId, quantity);
		}
	}

	async removeFromCart(itemId) {
		try {

			if (this.checkAuthStatus()) {
				const items = await this.makeAuthenticatedRequest(async () => {
					const response = await axiosInstance.delete(
						`/${endpointUrl}remove-item/${itemId}`
						// this.getAxiosConfig()
					);
					return response.data.cart.items || [];
				});
				window.dispatchEvent(
					new CustomEvent("cartUpdated", { detail: { cart: items } })
				);
				return items;
			} else {
				return cartLocalStorage.removeFromCart(itemId);
			}
		} catch (error) {
			console.error("Error removing item from cart", error);
			console.error("  - Error message:", error.message);
			if (this.checkAuthStatus()) {
				const errorMessage =
					error.response?.data ||
					error.message ||
					"Failed to remove item from cart";
				throw new Error(errorMessage);
			}

			return cartLocalStorage.removeFromCart(itemId);
		}
	}

	async clearCart() {
		try {

			if (this.checkAuthStatus()) {
				await this.makeAuthenticatedRequest(async () => {
					await axiosInstance.delete(
						`/${endpointUrl}clear-cart`
						// this.getAxiosConfig()
					);
				});

				window.dispatchEvent(
					new CustomEvent("cartUpdated", {
						detail: { cart: [] },
					})
				);

				return [];
			} else {
				return cartLocalStorage.clearCart();
			}
		} catch (error) {
			console.error("Error clearing cart", error);

			if (this.checkAuthStatus()) {
				const errorMessage =
					error.response?.data || error.message || "Failed to clear cart";
				throw new Error(errorMessage);
			}

			return cartLocalStorage.clearCart();
		}
	}

	async getCartCount() {
		try {

			if (this.checkAuthStatus()) {
				return await this.makeAuthenticatedRequest(async () => {
					const response = await axiosInstance.get(
						`/${endpointUrl}get-cart`
						// this.getAxiosConfig()
					);
					return response.data.totalItems || 0;
				});
			} else {
				const count = cartLocalStorage.getCartCount();
				return count;
			}
			// return cartLocalStorage.getCartCount();
		} catch (error) {
			console.error("Error getting cart count", error);
			return cartLocalStorage.getCartCount();
		}
	}

	async getCartTotal() {
		try {

			if (this.checkAuthStatus()) {
				return await this.makeAuthenticatedRequest(async () => {
					const response = await axiosInstance.get(
						`/${endpointUrl}get-cart`
						// this.getAxiosConfig()
					);
					return response.data.totalAmount || 0;
				});
			} else {
				return cartLocalStorage.getCartTotal();
			}
		} catch (error) {
			console.error("Error getting cart total", error);
			return cartLocalStorage.getCartTotal();
		}
	}

	async syncCartOnLogin(authToken = null) {
		try {
			const token = authToken || localStorage.getItem("token");

			if (!token) {
				return [];
			}

			localStorage.setItem("token", token)

			const localCartItems = cartLocalStorage.getCart();

			if (localCartItems.length === 0) {
				return await this.getCart();
			}

			const syncPromises = localCartItems.map((item) =>
        this.addToCart(
          {
            _id: item._id,
            name: item.name,
            price: item.price,
            productImg: item.productImg,
          },
          item.quantity,
          item.variety,
        ).catch((error) => {
          console.error("Failed to sync item: ", item, error);
        }),
      );

      await Promise.allSettled(syncPromises);


			cartLocalStorage.clearCart();

			const finalCart = await this.getCart();

			return finalCart;
		} catch (error) {
			console.error("Error syncing cart on login", error);
			return cartLocalStorage.getCart();
		}
	}

	async syncCartOnLogout() {
		try {
			if (!this.checkAuthStatus()) {
				return;
			}

			const backendCart = await this.getCart();

			localStorage.removeItem("token")

			cartLocalStorage.clearCart();

			for (const item of backendCart) {
				const productData = item.product || item;
				cartLocalStorage.addToCart(
					{
						_id: productData._id,
						name: productData.name,
						price: productData.price,
						productImg: productData.productImg,
					},
					item.quantity
				);
			}

			return cartLocalStorage.getCart();
		} catch (error) {
			console.error("Error syncing cart on logout:", error);

			localStorage.removeItem("token")
		}
	}

	async isInCart(productId) {
		try {
			const cartItems = await this.getCart();
			return cartItems.some((item) => {
				const itemId = item._id || item.product?._id;
				return itemId.toString() === productId.toString();
			});
		} catch (error) {
			console.error("Error checking if item is in cart", error);
			return false;
		}
	}
}

export const cartService = new CartService();
