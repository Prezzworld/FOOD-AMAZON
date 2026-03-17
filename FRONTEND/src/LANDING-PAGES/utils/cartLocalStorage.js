export const cartLocalStorage = {
	getCart: () => {
		try {
			const cart = localStorage.getItem("foodAmazonCart");
			return cart ? JSON.parse(cart) : [];
		} catch (error) {
			console.error("Error getting cart from localStorage", error);
			return [];
		}
	},

	addToCart: (product, quantity = 1, variety = null) => {
		try {
			const cart = cartLocalStorage.getCart();
			const existingItemIndex = cart.findIndex(
				(item) => item._id === product._id
			);

			if (existingItemIndex !== -1) {
				cart[existingItemIndex].quantity += quantity;
			} else {
				cart.push({
					...product,
					quantity,
					variety,
					addedAt: new Date().toISOString(),
				});
			}

			localStorage.setItem("foodAmazonCart", JSON.stringify(cart));
			return cart;
		} catch (error) {
			console.error("Error adding to cart", error);
			return [];
		}
	},

	updateQuantity: (productId, quantity) => {
		try {
			const cart = cartLocalStorage.getCart();
			const itemIndex = cart.findIndex((item) => item._id === productId);

			if (itemIndex !== -1) {
				if (quantity <= 0) {
					cart.splice(itemIndex, 1);
				} else {
					cart[itemIndex].quantity = quantity;
				}
				localStorage.setItem("foodAmazonCart", JSON.stringify(cart));
			}
			return cart;
		} catch (error) {
			console.error("Error updating quantity", error);
			return [];
		}
	},

	removeFromCart: (productId) => {
		try {
			const cart = cartLocalStorage.getCart();
			const updatedCart = cart.filter((item) => item._id !== productId);
			localStorage.setItem("foodAmazonCart", JSON.stringify(updatedCart));
			return updatedCart;
		} catch (error) {
			console.error("Error removing from cart", error);
			return [];
		}
	},

	clearCart: () => {
		try {
			localStorage.removeItem("foodAmazonCart");
			return [];
		} catch (error) {
			console.error("Error clearing cart", error);
			return [];
		}
   },
   
   getCartCount: () => {
      try {
         const cart = cartLocalStorage.getCart();
         return cart.reduce((total, item) => total + item.quantity, 0);
      } catch (error) {
         console.error("error getting cart count", error);
         return 0
      }
   },

   getCartTotal: () => {
      try {
         const cart = cartLocalStorage.getCart();
         return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      } catch (error) {
         console.error("Error calculating cart total", error);
         return 0;
      }
   },

   isInCart: (productId) => {
      try {
         const cart = cartLocalStorage.getCart();
         return cart.some(item => item._id === productId);
      } catch (error) {
         console.error("Error checking if item is in cart", error);
         return false;
      }
   },

   getCartItem: (productId) => {
      try {
         const cart = cartLocalStorage.getCart();
         return cart.find(item => item._id === productId) || null;
      } catch (error) {
         console.error("Error getting cart item", error);
         return null;
      }
	},
	
	generateCartId: () => {
		const initials = 'FA';
		const timeStamps = Date.now().toString().slice(-6);
		const randomNumbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

		const cartId = `${initials}${timeStamps}${randomNumbers}`;
		return cartId;
	}
};
