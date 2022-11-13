const cart = [];

const handleCart = (state = cart, action) => {

  const product = action.payload;
  switch (action.type) {
    case 'ADDITEM':
      // Check if Product already Exists
      const exist = state.find((x) => x._id === product._id.toString());
      if (exist) {
        // Increase the Quantity
        return state.map((x) =>
          x.id === product._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      } else {
        const product = action.payload;
        return [
          ...state,
          {
            ...product,
            quantity: 1,
          },
        ];
      }
      break;

    case 'DELITEM':
      const exist1 = state.find((x) => x._id === product._id.toString());
      if (exist1.quantity === 1) {
        return state.filter((x) => x.id !== exist1.id);
      } else {
        return state.map((x) =>
          x.id === product._id ? { ...x, quantity: x.quantity - 1 } : x
        );
      }
      break;

    case 'DEL_CART':
      state = product;
      return state;

    default:
      return state;
      break;
  }
};

export default handleCart;
