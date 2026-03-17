export const wishlistLocalStorage = {
	getWishlist: () => {
		try {
			const savedWishlist = localStorage.getItem("foodAmazonWishlist");
			return savedWishlist ? JSON.parse(savedWishlist) : [];
		} catch (error) {
         console.error("Error loading wishlist from localstorage", error);
         return [];
		}
	},

	saveWishlist: (wishlist) => {
		try {
			localStorage.setItem("foodAmazonWishlist", JSON.stringify(wishlist));
		} catch (error) {
			console.error("Error saving product to wishlist", error);
		}
	},

	addToWishlist: (product) => {
		try {
			const wishlist = wishlistLocalStorage.getWishlist();
			const exists = wishlist.some((item) => item._id === product._id);

			if (exists) {
				console.log("Product is already in wishlist");
				return false;
			}

			const newItem = {
				...product,
				addedToWishlistAt: new Date().toISOString(),
			};

			const updatedWishlist = [...wishlist, newItem];
			wishlistLocalStorage.saveWishlist(updatedWishlist);
			return true;
		} catch (error) {
			console.error("Error adding product to wishlist", error);
		}
	},

	removeFromWishlist: (productId) => {
		try {
			const wishlist = wishlistLocalStorage.getWishlist();
			const updatedWishlist = wishlist.filter((item) => item._id !== productId);
			wishlistLocalStorage.saveWishlist(updatedWishlist);
			return updatedWishlist;
		} catch (error) {
			console.error("Error removing product from wishlist", error);
		}
	},

	toggleWishlist: (product) => {
		try {
			const wishlist = wishlistLocalStorage.getWishlist();
			const exists = wishlist.some((item) => item._id === product._id);
	
			if (exists) {
				wishlistLocalStorage.removeFromWishlist(product._id);
				console.log("Product removed from wishlist");
				return false;
			} else {
				wishlistLocalStorage.addToWishlist(product);
				return true;
			}
		} catch (error) {
			console.console.error("Error toggling wishlist", error);
			return false;
		}
	},

	isInWishlist: (productId) => {
		try {
			const wishlist = wishlistLocalStorage.getWishlist();
			return wishlist.some((item) => item._id === productId);
		} catch (error) {
			console.log("Failed to check if item is in wishlist", error);
			return false;
		}
	},

	clearWishlist: () => {
		wishlistLocalStorage.saveWishlist([]);
		return [];
	},

	getWishlistCount: () => {
		try {
			const wishlist = wishlistLocalStorage.getWishlist();
			return wishlist.length;
		} catch (error) {
			console.error("Error clearing wishlist", error)
		}
	},
};
