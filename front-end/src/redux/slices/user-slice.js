import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { pushToUserCart } from "../../services/product-util";
import { register, login, logout, getUser } from "../../services/user-auth";
import { delTotCart, setCartItems } from "./cart-slice";

const user = JSON.parse(localStorage.getItem('user'));

/*
{
  "user": {
    "id": "Asdd1ada",
    "name": "ABC",
    "cartSize": 2
  },
  "token": "asdasd1asd12ads"
}
*/
const initialState = user
  ? { ...user }
  : { user: null, token: null };

export const userRegister = createAsyncThunk(
    "user/register", 
    async ({name, email, password, address, phone}, thunkAPI) => {

        const result = await register(name, email, password, address, phone);
        
        // Return value is the action payload
        if (result.user) return result; 
        else return thunkAPI.rejectWithValue();

    }
)

export const userLogin = createAsyncThunk(
    "user/login", 
    async ({email, password}, thunkAPI) => {
        const result = await login(email, password);
        if (result.user) {
            // Logic to push existing cart state to user on DB (frontend to backend)
            const tempCart = thunkAPI.getState().cart;
            if (tempCart.length > 0)
                await pushToUserCart(tempCart);

            const user = await getUser(result.user.id);

            // Backend to frontend pull
            thunkAPI.dispatch(setCartItems(user.cart ? user.cart: []));
            return result;
        }
        else return thunkAPI.rejectWithValue();
    }
)

export const userLogout = createAsyncThunk(
    "user/logout", 
    // 'args' are undefined. Passing args is optional
    async (args, thunkAPI) => {
        thunkAPI.dispatch(delTotCart());
        return await logout()
    }
);

const userSlice = createSlice({

    name: "user",
    initialState: initialState,

    reducers: {
        incrementCart: (state, action) => {
            state.user.cartSize += 1;
            return state;
        },

        decrementCart: (state, action) => {
            state.user.cartSize -= 1;
            return state;
        }
    },

    extraReducers: (builder) => { 
        builder.addCase(
            // If user registration is successful
            userRegister.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
        }).addCase(
            // If user registration has failed
            userRegister.rejected, (state, action) => {
                state.user = null;
                state.token = null;
        }).addCase(
            // If user login is successful
            userLogin.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token;
        }).addCase(
            // If user login has failed
            userLogin.rejected, (state, action) => {
                state.user = null;
                state.token = null;
        }).addCase(
            // If user logout is successful
            userLogout.fulfilled, (state, action) => {
                state.user = null;
                state.token = null;
        })
    }

});

export const {incrementCart, decrementCart} = userSlice.actions;
export default userSlice.reducer;