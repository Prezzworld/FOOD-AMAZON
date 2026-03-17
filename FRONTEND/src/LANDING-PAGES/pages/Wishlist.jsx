import React, {useState, useEffect} from "react";
// import { useNavigate } from 'react-router-dom';
// import { stringToArray } from '../helper/Helper';
import { BsX } from "react-icons/bs";
import { wishlistLocalStorage } from "../utils/wishlistLocalStorage";
import { cartService } from "../utils/cartService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Swal from 'sweetalert2';
import withReactContent from "sweetalert2-react-content";
import '../pages/wishlist.css';

const Wishlist = () => {
	const MySwal = withReactContent(Swal);
	// const navigate = useNavigate();
	const [wishlist, setWishlist] = useState({});
	const [addedItem, setAddedItem] = useState([]);
	const [loading, setLoading] = useState(true);
	const [addingToCart, setAddingToCart] = useState(false);

	useEffect(() => {
		try {
			const loadWishlist = () => {
				setLoading(true);
				const savedWishlist = wishlistLocalStorage.getWishlist();

				const wishlistArray = Array.isArray(savedWishlist) ? savedWishlist : [];
				setWishlist(wishlistArray);
			};

			loadWishlist();

			const handleStorageChange = (e) => {
				if (e.key === "foodAmazonWishlist") {
					loadWishlist();
				}
			};

			window.addEventListener("storage", handleStorageChange);
			return () => window.removeEventListener("storage", handleStorageChange);
		} catch (error) {
			console.error('Error loading wishlist', error);
			MySwal.fire({
				icon: "error",
				text: "Failed to load wishlist",
				showConfirmButton: true,
			});
		} finally {
			setLoading(false);
		}
	}, []);

	const handleAddToCart = async (product) => {
		if (addingToCart[product._id]) return; // Prevent multiple clicks
		try {
			await cartService.addToCart(product, 1);
			setAddedItem(prev => ({...prev, [product._id]: true}));
		// Here you would dispatch to Redux or Context
		console.log("Added to cart:", product);

		MySwal.fire({
			icon: "success",
			text: "Product added to cart",
			showConfirmButton: false,
			timer: 2000,
			toast: true,
			position: "top-end",
		});

		// Reset after 2 seconds
		setTimeout(() => {
			setAddedItem(prev => ({...prev, [product._id]: false}))
		}, 2000);
		} catch (error) {
			console.error("Error adding to cart:", error);

			MySwal.fire({
				icon: "error",
				text: error.message || "Failed to add item to cart",
				showConfirmButton: true,
				confirmButtonColor: "#00a859",
			});
		} finally {
			setAddedItem((prev) => ({ ...prev, [product._id]: false }));
		}
	};

	const handleAddAllToCart = async () => {
		const inStockItems = wishlist.filter((item) => item.inStock > 0);

		if (inStockItems.length === 0) {
			MySwal.fire({
				icon: "warning",
				text: "No item in stock to add",
				showConfirmButton: false,
				timer: 2000,
				toast: true,
				position: "top-end"
			});
			return;
		}

		try {
			const loadingState = {};
			inStockItems.forEach(item => {
				loadingState[item._id] = true;
			});
			setAddingToCart(loadingState);

			const results = await Promise.allSettled(
				inStockItems.map(item => cartService.addToCart(item, 1))
			)

			const successCount = results.filter(r => r.status === 'fulfilled').length;
			const failCount = results.filter(r => r.status === 'rejected').length;

			const newAddedItems = {};
			inStockItems.forEach(item => {
				newAddedItems[item._id] = true;
			})
			setAddedItem(newAddedItems);

			if (failCount === 0) {
				MySwal.fire({
					icon: "success",
					text: `${successCount} items added to cart`,
					showConfirmButton: false,
					timer: 2000,
					toast: true,
					position: "top-end",
				});
			} else {
				MySwal.fire({
					icon: "warning",
					title: "Partial Success",
					text: `${successCount} items added, ${failCount} failed`,
					showConfirmButton: true,
				});
			}
			console.log("Added all to cart:", inStockItems);

			setTimeout(() => {
				setAddedItem({});
			}, 2000);
		} catch (error) {
			console.error("Error adding all to cart", error);
			MySwal.fire({
				icon: "error",
				text: "Failed to add all items to cart",
				showConfirmButton: true,
			});
		} finally {
			setAddingToCart({});
		}
	}

	const handleRemove = (productId) => {
		wishlistLocalStorage.removeFromWishlist(productId);
		setWishlist(prev => prev.filter(item => item._id !== productId));
	}

	const handleClearAll = () => {
		MySwal.fire({
			title: "Are you sure?",
			text: "This will clear your entire wishlist",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#00a859",
			confirmButtonText: "Yes, clear it!",
		}).then(result => {
			if (result.isConfirmed) {
				wishlistLocalStorage.clearWishlist();
				setWishlist([]);
				MySwal.fire({
					icon: "success",
					text: "Wishlist cleared",
					showConfirmButton: false,
					timer: 1500,
					toast: true,
					position: "top-end",
				});
			}
		});
	}

	// const handleProductClick = (product) => {
	// 	navigate(`/product-details/${product._id}`, { state: {product}})
	// }

	if (loading) {
		return (
			<div className="text-center py-5">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	console.log("Your wishlist:", wishlist)

	return (
		<>
			<Header shadow="shadow" />
			<div className="container py-5">
				<div className="wishlist-content-header text-center my-5">
					<h2 className="font-nichrome fw-bold text-main-accent">Wish List</h2>
					<p className="fs-5 font-inter fw-normal text-content-accent">
						{wishlist.length} {wishlist.length === 1 ? "item" : "items"} in your
						wishlist
					</p>
				</div>
				{wishlist.length === 0 ? (
					<div className="text-center py-5">
						<p className="fs-4 text-content-accent">Your wishlist is empty</p>
					</div>
				) : (
					<div className="wishlist-content-body">
						<table className="table border-1 align-middle">
							<thead>
								<tr className="border font-inter fs-5 fw-semibold">
									<th
										scope="col"
										className="text-center"
										style={{ width: "45%" }}
									>
										Product Name
									</th>
									<th
										scope="col"
										className="text-start border"
										style={{ width: "20%" }}
									>
										Unit Price
									</th>
									<th
										scope="col"
										className="text-center"
										style={{ width: "12.5%" }}
									>
										Stock Status
									</th>
									<th
										scope="col"
										className="text-end"
										style={{ width: "30%" }}
									></th>
								</tr>
							</thead>
							<tbody className="border">
								{wishlist.map((item) => (
									<tr
										key={item._id}
										className="text-start font-inter fs-6 fw-medium text-content-accent"
									>
										<td scope="row" className="ps-3">
											<div className="d-flex align-items-center gap-3">
												<button
													className="border-0 bg-transparent"
													onClick={() => handleRemove(item._id)}
												>
													<BsX size={25} className="text-content-accent" />
												</button>
												<div
													className="image"
													// style={{ width: "60px", height: "60px" }}
												>
													<img
														src={item.productImg}
														alt={item.name}
														className="w-100 h-100 object-fit-cover rounded"
													/>
												</div>
												<h5 className="mb-0">{item.name}</h5>
											</div>
										</td>
										<td>${item.price}</td>
										<td className="text-start">
											{item.inStock === 0 ? (
												<span className="">Out of Stock</span>
											) : (
												<span className="">In Stock</span>
											)}
										</td>
										<td className="text-end pe-3">
											<button
												className="btn bg-primary-normal border-0 py-2 px-3 text-white font-inter"
												onClick={() => handleAddToCart(item)}
												disabled={item.inStock === 0 || addingToCart[item._id]}
											>
												{addingToCart[item._id] ? (
													<>
														<span
															className="spinner-border spinner-border-sm me-2"
															role="status"
															aria-hidden="true"
														></span>
														Adding...
													</>
												) : addedItem[item._id] ? (
													"Added"
												) : (
													"Add to Cart"
												)}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						<div className="text-end">
							<p>Estimated total:</p>
							<p>
								$
								{wishlist.reduce((acc, item) => {
									return acc + item.price;
								}, 0)}
							</p>

							<div className="mt-3">
								<button
									className="btn bg-primary-normal border-0 py-2 px-4 text-white font-inter me-2"
									onClick={handleAddAllToCart}
								>
									Add All to Cart
								</button>
								<button
									className="btn btn-outline-danger border py-2 px-4 font-inter"
									onClick={handleClearAll}
								>
									Clear Wishlist
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
			<Footer iconsDisplay />
		</>
	);
}

export default Wishlist;
