const computeTotals = (items) => {
  let totalItems = 0;
  let totalAmount = 0;

  for (let i = 0; i < items.length; i++) {
    totalItems += items[i].quantity;
    totalAmount += items[i].price * items[i].quantity;
  }

  return { totalItems, totalAmount };
};

const normalizeCart = (cartItems) => {
  return cartItems.map((item) => {
    if (item.product) {
      return {
        itemId: item._id,
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        productImg: item.product.productImg,
        quantity: item.quantity,
        variety: item.variety,
        cartItemId: item.cartItemId,
      };
    }
    return item;
  });
};

export {computeTotals, normalizeCart}