import { configureStore } from '@reduxjs/toolkit';

import userReducer from "./slices/user-slice";
import cartReducer from "./slices/cart-slice";
import orderReducer from "./slices/order-slice";
import offeringSlice from './slices/offering-slice';

const store = configureStore({
    reducer: {
      cart: cartReducer,
      user: userReducer,
      order: orderReducer,
      offering: offeringSlice,
    }
});

export default store;
