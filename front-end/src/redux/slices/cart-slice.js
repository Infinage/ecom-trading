import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { decrementCart, incrementCart } from "./user-slice";
import { authHeader } from "../../services/user-auth";

/* Cart = [
  {
    "_id": "312adsa",
    "title": "ABC",
    "price": 109.95,
    "description": "Desc",
    "category": "Apparel",
    "image": "img.jpg",
    "count": 1,
    "user": "adasd1das",
    "createdAt": "2022-11-13T10:00:12.077Z",
    "updatedAt": "2022-11-13T10:00:12.077Z",
    "__v": 0,
    "quantity": 1
  }]
  */
const cart = JSON.parse(localStorage.getItem('cart'));

export const addCart = createAsyncThunk(

    // Accessing state of a different slice - https://stackoverflow.com/a/72887349 (option 3)

    "cart/addCart",
    async (product, thunkAPI) => {

        const exists = thunkAPI.getState().cart.find((x) => x._id === product._id);
        const user = thunkAPI.getState().user.user;

        // Either user shouldn't be logged in or the product shouldn't belong to the logged in user
        if (!user || user.id !== product.user){

            if (user) {
                if (!exists)
                    thunkAPI.dispatch(incrementCart());
    
                const resp = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/user/modifyCart/${product._id}?` + new URLSearchParams({ op: 'ADD', qty: 1 }),
                    { method: "PATCH", headers: authHeader() }
                );
    
                if (resp.ok) {
                    thunkAPI.dispatch(setCartItems(await resp.json().data));
                }
            }
    
            return product;

        } else {
            return thunkAPI.rejectWithValue();
        }

    }
)

export const delCart = createAsyncThunk(
    "cart/delCart",
    async (product, thunkAPI) => {

        const exists = thunkAPI.getState().cart.find((x) => x._id === product._id);
        const user = thunkAPI.getState().user.user;

        if (user) {
            if (!exists)
                thunkAPI.dispatch(decrementCart());

            const resp = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/user/modifyCart/${product._id}?` + new URLSearchParams({ op: 'SUB', qty: 1 }),
                { method: "PATCH", headers: authHeader() }
            );

            if (resp.ok) {
                thunkAPI.dispatch(setCartItems(await resp.json().data));
            }

        }

        return product;

    }
)

const cartSlice = createSlice({
    name: "cart",
    initialState: cart ? cart : [],

    reducers: {
        delTotCart: (state) => {
            localStorage.setItem("cart", JSON.stringify([])),
            state = [];
            return state;
        },

        setCartItems: (state, action) => {
            localStorage.setItem("cart", JSON.stringify(action.payload));
            state = action.payload;
            return state;
        }
    },

    extraReducers: (builder) => {
        builder.addCase(addCart.fulfilled, (state, action) => {
            const exist = state.find((x) => x._id === action.payload._id);
            if (exist) { // Increase the Quantity
                state = state.map((x) => x._id === action.payload._id ? { ...x, quantity: x.quantity + 1 } : x);
            } else {
                // Add new item
                state = [...state, { ...action.payload, quantity: 1 }];
            }

            localStorage.setItem("cart", JSON.stringify(state));
            return state;

        }).addCase(delCart.fulfilled, (state, action) => {
            const exist1 = state.find((x) => x._id === action.payload._id);
            if (exist1.quantity === 1) { // Decrement the Qty
                state = state.filter((x) => x._id !== exist1._id);
            } else {
                state = state.map((x) => x._id === action.payload._id ? { ...x, quantity: x.quantity - 1 } : x);
            }

            localStorage.setItem("cart", JSON.stringify(state));
            return state;
        })
    }
});

export const { delTotCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;