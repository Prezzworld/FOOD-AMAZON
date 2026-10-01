import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductShowcase from "../components/ProductShowcase";
import CartItems from "../components/CartItems";
import OrderSummary from "../components/OrderSummary";
import {useCart} from "../hooks/useCart"
import {useToast} from "../../toast/ToastContext"
import "./cart.css";

const Cart = () => {
	const {items, loading, updateCartItem, removeCartItem} = useCart()
	const{showToast} = useToast()

	const handleRemoveItem = async (item) =>  {
		try {
			await removeCartItem(item)
			showToast("Cart item removed successfully", "success")
		} catch {
			showToast("Couldn't remove item from cart, please try again later", "error")
		}
	}

	const updateCart = async (item, quantity) => {
		try {
			await updateCartItem(item, quantity)
			showToast("Cart updated successfully", "success")
		} catch {
			showToast("Couldn't update cart, please try again later", "error")
		}
	} 
	return (
		<>
			<Header shadow="shadow" />
			{loading ? (
				<>
					<div className="text-center py-5">
						<div className="spinner-border">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				</>
			) : items.length === 0 ? (
				<>
					<div className="text-center py-5">
						<p className="ps-5 text-muted">
							Oops! 😥. Your cart is empty. <br /> Add items to cart
						</p>
					</div>
				</>
			) : (
				<>
					<div className="container mt-5 mb-4">
						<div className="cart-page">
							<div className="row d-flex g-4">
								<div className="col-12 col-lg-6">
									{items.map((item, index) => (
										<CartItems
											key={item.itemId}
											item={item}
											index={index}
											onUpdate={updateCart}
											onRemove={handleRemoveItem}
											showCartId={true}
											variant="default"
										/>
									))}
								</div>
								<div className="col-12 col-lg-6 offset-md-1 offset-lg-0">
									<OrderSummary title="Order Summary" buttonText="Proceed to Check out"/>
								</div>
							</div>
						</div>
					</div>

					<ProductShowcase
						sectionType=""
						layoutStyle="scroll"
						limit={8}
						buttonLink="/products?popular=true"
					/>
				</>
			)}
			<Footer iconsDisplay />
		</>
	);
};

export default Cart;
