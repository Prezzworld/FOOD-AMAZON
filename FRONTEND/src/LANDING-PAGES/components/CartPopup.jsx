import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useToast } from "../../toast/ToastContext";
import CartItems from "./CartItems";
import { BsX } from "react-icons/bs";
import "../pages/cart.css";
import { formatToNaira } from "../../utils/nairaFormatter";

const CartPopup = () => {
  const navigate = useNavigate();
  const {items, loading, totalItems, totalAmount, updateCartItem, removeCartItem} = useCart()
  const {showToast} = useToast()

  useEffect(() => {
    // Listen for modal shown event to refresh cart
    const modalElement = document.getElementById("cartModal");
    const handleModalShown = () => {
      setTimeout(() => {
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
          backdrop.style.backgroundColor = "#00a859";
        }
      }, 50);
    };

    const handleModalHidden = () => {
      // Remove the background color when modal closes
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.style.backgroundColor = "";
      }
    };

    if (modalElement) {
      modalElement.addEventListener("shown.bs.modal", handleModalShown);
      modalElement.addEventListener("hidden.bs.modal", handleModalHidden);
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener("shown.bs.modal", handleModalShown);
        modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
      }

      cleanUpModal();
    };
  }, []);


  const handleViewCart = () => {
    // Get the modal element
    const modalElement = document.getElementById("cartModal");
    // Check if Bootstrap is available
    if (typeof window.bootstrap !== "undefined") {
      // Use Bootstrap's Modal API
      let modal = window.bootstrap.Modal.getInstance(modalElement);
      if (!modal) {
        modal = new window.bootstrap.Modal(modalElement);
      }
      modal.hide();
      // Wait for modal transition to complete
      setTimeout(() => {
        cleanUpModal();
        navigate("/cart");
      }, 300);
    } else {
      // Fallback if Bootstrap JS isn't available
      modalElement.classList.remove("show");
      modalElement.style.display = "none";
      modalElement.setAttribute("aria-hidden", "true");

      cleanUpModal();
      navigate("/cart");
    }
  };

  const cleanUpModal = () => {
    const backdrops = document.querySelectorAll(".modal-backdrop");
    backdrops.forEach((backdrop) => {
      backdrop.style.backgroundColor = "";
      backdrop.remove();
    });
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };

  const handleCheckout = () => {
    const modalElement = document.getElementById("cartModal");
    if (typeof window.bootstrap !== "undefined") {
      let modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    setTimeout(() => {
      cleanUpModal();
      navigate("/checkout");
    }, 300);
  };

  const handleRemoveItem = async (item) => {
    try {
      await removeCartItem(item)
      showToast("Cart item removed successfully", "success")
    } catch {
      showToast("Couldn't remove item from cart, please try again later", "error")
    }
  }

  const updateCart = async (item, quantity) => {
    try {
      await updateCartItem(item, quantity);
      showToast("Cart updated successfully", "success");
    } catch {
      showToast("Couldn't update cart, please try again later", "error");
    }
  }; 


  return (
    <>
      <div
        className="modal fade"
        id="cartModal"
        tabIndex="-1"
        aria-labelledby="cartModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-xl mx-auto">
          <div className="modal-content px-3">
            <div className="d-flex justify-content-end ms-auto">
              {/* <h5 className="modal-title fw-bold" id="cartModalLabel">
								Shopping Cart ({cart.length})
							</h5> */}
              <button
                type="button"
                className="ms-auto modal-close bg-transparent border-0 py-1"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <BsX size={40} />
              </button>
            </div>
            <div className="modal-body mt-3 mb-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading</span>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-5">
                  <p className="fs-5 text-muted">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="row align-items-start">
                    <div className="col-lg-5 col-12">
                      {items.map((item, index) => (
                        <CartItems
                          key={item.itemId}
                          item={item}
                          index={index}
                          onUpdate={updateCart}
                          onRemove={handleRemoveItem}
                          showCartId={true}
                          variant="compact"
                        />
                      ))}
                    </div>
                    <div className="col-lg-6 col-12 d-flex flex-column justify-content-between ms-auto">
                      {items.length > 0 && (
                        <div className="cart-summary">
                          <div className="w-100">
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                              <h3 className="fw-bold font-inter text-main-accent fs-4">
                                Cart Order Total ({totalItems})
                              </h3>
                              <span className="fw-bold fs-4 text-main-accent font-inter">
                                {formatToNaira(totalAmount)}
                              </span>
                            </div>
                            <div className="congrat font-inter fw-normal fs-5 my-4">
                              <p>
                                Congrats! You get free shipping. <br />{" "}
                                <small>Being your first purchase.</small>
                              </p>
                            </div>
                            <button
                              className="bg-primary-normal text-white w-100 py-3 rounded-2 border-0 text-white font-inter fw-semibold fs-5"
                              onClick={handleViewCart}
                            >
                              View Cart
                            </button>
                            <button
                              className="mt-2 bg-secondary-normal text-white w-100 py-3 rounded-2 border-0 text-white font-inter fw-semibold fs-5"
                              onClick={handleCheckout}
                            >
                              Check Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPopup;
