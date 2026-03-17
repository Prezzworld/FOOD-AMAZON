import { cartLocalStorage } from "./cartLocalStorage";
import axiosInstance from "./axiosInstance";

// const API_BASE_URL = "http://localhost:3004/api/";
const endpointUrl = "food-amazon-database/cart/";

class CartService {
	constructor() {
		this.isAuthenticated = false;
		this.authToken = null;
		this.checkAuthStatus();
	}

	checkAuthStatus() {
		this.authToken = localStorage.getItem("token");
		console.log("Auth Token:", this.authToken);

		this.isAuthenticated = !!this.authToken;
		console.log("Is Authenticated:", this.isAuthenticated);

		return this.isAuthenticated;
	}

	setAuthStatus(isAuth, token = null) {
		this.isAuthenticated = isAuth;
		this.authToken = token;

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
			// if (error.response?.status === 401 || error.response?.status === 403) {
			// 	const errorMessage = error.response?.data?.toLowerCase() || "";

			// 	if (
			// 		errorMessage.includes("token") &&
			// 		(errorMessage.includes("expired") ||
			// 			errorMessage.includes("invalid") ||
			// 			errorMessage.includes("unauthorized"))
			// 	) {
			// 		this.handleTokenExpiration();
			// 		throw new Error("Your session has expired. Please log in again.");
			// 	}
			// }

			throw error;
		}
	}

	async getCart() {
		try {
			this.checkAuthStatus();

			if (this.isAuthenticated) {
				return await this.makeAuthenticatedRequest(async () => {
					console.log("📦 Fetching cart from backend...");

					const response = await axiosInstance.get(
						`/${endpointUrl}get-cart`
						// this.getAxiosConfig()
					);
					console.log("Cart response: ", response.data);
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
			if (this.isAuthenticated) {
				console.warn("Backend cart fetch failed, falling back to localStorage");
			}

			return cartLocalStorage.getCart();
		}
	}

	async addToCart(product, quantity = 1, variety = null) {
		try {
			this.checkAuthStatus();

			if (this.isAuthenticated) {
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
					console.log(backendItems);
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

			if (this.isAuthenticated) {
				const errorMessage =
					error.response?.data || error.message || "Faied to add item to cart";
				throw new Error(errorMessage);
			}

			return cartLocalStorage.addToCart(product, quantity);
		}
	}

	async updateQuantity(productId, quantity) {
		try {
			this.checkAuthStatus();

			if (this.isAuthenticated) {
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

			if (this.isAuthenticated) {
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
			console.log("🗑️ CartService: Removing item");
			console.log("  - Product ID:", itemId);
			console.log("  - Is authenticated:", this.isAuthenticated);
			this.checkAuthStatus();

			if (this.isAuthenticated) {
				const items = await this.makeAuthenticatedRequest(async () => {
					console.log("  - Making DELETE request to backend");
					console.log(
						"  - Endpoint:",
						`/${endpointUrl}remove-item/${itemId}`
					);
					const response = await axiosInstance.delete(
						`/${endpointUrl}remove-item/${itemId}`
						// this.getAxiosConfig()
					);
					console.log("  - Backend response:", response.data);
					console.log("  - Items returned:", response.data.cart.items);
					console.log("  - Number of items:", response.data.cart.items?.length);
					return response.data.cart.items || [];
				});
				console.log("  - Dispatching cartUpdated event");
				window.dispatchEvent(
					new CustomEvent("cartUpdated", { detail: { cart: items } })
				);
				console.log("✅ Item removed, returning updated cart");
				return items;
			} else {
				console.log("Using localStorage to remove item");
				return cartLocalStorage.removeFromCart(itemId);
			}
		} catch (error) {
			console.error("Error removing item from cart", error);
			console.error("  - Error message:", error.message);
			if (this.isAuthenticated) {
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
			this.checkAuthStatus();

			if (this.isAuthenticated) {
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

			if (this.isAuthenticated) {
				const errorMessage =
					error.response?.data || error.message || "Failed to clear cart";
				throw new Error(errorMessage);
			}

			return cartLocalStorage.clearCart();
		}
	}

	async getCartCount() {
		try {
			this.checkAuthStatus();

			if (this.isAuthenticated) {
				return await this.makeAuthenticatedRequest(async () => {
					console.log("📦 Fetching cart count from backend...");
					const response = await axiosInstance.get(
						`/${endpointUrl}get-cart`
						// this.getAxiosConfig()
					);
					console.log("Cart count response: ", response.data.totalItems);
					return response.data.totalItems || 0;
				});
			} else {
				const count = cartLocalStorage.getCartCount();
				console.log("Local cart count: ", count);
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
			this.checkAuthStatus();

			if (this.isAuthenticated) {
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
				console.warn("No auth token found for syncing cart");
				return [];
			}

			this.setAuthStatus(true, token);

			const localCartItems = cartLocalStorage.getCart();

			if (localCartItems.length === 0) {
				console.log("No local cart items to sync");
				return await this.getCart();
			}

			console.log(
				`Syncing ${localCartItems.length} local cart items to server`
			);

			const backendCart = await this.getCart();
			console.log(`Backend cart has ${backendCart.length} items before sync`);

			// const syncPromises = localCartItems.map(async (item) => {
			// 	try {
			// 		await this.addToCart(
			// 			{
			// 				_id: item._id,
			// 				name: item.name,
			// 				price: item.price,
			// 				productImg: item.productImg,
			// 			},
			// 			item.quantity,
			// 			item.variety
			// 		);
			// 		console.log("Successfully synced item", item);
			// 	} catch (error) {
			// 		console.error("Failed to sync item", item, error);
			// 	}
			// });

			// await Promise.allSettled(syncPromises);

			for (const item of localCartItems) {
				try {
					await this.addToCart(
						{
							_id: item._id,
							name: item.name,
							price: item.price,
							productImg: item.productImg,
						},
						item.quantity,
						item.variety
					)
					console.log("Successfully synced item: ", item);
				} catch (error) {
					console.error("Failed to sync item: ", item, error)
				}
			}

			cartLocalStorage.clearCart();
			console.log("localStorage cart cleared after sync");

			const finalCart = await this.getCart();
			console.log(`Final cart has ${finalCart.length} items after sync`);

			return finalCart;
		} catch (error) {
			console.error("Error syncing cart on login", error);
			return cartLocalStorage.getCart();
		}
	}

	async syncCartOnLogout() {
		try {
			if (!this.isAuthenticated) {
				console.log("Not authenticated, skipping logout cart sync");
				return;
			}

			console.log("Syncing backend cart to localStorage on logout");

			const backendCart = await this.getCart();

			this.setAuthStatus(false, null);

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

			console.log(
				`Synced ${backendCart.length} items to localStorage on logout`
			);
			return cartLocalStorage.getCart();
		} catch (error) {
			console.error("Error syncing cart on logout:", error);

			this.setAuthStatus(false, null);
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
