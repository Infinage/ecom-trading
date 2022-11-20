import { configureStore } from '@reduxjs/toolkit';

import userReducer from "./slices/user-slice";
import cartReducer from "./slices/cart-slice";

const store = configureStore({
    reducer: {
      cart: cartReducer,
      user: userReducer,
    }
});

export default store;
