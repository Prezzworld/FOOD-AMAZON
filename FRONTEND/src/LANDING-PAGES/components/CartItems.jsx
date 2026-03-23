import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";
// import { cartLocalStorage } from "../utils/cartLocalStorage";
import { BsDashLg, BsPlusLg } from "react-icons/bs";
import "../pages/cart.css";

const CartItems = ({
	item,
	index = 1,
	onUpdate,
   onRemove,
   onAddToWishlist,
	showCartId = true,
	variant = "default",
}) => {
	const [isEditing, setIsEditing] = useState(false);

	const handleToggleEdit = (e) => {
		e.preventDefault();
		setIsEditing(!isEditing);
	};

	const handleConfirmEdit = (e) => {
		e.preventDefault();
		// onUpdate(item.id, item.quantity);
		setIsEditing(false);
	};

	const handleQuantityChange = (newQuantity) => {
		if (newQuantity >= 1) {
			onUpdate(item._id, newQuantity);
		}
	};

	const handleRemove = (e) => {
		e.preventDefault();
		onRemove(item.itemId);
   };
   
   const handleAddToWishlist = (e) => {
      e.preventDefault();
      onAddToWishlist(item);
   }

	if (variant === "compact") {
		return (
			<>
				<div className="cart-content row">
					<div className="d-flex justify-content-between align-items-center border-bottom pb-3 col-12">
						<div className="">
							<p className="item-count font-inter fw-medium text-main-accent mb-0">
								Item {index + 1}
							</p>
						</div>
						<div className="d-flex gap-3 ms-auto">
							<button
								// href=""
								onClick={handleToggleEdit}
								className="text-decoration-none bg-transparent border-0 p-0 text-content-accent item-count font-inter fw-normal"
							>
								{isEditing ? "Cancel" : "Edit"}
							</button>
							<button
								// href=""
								onClick={handleRemove}
								className="text-decoration-none bg-transparent border-0 p-0 text-content-accent item-count font-inter fw-normal"
							>
								Remove
							</button>
							{isEditing && (
								<div className="quantity-controls d-flex align-items-center gap-2 mt-2">
									<button
										className="btn btn-sm btn-outline-secondary"
										onClick={() => handleQuantityChange(item.quantity - 1)}
										disabled={item.quantity <= 1}
									>
										-
									</button>
									<span className="fw-semibold">{item.quantity}</span>
									<button
										className="btn btn-sm btn-outline-secondary"
										onClick={() => handleQuantityChange(item.quantity + 1)}
									>
										+
									</button>
									<button
										onClick={handleConfirmEdit}
										className="btn btn-sm shadow-sm bg-success text-white"
										title="Confirm changes"
									>
										<FaCheck size={15} />
									</button>
								</div>
							)}
						</div>
					</div>
					<div className="d-flex mt-3 gap-3 mb-4 col-12">
						<div className="item-img">
							<img
								src={item.productImg}
								alt={item.name}
								className="w-100 h-100 object-fit-cover rounded-3"
							/>
						</div>
						<div className="d-flex flex-column justify-content-between">
							<h4 className="font-nichrome fs-5 fw-medium text-main-accent">
								{item.name}
							</h4>
							{showCartId && item.cartItemId && (
								<p className="font-inter text-content-accent fs-6 fw-normal mb-0">
									Cart ID: {item.cartItemId}
								</p>
							)}
							<p className="font-inter fs-5 fw-semibold text-main-accent mb-0">
								${item.price}
							</p>
						</div>
					</div>
				</div>
			</>
		);
	}
	return (
		<>
			<div className="cart-content">
				<div className="d-flex justify-content-between align-items-center border-bottom pb-3">
					<div>
						<p className="item-count font-inter fw-medium text-main-accent mb-0">
							Item {index + 1}
						</p>
					</div>
					<div className="d-flex align-items-center ms-auto">
						<div className="d-flex align-items-center gap-4 me-5">
							<button
								// href=""
								onClick={handleAddToWishlist}
								className="text-decoration-none bg-transparent border-0 p-0 text-content-accent item-count font-inter fw-normal"
							>
								Save for later
							</button>
							<button
								// href=""
								onClick={handleRemove}
								className="text-decoration-none bg-transparent border-0 p-0 text-content-accent item-count font-inter fw-normal"
							>
								Remove
							</button>
						</div>
						<div className="quantity-controls d-flex align-items-center gap-2 mt-2">
							<p className="font-inter fw-bold text-main-accent mb-0 me-2">
								Qty:
							</p>
							<div className="d-flex align-items-center gap-2">
								<button
									className="bg-content py-1 px-2 border-0"
									onClick={() => handleQuantityChange(item.quantity - 1)}
									disabled={item.quantity <= 1}
								>
									<BsDashLg className="text-main-accent" />
								</button>
								<span className="fw-normal text-content-accent item-count py-1 border-content">
									{item.quantity}
								</span>
								<button
									className="bg-content py-1 px-2 border-0"
									onClick={() => handleQuantityChange(item.quantity + 1)}
								>
									<BsPlusLg className="text-main-accent" />
								</button>
							</div>
							{/* <button
								onClick={handleConfirmEdit}
								className="btn btn-sm shadow-sm bg-success text-white"
								title="Confirm changes"
							>
								<FaCheck size={15} />
							</button> */}
						</div>
					</div>
				</div>
				<div className="d-flex gap-3 my-3 justify-content-center justify-content-lg-start">
					<div className="item-img">
						<img
							src={item.productImg}
							alt={item.name}
							className="w-100 h-100 object-fit-cover rounded-3"
						/>
					</div>
					<div className="d-flex flex-column gap-2 gap-lg-0 justify-content-center justify-content-lg-between">
						<h4 className="font-nichrome fs-5 fw-medium text-main-accent">
							{item.name}
						</h4>
						{showCartId && item.cartItemId && (
							<p className="font-inter text-content-accent fs-6 fw-normal mb-0">
								Cart ID: {item.cartItemId}
							</p>
						)}
						<p className="font-inter fs-5 fw-semibold text-main-accent mb-0">
							${item.price}
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default CartItems;
